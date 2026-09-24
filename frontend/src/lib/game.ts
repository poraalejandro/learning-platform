import { createClient } from "@/lib/supabase/client";
import { recordAttempt, recomputeNodeStatus } from "@/lib/progress";
import { maybeAdvanceOnRetry } from "@/lib/mistakes";
import { celebrate, celebrateNode } from "@/lib/confetti";
import { awardXp, xpForPass, XP_NODE_BONUS } from "@/lib/xp";
import { toast, type Point } from "@/lib/fx";

/**
 * Everything that happens when a gating exercise (code, fix_bug,
 * predict_output, match, parsons) is solved — one place instead of each of
 * the four exercise components repeating it.
 *
 * "Node just completed" is derived from the attempt itself, not from the
 * stored user_node_progress row: if this was the first-ever pass of this
 * exercise *and* the node is complete now, this exercise was the last one
 * missing. The stored row can be stale (see lib/skillTree.ts), this can't.
 */
export async function handleGatingPass({
  exerciseId,
  nodeId,
  hintsUsed = 0,
  submittedCode,
  origin,
}: {
  exerciseId: string;
  nodeId: string;
  hintsUsed?: number;
  submittedCode?: string;
  origin?: Point;
}) {
  celebrate();

  const { firstPass } = await recordAttempt({ exerciseId, status: "passed", submittedCode, hintsUsed });
  const nodeComplete = await recomputeNodeStatus(nodeId);
  await maybeAdvanceOnRetry(exerciseId);

  if (!firstPass) return;
  await awardXp(xpForPass(hintsUsed), origin);

  if (nodeComplete) {
    celebrateNode();
    const supabase = createClient();
    const { data: node } = await supabase.from("skill_nodes").select("title").eq("id", nodeId).single();
    toast({
      icon: "🏆",
      title: `Node complete: ${node?.title ?? nodeId}`,
      body: `+${XP_NODE_BONUS} XP bonus — check the tree for what just unlocked.`,
    });
    await awardXp(XP_NODE_BONUS, origin);
  }
}
