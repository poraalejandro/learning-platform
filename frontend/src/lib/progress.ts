import { createClient } from "@/lib/supabase/client";
import { GATING_EXERCISE_TYPES } from "@/lib/exercises";

/**
 * Returns whether this was the first time the exercise was ever passed —
 * checked *before* inserting, so it's what XP (only awarded once per
 * exercise) and node-completion detection key off.
 */
export async function recordAttempt({
  exerciseId,
  status,
  submittedCode,
  hintsUsed,
}: {
  exerciseId: string;
  status: "passed" | "failed" | "revealed";
  submittedCode?: string;
  hintsUsed?: number;
}): Promise<{ firstPass: boolean }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { firstPass: false };

  let firstPass = false;
  if (status === "passed") {
    const { count } = await supabase
      .from("exercise_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("exercise_id", exerciseId)
      .eq("status", "passed");
    firstPass = (count ?? 0) === 0;
  }

  await supabase.from("exercise_attempts").insert({
    user_id: user.id,
    exercise_id: exerciseId,
    status,
    submitted_code: submittedCode ?? null,
    hints_used: hintsUsed ?? 0,
  });

  return { firstPass };
}

/**
 * A node becomes 'completed' once every one of its "gating" exercises
 * (everything except flashcard/recall — see GATING_EXERCISE_TYPES) has at
 * least one 'passed' attempt. Flashcards/recall don't gate progression,
 * they're for ongoing review, not a one-time pass/fail (confirmed with the
 * project owner). A node with no gating exercises at all never
 * auto-completes through this path. Returns whether the node is complete.
 */
export async function recomputeNodeStatus(nodeId: string): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: gatingExercises } = await supabase
    .from("exercises")
    .select("id")
    .eq("node_id", nodeId)
    .in("type", GATING_EXERCISE_TYPES);

  const gatingExerciseIds = (gatingExercises ?? []).map((e) => e.id);
  let allGatingPassed = false;

  if (gatingExerciseIds.length > 0) {
    const { data: passedAttempts } = await supabase
      .from("exercise_attempts")
      .select("exercise_id")
      .eq("user_id", user.id)
      .eq("status", "passed")
      .in("exercise_id", gatingExerciseIds);

    const passedIds = new Set((passedAttempts ?? []).map((a) => a.exercise_id));
    allGatingPassed = gatingExerciseIds.every((id) => passedIds.has(id));
  }

  const nextStatus = allGatingPassed ? "completed" : "in_progress";

  await supabase.from("user_node_progress").upsert(
    {
      user_id: user.id,
      node_id: nodeId,
      status: nextStatus,
      completed_at: nextStatus === "completed" ? new Date().toISOString() : null,
    },
    { onConflict: "user_id,node_id" },
  );

  return allGatingPassed;
}
