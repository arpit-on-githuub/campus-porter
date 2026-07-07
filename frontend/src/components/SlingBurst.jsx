/**
 * SlingBurst — the full-screen "zoomed SLING" celebration.
 * Fired when a request is posted or accepted. The parcel logo springs in big,
 * confetti bursts outward, and a headline pops, then it fades on its own.
 */
const CONFETTI = Array.from({ length: 12 });

const SlingBurst = ({ title = 'Slung!', subtitle = '' }) => {
  return (
    <div className="sling-burst-overlay" role="status" aria-live="polite">
      <div className="sling-burst-glow" />
      <div className="sling-burst-stage">
        {CONFETTI.map((_, i) => (
          <span key={i} className="sling-confetti" style={{ '--i': i }} />
        ))}

        <div className="sling-burst-logo">
          <svg viewBox="0 0 64 64" width="64%" height="64%" fill="none" aria-hidden="true">
            <g stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.9">
              <line x1="6" y1="24" x2="22" y2="24" />
              <line x1="2" y1="34" x2="18" y2="34" />
              <line x1="8" y1="44" x2="20" y2="44" />
            </g>
            <rect x="26" y="20" width="26" height="24" rx="6" fill="#ffffff" />
            <path d="M52 26 L60 32 L52 38" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>

        <h2 className="sling-burst-title">{title}</h2>
        {subtitle ? <p className="sling-burst-subtitle">{subtitle}</p> : null}
      </div>
    </div>
  );
};

export default SlingBurst;
