import { useState } from 'react';
import type { AthleteProfile } from '../types';

// ─── Static data ──────────────────────────────────────────────────────────────

const POSITIONS = ['QB','RB','WR','TE','OT','OG','C','DE','DT','ILB','OLB','CB','FS','SS','K','P','LS','ATH'];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
];

const REGIONS = ['Northeast','Mid-Atlantic','Southeast','Midwest','Southwest','Mountain West','Pacific Coast'];
const DISTANCES = ['Within 2 hours','Within 4 hours','Within 8 hours','Anywhere in the US'];
const SCHOOL_SIZES = ['Small (< 5,000)','Medium (5,000–15,000)','Large (> 15,000)'];

const PRIORITY_OPTIONS = [
  { label: 'Athletics', desc: 'Winning program, coaching quality' },
  { label: 'Academics', desc: 'Academic reputation and majors' },
  { label: 'Playing Time', desc: 'Realistic path to the field' },
  { label: 'Location', desc: 'Geography and proximity to home' },
  { label: 'Social Life', desc: 'Campus culture and environment' },
  { label: 'Facilities', desc: 'Training and stadium quality' },
  { label: 'Scholarship', desc: 'Financial aid and offers' },
  { label: 'Program Prestige', desc: 'Brand, exposure, and history' },
];

const STEPS = [
  { label: 'Player Info', sub: 'Your basics and position' },
  { label: 'Measurables', sub: 'Physical stats coaches evaluate' },
  { label: 'Academics', sub: 'GPA and test scores' },
  { label: 'Your Story', sub: 'Career highlights and film' },
  { label: 'Preferences', sub: 'Location and priorities' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({
  label, error, hint, children,
}: {
  label: string; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="field-label">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-slate-500 mt-1.5">{hint}</p>}
      {error && <p className="text-xs text-red-400 mt-1.5 font-medium">{error}</p>}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseHeight(h: string): { ft: string; in: string } {
  const m = h?.match(/^(\d)'(\d+)"/);
  return m ? { ft: m[1], in: m[2] } : { ft: '', in: '0' };
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface ProfileFormInitialData {
  firstName?: string;
  lastName?: string;
  position?: string;
  gradYear?: string;
  state?: string;
  highSchool?: string;
  height?: string;
  weight?: string;
  forty?: string;
  bench?: string;
  gpa?: string;
  sat?: string;
  act?: string;
  major?: string;
  career?: string;
  film?: string;
  regions?: string[];
  distance?: string;
  schoolSize?: string;
  priorities?: string[];
}

interface Props {
  onSubmit: (profile: AthleteProfile) => void;
  isLoading: boolean;
  error: string | null;
  initialData?: ProfileFormInitialData;
  submitLabel?: string;
}

export default function ProfileForm({ onSubmit, error, initialData, submitLabel }: Props) {
  const parsedH = parseHeight(initialData?.height ?? '');

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [heightFt, setHeightFt] = useState(parsedH.ft);
  const [heightIn, setHeightIn] = useState(parsedH.in);
  const [priorities, setPriorities] = useState<string[]>(initialData?.priorities ?? []);
  const [regions, setRegions] = useState<string[]>(initialData?.regions ?? []);

  const [form, setForm] = useState({
    firstName: initialData?.firstName ?? '',
    lastName: initialData?.lastName ?? '',
    position: initialData?.position ?? '',
    gradYear: initialData?.gradYear ?? String(new Date().getFullYear() + 1),
    state: initialData?.state ?? '',
    highSchool: initialData?.highSchool ?? '',
    weight: initialData?.weight ?? '',
    forty: initialData?.forty ?? '',
    bench: initialData?.bench ?? '',
    gpa: initialData?.gpa ?? '',
    sat: initialData?.sat ?? '',
    act: initialData?.act ?? '',
    major: initialData?.major ?? '',
    career: initialData?.career ?? '',
    film: initialData?.film ?? '',
    distance: initialData?.distance ?? '',
    schoolSize: initialData?.schoolSize ?? '',
  });

  const set = (field: keyof typeof form, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!form.firstName.trim()) e.firstName = 'Required';
      if (!form.lastName.trim()) e.lastName = 'Required';
      if (!form.position) e.position = 'Select a position';
      if (!form.state) e.state = 'Select your state';
    }
    if (step === 1) {
      if (!heightFt) e.height = 'Select height';
      if (!form.weight || Number(form.weight) <= 0) e.weight = 'Enter your weight';
    }
    if (step === 2) {
      if (!form.gpa || Number(form.gpa) <= 0) e.gpa = 'Enter your GPA';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => s + 1); };
  const back = () => { setErrors({}); setStep(s => s - 1); };

  const toggleRegion = (r: string) =>
    setRegions(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);

  const togglePriority = (label: string) =>
    setPriorities(prev =>
      prev.includes(label) ? prev.filter(p => p !== label) : [...prev, label],
    );

  const handleSubmit = () => {
    if (!validate()) return;
    const profile: AthleteProfile = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      position: form.position,
      gradYear: Number(form.gradYear),
      height: heightFt ? `${heightFt}'${heightIn}"` : '',
      weight: Number(form.weight),
      gpa: Number(form.gpa),
      state: form.state,
      ...(form.forty && { forty: Number(form.forty) }),
      ...(form.bench && { bench: Number(form.bench) }),
      ...(form.sat && { sat: Number(form.sat) }),
      ...(form.act && { act: Number(form.act) }),
      ...(form.highSchool.trim() && { highSchool: form.highSchool.trim() }),
      ...(form.major.trim() && { major: form.major.trim() }),
      ...(form.career.trim() && { career: form.career.trim() }),
      ...(form.film.trim() && { film: form.film.trim() }),
      ...(regions.length > 0 && { region: regions.join(', ') }),
      ...(form.distance && { distance: form.distance }),
      ...(form.schoolSize && { schoolSize: form.schoolSize }),
      ...(priorities.length > 0 && {
        priorities: priorities.map((p, i) => `#${i + 1} ${p}`).join(', '),
      }),
    };
    onSubmit(profile);
  };

  const currentYear = new Date().getFullYear();

  // ─── Step content ─────────────────────────────────────────────────────────

  const stepContent = [
    // 0 — Player Info
    <div key="info">
      <div className="grid grid-cols-2 gap-x-4">
        <Field label="First Name" error={errors.firstName}>
          <input className={`dark-input${errors.firstName ? ' error' : ''}`} value={form.firstName}
            onChange={e => set('firstName', e.target.value)} placeholder="Jake" />
        </Field>
        <Field label="Last Name" error={errors.lastName}>
          <input className={`dark-input${errors.lastName ? ' error' : ''}`} value={form.lastName}
            onChange={e => set('lastName', e.target.value)} placeholder="Smith" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-x-4">
        <Field label="Position" error={errors.position}>
          <select className={`dark-input${errors.position ? ' error' : ''}`} value={form.position}
            onChange={e => set('position', e.target.value)}>
            <option value="">Select…</option>
            {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Graduation Year">
          <select className="dark-input" value={form.gradYear} onChange={e => set('gradYear', e.target.value)}>
            {[currentYear, currentYear+1, currentYear+2, currentYear+3].map(y =>
              <option key={y} value={y}>{y}</option>
            )}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-x-4">
        <Field label="Home State" error={errors.state}>
          <select className={`dark-input${errors.state ? ' error' : ''}`} value={form.state}
            onChange={e => set('state', e.target.value)}>
            <option value="">Select…</option>
            {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="High School">
          <input className="dark-input" value={form.highSchool}
            onChange={e => set('highSchool', e.target.value)} placeholder="Lincoln High School" />
        </Field>
      </div>
    </div>,

    // 1 — Measurables
    <div key="measurables">
      <Field label="Height" error={errors.height}>
        <div className="grid grid-cols-2 gap-3">
          <select className={`dark-input${errors.height ? ' error' : ''}`} value={heightFt}
            onChange={e => { setHeightFt(e.target.value); setErrors(er => ({...er, height:''})); }}>
            <option value="">Feet</option>
            {['5','6','7'].map(f => <option key={f} value={f}>{f} ft</option>)}
          </select>
          <select className="dark-input" value={heightIn}
            onChange={e => setHeightIn(e.target.value)}>
            {Array.from({length:12},(_,i) => <option key={i} value={i}>{i} in</option>)}
          </select>
        </div>
      </Field>
      <Field label="Weight (lbs)" error={errors.weight}>
        <input type="number" className={`dark-input${errors.weight ? ' error' : ''}`}
          value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="185" />
      </Field>
      <div className="grid grid-cols-2 gap-x-4">
        <Field label="40-Yard Dash (sec)" hint="e.g. 4.52">
          <input type="number" step="0.01" className="dark-input" value={form.forty}
            onChange={e => set('forty', e.target.value)} placeholder="4.52" />
        </Field>
        <Field label="Bench Press (lbs)">
          <input type="number" className="dark-input" value={form.bench}
            onChange={e => set('bench', e.target.value)} placeholder="225" />
        </Field>
      </div>
    </div>,

    // 2 — Academics
    <div key="academics">
      <Field label="GPA (Unweighted)" error={errors.gpa} hint="NCAA D1/D2 requires 2.3+ core GPA.">
        <input type="number" step="0.01" className={`dark-input${errors.gpa ? ' error' : ''}`}
          value={form.gpa} onChange={e => set('gpa', e.target.value)} placeholder="3.5" />
      </Field>
      <div className="grid grid-cols-2 gap-x-4">
        <Field label="SAT Score">
          <input type="number" className="dark-input" value={form.sat}
            onChange={e => set('sat', e.target.value)} placeholder="1200" />
        </Field>
        <Field label="ACT Score">
          <input type="number" className="dark-input" value={form.act}
            onChange={e => set('act', e.target.value)} placeholder="26" />
        </Field>
      </div>
      <Field label="Intended Major">
        <input className="dark-input" value={form.major}
          onChange={e => set('major', e.target.value)} placeholder="Business, Engineering, Undecided…" />
      </Field>
    </div>,

    // 3 — Your Story
    <div key="story">
      <div className="flex gap-3 items-start bg-[rgba(56,189,248,0.06)] border border-[rgba(56,189,248,0.15)] rounded-xl p-3.5 mb-5 text-sm text-slate-400 leading-relaxed">
        <div className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
        <p>Be specific — this is the most important field. Include stats, awards, notable opponents, and what sets you apart. <span className="text-sky-300 font-semibold">Honesty leads to accurate matches.</span></p>
      </div>
      <Field label="Football Career Summary">
        <textarea
          className="dark-input resize-none"
          rows={6}
          value={form.career}
          onChange={e => set('career', e.target.value)}
          placeholder={`Example: "Two-year starter at QB for Lincoln High (5A). Led team to state championship — 2,800 passing yards, 31 TDs, 5 INTs. All-district first team. Played against three D1 commits this season…"`}
        />
      </Field>
      <Field label="Highlight Film URL" hint="Hudl, YouTube, or any public link">
        <input className="dark-input" type="url" value={form.film}
          onChange={e => set('film', e.target.value)} placeholder="https://hudl.com/video/…" />
      </Field>
    </div>,

    // 4 — Preferences
    <div key="prefs">
      <Field label="Geographic Region" hint="Select all that apply">
        <div className="flex flex-wrap gap-2 mt-1">
          {REGIONS.map(r => (
            <button key={r} type="button"
              className={`chip${regions.includes(r) ? ' active' : ''}`}
              onClick={() => toggleRegion(r)}>
              {r}
            </button>
          ))}
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-x-4">
        <Field label="Max Distance">
          <select className="dark-input" value={form.distance} onChange={e => set('distance', e.target.value)}>
            <option value="">No preference</option>
            {DISTANCES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="School Size">
          <select className="dark-input" value={form.schoolSize} onChange={e => set('schoolSize', e.target.value)}>
            <option value="">No preference</option>
            {SCHOOL_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <Field label="What matters most? Click to rank in order.">
        <div className="flex flex-col gap-2 mt-1">
          {PRIORITY_OPTIONS.map(opt => {
            const rank = priorities.indexOf(opt.label);
            const selected = rank !== -1;
            return (
              <div key={opt.label}
                className={`rank-item${selected ? ' ranked' : ''}`}
                onClick={() => togglePriority(opt.label)}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border transition-colors ${
                  selected
                    ? 'bg-[rgba(56,189,248,0.15)] border-[rgba(56,189,248,0.4)] text-sky-400'
                    : 'bg-[#1a1a1a] border-[#2a2a2a] text-slate-500'
                }`}>
                  {selected ? rank + 1 : '—'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${selected ? 'text-white' : 'text-slate-300'}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                </div>
                {selected && (
                  <div className="text-xs text-slate-500 shrink-0">#{rank+1}</div>
                )}
              </div>
            );
          })}
        </div>
        {priorities.length > 0 && (
          <button type="button" onClick={() => setPriorities([])}
            className="mt-3 text-xs text-slate-500 hover:text-slate-300 underline transition-colors">
            Clear rankings
          </button>
        )}
      </Field>
    </div>,
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #0d1f35 0%, #0a0a0a 65%)' }}
    >
      {/* Page header */}
      <div className="text-center pt-12 pb-8 px-6">
        <p className="text-xs font-bold tracking-[0.12em] text-sky-400 uppercase mb-3">
          ScoutGrade
        </p>
        <h1 className="text-3xl font-black text-white leading-tight">
          Find Your Level
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Get matched to college football programs that fit your profile
        </p>
      </div>

      {/* Form card */}
      <div className="w-full max-w-[520px] px-5 pb-16">
        <div className="dark-card shadow-2xl" style={{ boxShadow: '0 4px 60px rgba(0,0,0,0.6)' }}>

          {/* Step indicator */}
          <div className="flex items-center px-8 pt-7 pb-5 border-b border-[#1a1a1a]">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-300"
                  style={
                    i < step
                      ? { background: 'linear-gradient(135deg,#0ea5e9,#38bdf8)', color: '#0a0a0a' }
                      : i === step
                      ? { background: '#1a3a4a', border: '2px solid #38bdf8', color: '#38bdf8' }
                      : { background: '#1a1a1a', color: '#64748b' }
                  }
                >
                  {i < step ? '✓' : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className="flex-1 h-0.5 mx-2 transition-all duration-500"
                    style={
                      i < step
                        ? { background: 'linear-gradient(90deg,#0ea5e9,#38bdf8)' }
                        : { background: '#1e1e1e' }
                    }
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step body */}
          <div className="px-8 pt-6 pb-2">
            <h2 className="text-xl font-bold text-white">{STEPS[step].label}</h2>
            <p className="text-sm text-slate-400 mt-1 mb-6">{STEPS[step].sub}</p>
            {stepContent[step]}
          </div>

          {/* Error banner */}
          {error && (
            <div className="mx-8 mb-4 px-4 py-3 rounded-xl bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between px-8 py-5 border-t border-[#1a1a1a]">
            <button type="button" className="btn-ghost" onClick={back} disabled={step === 0}>
              Back
            </button>
            <span className="text-xs text-slate-600">{step + 1} / {STEPS.length}</span>
            {step < STEPS.length - 1 ? (
              <button type="button" className="btn-primary" onClick={next}>
                Continue
              </button>
            ) : (
              <button type="button" className="btn-primary" onClick={handleSubmit}>
                {submitLabel ?? 'Find My Schools'}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-5">
          Results are AI-generated and for informational purposes only.
        </p>
      </div>
    </div>
  );
}
