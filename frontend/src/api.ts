import type { AthleteProfile, AuthUser, MatchResult, SavedAthleteProfile } from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// In dev, Vite proxies /api → localhost:8000 so this is empty.
// In production, set VITE_API_URL=https://your-backend.railway.app
const API_BASE = import.meta.env.VITE_API_URL ?? '';

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Token ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.non_field_errors?.[0] ?? body.detail ?? body.error ?? `Request failed (${res.status})`);
  }
  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<{ key: string }> {
  return apiFetch('/api/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export interface RegisterData {
  email: string;
  password1: string;
  password2: string;
  first_name: string;
  last_name: string;
  role: string;
}

export async function register(data: RegisterData): Promise<{ key: string }> {
  return apiFetch('/api/auth/registration/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function loginWithGoogle(credential: string): Promise<{ key: string; user: AuthUser }> {
  return apiFetch('/api/auth/google-token/', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });
}

// ─── User ────────────────────────────────────────────────────────────────────

export async function getMe(token: string): Promise<AuthUser> {
  return apiFetch('/api/users/me/', {}, token);
}

// ─── Athlete profile ─────────────────────────────────────────────────────────

export async function getAthleteProfile(token: string): Promise<SavedAthleteProfile> {
  return apiFetch('/api/users/me/athlete-profile/', {}, token);
}

export async function saveAthleteProfile(token: string, data: Partial<SavedAthleteProfile>): Promise<SavedAthleteProfile> {
  return apiFetch('/api/users/me/athlete-profile/', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, token);
}

// ─── Match ───────────────────────────────────────────────────────────────────

export async function runMatch(profile: AthleteProfile, token?: string): Promise<MatchResult> {
  return apiFetch('/api/match/', {
    method: 'POST',
    body: JSON.stringify(profile),
  }, token);
}

export interface MatchHistoryItem {
  id: number;
  profile_snapshot: AthleteProfile;
  result: MatchResult;
  created_at: string;
}

export async function getMatchHistory(token: string): Promise<MatchHistoryItem[]> {
  return apiFetch('/api/match/history/', {}, token);
}
