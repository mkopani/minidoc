from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated


class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            # Generate or retrieve token
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "username": user.username,
                "token": token.key,
            }, status=status.HTTP_200_OK)

        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Delete token and log out
        request.user.auth_token.delete()
        logout(request)
        return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
