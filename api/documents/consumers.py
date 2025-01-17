import json
import logging
import re

import y_py as Y
from asgiref.sync import sync_to_async
from ypy_websocket.django_channels_consumer import YjsConsumer

from django.apps import apps

logger = logging.getLogger("django.channels")


class DocumentConsumer(YjsConsumer):
    Document = None

    initial_state: bytes
    state_modified: bool

    def __init__(self, *args, **kwargs):
        self.initial_state = b""
        self.state_modified = False
        super().__init__(*args, **kwargs)

    @classmethod
    def get_document_model(cls):
        """
        Lazy import the Document model to avoid AppRegistryNotReady exception
        """

        if cls.Document is None:
            cls.Document = apps.get_model("documents", "Document")
        return cls.Document

    def get_document_id(self):
        """
        Get the document ID from the URL route kwargs
        """

        return self.scope["url_route"]["kwargs"]["document_id"]

    def make_room_name(self):
        """
        Sanitize the room name to avoid TypeError
        """

        room_name = self.get_document_id()
        return re.sub(r"[^a-zA-Z0-9]", "_", room_name)

    async def make_ydoc(self):
        """
        Create a Y.Doc instance and load the document content from the database
        """

        doc = Y.YDoc()

        # Fetch the document or create a new one
        Document = self.get_document_model()
        db_document, created = await sync_to_async(Document.objects.get_or_create)(
            id=self.get_document_id(),
            defaults={
                "title": "Untitled Document",
                "content": b"",  # Use default binary content
            },
        )

        # TODO: When collaboration permissions are implemented, set owner of new documents
        # if created:
        #     db_document.owner = self.scope["user"]

        # Initialize the document with the content from the database.
        # This comparison avoids unnecessarily initializing the document with an empty state.
        content = db_document.content
        if content != b"":
            Y.apply_update(doc, content)
            self.initial_state = content

        doc.observe_after_transaction(self.on_update_event)
        return doc

    def on_update_event(self, event):
        # Set the state_modified flag to True when the document is modified
        self.state_modified = True

    async def receive(self, text_data=None, bytes_data=None):
        # Handle custom events
        if text_data:
            try:
                data = json.loads(text_data)
                event_type = data.get("eventType")

                if event_type == "TITLE_UPDATE":
                    # Clean up the title
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

        # Let YjsConsumer handle bytes_data
        return await super().receive(text_data, bytes_data)

    async def disconnect(self, code):
        # Only save to database if the document has been modified
        if self.state_modified and self.initial_state != Y.encode_state_as_update(
            self.ydoc
        ):
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
        """
        Save in-memory document state to the database.
        """

        Document = self.get_document_model()
        try:
            document = await sync_to_async(Document.objects.get)(
                id=self.get_document_id()
            )
            document.content = Y.encode_state_as_update(self.ydoc)
            # TODO: Extract readable text from YDoc
            # readable_content = self.ydoc.get_text('content').__str__()
            # document.readable_content = readable_content
            await sync_to_async(document.save)()
        except Document.DoesNotExist:
            error_message = "Document not found"
            logger.error(error_message)
            await self.send(json.dumps({"error": error_message}))

    async def update_document_title(self, title: str):
        """
        Update the title of the document in the database
        """

        Document = self.get_document_model()
        document = await sync_to_async(Document.objects.get)(id=self.get_document_id())
        document.title = title
        await sync_to_async(document.save)()
