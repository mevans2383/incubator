from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from rest_framework import generics, permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AthleteProfile, CoachProfile, RecruiterProfile, User
from .serializers import (
    AthleteProfileSerializer,
    CoachProfileSerializer,
    RecruiterProfileSerializer,
    UserSerializer,
)


class GoogleLogin(SocialLoginView):
    """OAuth2 code-based Google login (used by allauth redirect flow)."""
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    callback_url = 'http://localhost:8000/api/auth/google/callback/'


class GoogleTokenLoginView(APIView):
    """
    POST /api/auth/google-token/

    Accepts a Google ID token (credential) from the Google Identity Services
    JS library and returns a DRF auth token.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from django.conf import settings

        credential = request.data.get('credential')
        if not credential:
            return Response({'error': 'credential is required.'}, status=status.HTTP_400_BAD_REQUEST)

        client_id = settings.GOOGLE_CLIENT_ID
        if not client_id:
            return Response({'error': 'Google OAuth is not configured on this server.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        try:
            idinfo = google_id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                client_id,
            )
        except ValueError as e:
            return Response({'error': f'Invalid Google token: {e}'}, status=status.HTTP_400_BAD_REQUEST)

        email = idinfo.get('email')
        if not email:
            return Response({'error': 'Could not retrieve email from Google token.'}, status=status.HTTP_400_BAD_REQUEST)

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name': idinfo.get('given_name', ''),
                'last_name': idinfo.get('family_name', ''),
                'role': User.ATHLETE,
            },
        )

        if created:
            AthleteProfile.objects.get_or_create(user=user)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'key': token.key,
            'user': UserSerializer(user).data,
        })


class MeView(generics.RetrieveUpdateAPIView):
    """Get or update the authenticated user's account info."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class AthleteProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = AthleteProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = AthleteProfile.objects.get_or_create(user=self.request.user)
        return profile


class CoachProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = CoachProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = CoachProfile.objects.get_or_create(user=self.request.user)
        return profile


class RecruiterProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = RecruiterProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = RecruiterProfile.objects.get_or_create(user=self.request.user)
        return profile
