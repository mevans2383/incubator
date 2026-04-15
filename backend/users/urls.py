from django.urls import path
from . import views

urlpatterns = [
    path('me/', views.MeView.as_view(), name='user-me'),
    path('me/athlete-profile/', views.AthleteProfileView.as_view(), name='athlete-profile'),
    path('me/coach-profile/', views.CoachProfileView.as_view(), name='coach-profile'),
    path('me/recruiter-profile/', views.RecruiterProfileView.as_view(), name='recruiter-profile'),
]
