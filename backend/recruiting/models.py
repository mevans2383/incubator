from django.conf import settings
from django.db import models


class MatchResult(models.Model):
    """Stores a snapshot of the athlete profile and the Claude response."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='match_results',
        null=True,
        blank=True,  # Anonymous requests are allowed; no user attached
    )
    profile_snapshot = models.JSONField()  # The form data sent to Claude
    result = models.JSONField()            # The full Claude JSON response
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        who = self.user.email if self.user else 'Anonymous'
        return f'Match for {who} at {self.created_at:%Y-%m-%d %H:%M}'
