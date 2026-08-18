type IconProps = { className?: string; ink?: string };

export function LoupeIcon({ className, ink = "#2B2117" }: IconProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
      <circle cx="52" cy="52" r="30" stroke="#B85C38" strokeWidth="5" />
      <path d="M74 74 L98 98" stroke={ink} strokeWidth="6" strokeLinecap="round" />
      <path
        d="M40 52 a12 12 0 0 1 12 -12"
        stroke={ink}
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

export function BoutiqueIcon({ className, ink = "#2B2117" }: IconProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
      <path
        d="M20 50 L26 24 h68 l6 26"
        stroke={ink}
        strokeWidth="5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M20 50 a10 10 0 0 0 20 2 a10 10 0 0 0 20 -2 a10 10 0 0 0 20 2 a10 10 0 0 0 20 -2"
        stroke="#B85C38"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M28 54 v40 h64 v-40" stroke={ink} strokeWidth="5" strokeLinecap="round" />
      <rect x="52" y="70" width="16" height="24" stroke={ink} strokeWidth="4" />
    </svg>
  );
}

export function RapportIcon({ className, ink = "#2B2117" }: IconProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
      <rect x="28" y="18" width="64" height="84" rx="4" stroke={ink} strokeWidth="5" />
      <path d="M40 40 h40 M40 54 h40 M40 68 h24" stroke={ink} strokeWidth="4" strokeLinecap="round" opacity="0.6" />
      <path
        d="M40 90 l10 -14 l10 8 l14 -20"
        stroke="#B85C38"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
