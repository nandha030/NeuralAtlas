export const Logo = ({ size = 32, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="na-logo-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="var(--na-gold-2)" />
        <stop offset="100%" stopColor="var(--na-gold)" />
      </linearGradient>
    </defs>
    <g fill="url(#na-logo-g)" stroke="url(#na-logo-g)" strokeWidth="1.5" strokeLinejoin="round">
      <circle cx="50" cy="50" r="42" fill="none" />
      <circle cx="50" cy="50" r="35" fill="none" />
      <path d="M50 8 L54 45 L92 50 L54 55 L50 92 L46 55 L8 50 L46 45 Z" />
      <path d="M50 22 L52.5 47.5 L77.5 50 L52.5 52.5 L50 78 L47.5 52.5 L22.5 50 L47.5 47.5 Z" opacity="0.85" />
      <circle cx="50" cy="50" r="8" fill="none" strokeWidth="2" />
      <circle cx="50" cy="50" r="3" fill="url(#na-logo-g)" />
    </g>
  </svg>
);

export const Wordmark = ({ className = "" }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <Logo size={30} />
    <span className="font-display text-xl tracking-tight font-semibold text-[var(--na-text)]">
      Neural<span className="text-[var(--na-gold)]">Atlas</span>
    </span>
  </div>
);

export default Logo;
