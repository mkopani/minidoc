import base64
import json
import logging
import re

from asgiref.sync import sync_to_async
from channels.layers import get_channel_layer
from pycrdt import Doc, create_update_message
from pycrdt_websocket.django_channels_consumer import YjsConsumer


class DocumentConsumer(YjsConsumer):
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

        doc = Doc()

        # TODO: Load document content from database

        # Fetch document from database or create a new one
        # document_instance, _ = await sync_to_async(Document.objects.get_or_create)(
        #     id=self.get_document_id(),
        #     defaults={'title': 'Untitled Document', 'content': {'state': ''}},
        # )

        # # Initialize YDoc with content document content
        # if document_instance.content:
        #     state = document_instance.content['state']
        #     doc.apply_update(base64.b64decode(state))
        #     # for change in changes:
        #     #     doc.apply_changes(change)

        # Observe changes
        doc.observe(self.on_update_event)
        return doc
    
    async def connect(self):
        try:
            # TODO: Uncomment after implementing auth
            # user = self.scope['user']
            # if user is None or user.is_anonymous:
            #     await self.close()
            #     return

            await super().connect()
        except Exception as e:
            logging.error(f"Error during WebSocket connect: {e}")
            await self.close()

    def on_update_event(self, event):
        # TODO: Might not be necessary
        logging.info(f"Received update event: {event}")

    async def doc_update(self, update_wrapper):
        update = update_wrapper['update']
        self.ydoc.apply_update(update)
        await self.group_send_message(create_update_message(update))

    async def receive(self, text_data=None, bytes_data=None):
        if text_data:
            logging.info(f'TEXT: {text_data}')
            try:
                data = json.loads(text_data)
                event_type = data.get('eventType')

                # TODO: Handle custom events; use the "type" field to trigger other send methods here
                if event_type == "TITLE_UPDATE":
                    from .models import Document

                    document = await sync_to_async(Document.objects.get)(id=self.get_document_id())
                    title = data.get('title').trim()
                    if not title:
                        title = 'Untitled Document'
                    document.title = title
                    await sync_to_async(document.save)()

                    await self.channel_layer.group_send(
                        self.room_name,
                        {
                            'type': 'title_update',
                            'title': title
                        }
                    )
                elif event_type == "SAVE":
                    pass # TODO
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

        # Let YjsConsumer handle bytes_data
        return await super().receive(text_data, bytes_data)

    async def disconnect(self, code):
        from .models import Document

        document_state = self.ydoc.get_state()
        encoded_state = base64.b64encode(document_state).decode('utf-8')

        # Save document content to database
        document = await sync_to_async(Document.objects.get)(id=self.get_document_id())
        document.content = {"state": encoded_state}
        await sync_to_async(document.save)()

        await super().disconnect(code)

    async def title_update(self, title):
        await self.send(
            json.dumps({
                'eventType': 'TITLE_UPDATE',
                'title': title,
            })
        )

    # TODO: Implement this
    # async def save_document(self):
    #     """Save in-memory document state to the database."""

    #     # Load document model here to avoid startup errors
    #     from .models import Document

    #     document = await sync_to_async(Document.objects.get)(id=self.document_id)
    #     document.content = json.dumps(self.doc_state.to_json())
    #     await sync_to_async(document.save)()
