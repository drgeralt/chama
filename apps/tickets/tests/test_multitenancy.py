import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from apps.organizations.tests.factories import (
    OrganizationFactory,
    UserFactory,
    MembershipFactory,
    DepartmentFactory,
)
from apps.tickets.tests.factories import TicketFactory


@pytest.mark.django_db
def test_multitenancy_isolation():
    org_a = OrganizationFactory(name="Org A")
    dep_a = DepartmentFactory(organization=org_a)
    user_a = UserFactory()
    MembershipFactory(user=user_a, organization=org_a, department=dep_a)
    ticket_a = TicketFactory(organization=org_a, department=dep_a, creator=user_a)

    org_b = OrganizationFactory(name="Org B")
    dep_b = DepartmentFactory(organization=org_b)
    user_b = UserFactory()
    MembershipFactory(user=user_b, organization=org_b, department=dep_b)
    ticket_b = TicketFactory(organization=org_b, department=dep_b, creator=user_b)

    client = APIClient()
    client.force_authenticate(user=user_a)

    url = reverse("ticket-list-create")
    response = client.get(url, {"org_id": org_a.id})

    assert response.status_code == 200
    # Ensure user_a only sees ticket_a
    data = response.json()
    if "results" in data:
        results = data["results"]
    else:
        results = data

    ticket_ids = [str(t["id"]) for t in results]
    assert str(ticket_a.id) in ticket_ids
    assert str(ticket_b.id) not in ticket_ids


@pytest.mark.django_db
def test_multitenancy_cross_organization_block():
    org_a = OrganizationFactory(name="Org A")
    dep_a = DepartmentFactory(organization=org_a)
    user_a = UserFactory()
    MembershipFactory(user=user_a, organization=org_a, department=dep_a)

    org_b = OrganizationFactory(name="Org B")

    client = APIClient()
    client.force_authenticate(user=user_a)

    url = reverse("ticket-list-create")
    # User A tries to pass Organization B's ID
    response = client.get(url, {"org_id": org_b.id})

    # Should be blocked, either returning 403 or empty results
    assert response.status_code in [200, 403]
    if response.status_code == 200:
        data = response.json()
        results = data["results"] if isinstance(data, dict) and "results" in data else data
        assert len(results) == 0
