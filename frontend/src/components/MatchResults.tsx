import type { AthleteProfile, MatchResult } from '../types';
import DivisionChart from './DivisionChart';
import SchoolCard from './SchoolCard';

interface Props {
  result: MatchResult;
  athlete: AthleteProfile;
  onBack: () => void;
}

export default function MatchResults({ result, athlete, onBack }: Props) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Sticky nav bar */}
      <div
        className="sticky top-0 z-50 flex items-center justify-between px-7 h-[62px] border-b border-[#1a1a1a]"
        style={{ background: '#0d0d0d' }}
      >
        <button
          onClick={onBack}
          className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
        >
          ← New Search
        </button>
        <span
          className="text-[19px] font-black tracking-[-0.02em]"
          style={{
            background: 'linear-gradient(90deg,#fff 40%,#7dd3fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          ScoutGrade
        </span>
        <span className="text-xs font-bold tracking-wider text-sky-400 uppercase">
          {result.topDivision}
        </span>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-7">

        {/* Profile banner */}
        <div
          className="rounded-2xl px-7 py-5 mb-6"
          style={{
            background: 'linear-gradient(135deg,#0d1f35 0%,#0a2540 100%)',
            border: '1px solid #1a3a50',
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.1em] text-sky-400 uppercase mb-1.5">
                Athlete Profile
              </p>
              <h1 className="text-2xl font-black text-white mb-1">
                {athlete.firstName} {athlete.lastName}
              </h1>
              <p className="text-sky-300 text-sm">
                {athlete.position} &middot; Class of {athlete.gradYear} &middot; {athlete.state}
              </p>
            </div>
            <div
              className="rounded-xl px-5 py-3 text-center shrink-0"
              style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}
            >
              <p className="text-[10px] text-sky-400 font-bold tracking-wider uppercase mb-1">Best Fit</p>
              <p className="text-lg font-black text-white leading-tight">{result.topDivision}</p>
            </div>
          </div>

          {/* Quick stats */}
          <div
            className="flex flex-wrap gap-6 mt-4 pt-4"
            style={{ borderTop: '1px solid rgba(56,189,248,0.1)' }}
          >
            {[
              { label: 'GPA', val: athlete.gpa },
              { label: 'Position', val: athlete.position },
              { label: 'Height', val: athlete.height || '—' },
              { label: 'Weight', val: athlete.weight ? `${athlete.weight} lbs` : '—' },
              ...(athlete.forty ? [{ label: '40 Yard', val: `${athlete.forty}s` }] : []),
            ].map(({ label, val }) => (
              <div key={label}>
                <p className="text-[10px] text-sky-400 font-bold tracking-wider uppercase mb-0.5">{label}</p>
                <p className="text-sm font-bold text-white">{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:grid gap-5" style={{ gridTemplateColumns: '280px 1fr' }}>

          {/* ── Left column ── */}
          <div className="space-y-4">

            {/* Division fit */}
            <div className="dark-card p-5">
              <h2 className="text-sm font-bold text-white mb-1">Division Fit</h2>
              <p className="text-xs text-slate-500 mb-5">Based on your full profile</p>
              <DivisionChart divisions={result.divisions} topDivision={result.topDivision} />
            </div>

            {/* Scouting insight */}
            <div
              className="rounded-2xl p-5"
              style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)' }}
            >
              <p
                className="text-[10px] font-bold tracking-[0.08em] uppercase mb-2"
                style={{ color: '#38bdf8' }}
              >
                Scouting Report
              </p>
              <p className="text-xs text-sky-100 leading-relaxed">{result.insight}</p>
            </div>
          </div>

          {/* ── Right column ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white">Your Top School Matches</h2>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8' }}
              >
                {result.schools.length} schools
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {result.schools.map(school => (
                <SchoolCard key={school.name} school={school} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-10 pb-6">
          <p className="text-xs text-slate-600 mb-4">
            Results are AI-generated and for informational purposes only. Always contact programs directly.
          </p>
          <button
            onClick={onBack}
            className="btn-ghost text-sm"
          >
            Run Another Match
          </button>
        </div>
      </div>
    </div>
  );
}
