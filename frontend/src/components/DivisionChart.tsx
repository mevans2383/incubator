import { useEffect, useRef, useState } from 'react';

const DIVISION_ORDER = ['FBS (D1)', 'FCS (D1-AA)', 'Division II', 'Division III', 'NAIA', 'JUCO'];

interface Props {
  divisions: Record<string, number>;
  topDivision: string;
}

export default function DivisionChart({ divisions, topDivision }: Props) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div ref={ref} className="space-y-3.5">
      {DIVISION_ORDER.map(div => {
        const score = divisions[div] ?? 0;
        const isTop = div === topDivision;

        return (
          <div key={div}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${isTop ? 'text-white font-bold' : 'text-slate-400'}`}>
                  {div}
                </span>
                {isTop && (
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wider uppercase"
                    style={{
                      background: 'rgba(56,189,248,0.15)',
                      border: '1px solid rgba(56,189,248,0.3)',
                      color: '#38bdf8',
                    }}
                  >
                    Best Fit
                  </span>
                )}
              </div>
              <span className={`text-xs font-bold tabular-nums ${isTop ? 'text-sky-400' : 'text-slate-500'}`}>
                {score}%
              </span>
            </div>
            <div className="div-track">
              <div
                className="div-fill"
                style={{
                  width: animated ? `${score}%` : '0%',
                  background: isTop
                    ? 'linear-gradient(90deg,#0ea5e9,#38bdf8)'
                    : '#2a2a2a',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
