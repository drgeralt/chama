import json
from channels.generic.websocket import AsyncWebsocketConsumer

class TicketConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Initial accept, but we expect an authentication message
        self.user = None
        await self.accept()

    async def disconnect(self, close_code):
        if self.user:
            group_name = f"user_{self.user.id}"
            await self.channel_layer.group_discard(
                group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        
        # If not authenticated, we expect the first message to be authentication
        if not self.user:
            if text_data_json.get('type') == 'authenticate':
                token = text_data_json.get('token')
                user = await self.authenticate_token(token)
                if user:
                    self.user = user
                    group_name = f"user_{self.user.id}"
                    await self.channel_layer.group_add(
                        group_name,
                        self.channel_name
                    )
                    await self.send(text_data=json.dumps({
                        "type": "authenticated",
                        "user_id": str(self.user.id)
                    }))
                else:
                    await self.close(code=4000)
            else:
                # Close if first message is not authentication
                await self.close(code=4000)
        else:
            # Handle other messages from client if necessary
            pass

    async def ticket_updated(self, event):
        # This method is triggered by channel_layer.group_send
        await self.send(text_data=json.dumps(event))

    from channels.db import database_sync_to_async
    @database_sync_to_async
    def authenticate_token(self, token):
        from rest_framework_simplejwt.tokens import AccessToken
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            return User.objects.get(id=user_id)
        except Exception:
            return None
