import pytest
from rest_framework.exceptions import ValidationError
from apps.tickets.services import transition_ticket
from apps.tickets.tests.factories import TicketFactory
from apps.organizations.tests.factories import UserFactory, MembershipFactory


@pytest.mark.django_db
def test_transition_ticket_success():
    ticket = TicketFactory(status="ABERTO")
    user = UserFactory()
    MembershipFactory(
        user=user,
        organization=ticket.organization,
        department=ticket.department,
        role="EXECUTOR",
    )

    updated_ticket = transition_ticket(ticket, user, "iniciar")
    assert updated_ticket.status == "ANDAMENTO"
    assert updated_ticket.assignee == user


@pytest.mark.django_db
def test_transition_ticket_illegal_status_jump():
    ticket = TicketFactory(status="ABERTO")
    user = UserFactory()
    MembershipFactory(
        user=user,
        organization=ticket.organization,
        department=ticket.department,
        role="EXECUTOR",
    )

    with pytest.raises(ValidationError) as exc_info:
        transition_ticket(ticket, user, "aprovar")

    assert "Can only approve" in str(exc_info.value)


@pytest.mark.django_db(transaction=True)
def test_transition_ticket_concurrency():
    # To test select_for_update, we simulate two threads trying to transition the same ticket.
    # We use a transaction-enabled test to allow thread connections.
    ticket = TicketFactory(status="ABERTO")
    user_a = UserFactory()
    user_b = UserFactory()

    import threading
    from django.db import connection

    def worker(user):
        try:
            transition_ticket(ticket, user, "iniciar")
        except Exception:
            pass  # We expect one to fail or block and eventually fail if already transitioned
        finally:
            connection.close()

    t1 = threading.Thread(target=worker, args=(user_a,))
    t2 = threading.Thread(target=worker, args=(user_b,))

    t1.start()
    t2.start()

    t1.join()
    t2.join()

    # Reload ticket
    ticket.refresh_from_db()
    # It must be ANDAMENTO, but more importantly, only one transition log should exist for 'iniciar'
    from apps.tickets.models import TicketTransitionLog

    logs_count = TicketTransitionLog.objects.filter(
        ticket=ticket, to_status="ANDAMENTO"
    ).count()

    assert logs_count == 1, "Concurrency issue: Ticket was transitioned multiple times!"
