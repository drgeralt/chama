import factory
from django.contrib.auth import get_user_model
from apps.organizations.models import Organization, Department, Membership

User = get_user_model()


class OrganizationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Organization

    name = factory.Faker("company")
    slug = factory.Sequence(lambda n: f"org-{n}")


class DepartmentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Department

    organization = factory.SubFactory(OrganizationFactory)
    name = factory.Faker("job")

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        return model_class.add_root(**kwargs)


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        skip_postgeneration_save = True

    email = factory.Sequence(lambda n: f"user{n}@example.com")
    nome = factory.Faker("name")
    password = factory.PostGenerationMethodCall("set_password", "password123")


class RoleFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "organizations.Role"
        django_get_or_create = ("name",)

    name = "Admin"


class MembershipFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Membership

    user = factory.SubFactory(UserFactory)
    organization = factory.SubFactory(OrganizationFactory)
    department = factory.SubFactory(DepartmentFactory)
    role = factory.SubFactory(RoleFactory)
