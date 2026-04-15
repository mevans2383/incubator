import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

type Mode = 'login' | 'signup';

const ROLES = [
  { value: 'athlete', label: 'Athlete', desc: 'Find your best-fit programs' },
  { value: 'coach', label: 'Coach', desc: 'Discover recruit prospects' },
  { value: 'recruiter', label: 'Recruiter', desc: 'Build your pipeline' },
];

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

// Declare the Google GIS global
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (el: HTMLElement, config: object) => void;
        };
      };
    };
  }
}

export default function AuthPage() {
  const { login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [role, setRole] = useState('athlete');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Initialize Google Sign-In button
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !window.google || !googleBtnRef.current) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response: { credential: string }) => {
        setError(null);
        setIsSubmitting(true);
        try {
          await loginWithGoogle(response.credential);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Google sign-in failed.');
        } finally {
          setIsSubmitting(false);
        }
      },
    });
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: 'filled_black',
      size: 'large',
      width: googleBtnRef.current.offsetWidth || 400,
      text: mode === 'login' ? 'signin_with' : 'signup_with',
      shape: 'rectangular',
    });
  }, [mode, loginWithGoogle]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === 'signup' && password !== password2) {
      setError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({ email, password1: password, password2, first_name: firstName, last_name: lastName, role });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function switchMode() {
    setMode(m => m === 'login' ? 'signup' : 'login');
    setError(null);
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #0d1f35 0%, #0a0a0a 65%)' }}
    >
      {/* Wordmark */}
      <p
        className="text-2xl font-black tracking-[-0.02em] mb-8"
        style={{
          background: 'linear-gradient(90deg,#fff 40%,#7dd3fc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        ScoutGrade
      </p>

      <div
        className="w-full max-w-md rounded-2xl"
        style={{ background: '#111', border: '1px solid #1e1e1e', boxShadow: '0 4px 60px rgba(0,0,0,0.6)' }}
      >
        {/* Header */}
        <div className="px-8 pt-7 pb-5 border-b border-[#1a1a1a]">
          <h1 className="text-xl font-bold text-white">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {mode === 'login'
              ? "Don't have an account? "
              : 'Already have an account? '}
            <button
              type="button"
              onClick={switchMode}
              className="text-sky-400 hover:text-sky-300 font-semibold transition-colors"
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>

        <div className="px-8 py-6 space-y-5">
          {/* Google button */}
          {GOOGLE_CLIENT_ID ? (
            <div>
              <div ref={googleBtnRef} className="w-full" />
            </div>
          ) : (
            <div
              className="w-full py-3 rounded-xl text-center text-xs text-slate-500"
              style={{ background: '#0d0d0d', border: '1px solid #222' }}
            >
              Google Sign-In — add VITE_GOOGLE_CLIENT_ID to enable
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#1e1e1e]" />
            <span className="text-xs text-slate-600 font-medium">or continue with email</span>
            <div className="flex-1 h-px bg-[#1e1e1e]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Signup-only fields */}
            {mode === 'signup' && (
              <>
                {/* Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="field-label">First Name</label>
                    <input className="dark-input" value={firstName}
                      onChange={e => setFirstName(e.target.value)} placeholder="Jake" required />
                  </div>
                  <div>
                    <label className="field-label">Last Name</label>
                    <input className="dark-input" value={lastName}
                      onChange={e => setLastName(e.target.value)} placeholder="Smith" required />
                  </div>
                </div>

                {/* Role selector */}
                <div>
                  <label className="field-label">I am a</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {ROLES.map(r => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-center transition-all"
                        style={
                          role === r.value
                            ? { background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.4)', color: '#38bdf8' }
                            : { background: '#0d0d0d', border: '1px solid #222', color: '#94a3b8' }
                        }
                      >
                        <span className="text-xs font-bold">{r.label}</span>
                        <span className="text-[10px] leading-tight opacity-70">{r.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="field-label">Email</label>
              <input className="dark-input" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required autoComplete="email" />
            </div>

            {/* Password */}
            <div>
              <label className="field-label">Password</label>
              <input className="dark-input" type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </div>

            {/* Confirm password (signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="field-label">Confirm Password</label>
                <input className="dark-input" type="password" value={password2}
                  onChange={e => setPassword2(e.target.value)}
                  placeholder="••••••••" required autoComplete="new-password" />
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                className="px-4 py-3 rounded-xl text-sm text-red-400"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full justify-center py-3 text-sm"
            >
              {isSubmitting
                ? 'Please wait…'
                : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>

      <p className="mt-6 text-xs text-slate-600 text-center max-w-xs">
        By continuing you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
