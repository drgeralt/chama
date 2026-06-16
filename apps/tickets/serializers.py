from rest_framework import serializers
from .models import Ticket, TicketTransitionLog, TicketStatus
from apps.organizations.models import Organization, Department

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = '__all__'
        read_only_fields = ['id', 'status', 'creator', 'created_at', 'updated_at', 'organization']

class TicketCreateSerializer(serializers.Serializer):
    org_slug = serializers.SlugField()
    department_id = serializers.UUIDField()
    title = serializers.CharField(max_length=200)
    description = serializers.CharField(style={'base_template': 'textarea.html'})
    priority = serializers.IntegerField(required=False)
    due_date = serializers.DateTimeField(required=False, allow_null=True)

class TicketTransitionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=[
        ('iniciar', 'Iniciar'),
        ('pausar', 'Pausar'),
        ('enviar_revisao', 'Enviar para Revisão'),
        ('aprovar', 'Aprovar'),
        ('rejeitar', 'Rejeitar'),
        ('cancelar', 'Cancelar'),
    ])

class TicketTransitionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketTransitionLog
        fields = '__all__'
