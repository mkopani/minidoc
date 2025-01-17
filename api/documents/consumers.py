import base64
import json
import logging
import re
import uuid

from asgiref.sync import sync_to_async
from channels.layers import get_channel_layer
from pycrdt import Doc, create_update_message, Text, merge_updates
from pycrdt_websocket.django_channels_consumer import YjsConsumer
from pycrdt_websocket.ystore import BaseYStore

logger = logging.getLogger("django.channels")


class CustomDoc(Doc):
    modified: bool
    _initial_state: bytes

    def __init__(self, *args, **kwargs):
        self.modified = False
        self._initial_state = b''
        super().__init__(*args, **kwargs)

    def get_state(self):
        if self.modified:
            return super().get_state()
        return self._initial_state
    
    def set_initial_state(self, state):
        self._initial_state = state


class DocumentConsumer(YjsConsumer):
    ydoc: CustomDoc
    state_modified: bool

    def __init__(self, *args, **kwargs):
        self.state_modified = False
        super().__init__(*args, **kwargs)

    def get_document_id(self):
        return self.scope['url_route']['kwargs']['document_id']

    def make_room_name(self):
        """
        Sanitize the room name to avoid TypeError
        """

        room_name = self.get_document_id()
        return re.sub(r"[^a-zA-Z0-9]", "_", room_name)
    
    async def make_ydoc(self):
        from .models import Document

        doc = CustomDoc()

        # Fetch the document or create a new one
        document_instance, _ = await sync_to_async(Document.objects.get_or_create)(
            id=self.get_document_id(),
            defaults={'title': 'Untitled Document', 'content': b'\x00'},  # Use default binary content
        )

        logger.info(f"Initial state: {doc.get_state()}")
        state = document_instance.content
        doc.set_initial_state(state)
        logger.info(f"Updated state: {doc.get_state()}")

        # Observe changes
        doc.observe(self.on_update_event)
        return doc
    
    def on_update_event(self, event):
        self.state_modified = True
        self.ydoc.modified = True
    
    async def connect(self):
        try:
            # TODO: Uncomment after implementing auth
            # user = self.scope['user']
            # if user is None or user.is_anonymous:
            #     await self.close()
            #     return

            await super().connect()
            logger.info(f"Doc state: f{self.ydoc.get_state()}")
        except Exception as e:
            logger.error(f"Error during WebSocket connect: {e}", exc_info=True)
            await self.close()

    async def doc_update(self, update_wrapper):
        update = update_wrapper['update']
        self.ydoc.apply_update(update)
        await self.group_send_message(create_update_message(update))

    async def receive(self, text_data=None, bytes_data=None):
        if text_data:
            logger.info(f'*** TEXT DATA *** {text_data}')
            try:
                data = json.loads(text_data)
                event_type = data.get('eventType')

                if event_type == "TITLE_UPDATE":
                    from .models import Document

                    document = await sync_to_async(Document.objects.get)(id=self.get_document_id())
                    title = data.get('title', 'Untitled Document').strip()
                    document.title = title
                    await sync_to_async(document.save)()

                    await self.channel_layer.group_send(
                        self.room_name,
                        {
                            'type': 'broadcast_title_update',
                            'eventType': 'TITLE_UPDATE',
                            'title': title,
                        }
                    )
                elif event_type == "SAVE":
                    # TODO: Refactor this

                    b = self.ydoc.get_state()
                    encoded = base64.b64encode(b).decode('utf-8')
                    decoded = base64.b64decode(encoded)
                    logger.info(f"*** YDOC STATE *** {b}")
                    
                    from .models import Document

                    document = await sync_to_async(Document.objects.get)(id=self.get_document_id())
                    document.content = self.ydoc.get_state()
                    await sync_to_async(document.save)()
                    logger.info(f'DOCUMENT SAVED: {document.content}')

                    await self.channel_layer.group_send(
                        self.room_name,
                        {
                            'type': 'broadcast_save',
                            'eventType': 'SAVE',
                        }
                    )
                else:
                    await self.send(
                        json.dumps({'error': 'Invalid event type'})
                    )
            except json.JSONDecodeError:
                await self.send(
                    json.dumps({'error': 'Invalid JSON data'})
                )
                return
            return

        # await self.doc_update({"update": bytes_data})

        # self.ydoc.apply_update(bytes_data)

        # Let YjsConsumer handle bytes_data
        return await super().receive(text_data, bytes_data)

    async def disconnect(self, code):
        if not self.state_modified:
            return await super().disconnect(code)

        from .models import Document

        # Save document content to database
        try:
            document = await sync_to_async(Document.objects.get)(id=self.get_document_id())
            document.content = self.ydoc.get_state()
            await sync_to_async(document.save)()
        except Document.DoesNotExist:
            # Skip this
            pass

        await super().disconnect(code)

    async def broadcast_title_update(self, event):
        await self.send(
            json.dumps({
                'eventType': event['eventType'],
                'title': event['title'],
            })
        )

    async def broadcast_save(self, event):
        await self.send(
            json.dumps({
                'eventType': event['eventType'],
            })
        )

    # TODO: Implement this
    async def save_document(self):
        """Save in-memory document state to the database."""

        logger.info('RUNNING SAVE DOCUMENT')
        # Load document model here to avoid startup errors
        from .models import Document

        document = await sync_to_async(Document.objects.get)(id=self.get_document_id())
        # document.content = json.dumps(self.doc_state.to_json())
        document.content = self.ydoc.get_state()
        logger.info(f'DOCUMENT SAVED: {document.content}')
        await sync_to_async(document.save)()
