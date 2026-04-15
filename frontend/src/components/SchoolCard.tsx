import type { School } from '../types';

const DIV_COLORS: Record<string, string> = {
  D1: 'rgba(56,189,248,0.15)', FCS: 'rgba(56,189,248,0.1)',
  D2: 'rgba(167,139,250,0.15)', D3: 'rgba(74,222,128,0.12)',
  NAIA: 'rgba(251,191,36,0.12)', JUCO: 'rgba(251,113,133,0.12)',
};
const DIV_TEXT: Record<string, string> = {
  D1: '#38bdf8', FCS: '#7dd3fc', D2: '#a78bfa', D3: '#4ade80', NAIA: '#fbbf24', JUCO: '#fb7185',
};
const DIV_LABELS: Record<string, string> = {
  D1: 'Division I', FCS: 'FCS', D2: 'Division II', D3: 'Division III', NAIA: 'NAIA', JUCO: 'JUCO',
};

export default function SchoolCard({ school }: { school: School }) {
  const {
    name, abbr, division, conference, location, distance,
    fitScore, coachName, coachEmail,
    emailDate, campName, campDate, followDate,
    primaryColor, secondaryColor,
    fitReason, concern,
  } = school;

  const divBg = DIV_COLORS[division] ?? 'rgba(56,189,248,0.1)';
  const divText = DIV_TEXT[division] ?? '#38bdf8';
  const divLabel = DIV_LABELS[division] ?? division;

  return (
    <div
      className="rounded-[14px] overflow-hidden transition-all duration-200"
      style={{ background: '#111', border: '1px solid #1a1a1a' }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#38bdf8';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 28px rgba(56,189,248,0.1)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#1a1a1a';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      {/* Thin school-color top bar */}
      <div style={{ height: 4, background: primaryColor }} />

      <div className="p-4">
        {/* Header row: logo box + name + fit ring */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            {/* Logo / abbr box */}
            <div
              className="w-[42px] h-[42px] rounded-[9px] flex items-center justify-center text-[11px] font-black text-white shrink-0"
              style={{ background: primaryColor }}
            >
              {abbr}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-white leading-tight truncate">{name}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{conference}</p>
            </div>
          </div>

          {/* Fit ring */}
          <div
            className="w-11 h-11 rounded-full flex flex-col items-center justify-center shrink-0 border-[2.5px]"
            style={{ borderColor: primaryColor }}
          >
            <span className="text-[13px] font-black text-white leading-none">{fitScore}</span>
            <span className="text-[7px] text-slate-400 font-semibold mt-0.5">FIT</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span
            className="text-[10px] font-black px-1.5 py-0.5 rounded-[5px] tracking-wider uppercase"
            style={{ background: divBg, color: divText }}
          >
            {divLabel}
          </span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(56,189,248,0.1)', color: '#7dd3fc' }}
          >
            {fitScore}% match
          </span>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-y-1 mb-3">
          {[
            { icon: '◎', val: location },
            { icon: '→', val: distance },
          ].map(({ icon, val }) => (
            <div key={val} className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="text-slate-600 text-[10px]">{icon}</span>
              {val}
            </div>
          ))}
        </div>

        {/* Coach */}
        <div className="mb-3 pb-3 border-b border-[#1a1a1a]">
          <p className="text-xs font-semibold text-white mb-0.5">{coachName}</p>
          <a href={`mailto:${coachEmail}`}
            className="text-xs text-sky-400 hover:text-sky-300 transition-colors hover:underline">
            {coachEmail}
          </a>
        </div>

        {/* Action dates */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 text-center">
            <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wide">Email by</p>
            <span
              className="text-[10px] font-semibold px-2 py-1 rounded-full inline-block"
              style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)', color: '#38bdf8' }}
            >
              {emailDate}
            </span>
          </div>
          <div className="flex-1 text-center">
            <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wide">
              {campName ? campName.split(' ').slice(0,2).join(' ') : 'Camp'}
            </p>
            <span
              className="text-[10px] font-semibold px-2 py-1 rounded-full inline-block"
              style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)', color: '#fbbf24' }}
            >
              {campDate}
            </span>
          </div>
          <div className="flex-1 text-center">
            <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wide">Follow up</p>
            <span
              className="text-[10px] font-semibold px-2 py-1 rounded-full inline-block"
              style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa' }}
            >
              {followDate}
            </span>
          </div>
        </div>

        {/* Fit reason + concern */}
        <div
          className="text-[11px] text-slate-400 leading-relaxed mb-2 px-2.5 py-2 rounded-[7px]"
          style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}
        >
          <span className="text-sky-400 font-bold text-[10px] uppercase tracking-wider block mb-0.5">Fit</span>
          {fitReason}
        </div>
        <div
          className="text-[11px] text-slate-400 leading-relaxed mb-3 px-2.5 py-2 rounded-[7px]"
          style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}
        >
          <span className="text-amber-400 font-bold text-[10px] uppercase tracking-wider block mb-0.5">Note</span>
          {concern}
        </div>

        {/* Email CTA */}
        <a
          href={`mailto:${coachEmail}?subject=Recruiting Inquiry — ${abbr}`}
          className="block w-full text-center py-2 rounded-[7px] text-xs font-semibold text-slate-400 transition-all"
          style={{ background: '#0d0d0d', border: '1px solid #222' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = '#38bdf8';
            (e.currentTarget as HTMLAnchorElement).style.color = '#38bdf8';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = '#222';
            (e.currentTarget as HTMLAnchorElement).style.color = '#94a3b8';
          }}
        >
          Email Coach
        </a>
      </div>
    </div>
  );
}
