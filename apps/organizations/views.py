from rest_framework import generics, permissions
from .models import Organization, Department, Membership, Role
from .serializers import OrganizationSerializer, DepartmentSerializer, MembershipSerializer, OrganizationInviteSerializer, MembershipUpdateSerializer
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction

class OrganizationListCreateView(generics.ListCreateAPIView):
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # A user only sees organizations they are a member of
        user = self.request.user
        org_ids = Membership.objects.filter(user=user).values_list(
            "organization_id", flat=True
        )
        return Organization.objects.filter(id__in=org_ids)

    @transaction.atomic
    def perform_create(self, serializer):
        org = serializer.save()
        admin_role, _ = Role.objects.get_or_create(name="Admin")
        Membership.objects.create(
            user=self.request.user,
            organization=org,
            role=admin_role
        )


class OrganizationDetailView(generics.RetrieveAPIView):
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        user = self.request.user
        org_ids = Membership.objects.filter(user=user).values_list(
            "organization_id", flat=True
        )
        return Organization.objects.filter(id__in=org_ids)


class OrganizationDepartmentsView(generics.ListCreateAPIView):
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        org_id = self.kwargs["id"]
        org = get_object_or_404(Organization, id=org_id)

        # Check membership
        if not Membership.objects.filter(user=user, organization=org).exists():
            return Department.objects.none()

        return Department.objects.filter(organization=org)

    def perform_create(self, serializer):
        user = self.request.user
        org_id = self.kwargs["id"]
        org = get_object_or_404(Organization, id=org_id)
        
        membership = Membership.objects.filter(user=user, organization=org).first()
        if not membership or membership.role.name != "Admin":
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Apenas administradores podem criar departamentos.")
        
        dept = Department.add_root(
            organization=org,
            name=serializer.validated_data['name'],
            icon=serializer.validated_data.get('icon', 'domain')
        )
        serializer.instance = dept

class OrganizationMembershipDetailView(generics.UpdateAPIView):
    serializer_class = MembershipUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        org_id = self.kwargs["id"]
        return Membership.objects.filter(organization_id=org_id)

    def perform_update(self, serializer):
        user = self.request.user
        org_id = self.kwargs["id"]
        org = get_object_or_404(Organization, id=org_id)
        
        # Check if acting user is Admin
        admin_membership = Membership.objects.filter(user=user, organization=org).first()
        if not admin_membership or admin_membership.role.name != "Admin":
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Apenas administradores podem editar membros.")
            
        serializer.save()

class OrganizationMembershipsView(generics.ListAPIView):
    serializer_class = MembershipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        org_id = self.kwargs["id"]
        org = get_object_or_404(Organization, id=org_id)

        if not Membership.objects.filter(user=user, organization=org).exists():
            return Membership.objects.none()

        return Membership.objects.filter(organization=org).select_related('user', 'role')

class OrganizationInviteView(generics.CreateAPIView):
    serializer_class = OrganizationInviteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        user = request.user
        org_id = self.kwargs["id"]
        org = get_object_or_404(Organization, id=org_id)

        membership = Membership.objects.filter(user=user, organization=org).first()
        if not membership or membership.role.name != "Admin":
            return Response({"detail": "Apenas administradores podem gerar convites."}, status=status.HTTP_403_FORBIDDEN)
        
        role_name = request.data.get("role", "User")
        role, _ = Role.objects.get_or_create(name=role_name)

        from .models import OrganizationInvite
        invite = OrganizationInvite.objects.create(
            organization=org,
            role=role,
            created_by=user,
            expires_at=timezone.now() + timedelta(days=7)
        )

        serializer = self.get_serializer(invite)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class OrganizationInviteAcceptView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, invite_id):
        from .models import OrganizationInvite, Membership
        from django.utils import timezone
        
        invite = get_object_or_404(OrganizationInvite, id=invite_id)
        
        if timezone.now() > invite.expires_at:
            return Response({"detail": "Esse convite expirou."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Check if user already in organization
        membership, created = Membership.objects.get_or_create(
            user=request.user,
            organization=invite.organization,
            defaults={"role": invite.role}
        )
        
        if not created and membership.role.name == "User" and invite.role.name != "User":
            # Upgrade user role
            membership.role = invite.role
            membership.save()
            
        return Response({
            "detail": "Convite aceito com sucesso.",
            "organization_id": invite.organization.id,
            "organization_name": invite.organization.name,
            "role": membership.role.name
        }, status=status.HTTP_200_OK)
