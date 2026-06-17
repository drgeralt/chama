from rest_framework import permissions
from apps.organizations.models import Membership


class IsSupervisor(permissions.BasePermission):
    """
    Allows access only to users who are Supervisors in the ticket's department.
    """

    def has_object_permission(self, request, view, obj):
        # We assume obj is a Ticket here, which has a department
        if hasattr(obj, "department"):
            return Membership.objects.filter(
                user=request.user, department=obj.department, role__name="Supervisor"
            ).exists()
        return False


class IsExecutor(permissions.BasePermission):
    """
    Allows access only to users who are Executors in the ticket's department.
    """

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, "department"):
            return Membership.objects.filter(
                user=request.user, department=obj.department, role__name="Executor"
            ).exists()
        return False
