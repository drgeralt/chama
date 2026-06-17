from rest_framework import serializers
from .models import Ticket, TicketTransitionLog, TicketComment


class TicketSerializer(serializers.ModelSerializer):
    creator_name = serializers.CharField(source='creator.nome', read_only=True)
    assignee_name = serializers.CharField(source='assignee.nome', read_only=True, allow_null=True)
    department_name = serializers.CharField(source='department.name', read_only=True, allow_null=True)

    class Meta:
        model = Ticket
        fields = "__all__"
        read_only_fields = [
            "id",
            "status",
            "creator",
            "created_at",
            "updated_at",
            "organization",
        ]


class TicketCreateSerializer(serializers.Serializer):
    org_slug = serializers.SlugField(required=False)
    organization_id = serializers.UUIDField(required=False)
    department_id = serializers.UUIDField(required=False)
    assignee_id = serializers.UUIDField(required=False, allow_null=True)
    title = serializers.CharField(max_length=200)
    description = serializers.CharField(style={"base_template": "textarea.html"})
    priority = serializers.IntegerField(required=False)
    due_date = serializers.DateTimeField(required=False, allow_null=True)


class TicketTransitionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(
        choices=[
            ("iniciar", "Iniciar"),
            ("pausar", "Pausar"),
            ("enviar_revisao", "Enviar para Revisão"),
            ("aprovar", "Aprovar"),
            ("rejeitar", "Rejeitar"),
            ("cancelar", "Cancelar"),
        ]
    )


class TicketTransitionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketTransitionLog
        fields = "__all__"

class TicketCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.email', read_only=True)
    
    class Meta:
        model = TicketComment
        fields = ['id', 'ticket', 'author', 'author_name', 'content', 'is_internal', 'created_at', 'updated_at']
        read_only_fields = ['id', 'ticket', 'author', 'created_at', 'updated_at']
