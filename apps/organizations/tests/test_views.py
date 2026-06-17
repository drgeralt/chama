import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from apps.organizations.tests.factories import OrganizationFactory, UserFactory, MembershipFactory, RoleFactory
from apps.organizations.models import Organization

@pytest.mark.django_db
def test_organization_list_create():
    user = UserFactory()
    role = RoleFactory(name="Admin")
    org = OrganizationFactory(name="Test Org")
    MembershipFactory(user=user, organization=org, role=role)

    client = APIClient()
    client.force_authenticate(user=user)

    url = reverse("org-list-create")
    
    # Test List
    response = client.get(url)
    assert response.status_code == 200
    data = response.json()
    
    results = data["results"] if isinstance(data, dict) and "results" in data else data
    assert len(results) == 1
    assert results[0]["name"] == "Test Org"
    assert results[0]["current_role"] == "Admin"

@pytest.mark.django_db
def test_organization_creation():
    user = UserFactory()
    client = APIClient()
    client.force_authenticate(user=user)

    url = reverse("org-list-create")
    response = client.post(url, {
        "name": "New Org",
        "slug": "new-org"
    })
    
    assert response.status_code == 201
    assert Organization.objects.filter(slug="new-org").exists()
