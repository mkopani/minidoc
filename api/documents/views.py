# from django.contrib.auth.models import User
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets

from .models import Document
from .serializers import DocumentSerializer


class DocumentViewSet(viewsets.ModelViewSet):
    """
    Model ViewSet for Document model.

    Routes:
    - GET /documents/ -> list(): Get list of documents
    - POST /documents/ -> create(): Create a new document
    - GET /documents/{id}/ -> retrieve(): Get a single document
    - PUT /documents/{id}/ -> update(): Update a single document
    - DELETE /documents/{id}/ -> destroy(): Delete a single document

    Not yet implemented:
    - PATCH /documents/{id}/add_collaborator/ -> add_collaborator(): Add a collaborator to a document
    """
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

    # PATH: /documents/
    def list(self, request, *args, **kwargs):
        # TODO: Add query param for user ID to fetch docs owned by user or
        # collaborated on by user
        return super().list(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        # TODO: Set user ID as author of document
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        # TODO: Validate that user is author of document
        return super().update(request, *args, **kwargs)
    
    @action(detail=True, methods=['patch'], url_path='add_collaborator')
    def add_collaborator(self, request):
        # TODO: Implement
        return Response("Not implemented", status=status.HTTP_501_NOT_IMPLEMENTED)
