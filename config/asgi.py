import os

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

django_asgi_app = get_asgi_application()

import apps.tickets.routing

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": URLRouter(apps.tickets.routing.websocket_urlpatterns),
    }
)
