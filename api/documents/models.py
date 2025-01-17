import uuid

# from django.contrib.auth.models import User
from django.db import models


class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    content =models.BinaryField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # TODO
    # author = models.ForeignKey(User, on_delete=models.CASCADE)
    # collaborators = models.ManyToManyField(User, related_name='collaborators')
