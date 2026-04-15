from django.contrib import admin
from django.urls import path, include
from users.views import GoogleLogin, GoogleTokenLoginView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth — login, logout, password reset, token refresh
    path('api/auth/', include('dj_rest_auth.urls')),
    # Auth — registration
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    # Auth — Google OAuth (allauth redirect flow)
    path('api/auth/google/', GoogleLogin.as_view(), name='google_login'),
    # Auth — Google ID token login (used by the React frontend via GIS)
    path('api/auth/google-token/', GoogleTokenLoginView.as_view(), name='google_token_login'),

    # Users — current user profile
    path('api/users/', include('users.urls')),

    # Recruiting — match + history
    path('api/', include('recruiting.urls')),
]
