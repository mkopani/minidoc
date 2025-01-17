from django.urls import path

from documents.consumers import DocumentConsumer

websocket_urlpatterns = [
    path("ws/documents/<str:document_id>", DocumentConsumer.as_asgi())
]
