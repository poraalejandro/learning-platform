import Link from "next/link";

export type NavTarget = { href: string; label: string };

const DISABLED = "pointer-events-none opacity-40";

/**
 * Prev/Next for exercises: small buttons beside the "back" link, with a
 * "3 / 14" counter between them. Always in reading order (or the due queue,
 * inside a mistakes review) — unlike the "Next exercise" button that appears
 * after solving one, which jumps to the next *unsolved* exercise.
 * At either end the button stays, greyed out, so the row doesn't shift.
 */
export function PrevNextCompact({
  prev,
  next,
  counter,
}: {
  prev: NavTarget | null;
  next: NavTarget | null;
  counter?: string;
}) {
  const button =
    "rounded-lg border px-3 py-1.5 text-sm whitespace-nowrap transition-all duration-150";
  const live = "hover:bg-surface-2 active:scale-95";

  return (
    <nav aria-label="Previous and next" className="flex items-center gap-2">
      {prev ? (
        <Link href={prev.href} rel="prev" title={prev.label} className={`${button} ${live}`}>
          ← Prev
        </Link>
      ) : (
        <span aria-disabled="true" className={`${button} ${DISABLED}`}>
          ← Prev
        </span>
      )}
      {counter && <span className="text-xs text-muted tabular-nums">{counter}</span>}
      {next ? (
        <Link href={next.href} rel="next" title={next.label} className={`${button} ${live}`}>
          Next →
        </Link>
      ) : (
        <span aria-disabled="true" className={`${button} ${DISABLED}`}>
          Next →
        </span>
      )}
    </nav>
  );
}

/**
 * Prev/Next for lessons: at the end of a long read, so each side names the
 * lesson it leads to instead of just an arrow.
 */
export function PrevNextCards({ prev, next }: { prev: NavTarget | null; next: NavTarget | null }) {
  if (!prev && !next) return null;

  const card =
    "flex flex-col gap-0.5 rounded-xl border bg-surface px-4 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]";

  return (
    <nav aria-label="Previous and next lesson" className="grid gap-3 border-t pt-6 sm:grid-cols-2">
      {prev ? (
        <Link href={prev.href} rel="prev" className={card}>
          <span className="text-xs text-muted">← Previous</span>
          <span className="font-medium">{prev.label}</span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}
      {next && (
        <Link href={next.href} rel="next" className={`${card} sm:text-right`}>
          <span className="text-xs text-muted">Next →</span>
          <span className="font-medium">{next.label}</span>
        </Link>
      )}
    </nav>
  );
}
