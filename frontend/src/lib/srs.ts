import { createClient } from "@/lib/supabase/client";
import { updateCard, type Rating, type SrsCard } from "./sm2";
import { recordAttempt } from "./progress";

export async function getOrCreateCard(exerciseId: string): Promise<SrsCard> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: existing } = await supabase
    .from("srs_cards")
    .select("interval_days, ease, reps, lapses")
    .eq("user_id", user.id)
    .eq("exercise_id", exerciseId)
    .maybeSingle();

  return existing ?? { interval_days: 0, ease: 2.5, reps: 0, lapses: 0 };
}

/** Applies the SM-2 update for a rating and logs the review as an attempt. */
export async function rateCard(exerciseId: string, current: SrsCard, rating: Rating) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const updated = updateCard(current, rating);

  await supabase.from("srs_cards").upsert(
    { user_id: user.id, exercise_id: exerciseId, ...updated },
    { onConflict: "user_id,exercise_id" },
  );

  await recordAttempt({ exerciseId, status: rating === "again" ? "failed" : "passed" });
}
