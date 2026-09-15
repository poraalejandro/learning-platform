import { createClient } from "@/lib/supabase/client";
import { updateCard } from "./sm2";

/**
 * "Repasa tus errores" (docs/architecture.md §4): a code exercise that got
 * its solution revealed, or failed twice, joins the same SRS rotation
 * flashcards use — reusing srs_cards/SM-2 instead of inventing a parallel
 * tracking mechanism. ignoreDuplicates means an exercise already flagged
 * (has a card) is left alone rather than having its progress reset.
 */
export async function flagIfStruggling(exerciseId: string, attemptStatus: "failed" | "revealed") {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (attemptStatus === "failed") {
    const { count } = await supabase
      .from("exercise_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("exercise_id", exerciseId)
      .eq("status", "failed");
    if ((count ?? 0) < 2) return;
  }

  await supabase.from("srs_cards").upsert(
    {
      user_id: user.id,
      exercise_id: exerciseId,
      interval_days: 0,
      ease: 2.5,
      reps: 0,
      lapses: 0,
      due_date: new Date().toISOString().slice(0, 10),
    },
    { onConflict: "user_id,exercise_id", ignoreDuplicates: true },
  );
}

/**
 * Passing a code exercise that was previously flagged as a mistake is a
 * real review win — apply it as a "good" SM-2 rating (same as rating a
 * flashcard) so the card's interval grows, instead of it staying due
 * forever. Does nothing if the exercise was never flagged.
 */
export async function maybeAdvanceOnRetry(exerciseId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("srs_cards")
    .select("interval_days, ease, reps, lapses")
    .eq("user_id", user.id)
    .eq("exercise_id", exerciseId)
    .maybeSingle();
  if (!existing) return;

  const updated = updateCard(existing, "good");
  await supabase
    .from("srs_cards")
    .upsert({ user_id: user.id, exercise_id: exerciseId, ...updated }, { onConflict: "user_id,exercise_id" });
}
