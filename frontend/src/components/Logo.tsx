/**
 * The PyQuest mark: a ">_" prompt drawn as one snake — the ">" is its body
 * (head at the top, turned to read along the line), the "_" its tapering
 * tail. Same geometry as app/icon.svg; keep the two in step.
 */
export function LogoMark({ size = 34, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      shapeRendering="geometricPrecision"
      className={`shrink-0 ${className}`}
      aria-hidden
    >
      <rect width="64" height="64" rx="16" fill="#F2C14E" />
      <path
        d="M16 18 L30 30 L18 41.5 Q14.5 45.5 20.5 47.5 L23 47.5"
        fill="none"
        stroke="#1A1405"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M21 44.5 L33 44.5 C43 44.5 50 44.2 56.5 41.8 C51.5 47 43.5 50.5 33 50.5 L21 50.5 Z" fill="#1A1405" />
      <ellipse cx="16.5" cy="14.5" rx="6" ry="4.4" fill="#1A1405" />
      <path d="M10.5 14.5 C10.5 16.6 11.3 18 12.53 18.98 L15.57 21.58 L19.5 17 L16.5 14.5 Z" fill="#1A1405" />
      {size >= 28 && <circle cx="18.6" cy="13.2" r="1.15" fill="#F2C14E" />}
      {size >= 28 && (
        <path
          className="logo-tongue"
          d="M22.3 14.6 h3 l1.8 -1.6 M25.3 14.6 l1.8 1.6"
          fill="none"
          stroke="#C2361F"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className="font-display text-xl font-extrabold tracking-tight">PyQuest</span>
    </span>
  );
}
