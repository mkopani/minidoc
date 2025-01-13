import json
import logging
import re

from channels.generic.websocket import AsyncWebsocketConsumer


class DocumentConsumer(AsyncWebsocketConsumer):
    document_id: str
    group_name: str

    async def connect(self):
        self.document_id = self.scope["url_route"]["kwargs"]["document_id"]

        # Sanitize group name so that it doesn't throw a TypeError
        self.group_name = f"document_${self.document_id}"
        self.group_name = re.sub(r"[^a-zA-Z0-9]", "_", self.group_name)

        # Join the group
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        content = data.get("content")
        title = data.get("title")
        is_save = data.get("is_save", False)

        # Broadcast changes to all users in the group
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "document_update",
                "content": content,
                "title": title,
                "is_save": is_save,
            },
        )

    async def document_update(self, event):
        content = event["content"]
        title = event["title"]
        is_save = event["is_save"]

        # Send changes and save state to WebSocket
        await self.send(
            text_data=json.dumps(
                {
                    "content": content,
                    "title": title,
                    "is_save": is_save,
                }
            )
        )
