# from django.contrib.auth.models import User
import logging

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Document
from .serializers import DocumentSerializer, UpsertDocumentSerializer

logger = logging.getLogger(__name__)


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
    - PATCH /documents/{id}/add_collaborator/ -> add_collaborator():
        Add a collaborator to a document
    """

    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return UpsertDocumentSerializer
        return super().get_serializer_class()

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

    def create(self, request, *args, **kwargs):
        # TODO: Set user ID as author of document

        # Use the UpsertDocumentSerializer for validation and creation
        partial_serializer = self.get_serializer(data=request.data)
        partial_serializer.is_valid(raise_exception=True)
        self.perform_create(partial_serializer)

        # Retrieve the fully created instance and return it with the full serializer
        full_serializer = DocumentSerializer(
            partial_serializer.instance, context=self.get_serializer_context()
        )
        return Response(full_serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        # TODO: Validate that user is author of document

        # Retrieve the existing instance
        instance = self.get_object()

        # Use the UpsertDocumentSerializer for validation and updating
        partial_serializer = self.get_serializer(
            instance, data=request.data, partial=True
        )
        partial_serializer.is_valid(raise_exception=True)
        self.perform_update(partial_serializer)

        # Retrieve the updated instance and return it with the full serializer
        full_serializer = DocumentSerializer(
            partial_serializer.instance, context=self.get_serializer_context()
        )
        return Response(full_serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"], url_path="add_collaborator")
    def add_collaborator(self, request):
        # TODO: Implement
        return Response("Not implemented", status=status.HTTP_501_NOT_IMPLEMENTED)
