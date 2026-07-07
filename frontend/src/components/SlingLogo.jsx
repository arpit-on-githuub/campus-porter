/**
 * SLING — animated brand mark.
 *
 * The name SLING means "to move things easily". The logo captures that: a
 * parcel is flung forward along a subtle arc with speed lines trailing behind
 * it, so the brand literally shows motion. Animations are intentionally gentle
 * (slow float + soft speed-line sweep) to keep the UI/UX subtle.
 */
const SlingLogo = ({ size = 72, withWordmark = false, tagline = false }) => {
  return (
    <div className="flex flex-col items-center select-none">
      <div
        className="sling-badge animate-pop-in"
        style={{ width: size, height: size }}
        aria-label="SLING logo"
      >
        <svg viewBox="0 0 64 64" width="60%" height="60%" fill="none" aria-hidden="true">
          {/* speed / motion lines that sweep to convey "slinging" */}
          <g className="sling-speedlines" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.9">
            <line x1="6" y1="24" x2="22" y2="24" />
            <line x1="2" y1="34" x2="18" y2="34" />
            <line x1="8" y1="44" x2="20" y2="44" />
          </g>
          {/* the parcel being slung forward, gently floating */}
          <g className="sling-parcel">
            <rect x="26" y="20" width="26" height="24" rx="6" fill="white" />
            <path d="M26 28 L52 28" stroke="#2563eb" strokeWidth="2.5" opacity="0.6" />
            <path d="M39 20 L39 44" stroke="#2563eb" strokeWidth="2.5" opacity="0.35" />
            {/* arrow tip = direction of travel */}
            <path d="M52 26 L60 32 L52 38" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        </svg>
      </div>

      {withWordmark && (
        <h1
          className="mt-4 font-black tracking-tight bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent sling-wordmark"
          style={{ fontSize: size * 0.5, backgroundSize: '200% auto' }}
        >
          SLING
        </h1>
      )}
      {tagline && (
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-slate-400 mt-0.5">
          Move things, easily
        </p>
      )}
    </div>
  );
};

export default SlingLogo;
