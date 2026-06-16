from rest_framework import serializers
from .models import Organization, Department, Role, Membership

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['id', 'name', 'slug', 'logo_url', 'created_at']

class DepartmentSerializer(serializers.ModelSerializer):
    parent_id = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'name', 'parent_id', 'depth', 'path']

    def get_parent_id(self, obj):
        parent = obj.get_parent()
        return parent.id if parent else None
