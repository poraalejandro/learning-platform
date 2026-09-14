export type Rating = "again" | "hard" | "good" | "easy";

// Classic SM-2 quality scale is 0-5; a 4-button UI maps onto the values
// that actually change the algorithm's behavior (see updateCard below).
const RATING_QUALITY: Record<Rating, number> = { again: 0, hard: 3, good: 4, easy: 5 };

export type SrsCard = {
  interval_days: number;
  ease: number;
  reps: number;
  lapses: number;
};

export type SrsUpdate = SrsCard & { due_date: string };

/**
 * SM-2 (Piotr Woźniak's original spaced-repetition algorithm, as used by
 * Anki): a rating below "hard" (quality < 3) resets the card back to a
 * 1-day interval and counts as a lapse; anything "hard" or better grows the
 * interval — 1 day, then 6 days, then previous interval × ease — and nudges
 * `ease` up or down depending on how easy the recall actually was.
 */
export function updateCard(card: SrsCard, rating: Rating): SrsUpdate {
  const quality = RATING_QUALITY[rating];

  let { interval_days, ease, reps, lapses } = card;

  if (quality < 3) {
    reps = 0;
    lapses += 1;
    interval_days = 1;
  } else {
    if (reps === 0) interval_days = 1;
    else if (reps === 1) interval_days = 6;
    else interval_days = Math.round(interval_days * ease);
    reps += 1;
  }

  ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + interval_days);

  return {
    interval_days,
    ease,
    reps,
    lapses,
    due_date: dueDate.toISOString().slice(0, 10),
  };
}
