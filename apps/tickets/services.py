from django.db import transaction
from django.core.exceptions import ValidationError
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Ticket, TicketStatus, TicketTransitionLog
from apps.organizations.models import Membership

def transition_ticket(ticket, actor, action):
    old_status = ticket.status
    new_status = old_status

    if action == 'iniciar':
        if old_status != TicketStatus.ABERTO:
            raise ValidationError("Can only initiate ABERTO tickets.")
        new_status = TicketStatus.ANDAMENTO
        ticket.assignee = actor
    elif action == 'pausar':
        if old_status != TicketStatus.ANDAMENTO:
            raise ValidationError("Can only pause ANDAMENTO tickets.")
        new_status = TicketStatus.ABERTO
    elif action == 'enviar_revisao':
        if old_status != TicketStatus.ANDAMENTO:
            raise ValidationError("Can only submit ANDAMENTO tickets to review.")
        new_status = TicketStatus.REVISAO
    elif action == 'aprovar':
        if old_status != TicketStatus.REVISAO:
            raise ValidationError("Can only approve REVISAO tickets.")
        new_status = TicketStatus.CONCLUIDO
    elif action == 'rejeitar':
        if old_status != TicketStatus.REVISAO:
            raise ValidationError("Can only reject REVISAO tickets.")
        new_status = TicketStatus.ANDAMENTO
    elif action == 'cancelar':
        new_status = TicketStatus.CANCELADO
    else:
        raise ValidationError("Invalid action.")

    with transaction.atomic():
        ticket.status = new_status
        ticket.save(update_fields=['status', 'assignee', 'updated_at'])
        
        TicketTransitionLog.objects.create(
            ticket=ticket,
            actor=actor,
            from_status=old_status,
            to_status=new_status
        )

    # Trigger Async Notification via Channels
    _notify_ticket_update(ticket)

    return ticket

def _notify_ticket_update(ticket):
    channel_layer = get_channel_layer()
    if not channel_layer:
        return

    # Granular WebSocket logic: send only to creator, assignee, and supervisors
    user_ids_to_notify = set()
    if ticket.creator_id:
        user_ids_to_notify.add(str(ticket.creator_id))
    if ticket.assignee_id:
        user_ids_to_notify.add(str(ticket.assignee_id))

    # Add all supervisors in the department
    supervisors = Membership.objects.filter(
        department=ticket.department,
        role__name='Supervisor'
    ).values_list('user_id', flat=True)

    for sid in supervisors:
        user_ids_to_notify.add(str(sid))

    for user_id in user_ids_to_notify:
        group_name = f"user_{user_id}"
        # We don't have the serialized ticket here easily without DRF context,
        # but we can send minimal info for the client to know it updated,
        # or we can import the serializer here.
        # Sending minimal info is safer for circular imports.
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "ticket_updated",
                "ticket_id": str(ticket.id),
                "status": ticket.status
            }
        )
