import type { CSSProperties } from "react";

/**
 * done/total as a small ring. pathLength={1} normalizes the circle so the
 * dash math is just the fraction, same trick as the tree connectors. The
 * fill animates in on mount (animate-ring-fill reads --ring).
 */
export function ProgressRing({
  done,
  total,
  size = 18,
  complete = false,
}: {
  done: number;
  total: number;
  size?: number;
  complete?: boolean;
}) {
  const fraction = total > 0 ? Math.min(1, done / total) : 0;
  const stroke = 3;
  const r = (size - stroke) / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-border" />
      {fraction > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${fraction} 1`}
          className={`animate-ring-fill ${complete ? "stroke-success" : "stroke-primary"}`}
          style={{ "--ring": fraction } as CSSProperties}
        />
      )}
    </svg>
  );
}
