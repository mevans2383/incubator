from typing import List

from django.conf import settings
from openai import OpenAI
from pydantic import BaseModel
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import MatchResult
from .serializers import MatchResultSerializer


# ─── Structured output schema ─────────────────────────────────────────────────

class SchoolMatch(BaseModel):
    name: str
    abbr: str
    division: str
    conference: str
    location: str
    state: str
    distance: str
    fitScore: int
    enrollment: str
    avgGpa: str
    coachName: str
    coachEmail: str
    emailDate: str
    campName: str
    campDate: str
    followDate: str
    primaryColor: str
    secondaryColor: str
    fitReason: str
    concern: str


class DivisionScores(BaseModel):
    fbs: int
    fcs: int
    d2: int
    d3: int
    naia: int
    juco: int


class MatchResponse(BaseModel):
    divisions: DivisionScores
    topDivision: str
    insight: str
    schools: List[SchoolMatch]


# ─── Prompt ───────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are an expert college football recruiting analyst with 20+ years evaluating prospects at every level from FBS to JUCO.

Your job is to analyze an athlete's profile and return 8 realistic school recommendations. Be honest — parents are making real decisions based on this.

DIVISION FIT RULES:
- Evaluate size, speed, and production relative to position norms at each division level
- NCAA D1/D2 requires a 2.3+ core GPA minimum; factor this in
- Weight high school prestige heavily: a player from Mater Dei, IMG, St. Thomas Aquinas, etc. gets a significant boost vs. a small rural program with identical measurables
- Weight career production heavily: All-state, high stats, D1-caliber opponents are strong signals
- A backup with minimal stats should be placed lower than a decorated starter at any level

GRADUATION YEAR ADJUSTMENTS (current year: 2026):
- Class of 2026 (senior): evaluate as-is — full ceiling is known
- Class of 2027 (junior): give credit for development, one full season remains
- Class of 2028 (sophomore): focus on athleticism and trajectory, ceiling is open
- Class of 2029 (freshman): focus almost entirely on physical projection, stats mean little

SCHOOL SELECTION RULES:
- Return exactly 8 schools ordered by fitScore descending (highest first)
- Factor in the athlete's priority rankings when selecting and ordering schools
- Factor in geographic preferences; use the athlete's home state as the origin for distance estimates
- Use EXACT official school colors (hex codes) — these are displayed in the UI
- All dates must be in 2026; email dates should be 2-4 weeks from today (April 2026)

DIVISION SCORES:
- Each division gets a 0-100 fit score (not a percentage of the athlete going there, but how well they'd fit if they did)
- Scores across divisions can sum to more than 100 — they are independent ratings"""


def _build_user_message(profile: dict) -> str:
    return f"""ATHLETE PROFILE:
Name: {profile.get('firstName', '')} {profile.get('lastName', '')}
Position: {profile.get('position', '')}
Graduation Year: {profile.get('gradYear', '')}
Height: {profile.get('height', '')}
Weight: {profile.get('weight', '')} lbs
40-Yard Dash: {profile.get('forty', 'Not provided')} sec
Bench Press: {profile.get('bench', 'Not provided')} lbs
GPA (unweighted): {profile.get('gpa', '')}
SAT: {profile.get('sat', 'Not provided')}
ACT: {profile.get('act', 'Not provided')}
Home State: {profile.get('state', '')}
High School: {profile.get('highSchool', 'Not provided')}
Intended Major: {profile.get('major', 'Undecided')}
Highlight Film: {'Provided' if profile.get('film') else 'Not provided'}

FOOTBALL CAREER SUMMARY:
{profile.get('career', 'Not provided')}

PREFERENCES:
Geographic Preference: {profile.get('region', 'No preference')}
Max Distance: {profile.get('distance', 'Anywhere')}
School Size: {profile.get('schoolSize', 'No preference')}
Priority Rankings (#1 = most important): {profile.get('priorities', 'Not specified')}

Analyze this athlete and return 8 realistic school matches."""


# ─── Views ────────────────────────────────────────────────────────────────────

class MatchView(APIView):
    """
    POST /api/match/
    Accepts an athlete profile, calls OpenAI, returns school recommendations.
    Works for anonymous and authenticated users. Authenticated results are saved.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        profile = request.data
        if not profile:
            return Response({'error': 'Profile data is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not settings.OPENAI_API_KEY:
            return Response(
                {'error': 'AI matching is not configured. Add OPENAI_API_KEY to the backend .env file.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            completion = client.beta.chat.completions.parse(
                model='gpt-4o-mini',
                messages=[
                    {'role': 'system', 'content': SYSTEM_PROMPT},
                    {'role': 'user', 'content': _build_user_message(profile)},
                ],
                response_format=MatchResponse,
            )
            parsed: MatchResponse = completion.choices[0].message.parsed
        except Exception as e:
            return Response(
                {'error': f'AI service error: {e}'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        # Convert Pydantic model to the shape the frontend expects
        result = {
            'divisions': {
                'FBS (D1)': parsed.divisions.fbs,
                'FCS (D1-AA)': parsed.divisions.fcs,
                'Division II': parsed.divisions.d2,
                'Division III': parsed.divisions.d3,
                'NAIA': parsed.divisions.naia,
                'JUCO': parsed.divisions.juco,
            },
            'topDivision': parsed.topDivision,
            'insight': parsed.insight,
            'schools': [s.model_dump() for s in parsed.schools],
        }

        # Persist for authenticated users
        if request.user and request.user.is_authenticated:
            MatchResult.objects.create(
                user=request.user,
                profile_snapshot=profile,
                result=result,
            )

        return Response(result)


class MatchHistoryView(generics.ListAPIView):
    """
    GET /api/match/history/
    Returns all saved match results for the authenticated user.
    """
    serializer_class = MatchResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MatchResult.objects.filter(user=self.request.user).order_by('-created_at')
