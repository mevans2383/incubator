from django.contrib.auth.models import AbstractUser
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.db import models


class User(AbstractUser):
    ATHLETE = 'athlete'
    COACH = 'coach'
    RECRUITER = 'recruiter'
    ROLE_CHOICES = [
        (ATHLETE, 'Athlete'),
        (COACH, 'Coach'),
        (RECRUITER, 'Recruiter'),
    ]

    # Override username — not used for login, kept optional for display
    username = models.CharField(
        max_length=150,
        blank=True,
        validators=[UnicodeUsernameValidator()],
    )
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ATHLETE)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email


class AthleteProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='athlete_profile')

    # Physical measurables
    position = models.CharField(max_length=50, blank=True)
    grad_year = models.IntegerField(null=True, blank=True)
    height = models.CharField(max_length=10, blank=True)
    weight = models.IntegerField(null=True, blank=True)
    forty = models.FloatField(null=True, blank=True, verbose_name='40-yard dash (sec)')
    bench = models.IntegerField(null=True, blank=True, verbose_name='bench press (lbs)')

    # Academics
    gpa = models.FloatField(null=True, blank=True)
    sat = models.IntegerField(null=True, blank=True)
    act = models.IntegerField(null=True, blank=True)
    intended_major = models.CharField(max_length=200, blank=True)

    # Background
    state = models.CharField(max_length=2, blank=True)
    high_school = models.CharField(max_length=200, blank=True)
    career_summary = models.TextField(blank=True)
    film_url = models.URLField(blank=True)

    # Preferences
    region_pref = models.CharField(max_length=100, blank=True)
    distance_pref = models.CharField(max_length=100, blank=True)
    school_size_pref = models.CharField(max_length=50, blank=True)
    priorities = models.TextField(blank=True)

    def __str__(self):
        return f'{self.user.email} — Athlete Profile'


class CoachProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='coach_profile')
    school = models.CharField(max_length=200, blank=True)
    division = models.CharField(max_length=50, blank=True)
    conference = models.CharField(max_length=100, blank=True)
    position_coached = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f'{self.user.email} — Coach Profile'


class RecruiterProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='recruiter_profile')
    organization = models.CharField(max_length=200, blank=True)
    recruiting_region = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f'{self.user.email} — Recruiter Profile'
