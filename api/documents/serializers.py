from rest_framework import serializers

from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        exclude = ["content"]  # Avoid returning binary data to the client
