import { createClient } from "@/lib/supabase/server";
import { GATING_EXERCISE_TYPES, type ExerciseType } from "@/lib/exercises";
import type { TreeProgressInput } from "@/lib/skillTree";

/**
 * Loads everything computeNodeStatuses needs to derive node status from the
 * user's real attempt history. Shared by every page that has to know
 * whether a node is locked, so they can't drift apart on the rules.
 */
export async function fetchTreeProgress(userId: string): Promise<TreeProgressInput> {
  const supabase = await createClient();

  const [{ data: exercises }, { data: attempts }] = await Promise.all([
    supabase.from("exercises").select("id, node_id, type"),
    supabase.from("exercise_attempts").select("exercise_id, status").eq("user_id", userId),
  ]);

  const nodeByExercise = new Map<string, string>();
  const gatingExerciseIdsByNode = new Map<string, string[]>();

  for (const exercise of (exercises ?? []) as { id: string; node_id: string; type: ExerciseType }[]) {
    nodeByExercise.set(exercise.id, exercise.node_id);
    if (GATING_EXERCISE_TYPES.includes(exercise.type)) {
      const list = gatingExerciseIdsByNode.get(exercise.node_id) ?? [];
      list.push(exercise.id);
      gatingExerciseIdsByNode.set(exercise.node_id, list);
    }
  }

  const passedExerciseIds = new Set<string>();
  const attemptedNodeIds = new Set<string>();

  for (const attempt of (attempts ?? []) as { exercise_id: string; status: string }[]) {
    if (attempt.status === "passed") passedExerciseIds.add(attempt.exercise_id);
    const nodeId = nodeByExercise.get(attempt.exercise_id);
    if (nodeId) attemptedNodeIds.add(nodeId);
  }

  return { gatingExerciseIdsByNode, passedExerciseIds, attemptedNodeIds };
}
