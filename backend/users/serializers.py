from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer as BaseRegisterSerializer
from .models import User, AthleteProfile, CoachProfile, RecruiterProfile


class RegisterSerializer(BaseRegisterSerializer):
    """Extends the default dj-rest-auth serializer to capture role on signup."""
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default=User.ATHLETE)

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data['first_name'] = self.validated_data.get('first_name', '')
        data['last_name'] = self.validated_data.get('last_name', '')
        data['role'] = self.validated_data.get('role', User.ATHLETE)
        return data

    def save(self, request):
        user = super().save(request)
        user.first_name = self.cleaned_data.get('first_name', '')
        user.last_name = self.cleaned_data.get('last_name', '')
        user.role = self.cleaned_data.get('role', User.ATHLETE)
        user.save()
        # Create the matching profile row automatically
        if user.role == User.ATHLETE:
            AthleteProfile.objects.get_or_create(user=user)
        elif user.role == User.COACH:
            CoachProfile.objects.get_or_create(user=user)
        elif user.role == User.RECRUITER:
            RecruiterProfile.objects.get_or_create(user=user)
        return user


class AthleteProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AthleteProfile
        exclude = ['user']


class CoachProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoachProfile
        exclude = ['user']


class RecruiterProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecruiterProfile
        exclude = ['user']


class UserSerializer(serializers.ModelSerializer):
    athlete_profile = AthleteProfileSerializer(read_only=True)
    coach_profile = CoachProfileSerializer(read_only=True)
    recruiter_profile = RecruiterProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'role',
            'athlete_profile', 'coach_profile', 'recruiter_profile',
        ]
        read_only_fields = ['id', 'email', 'role']
