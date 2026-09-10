export type NodeStatus = "locked" | "available" | "in_progress" | "completed";

export type SkillNode = {
  id: string;
  title: string;
  description: string | null;
  track: "main" | "side";
  position: number;
};

type Prerequisite = { node_id: string; requires_node_id: string };
type Progress = { node_id: string; status: NodeStatus };

/**
 * Node unlocking is calculated here, not read from a stored 'available'
 * flag: a node is available once every one of its prerequisites is
 * completed. This is what CLAUDE.md means by "adding content never
 * corrupts existing progress" — a node's unlock state always reflects the
 * current prerequisite graph, not a snapshot taken whenever it was last
 * written.
 */
export function computeNodeStatuses(
  nodes: SkillNode[],
  prerequisites: Prerequisite[],
  progress: Progress[],
): Map<string, NodeStatus> {
  const storedStatus = new Map(progress.map((p) => [p.node_id, p.status]));
  const prereqsByNode = new Map<string, string[]>();
  for (const { node_id, requires_node_id } of prerequisites) {
    if (!prereqsByNode.has(node_id)) prereqsByNode.set(node_id, []);
    prereqsByNode.get(node_id)!.push(requires_node_id);
  }

  const result = new Map<string, NodeStatus>();
  for (const node of nodes) {
    const stored = storedStatus.get(node.id);
    if (stored === "completed" || stored === "in_progress") {
      result.set(node.id, stored);
      continue;
    }

    const requiredNodes = prereqsByNode.get(node.id) ?? [];
    const allPrereqsCompleted = requiredNodes.every(
      (requiredId) => storedStatus.get(requiredId) === "completed",
    );
    result.set(node.id, allPrereqsCompleted ? "available" : "locked");
  }

  return result;
}
