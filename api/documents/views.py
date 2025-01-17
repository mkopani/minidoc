# from django.contrib.auth.models import User
import logging

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Document
from .serializers import DocumentSerializer

logger = logging.getLogger(__name__)


class DocumentViewSet(viewsets.ModelViewSet):
    """
    Model ViewSet for Document model.

    Routes:
    - GET /documents/ -> list(): Get list of documents
    - GET /documents/{id}/ -> retrieve(): Get a single document
    - DELETE /documents/{id}/ -> destroy(): Delete a single document

    Not yet implemented:
    - PATCH /documents/{id}/add_collaborator/ -> add_collaborator():
        Add a collaborator to a document
    """

    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # TODO: Uncomment this after implementing auth and adding author field
        # serializer.save(author=self.request.user)

        super().perform_create(serializer)

    def list(self, request, *args, **kwargs):
        logger.info(
            f"User {request.user} is listing documents and is authenticated: {request.user.is_authenticated}"
        )
        if not request.user.is_authenticated:
            logger.warning("User is not authenticated")
            return Response(
                {"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED
            )
        # TODO: Add query param for user ID to fetch docs owned by user or
        # collaborated on by user

        self.queryset = self.queryset.order_by("-updated_at")

        return super().list(request, *args, **kwargs)

    @action(detail=True, methods=["patch"], url_path="add_collaborator")
    def add_collaborator(self, request):
        # TODO: Implement
        return Response("Not implemented", status=status.HTTP_501_NOT_IMPLEMENTED)

    # ********************************************************************
    # Disable create and update endpoints; this is handled via WebSocket
    def create(self, request, *args, **kwargs):
        pass

    def update(self, request, *args, **kwargs):
        pass
