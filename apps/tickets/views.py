from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from .serializers import (
    TicketSerializer,
    TicketCreateSerializer,
    TicketTransitionSerializer,
    TicketCommentSerializer,
)
from .models import Ticket, TicketPriority, TicketComment
from .services import transition_ticket
from apps.organizations.models import Organization, Department, Membership


class TicketListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return TicketCreateSerializer
        return TicketSerializer

    def get_queryset(self):
        user = self.request.user
        from django.db.models import Q
        qs = (
            Ticket.objects.select_related(
                "creator", "organization"
            )
            .prefetch_related("assignees", "departments")
            .filter(
                Q(organization__memberships__user=user, organization__memberships__role__name__in=["Admin", "Agent"]) |
                Q(organization__memberships__user=user, organization__memberships__role__name="User", creator=user)
            )
            .distinct()
        )

        # Filters
        org_slug = self.request.query_params.get("org")
        org_id = self.request.query_params.get("org_id")
        status_param = self.request.query_params.get("status")
        assignee = self.request.query_params.get("assignee")

        if org_slug:
            qs = qs.filter(organization__slug=org_slug)
        elif org_id:
            qs = qs.filter(organization_id=org_id)
        else:
            return qs.none()
        if status_param:
            qs = qs.filter(status=status_param)
        if assignee:
            qs = qs.filter(assignees__id=assignee)

        return qs

    def perform_create(self, serializer):
        # We only hit this with TicketSerializer in DRF usually,
        # but since we override get_serializer_class, we handle TicketCreateSerializer here
        pass

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if "organization_id" in data:
            org = get_object_or_404(Organization, id=data["organization_id"])
        elif "org_slug" in data:
            org = get_object_or_404(Organization, slug=data["org_slug"])
        else:
            return Response({"detail": "organization_id or org_slug is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Handle optional departments
        department_ids = data.get("department_ids", [])
        departments = Department.objects.filter(id__in=department_ids, organization=org)

        membership = Membership.objects.filter(user=request.user, organization=org).first()
        if not membership:
            return Response(
                {"detail": "Not a member of this organization."},
                status=status.HTTP_403_FORBIDDEN,
            )

        assignee_ids = data.get("assignee_ids", [])
        assignees = []

        if assignee_ids:
            if membership.role.name not in ["Admin", "Agent"]:
                return Response({"detail": "Seu nível de acesso não permite atribuir tickets a terceiros."}, status=status.HTTP_403_FORBIDDEN)
            
            from django.contrib.auth import get_user_model
            User = get_user_model()
            # Only Admin and Agent can be assignees
            assignees = list(User.objects.filter(
                id__in=assignee_ids, 
                memberships__organization=org, 
                memberships__role__name__in=["Admin", "Agent"]
            ).distinct())
            
            if len(assignees) != len(assignee_ids):
                return Response({"detail": "Um ou mais usuários atribuídos são inválidos ou são clientes."}, status=status.HTTP_400_BAD_REQUEST)

        ticket = Ticket.objects.create(
            organization=org,
            creator=request.user,
            title=data["title"],
            description=data["description"],
            priority=data.get("priority", TicketPriority.MEDIA),
            due_date=data.get("due_date"),
        )
        
        if departments:
            ticket.departments.set(departments)
        if assignees:
            ticket.assignees.set(assignees)

        return Response(TicketSerializer(ticket).data, status=status.HTTP_201_CREATED)


class TicketDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        from django.db.models import Q
        return Ticket.objects.filter(
            Q(organization__memberships__user=self.request.user, organization__memberships__role__name__in=["Admin", "Agent"]) |
            Q(organization__memberships__user=self.request.user, organization__memberships__role__name="User", creator=self.request.user)
        ).distinct()

    def perform_update(self, serializer):
        ticket = self.get_object()
        membership = Membership.objects.filter(user=self.request.user, organization=ticket.organization).first()
        
        if not membership:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Não autorizado.")
            
        is_admin_agent = membership.role.name in ["Admin", "Agent"]
        is_creator = ticket.creator == self.request.user
        
        if not (is_admin_agent or is_creator):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Você não tem permissão para editar este chamado.")
            
        if not is_admin_agent:
            serializer.validated_data.pop('assignees', None)
            serializer.validated_data.pop('departments', None)
            
        instance = serializer.save()
        
        # If the user passed department_ids or assignee_ids in the JSON, they will be handled
        # But if the request data contains lists of IDs, we should update the M2M fields
        if is_admin_agent:
            data = self.request.data
            org = instance.organization
            
            if "departments" in data or "department_ids" in data:
                dept_ids = data.get("departments") or data.get("department_ids", [])
                departments = Department.objects.filter(id__in=dept_ids, organization=org)
                instance.departments.set(departments)
                
            if "assignees" in data or "assignee_ids" in data:
                assignee_ids = data.get("assignees") or data.get("assignee_ids", [])
                from django.contrib.auth import get_user_model
                User = get_user_model()
                assignees = list(User.objects.filter(
                    id__in=assignee_ids, 
                    memberships__organization=org, 
                    memberships__role__name__in=["Admin", "Agent"]
                ).distinct())
                
                if len(assignees) == len(assignee_ids):
                    instance.assignees.set(assignees)


class TicketTransitionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        ticket = get_object_or_404(
            Ticket, pk=pk, organization__memberships__user=request.user
        )
        membership = Membership.objects.filter(user=request.user, organization=ticket.organization).first()
        if not membership:
            return Response({"detail": "Não autorizado."}, status=status.HTTP_403_FORBIDDEN)
            
        is_admin_agent = membership.role.name in ["Admin", "Agent"]
        is_involved = ticket.creator == request.user or ticket.assignees.filter(id=request.user.id).exists()

        if not (is_admin_agent or is_involved):
            return Response({"detail": "Você não tem permissão para alterar o status deste chamado."}, status=status.HTTP_403_FORBIDDEN)

        serializer = TicketTransitionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action = serializer.validated_data["action"]

        try:
            updated_ticket = transition_ticket(ticket, request.user, action)
        except ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(TicketSerializer(updated_ticket).data)

class TicketCommentListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TicketCommentSerializer

    def get_queryset(self):
        ticket_id = self.kwargs["pk"]
        qs = TicketComment.objects.filter(
            ticket_id=ticket_id,
            ticket__organization__memberships__user=self.request.user
        ).select_related("author").order_by("created_at")
        
        # Restrict internal comments for Users
        membership = Membership.objects.filter(user=self.request.user, organization__tickets__id=ticket_id).first()
        if membership and membership.role.name == "User":
            qs = qs.filter(is_internal=False)
            
        return qs

    def perform_create(self, serializer):
        ticket_id = self.kwargs["pk"]
        ticket = get_object_or_404(Ticket, pk=ticket_id, organization__memberships__user=self.request.user)
        
        membership = Membership.objects.filter(user=self.request.user, organization=ticket.organization).first()
        if membership and membership.role.name == "User":
            comment = serializer.save(ticket=ticket, author=self.request.user, is_internal=False)
        else:
            comment = serializer.save(ticket=ticket, author=self.request.user)
            
        from .services import _notify_ticket_comment
        _notify_ticket_comment(comment)
