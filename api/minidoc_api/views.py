import logging

from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger(__name__)


class LoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        # Authenticate user
        user = authenticate(request, username=username, password=password)

        logger.info(f"User {username} is logging in: {user}")

        if user is not None:
            # Persist user in the request so that the user doesn't have to
            # re-authenticate on every request
            login(request, user)

            # Generate or retrieve token
            token, _ = Token.objects.get_or_create(user=user)
            return Response(
                {
                    "username": user.username,
                    "token": token.key,
                },
                status=status.HTTP_200_OK,
            )

        logger.warning(f"Login failed for username: {username}")
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Delete token and log out
        request.user.auth_token.delete()
        logout(request)
        return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)


class CSRFTokenView(APIView):
    def get(self, request):
        """
        Get CSRF token for the user
        """

        csrf_token = get_token(request)
        return Response({"csrfToken": csrf_token}, status=status.HTTP_200_OK)
