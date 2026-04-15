import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import NavBar from './components/NavBar';
import ProfileForm, { type ProfileFormInitialData } from './components/ProfileForm';
import MatchResults from './components/MatchResults';
import * as api from './api';
import type { AthleteProfile, MatchResult, SavedAthleteProfile } from './types';

type Tab = 'profile' | 'schools';

// ─── Loading screen ───────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-5">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-[#1e1e1e]" />
        <div className="absolute inset-0 rounded-full border-2 border-t-sky-400 animate-spin" />
      </div>
    </div>
  );
}

// ─── Onboarding welcome ───────────────────────────────────────────────────────

function WelcomeScreen({ firstName, onStart }: { firstName: string; onStart: () => void }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #0d1f35 0%, #0a0a0a 65%)' }}
    >
      <div className="w-full max-w-md text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-8"
          style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', color: '#38bdf8' }}
        >
          ScoutGrade AI
        </div>

        <h1 className="text-4xl font-black text-white leading-[1.1] mb-4">
          Welcome{firstName ? `, ${firstName}` : ''}.
        </h1>
        <p className="text-slate-400 text-base leading-relaxed mb-10">
          ScoutGrade analyzes your athletic and academic profile to match you with college football programs at the right level — honestly, not aspirationally.
        </p>

        {/* Feature list */}
        <div className="text-left space-y-3 mb-10">
          {[
            { title: 'Division fit analysis', desc: 'See your realistic fit across FBS, FCS, D2, D3, NAIA, and JUCO based on your measurables and production.' },
            { title: '8 personalized school matches', desc: 'Real programs with real coaches — ranked by how well they fit your profile, location preferences, and priorities.' },
            { title: 'Recruiting action plan', desc: 'Coach contacts, camp dates, and a follow-up timeline so you know exactly what to do next.' },
          ].map(f => (
            <div
              key={f.title}
              className="flex gap-3 p-4 rounded-xl"
              style={{ background: '#111', border: '1px solid #1e1e1e' }}
            >
              <div
                className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                style={{ background: '#38bdf8' }}
              />
              <div>
                <p className="text-sm font-semibold text-white">{f.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="btn-primary w-full justify-center py-3.5 text-sm" onClick={onStart}>
          Build My Profile
        </button>
        <p className="text-xs text-slate-600 mt-4">Takes about 3 minutes. Your data is saved automatically.</p>
      </div>
    </div>
  );
}

// ─── Schools empty state ──────────────────────────────────────────────────────

function EmptySchools({ onGoToProfile }: { onGoToProfile: () => void }) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)' }}
      >
        <div className="w-6 h-6 rounded-full border-2 border-sky-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">No matches yet</h2>
      <p className="text-sm text-slate-400 max-w-xs mb-6 leading-relaxed">
        Fill out your profile and click "Find My Schools" to get personalized program recommendations.
      </p>
      <button className="btn-primary" onClick={onGoToProfile}>
        Go to Profile
      </button>
    </div>
  );
}

// ─── Main app (authenticated) ─────────────────────────────────────────────────

function AuthenticatedApp() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [result, setResult] = useState<MatchResult | null>(null);
  const [lastAthlete, setLastAthlete] = useState<AthleteProfile | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [initialData, setInitialData] = useState<ProfileFormInitialData | undefined>();
  const [profileLoading, setProfileLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  // Load saved profile + most recent match on mount
  useEffect(() => {
    if (!token || !user) return;
    Promise.all([
      api.getAthleteProfile(token).catch(() => null),
      api.getMatchHistory(token).catch(() => [] as api.MatchHistoryItem[]),
    ]).then(([saved, history]) => {
      if (saved && saved.position) {
        // Returning user with a saved profile
        setInitialData(savedToFormData(user.first_name, user.last_name, saved));
      } else {
        // New user — show welcome before the form
        setShowWelcome(true);
      }
      if (history && history.length > 0) {
        const last = history[0];
        setResult(last.result);
        setLastAthlete(last.profile_snapshot);
      }
    }).finally(() => setProfileLoading(false));
  }, [token, user]);

  async function handleSubmit(profile: AthleteProfile) {
    if (!token || !user) return;
    setMatchError(null);
    setIsMatching(true);
    setLastAthlete(profile);
    try {
      // Save profile and update initialData so re-entering the form is pre-filled
      const saved = await api.saveAthleteProfile(token, formToSaved(profile));
      setInitialData(savedToFormData(user.first_name, user.last_name, saved));
      const data = await api.runMatch(profile, token);
      setResult(data);
      setActiveTab('schools');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setMatchError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setIsMatching(false);
    }
  }

  if (profileLoading) return <Spinner />;

  if (showWelcome) {
    return (
      <WelcomeScreen
        firstName={user?.first_name ?? ''}
        onStart={() => setShowWelcome(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <NavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasResults={result !== null}
      />

      {isMatching && (
        <div className="fixed inset-0 z-50 bg-[#0a0a0a]/80 flex flex-col items-center justify-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-[#1e1e1e]" />
            <div className="absolute inset-0 rounded-full border-2 border-t-sky-400 animate-spin" />
          </div>
          <p className="text-slate-300 text-sm font-medium">Analyzing your profile…</p>
        </div>
      )}

      {activeTab === 'profile' && (
        <ProfileForm
          key={JSON.stringify(initialData)}
          onSubmit={handleSubmit}
          isLoading={isMatching}
          error={matchError}
          initialData={initialData}
          submitLabel="Save & Find Schools"
        />
      )}

      {activeTab === 'schools' && (
        result && lastAthlete
          ? <MatchResults
              result={result}
              athlete={lastAthlete}
              onBack={() => setActiveTab('profile')}
            />
          : <EmptySchools onGoToProfile={() => setActiveTab('profile')} />
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

function Root() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  return user ? <AuthenticatedApp /> : <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}

// ─── Profile data mappers ─────────────────────────────────────────────────────

function savedToFormData(
  firstName: string,
  lastName: string,
  s: SavedAthleteProfile,
): ProfileFormInitialData {
  return {
    firstName,
    lastName,
    position: s.position,
    gradYear: s.grad_year ? String(s.grad_year) : undefined,
    state: s.state,
    highSchool: s.high_school,
    height: s.height,
    weight: s.weight ? String(s.weight) : undefined,
    forty: s.forty ? String(s.forty) : undefined,
    bench: s.bench ? String(s.bench) : undefined,
    gpa: s.gpa ? String(s.gpa) : undefined,
    sat: s.sat ? String(s.sat) : undefined,
    act: s.act ? String(s.act) : undefined,
    major: s.intended_major,
    career: s.career_summary,
    film: s.film_url,
    regions: s.region_pref ? s.region_pref.split(', ').filter(Boolean) : [],
    distance: s.distance_pref,
    schoolSize: s.school_size_pref,
    priorities: s.priorities ? s.priorities.match(/#\d+ ([^,]+)/g)?.map(p => p.replace(/#\d+ /, '')) ?? [] : [],
  };
}

function formToSaved(p: AthleteProfile): Partial<SavedAthleteProfile> {
  return {
    position: p.position,
    grad_year: p.gradYear,
    height: p.height,
    weight: p.weight,
    forty: p.forty ?? null,
    bench: p.bench ?? null,
    gpa: p.gpa,
    sat: p.sat ?? null,
    act: p.act ?? null,
    intended_major: p.major ?? '',
    state: p.state,
    high_school: p.highSchool ?? '',
    career_summary: p.career ?? '',
    film_url: p.film ?? '',
    region_pref: p.region ?? '',
    distance_pref: p.distance ?? '',
    school_size_pref: p.schoolSize ?? '',
    priorities: p.priorities ?? '',
  };
}
