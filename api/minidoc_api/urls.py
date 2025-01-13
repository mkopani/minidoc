"""
URL configuration for minidoc_api project.
"""

from rest_framework.routers import DefaultRouter

from django.urls import include, path

from documents.views import DocumentViewSet

router = DefaultRouter()
router.register(r"documents", DocumentViewSet, basename="document")

urlpatterns = [
    path("", include(router.urls)),
]
