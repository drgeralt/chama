import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()
from apps.tickets.models import Ticket

print(f"Total tickets: {Ticket.objects.count()}")
for t in Ticket.objects.all():
    print(f"Ticket: {t.title} - Org: {t.organization_id}")

