from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from .models import Ticket, TicketStatus, TicketTransitionLog, TicketPriority
from .serializers import TicketSerializer, TicketCreateSerializer, TicketTransitionSerializer
from .services import transition_ticket
from apps.organizations.models import Organization, Department, Membership

class TicketListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TicketCreateSerializer
        return TicketSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Ticket.objects.select_related(
            'creator', 'assignee', 'organization', 'department'
        ).filter(organization__memberships__user=user).distinct()

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

    def post(self, request, pk):
        ticket = get_object_or_404(Ticket, pk=pk, organization__memberships__user=request.user)
        serializer = TicketTransitionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        action = serializer.validated_data['action']
        
        try:
            updated_ticket = transition_ticket(ticket, request.user, action)
        except ValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(TicketSerializer(updated_ticket).data)
