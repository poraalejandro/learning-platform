import { createClient } from "@/lib/supabase/client";
import { emitXp, toast, type Point } from "@/lib/fx";

/**
 * XP rules (docs/architecture.md §4: "XP descuenta por pista usada, nunca
 * castiga el fallo"). Failing costs nothing; hints and revealing do.
 *
 * - First pass of a gating exercise: 10 XP, minus 2 per hint used, never
 *   below 4. Re-solving something already passed earns nothing, so the
 *   only way to farm XP is to do new work.
 * - Revealing the solution: 0.
 * - Reviewing a flashcard/recall card: 2 (1 for "again").
 * - Completing a node: +20 on top.
 *
 * The database clamps any single award to 25 (see migration 0023).
 */
export const XP_PER_EXERCISE = 10;
export const XP_HINT_COST = 2;
export const XP_MIN_FOR_PASS = 4;
export const XP_NODE_BONUS = 20;
export const XP_PER_LEVEL = 100;

export function xpForPass(hintsUsed: number): number {
  return Math.max(XP_MIN_FOR_PASS, XP_PER_EXERCISE - XP_HINT_COST * hintsUsed);
}

export function levelFor(xp: number) {
  return {
    level: Math.floor(xp / XP_PER_LEVEL) + 1,
    intoLevel: xp % XP_PER_LEVEL,
  };
}

/** The user's calendar day (not UTC) — a streak is about *their* days. */
export function localDay(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * The streak as it should be *displayed* today: the stored count only still
 * holds if the last active day was today or yesterday.
 */
export function liveStreak(count: number, lastDate: string | null, today: string): number {
  if (!lastDate) return 0;
  if (lastDate >= today) return count;
  const yesterday = new Date(`${today}T00:00:00`);
  yesterday.setDate(yesterday.getDate() - 1);
  return lastDate === localDay(yesterday) ? count : 0;
}

export async function awardXp(amount: number, origin?: Point): Promise<void> {
  if (amount <= 0) return;
  const supabase = createClient();
  const { data, error } = await supabase.rpc("award_xp", { amount, local_day: localDay() });
  if (error || !data || data.length === 0) return;

  const row = data[0] as { xp: number; streak_count: number; streak_last_date: string | null };
  const before = row.xp - Math.min(amount, 25);
  if (levelFor(row.xp).level > levelFor(before).level) {
    toast({ icon: "⭐", title: `Level ${levelFor(row.xp).level}!`, body: "Keep going." });
  }
  emitXp({
    delta: Math.min(amount, 25),
    xp: row.xp,
    streak: row.streak_count,
    streakDate: row.streak_last_date,
    origin,
  });
}
