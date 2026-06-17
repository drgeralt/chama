import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from apps.organizations.tests.factories import OrganizationFactory, UserFactory, MembershipFactory, DepartmentFactory, RoleFactory
from apps.tickets.tests.factories import TicketFactory
from apps.tickets.models import TicketComment

@pytest.mark.django_db
def test_user_cannot_view_others_tickets():
    org = OrganizationFactory()
    user_role = RoleFactory(name="User")
    
    client_a = UserFactory()
    client_b = UserFactory()
    
    MembershipFactory(user=client_a, organization=org, role=user_role)
    MembershipFactory(user=client_b, organization=org, role=user_role)
    
    ticket_b = TicketFactory(organization=org, creator=client_b)
    
    client = APIClient()
    client.force_authenticate(user=client_a)
    
    # Try accessing ticket_b details
    url = reverse("ticket-detail", args=[ticket_b.id])
    response = client.get(url)
    
    # DRF distinct filter makes it return 404 since it's not in queryset
    assert response.status_code == 404


@pytest.mark.django_db
def test_user_cannot_edit_assignee_or_department():
    org = OrganizationFactory()
    user_role = RoleFactory(name="User")
    
    client_a = UserFactory()
    MembershipFactory(user=client_a, organization=org, role=user_role)
    
    ticket = TicketFactory(organization=org, creator=client_a)
    
    client = APIClient()
    client.force_authenticate(user=client_a)
    
    url = reverse("ticket-detail", args=[ticket.id])
    
    new_user = UserFactory()
    new_dep = DepartmentFactory(organization=org)
    
    payload = {
        "assignee_id": new_user.id,
        "department_id": new_dep.id,
        "priority": 4 # Priority is allowed
    }
    
    response = client.patch(url, payload)
    # The view blocks User from updating at all, or ignores assignee if we restricted perform_update
    assert response.status_code in [403, 200]
    
    ticket.refresh_from_db()
    # Ensure they were NOT updated
    assert ticket.assignee is None
    assert ticket.department is None


@pytest.mark.django_db
def test_user_cannot_read_internal_comments():
    org = OrganizationFactory()
    user_role = RoleFactory(name="User")
    agent_role = RoleFactory(name="Agent")
    
    client_a = UserFactory()
    agent = UserFactory()
    
    MembershipFactory(user=client_a, organization=org, role=user_role)
    MembershipFactory(user=agent, organization=org, role=agent_role)
    
    ticket = TicketFactory(organization=org, creator=client_a)
    
    # Agent creates internal comment
    TicketComment.objects.create(
        ticket=ticket, author=agent, content="Internal secret", is_internal=True
    )
    # Agent creates public comment
    TicketComment.objects.create(
        ticket=ticket, author=agent, content="Public hello", is_internal=False
    )
    
    # Client views comments
    client = APIClient()
    client.force_authenticate(user=client_a)
    
    url = reverse("ticket-comment-list-create", args=[ticket.id])
    response = client.get(url)
    
    assert response.status_code == 200
    data = response.json()
    results = data.get("results", data)
    
    assert len(results) == 1
    assert results[0]["content"] == "Public hello"

@pytest.mark.django_db
def test_agent_can_read_internal_comments():
    org = OrganizationFactory()
    agent_role = RoleFactory(name="Agent")
    
    agent = UserFactory()
    MembershipFactory(user=agent, organization=org, role=agent_role)
    
    ticket = TicketFactory(organization=org, creator=agent)
    
    TicketComment.objects.create(
        ticket=ticket, author=agent, content="Internal secret", is_internal=True
    )
    
    client = APIClient()
    client.force_authenticate(user=agent)
    
    url = reverse("ticket-comment-list-create", args=[ticket.id])
    response = client.get(url)
    
    assert response.status_code == 200
    data = response.json()
    results = data.get("results", data)
    
    assert len(results) == 1
    assert results[0]["content"] == "Internal secret"
    assert results[0]["is_internal"] is True
