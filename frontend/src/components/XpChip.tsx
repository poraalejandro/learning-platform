"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { onXp, prefersReducedMotion, type Point } from "@/lib/fx";
import { levelFor, liveStreak, localDay, XP_PER_LEVEL } from "@/lib/xp";

type Float = { id: number; delta: number; at: Point };

function subscribeNever() {
  return () => {};
}

/**
 * XP, level and daily streak, seeded from the server render (Navbar reads
 * user_stats) and then kept live by `pyquest:xp` events that lib/xp.ts
 * emits after each award — so the number climbs the moment you earn it,
 * not on the next page load.
 */
export function XpChip({
  initialXp,
  initialStreak,
  initialStreakDate,
}: {
  initialXp: number;
  initialStreak: number;
  initialStreakDate: string | null;
}) {
  const [xp, setXp] = useState(initialXp);
  const [displayXp, setDisplayXp] = useState(initialXp);
  const [streak, setStreak] = useState({ count: initialStreak, date: initialStreakDate });
  const [floats, setFloats] = useState<Float[]>([]);
  const [bumpKey, setBumpKey] = useState(0);
  const chipRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef(initialXp);

  // "Today" only exists on the client (the server doesn't know the user's
  // timezone). Null during SSR/hydration → show the stored count, then the
  // real value right after, which is exactly what useSyncExternalStore's
  // server snapshot is for.
  const today = useSyncExternalStore(subscribeNever, () => localDay(), () => null);
  const shownStreak = today ? liveStreak(streak.count, streak.date, today) : streak.count;

  useEffect(() => {
    let frame = 0;
    let nextId = 0;
    const timers = new Set<ReturnType<typeof setTimeout>>();

    const unsubscribe = onXp((gain) => {
      setXp(gain.xp);
      setStreak({ count: gain.streak, date: gain.streakDate });
      setBumpKey((k) => k + 1);

      if (!prefersReducedMotion()) {
        const chip = chipRef.current?.getBoundingClientRect();
        const at = gain.origin ?? (chip ? { x: chip.left + chip.width / 2, y: chip.bottom } : { x: 0, y: 0 });
        const id = nextId++;
        setFloats((current) => [...current, { id, delta: gain.delta, at }]);
        const t = setTimeout(() => {
          timers.delete(t);
          setFloats((current) => current.filter((f) => f.id !== id));
        }, 1150);
        timers.add(t);
      }

      // Count up from what's shown to the new total.
      cancelAnimationFrame(frame);
      const from = displayRef.current;
      const to = gain.xp;
      const start = performance.now();
      const duration = prefersReducedMotion() ? 0 : 700;
      const step = (now: number) => {
        const t = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
        const value = Math.round(from + (to - from) * (1 - Math.pow(1 - t, 3)));
        displayRef.current = value;
        setDisplayXp(value);
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    });

    return () => {
      unsubscribe();
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
    };
  }, []);

  const { level, intoLevel } = levelFor(xp);

  return (
    <>
      <div
        ref={chipRef}
        className="flex items-center gap-2 rounded-full border bg-surface px-2.5 py-1 text-xs whitespace-nowrap"
        title={`${displayXp} XP total · ${XP_PER_LEVEL - intoLevel} XP to level ${level + 1}`}
      >
        <span
          className={`flex items-center gap-0.5 font-medium ${shownStreak > 0 ? "text-accent" : "text-muted"}`}
          aria-label={`${shownStreak}-day streak`}
        >
          <span aria-hidden className={shownStreak > 0 ? "" : "grayscale"}>
            🔥
          </span>
          {shownStreak}
        </span>
        <span className="h-3 w-px bg-border" aria-hidden />
        <span className="font-semibold text-primary">Lv {level}</span>
        <span className="hidden h-1.5 w-14 overflow-hidden rounded-full bg-surface-2 lg:block" aria-hidden>
          <span
            className="block h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
            style={{ width: `${(intoLevel / XP_PER_LEVEL) * 100}%` }}
          />
        </span>
        <span key={bumpKey} className={`hidden tabular-nums text-muted lg:inline-block ${bumpKey > 0 ? "animate-bump" : ""}`}>
          {displayXp} XP
        </span>
      </div>

      {/* Portaled to <body>: the header uses backdrop-filter, which makes it
          the containing block for position:fixed descendants — rendered
          inline, the float would be positioned relative to the header, not
          the viewport. Floats only exist after a client event, so
          document is always available here. */}
      {floats.length > 0 &&
        createPortal(
          floats.map((f) => (
            <span
              key={f.id}
              aria-hidden
              className="animate-float-up pointer-events-none fixed z-[60] rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-neutral-900 shadow-md"
              style={{ left: f.at.x, top: f.at.y - 12 }}
            >
              +{f.delta} XP
            </span>
          )),
          document.body,
        )}
    </>
  );
}
