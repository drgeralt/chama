import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.utils import timezone
import datetime
from apps.organizations.models import OrganizationInvite
from apps.organizations.tests.factories import OrganizationFactory, UserFactory, RoleFactory

@pytest.mark.django_db
def test_invite_acceptance_success():
    org = OrganizationFactory()
    role = RoleFactory(name="Agent")
    inviter = UserFactory()
    
    invite = OrganizationInvite.objects.create(
        organization=org,
        role=role,
        created_by=inviter,
        expires_at=timezone.now() + datetime.timedelta(days=1)
    )
    
    invitee = UserFactory()
    client = APIClient()
    client.force_authenticate(user=invitee)
    
    url = reverse("invite-accept", args=[str(invite.id)])
    response = client.post(url)
    
    assert response.status_code == 200
    assert org.memberships.filter(user=invitee, role=role).exists()
    assert not OrganizationInvite.objects.filter(id=invite.id).exists()

@pytest.mark.django_db
def test_invite_acceptance_expired():
    org = OrganizationFactory()
    role = RoleFactory(name="Agent")
    inviter = UserFactory()
    
    invite = OrganizationInvite.objects.create(
        organization=org,
        role=role,
        created_by=inviter,
        expires_at=timezone.now() - datetime.timedelta(days=1) # Already expired
    )
    
    invitee = UserFactory()
    client = APIClient()
    client.force_authenticate(user=invitee)
    
    url = reverse("invite-accept", args=[str(invite.id)])
    response = client.post(url)
    
    assert response.status_code == 400
    assert "expirado" in response.json().get("detail", "").lower()
    assert not org.memberships.filter(user=invitee).exists()
