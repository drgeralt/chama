from django.db import transaction
from django.core.exceptions import ValidationError
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Ticket, TicketStatus, TicketTransitionLog
from apps.organizations.models import Membership


def transition_ticket(ticket_obj, actor, action):
    with transaction.atomic():
        # Lock the row to prevent race conditions during concurrent transitions
        ticket = Ticket.objects.select_for_update().get(id=ticket_obj.id)

        old_status = ticket.status
        new_status = old_status

        if action == "iniciar":
            if old_status != TicketStatus.ABERTO:
                raise ValidationError("Can only initiate ABERTO tickets.")
            new_status = TicketStatus.ANDAMENTO
            ticket.assignees.add(actor)
        elif action == "pausar":
            if old_status != TicketStatus.ANDAMENTO:
                raise ValidationError("Can only pause ANDAMENTO tickets.")
            new_status = TicketStatus.ABERTO
        elif action == "enviar_revisao":
            if old_status != TicketStatus.ANDAMENTO:
                raise ValidationError("Can only submit ANDAMENTO tickets to review.")
            new_status = TicketStatus.REVISAO
        elif action == "aprovar":
            if old_status != TicketStatus.REVISAO:
                raise ValidationError("Can only approve REVISAO tickets.")
            new_status = TicketStatus.CONCLUIDO
        elif action == "rejeitar":
            if old_status != TicketStatus.REVISAO:
                raise ValidationError("Can only reject REVISAO tickets.")
            new_status = TicketStatus.ANDAMENTO
        elif action == "cancelar":
            new_status = TicketStatus.CANCELADO
        else:
            raise ValidationError("Invalid action.")

        ticket.status = new_status
        ticket.save(update_fields=["status", "updated_at"])

        TicketTransitionLog.objects.create(
            ticket=ticket, actor=actor, from_status=old_status, to_status=new_status
        )

    # Trigger Async Notification via Channels
    _notify_ticket_update(ticket)

    return ticket


def _notify_ticket_update(ticket, actor=None):
    from apps.notifications.models import Notification
    channel_layer = get_channel_layer()

    # Create Notifications
    if actor:
        assignees = list(ticket.assignees.all())
        is_client = ticket.creator == actor
        is_assignee = actor in assignees

        title = f"Chamado atualizado: #{str(ticket.id).split('-')[0]}"
        message = f"O chamado '{ticket.title}' foi atualizado para '{ticket.status}'."
        link = f"/tickets/{ticket.id}"

        # If actor is Admin/Agent, notify creator (Client)
        if not is_client and ticket.creator:
            Notification.objects.create(user=ticket.creator, title=title, message=message, link=link)
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    f"user_{ticket.creator.id}",
                    {"type": "new_notification", "title": title, "message": message, "link": link}
                )

        # If actor is not one of the assignees (e.g. third party or client), notify assignees
        if not is_assignee:
            for assignee in assignees:
                Notification.objects.create(user=assignee, title=title, message=message, link=link)
                if channel_layer:
                    async_to_sync(channel_layer.group_send)(
                        f"user_{assignee.id}",
                        {"type": "new_notification", "title": title, "message": message, "link": link}
                    )

    if not channel_layer:
        return

    # Granular WebSocket logic: send only to creator, assignee, and supervisors
    user_ids_to_notify = set()
    if ticket.creator_id:
        user_ids_to_notify.add(str(ticket.creator_id))
    
    for assignee in ticket.assignees.all():
        user_ids_to_notify.add(str(assignee.id))

    # Add all supervisors in the departments
    supervisors = Membership.objects.filter(
        department__in=ticket.departments.all(), role__name="Supervisor"
    ).values_list("user_id", flat=True)

    for sid in supervisors:
        user_ids_to_notify.add(str(sid))

    for user_id in user_ids_to_notify:
        group_name = f"user_{user_id}"
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "ticket_updated",
                "ticket_id": str(ticket.id),
                "status": ticket.status,
            },
        )
        
    # Send to anyone actively viewing the ticket
    async_to_sync(channel_layer.group_send)(
        f"ticket_{ticket.id}",
        {
            "type": "ticket_updated",
            "ticket_id": str(ticket.id),
            "status": ticket.status,
        },
    )
def _notify_ticket_comment(comment):
    channel_layer = get_channel_layer()
    if not channel_layer:
        return

    ticket = comment.ticket
    user_ids_to_notify = set()
    if ticket.creator_id:
        user_ids_to_notify.add(str(ticket.creator_id))
    
    for assignee in ticket.assignees.all():
        user_ids_to_notify.add(str(assignee.id))

    supervisors = Membership.objects.filter(
        department__in=ticket.departments.all(), role__name="Supervisor"
    ).values_list("user_id", flat=True)

    for sid in supervisors:
        user_ids_to_notify.add(str(sid))

    # Do not send internal comments to creator if creator is User
    creator_membership = None
    if ticket.creator_id:
        creator_membership = Membership.objects.filter(user_id=ticket.creator_id, organization=ticket.organization).first()

    for user_id in user_ids_to_notify:
        if comment.is_internal and creator_membership and creator_membership.role.name == "User" and user_id == str(ticket.creator_id):
            continue

        group_name = f"user_{user_id}"
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "new_comment",
                "ticket_id": str(ticket.id),
                "comment_id": str(comment.id),
            },
        )
        
    # Send to anyone actively viewing the ticket
    # Wait, internal comments shouldn't be sent to Clients even if they are viewing the ticket
    # But since the group_send doesn't know who is in the group, we shouldn't broadcast internal comments to the public ticket group
    if not comment.is_internal:
        async_to_sync(channel_layer.group_send)(
            f"ticket_{ticket.id}",
            {
                "type": "new_comment",
                "ticket_id": str(ticket.id),
                "comment_id": str(comment.id),
            },
        )
