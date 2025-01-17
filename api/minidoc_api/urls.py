"""
URL configuration for minidoc_api project.
"""

from rest_framework.routers import DefaultRouter

from django.urls import include, path

from documents.views import DocumentViewSet

from .views import CSRFTokenView, LoginView, LogoutView

router = DefaultRouter()
router.register(r"documents", DocumentViewSet, basename="document")

urlpatterns = [
    path(
        "auth/",
        include(
            [
                path("csrf-token/", CSRFTokenView.as_view(), name="csrf-token"),
                path("login/", LoginView.as_view(), name="login"),
                path("logout/", LogoutView.as_view(), name="logout"),
            ]
        ),
    ),
    path("", include(router.urls)),
]
