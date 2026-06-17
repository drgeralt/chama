import datetime
from celery import shared_task
from django.utils import timezone
from .models import Ticket, TicketStatus
from .services import transition_ticket

@shared_task
def auto_close_tickets_task():
    """
    Finds tickets in REVISAO status that have been updated more than 7 days ago,
    and automatically concludes them.
    """
    threshold_date = timezone.now() - datetime.timedelta(days=7)
    
    # We query tickets that are in REVISAO and haven't been updated in 7 days
    tickets_to_close = Ticket.objects.filter(
        status=TicketStatus.REVISAO,
        updated_at__lte=threshold_date
    )
    
    closed_count = 0
    for ticket in tickets_to_close:
        # We simulate the system acting as the creator to approve it
        # Note: If creator is deleted, this might fail, so we should check
        actor = ticket.creator
        if actor:
            transition_ticket(ticket, actor, "aprovar")
            closed_count += 1
            
            # Optionally add a system comment
            from .models import TicketComment
            from .services import _notify_ticket_comment
            comment = TicketComment.objects.create(
                ticket=ticket,
                author=actor, # Blame the creator (Client) for the auto-approval
                content="Chamado concluído automaticamente após 7 dias sem resposta na fase de revisão.",
                is_internal=False
            )
            _notify_ticket_comment(comment)
            
    return f"Fechados {closed_count} chamados automaticamente."
