export type NodeStatus = "locked" | "available" | "in_progress" | "completed";

export type SkillNode = {
  id: string;
  title: string;
  description: string | null;
  track: "main" | "side";
  position: number;
};

type Prerequisite = { node_id: string; requires_node_id: string };

export type TreeProgressInput = {
  /** Gating exercise ids (see GATING_EXERCISE_TYPES) per node. */
  gatingExerciseIdsByNode: Map<string, string[]>;
  /** Every exercise the user has ever passed. */
  passedExerciseIds: Set<string>;
  /** Nodes where the user has attempted anything at all — flashcards included. */
  attemptedNodeIds: Set<string>;
};

/**
 * Every status here is derived from the user's actual attempts, never read
 * back from the stored `user_node_progress.status`. That stored row is a
 * record of work done (it's where completed_at lives), not the source of
 * truth for display.
 *
 * Deriving it is what makes CLAUDE.md's rule — "adding content never
 * corrupts existing progress" — actually hold. It previously only held for
 * *unlocking*: completion was trusted from the stored status, so when a
 * migration added new exercises to an already-"completed" node, that node
 * stayed completed and wrongly unlocked everything after it.
 *
 * - completed: the node has gating exercises and all of them are passed.
 * - in_progress: not completed, but the user has attempted something in it
 *   (any exercise type — doing only flashcards in a node still counts as
 *   having started it).
 * - available: untouched, but every prerequisite is completed.
 * - locked: otherwise.
 */
export function computeNodeStatuses(
  nodes: SkillNode[],
  prerequisites: Prerequisite[],
  { gatingExerciseIdsByNode, passedExerciseIds, attemptedNodeIds }: TreeProgressInput,
): Map<string, NodeStatus> {
  const prereqsByNode = new Map<string, string[]>();
  for (const { node_id, requires_node_id } of prerequisites) {
    if (!prereqsByNode.has(node_id)) prereqsByNode.set(node_id, []);
    prereqsByNode.get(node_id)!.push(requires_node_id);
  }

  function isCompleted(nodeId: string): boolean {
    const gating = gatingExerciseIdsByNode.get(nodeId) ?? [];
    return gating.length > 0 && gating.every((id) => passedExerciseIds.has(id));
  }

  const result = new Map<string, NodeStatus>();
  for (const node of nodes) {
    if (isCompleted(node.id)) {
      result.set(node.id, "completed");
      continue;
    }

    if (attemptedNodeIds.has(node.id)) {
      result.set(node.id, "in_progress");
      continue;
    }

    const requiredNodes = prereqsByNode.get(node.id) ?? [];
    result.set(node.id, requiredNodes.every(isCompleted) ? "available" : "locked");
  }

  return result;
}
