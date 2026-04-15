from django.urls import path
from . import views

urlpatterns = [
    path('match/', views.MatchView.as_view(), name='match'),
    path('match/history/', views.MatchHistoryView.as_view(), name='match-history'),
]
