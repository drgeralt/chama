from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Ticket, TicketStatus, TicketTransitionLog, TicketPriority
from .serializers import TicketSerializer, TicketCreateSerializer, TicketTransitionSerializer
from organizations.models import Organization, Department, Membership

class TicketListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TicketCreateSerializer
        return TicketSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Ticket.objects.filter(organization__memberships__user=user).distinct()

        # Filters
        org_slug = self.request.query_params.get('org')
        status_param = self.request.query_params.get('status')
        assignee = self.request.query_params.get('assignee')

        if org_slug:
            qs = qs.filter(organization__slug=org_slug)
        if status_param:
            qs = qs.filter(status=status_param)
        if assignee:
            qs = qs.filter(assignee_id=assignee)

        return qs

    def perform_create(self, serializer):
        # We only hit this with TicketSerializer in DRF usually, 
        # but since we override get_serializer_class, we handle TicketCreateSerializer here
        pass

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        org = get_object_or_404(Organization, slug=data['org_slug'])
        dept = get_object_or_404(Department, id=data['department_id'], organization=org)
        
        # Validation: Is user in this org?
        if not Membership.objects.filter(user=request.user, organization=org).exists():
            return Response({'detail': 'Not a member of this organization.'}, status=status.HTTP_403_FORBIDDEN)

        ticket = Ticket.objects.create(
            organization=org,
            department=dept,
            creator=request.user,
            title=data['title'],
            description=data['description'],
            priority=data.get('priority', TicketPriority.MEDIA),
            due_date=data.get('due_date')
        )
        
        return Response(TicketSerializer(ticket).data, status=status.HTTP_201_CREATED)

class TicketDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Ticket.objects.filter(organization__memberships__user=self.request.user).distinct()

class TicketTransitionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        ticket = get_object_or_404(Ticket, pk=pk, organization__memberships__user=request.user)
        serializer = TicketTransitionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        action = serializer.validated_data['action']
        old_status = ticket.status
        new_status = old_status

        if action == 'iniciar':
            if old_status != TicketStatus.ABERTO:
                return Response({'detail': 'Can only initiate ABERTO tickets.'}, status=400)
            new_status = TicketStatus.ANDAMENTO
            ticket.assignee = request.user
        elif action == 'pausar':
            if old_status != TicketStatus.ANDAMENTO:
                return Response({'detail': 'Can only pause ANDAMENTO tickets.'}, status=400)
            new_status = TicketStatus.ABERTO
        elif action == 'enviar_revisao':
            if old_status != TicketStatus.ANDAMENTO:
                return Response({'detail': 'Can only submit ANDAMENTO tickets to review.'}, status=400)
            new_status = TicketStatus.REVISAO
        elif action == 'aprovar':
            if old_status != TicketStatus.REVISAO:
                return Response({'detail': 'Can only approve REVISAO tickets.'}, status=400)
            new_status = TicketStatus.CONCLUIDO
        elif action == 'rejeitar':
            if old_status != TicketStatus.REVISAO:
                return Response({'detail': 'Can only reject REVISAO tickets.'}, status=400)
            new_status = TicketStatus.ANDAMENTO
        elif action == 'cancelar':
            new_status = TicketStatus.CANCELADO
            
        ticket.status = new_status
        ticket.save(update_fields=['status', 'assignee', 'updated_at'])
        
        TicketTransitionLog.objects.create(
            ticket=ticket,
            actor=request.user,
            from_status=old_status,
            to_status=new_status
        )
        
        return Response(TicketSerializer(ticket).data)
