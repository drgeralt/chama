from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import Organization, Department, Membership
from .serializers import OrganizationSerializer, DepartmentSerializer
from django.shortcuts import get_object_or_404

class OrganizationListCreateView(generics.ListCreateAPIView):
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # A user only sees organizations they are a member of
        user = self.request.user
        org_ids = Membership.objects.filter(user=user).values_list('organization_id', flat=True)
        return Organization.objects.filter(id__in=org_ids)

class OrganizationDetailView(generics.RetrieveAPIView):
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'slug'

    def get_queryset(self):
        user = self.request.user
        org_ids = Membership.objects.filter(user=user).values_list('organization_id', flat=True)
        return Organization.objects.filter(id__in=org_ids)

class OrganizationDepartmentsView(generics.ListAPIView):
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        slug = self.kwargs['slug']
        org = get_object_or_404(Organization, slug=slug)
        
        # Check membership
        if not Membership.objects.filter(user=user, organization=org).exists():
            return Department.objects.none()
            
        return Department.objects.filter(organization=org)
