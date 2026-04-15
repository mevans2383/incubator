import { useAuth } from '../contexts/AuthContext';

type Tab = 'profile' | 'schools';

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  hasResults: boolean;
}

export default function NavBar({ activeTab, onTabChange, hasResults }: Props) {
  const { user, logout } = useAuth();

  return (
    <div
      className="sticky top-0 z-50 flex items-center justify-between px-7 h-[62px] border-b border-[#1a1a1a]"
      style={{ background: '#0d0d0d' }}
    >
      {/* Wordmark */}
      <span
        className="text-[19px] font-black tracking-[-0.02em] shrink-0"
        style={{
          background: 'linear-gradient(90deg,#fff 40%,#7dd3fc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        ScoutGrade
      </span>

      {/* Tabs */}
      <div className="flex items-center gap-1">
        {(
          [
            { key: 'profile', label: 'Profile' },
            { key: 'schools', label: 'My Schools', badge: hasResults },
          ] as { key: Tab; label: string; badge?: boolean }[]
        ).map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className="relative flex items-center gap-1.5 px-4 py-2 rounded-[9px] text-sm font-semibold transition-all"
            style={
              activeTab === tab.key
                ? { color: '#fff', background: 'rgba(56,189,248,0.08)' }
                : { color: '#94a3b8', background: 'none' }
            }
          >
            {tab.label}
            {tab.badge && (
              <span
                className="text-[10px] font-black px-1.5 py-px rounded-full"
                style={{ background: '#38bdf8', color: '#0a0a0a' }}
              >
                New
              </span>
            )}
            {activeTab === tab.key && (
              <span
                className="absolute bottom-[-13px] left-3.5 right-3.5 h-[2px] rounded-full"
                style={{ background: 'linear-gradient(90deg,#0ea5e9,#38bdf8)' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* User + logout */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-slate-400 hidden sm:block">
          {user?.first_name || user?.email}
        </span>
        <button
          type="button"
          onClick={logout}
          className="text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors px-3 py-1.5 rounded-lg"
          style={{ border: '1px solid #222' }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
