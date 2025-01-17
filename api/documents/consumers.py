import json
import logging
import re

import y_py as Y
from asgiref.sync import sync_to_async
from ypy_websocket.django_channels_consumer import YjsConsumer

logger = logging.getLogger("django.channels")


class DocumentConsumer(YjsConsumer):
    initial_state: bytes
    state_modified: bool

    def __init__(self, *args, **kwargs):
        self.initial_state = b""
        self.state_modified = False
        super().__init__(*args, **kwargs)

    def get_document_id(self):
        return self.scope["url_route"]["kwargs"]["document_id"]

    def make_room_name(self):
        """
        Sanitize the room name to avoid TypeError
        """

        room_name = self.get_document_id()
        return re.sub(r"[^a-zA-Z0-9]", "_", room_name)

    async def make_ydoc(self):
        from .models import Document

        doc = Y.YDoc()

        # Fetch the document or create a new one
        db_document, _ = await sync_to_async(Document.objects.get_or_create)(
            id=self.get_document_id(),
            defaults={
                "title": "Untitled Document",
                "content": b"",
            },  # Use default binary content
        )

        # Initialize the document with the content from the database
        if db_document.content != b"":
            Y.apply_update(doc, db_document.content)
            self.initial_state = db_document.content

        doc.observe_after_transaction(self.on_update_event)
        return doc

    def on_update_event(self, event):
        self.state_modified = True

    async def receive(self, text_data=None, bytes_data=None):
        if text_data:
            try:
                data = json.loads(text_data)
                event_type = data.get("eventType")

                if event_type == "TITLE_UPDATE":
                    title = data.get("title", "Untitled Document").strip()
                    await self.update_document_title(title)

                    await self.channel_layer.group_send(
                        self.room_name,
                        {
                            "type": "broadcast_title_update",
                            "eventType": "TITLE_UPDATE",
                            "title": title,
                        },
                    )
                elif event_type == "SAVE":
                    await self.save_changes_to_document()
                    await self.channel_layer.group_send(
                        self.room_name,
                        {
                            "type": "broadcast_save",
                            "eventType": "SAVE",
                        },
                    )
                else:
                    await self.send(json.dumps({"error": "Invalid event type"}))
            except json.JSONDecodeError:
                await self.send(json.dumps({"error": "Invalid JSON data"}))
                return
            return

        # Let YjsConsumer handle bytes_data as expected
        return await super().receive(text_data, bytes_data)

    async def disconnect(self, code):
        if not self.state_modified:
            return await super().disconnect(code)

        # Only save to database if the document has been modified
        if (
            self.initial_state != b""
            and self.initial_state != Y.encode_state_as_update(self.ydoc)
        ):
            # Save document content to database
            await self.save_changes_to_document()

        await super().disconnect(code)

    async def broadcast_title_update(self, event):
        await self.send(
            json.dumps(
                {
                    "eventType": event["eventType"],
                    "title": event["title"],
                }
            )
        )

    async def broadcast_save(self, event):
        await self.send(
            json.dumps(
                {
                    "eventType": event["eventType"],
                }
            )
        )

    async def save_changes_to_document(self):
        """Save in-memory document state to the database."""

        # Load document model here to avoid startup errors
        from .models import Document

        document = await sync_to_async(Document.objects.get)(id=self.get_document_id())
        # TODO: Extract readable text from YDoc
        # readable_content = self.ydoc.get_text('content').__str__()
        # document.readable_content = readable_content
        document.content = Y.encode_state_as_update(self.ydoc)
        await sync_to_async(document.save)()

    async def update_document_title(self, title: str):
        from .models import Document

        document = await sync_to_async(Document.objects.get)(id=self.get_document_id())
        document.title = title
        await sync_to_async(document.save)()
