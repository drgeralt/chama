import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.organizations.models import Organization, Department, Membership, Role
from apps.accounts.models import User

org = Organization.objects.first()
dept = Department.objects.filter(organization=org).first()
admin_role, _ = Role.objects.get_or_create(name="Admin")

if org and dept:
    # Try updating a membership
    member = Membership.objects.filter(organization=org, role=admin_role).first()
    if member:
        print(f"Before update: member.department = {member.department}")
        member.department = dept
        member.save()
        print(f"After update: member.department = {member.department}")
        
        # Now test serialization
        from apps.organizations.serializers import MembershipSerializer
        data = MembershipSerializer(member).data
        print(f"Serialized department: {data.get('department')}")
