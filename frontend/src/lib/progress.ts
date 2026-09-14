import { createClient } from "@/lib/supabase/client";

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
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("exercise_attempts").insert({
    user_id: user.id,
    exercise_id: exerciseId,
    status,
    submitted_code: submittedCode ?? null,
    hints_used: hintsUsed ?? 0,
  });
}

/**
 * A node becomes 'completed' once every one of its `code` exercises has at
 * least one 'passed' attempt — flashcards/recall don't gate progression,
 * they're for ongoing review, not a one-time pass/fail (confirmed with the
 * project owner). A node with no `code` exercises at all never
 * auto-completes through this path.
 */
export async function recomputeNodeStatus(nodeId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: codeExercises } = await supabase
    .from("exercises")
    .select("id")
    .eq("node_id", nodeId)
    .eq("type", "code");

  const codeExerciseIds = (codeExercises ?? []).map((e) => e.id);
  let allCodePassed = false;

  if (codeExerciseIds.length > 0) {
    const { data: passedAttempts } = await supabase
      .from("exercise_attempts")
      .select("exercise_id")
      .eq("user_id", user.id)
      .eq("status", "passed")
      .in("exercise_id", codeExerciseIds);

    const passedIds = new Set((passedAttempts ?? []).map((a) => a.exercise_id));
    allCodePassed = codeExerciseIds.every((id) => passedIds.has(id));
  }

  const nextStatus = allCodePassed ? "completed" : "in_progress";

  await supabase.from("user_node_progress").upsert(
    {
      user_id: user.id,
      node_id: nodeId,
      status: nextStatus,
      completed_at: nextStatus === "completed" ? new Date().toISOString() : null,
    },
    { onConflict: "user_id,node_id" },
  );
}
