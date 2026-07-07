/**
 * StatusTimeline — animated 5-step progress for a request's lifecycle.
 * open -> accepted -> picked up -> delivered -> completed.
 * The fill line animates as the request advances, and the current step glows.
 */
const STEPS = [
  { key: 'open', label: 'Open', icon: '📢' },
  { key: 'accepted', label: 'Accepted', icon: '🤝' },
  { key: 'picked_up', label: 'Picked', icon: '📦' },
  { key: 'delivered', label: 'Dropped', icon: '🛵' },
  { key: 'completed', label: 'Done', icon: '✅' },
];

const StatusTimeline = ({ status, isDark }) => {
  if (status === 'cancelled') {
    return (
      <div className="rounded-2xl px-4 py-3 mb-5 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-bold text-center">
        ✖ This request was cancelled
      </div>
    );
  }

  const current = STEPS.findIndex((s) => s.key === status);
  const pct = current <= 0 ? 0 : (current / (STEPS.length - 1)) * 100;

  return (
    <div className="mb-5">
      <div className="relative">
        {/* track */}
        <div className={`absolute top-4 left-0 right-0 h-1 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
        {/* fill */}
        <div
          className="absolute top-4 left-0 h-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 sling-timeline-fill"
          style={{ width: `${pct}%` }}
        />
        {/* steps */}
        <div className="relative flex justify-between">
          {STEPS.map((s, i) => {
            const done = i < current;
            const active = i === current;
            const base = 'w-9 h-9 rounded-full flex items-center justify-center text-sm border-2 z-10 transition';
            let look;
            if (done) look = 'bg-gradient-to-br from-blue-600 to-cyan-500 border-transparent text-white';
            else if (active) look = 'bg-white border-blue-600 text-blue-600 animate-glow';
            else look = isDark ? 'bg-slate-800 border-slate-600 text-slate-500' : 'bg-white border-slate-200 text-slate-300';

            return (
              <div key={s.key} className="flex flex-col items-center" style={{ width: '20%' }}>
                <div className={`${base} ${look}`}>{done ? '✓' : s.icon}</div>
                <span className={`text-[10px] font-semibold mt-1.5 text-center ${active ? 'text-blue-600' : isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatusTimeline;
