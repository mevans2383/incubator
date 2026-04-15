from rest_framework import serializers
from .models import MatchResult


class MatchResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchResult
        fields = ['id', 'profile_snapshot', 'result', 'created_at']
        read_only_fields = ['id', 'created_at']
