import uuid
from django.db import models
from django.conf import settings
from apps.organizations.models import Organization, Department


class ActiveManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)


class TicketStatus(models.TextChoices):
    ABERTO = "ABERTO", "Aberto"
    ANDAMENTO = "ANDAMENTO", "Em Andamento"
    REVISAO = "REVISAO", "Em Revisão"
    CONCLUIDO = "CONCLUIDO", "Concluído"
    CANCELADO = "CANCELADO", "Cancelado"


class TicketPriority(models.IntegerChoices):
    BAIXA = 1, "Baixa"
    MEDIA = 2, "Média"
    ALTA = 3, "Alta"
    CRITICA = 4, "Crítica"


class Ticket(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="tickets"
    )
    departments = models.ManyToManyField(
        Department, related_name="tickets", blank=True
    )
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.RESTRICT,
        related_name="created_tickets",
    )
    assignees = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name="assigned_tickets", blank=True
    )

    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=TicketStatus.choices,
        default=TicketStatus.ABERTO,
        db_index=True,
    )
    priority = models.IntegerField(
        choices=TicketPriority.choices, default=TicketPriority.MEDIA
    )
    due_date = models.DateTimeField(null=True, blank=True, db_index=True)
    is_deleted = models.BooleanField(default=False, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = ActiveManager()
    all_objects = models.Manager()

    def __str__(self):
        return f"{self.title} [{self.status}]"


class TicketTransitionLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket = models.ForeignKey(
        Ticket, on_delete=models.CASCADE, related_name="transitions"
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    from_status = models.CharField(max_length=20, choices=TicketStatus.choices)
    to_status = models.CharField(max_length=20, choices=TicketStatus.choices)
    transitioned_at = models.DateTimeField(auto_now_add=True, db_index=True)
    is_deleted = models.BooleanField(default=False, db_index=True)

    objects = ActiveManager()
    all_objects = models.Manager()

    def __str__(self):
        return f"{self.ticket.id}: {self.from_status} -> {self.to_status}"

class TicketComment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket = models.ForeignKey(
        Ticket, on_delete=models.CASCADE, related_name="comments"
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.RESTRICT, related_name="ticket_comments"
    )
    content = models.TextField()
    is_internal = models.BooleanField(default=False) # For agent-only notes
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Comment by {self.author} on {self.ticket}"
