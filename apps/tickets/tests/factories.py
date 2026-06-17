import factory
from apps.tickets.models import Ticket
from apps.organizations.tests.factories import (
    OrganizationFactory,
    DepartmentFactory,
    UserFactory,
)


class TicketFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Ticket

    title = factory.Faker("sentence")
    description = factory.Faker("paragraph")
    status = "ABERTO"
    priority = 2
    organization = factory.SubFactory(OrganizationFactory)
    department = factory.SubFactory(DepartmentFactory)
    creator = factory.SubFactory(UserFactory)
