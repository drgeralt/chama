from rest_framework import serializers
from .models import Organization, Department, Membership, Role, OrganizationInvite

class OrganizationSerializer(serializers.ModelSerializer):
    current_role = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = ["id", "name", "slug", "logo_url", "created_at", "current_role"]

    def get_current_role(self, obj):
        user = self.context['request'].user
        if not user.is_authenticated:
            return None
        membership = Membership.objects.filter(organization=obj, user=user).first()
        return membership.role.name if membership else None

class DepartmentSerializer(serializers.ModelSerializer):
    parent_id = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ["id", "name", "icon", "parent_id", "depth", "path"]
        read_only_fields = ["id", "parent_id", "depth", "path"]

    def get_parent_id(self, obj):
        parent = obj.get_parent()
        return parent.id if parent else None

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "name"]

class MembershipSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    user_id = serializers.UUIDField(source="user.id", read_only=True)
    user_name = serializers.CharField(source="user.nome", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Membership
        fields = ["id", "user_id", "user_name", "user_email", "role", "department"]

class MembershipUpdateSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(write_only=True, required=False)
    department_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Membership
        fields = ["role_name", "department_id"]

    def update(self, instance, validated_data):
        if "role_name" in validated_data:
            role, _ = Role.objects.get_or_create(name=validated_data["role_name"])
            instance.role = role
        
        if "department_id" in validated_data:
            dept_id = validated_data["department_id"]
            if dept_id:
                dept = Department.objects.filter(id=dept_id, organization=instance.organization).first()
                if dept:
                    instance.department = dept
            else:
                instance.department = None
                
        instance.save()
        return instance

class OrganizationInviteSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationInvite
        fields = ["id", "organization", "role", "created_by", "created_at", "expires_at"]
        read_only_fields = ["id", "organization", "created_by", "created_at", "expires_at"]
