from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import ChannelLayer
import json


class DocumentConsumer(AsyncWebsocketConsumer):
    document_id: str
    group_name: str

    async def connect(self):
        self.document_id = self.scope['url_route']['kwargs']['document_id']
        self.group_name = f"document_${self.document_id}"

        # Join the group
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.channel_layer.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        content = data.get('content')

        # Broadcast changes to all users in the group
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'document_update',
                'content': content
            }
        )

    async def document_update(self, event):
        content = event['content']

        # Send changes to WebSocket
        await self.send(text_data=json.dumps({
            'content': content
        }))
