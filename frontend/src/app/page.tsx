import { createClient } from "@/lib/supabase/server";
import { computeNodeStatuses, type SkillNode } from "@/lib/skillTree";
import { fetchTreeProgress } from "@/lib/treeProgress";
import { SkillTree } from "@/components/SkillTree";
import type { NodeProgress } from "@/components/SkillTreeGraph";
import { TreeCelebration } from "@/components/TreeCelebration";
import { PageTransition } from "@/components/PageTransition";
import { Navbar } from "@/components/Navbar";
import { Landing } from "@/components/Landing";
import { ContinueCard } from "@/components/ContinueCard";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Live counts, so the landing page never advertises numbers the
    // content doesn't have. Content tables are public-read.
    const [nodeCount, exerciseCount, lessonCount] = await Promise.all(
      (["skill_nodes", "exercises", "lessons"] as const).map((table) =>
        supabase.from(table).select("id", { count: "exact", head: true }),
      ),
    );
    return (
      <Landing
        counts={{
          nodes: nodeCount.count ?? 0,
          exercises: exerciseCount.count ?? 0,
          lessons: lessonCount.count ?? 0,
        }}
      />
    );
  }

  const [{ data: nodes }, { data: prerequisites }, treeProgress] = await Promise.all([
    supabase.from("skill_nodes").select("*").order("track").order("position"),
    supabase.from("skill_prerequisites").select("*"),
    fetchTreeProgress(user.id),
  ]);

  const allNodes = (nodes ?? []) as SkillNode[];
  const mainNodes = allNodes.filter((n) => n.track === "main");
  const sideNodes = allNodes.filter((n) => n.track === "side");
  const nodesById = new Map(allNodes.map((n) => [n.id, n]));

  const statuses = computeNodeStatuses(allNodes, prerequisites ?? [], treeProgress);

  // A side quest sits on the row of the main-quest node that unlocks it.
  // It can also require other side quests (pandas needs NumPy too); those
  // show up in the "Requires" tooltip but never decide its row — a side
  // quest has no row of its own to borrow, so it would land at the top.
  const sideUnlockTitles = new Map<string, string>();
  const sideParentId = new Map<string, string>();
  const sideRequires = new Map<string, string[]>();
  for (const { node_id, requires_node_id } of prerequisites ?? []) {
    if (nodesById.get(node_id)?.track !== "side") continue;
    const required = nodesById.get(requires_node_id);
    sideRequires.set(node_id, [...(sideRequires.get(node_id) ?? []), required?.title ?? requires_node_id]);
    if (required?.track === "main") sideParentId.set(node_id, requires_node_id);
  }
  for (const [nodeId, titles] of sideRequires) sideUnlockTitles.set(nodeId, titles.join(" + "));

  const completedCount = [...statuses.values()].filter((s) => s === "completed").length;

  // Gating exercises passed / total per node, for the progress rings. Same
  // inputs computeNodeStatuses used, so a ring can never disagree with the
  // node's status.
  const nodeProgress = new Map<string, NodeProgress>();
  for (const node of allNodes) {
    const gating = treeProgress.gatingExerciseIdsByNode.get(node.id) ?? [];
    nodeProgress.set(node.id, {
      done: gating.filter((id) => treeProgress.passedExerciseIds.has(id)).length,
      total: gating.length,
    });
  }

  // Main quest first: the node you're in the middle of, else the next one
  // ready to start. Side quests only when the main path has nothing open.
  const ordered = [...mainNodes, ...sideNodes];
  const continueNode =
    ordered.find((n) => statuses.get(n.id) === "in_progress") ??
    ordered.find((n) => statuses.get(n.id) === "available");

  return (
    <>
      <Navbar userEmail={user.email ?? ""} active="tree" />
      <TreeCelebration
        userId={user.id}
        statuses={Object.fromEntries(statuses)}
        titles={Object.fromEntries(allNodes.map((n) => [n.id, n.title]))}
      />

      {/* No horizontal padding at lg: — SkillTree's section backdrop needs to
          reach the true viewport edge there. Below lg: (no backdrop rendered)
          this still supplies the padding every child relies on. */}
      <PageTransition>
      <main className="flex flex-col items-center gap-8 px-6 py-10 lg:px-0">
        <div className="animate-rise-in flex w-full max-w-5xl flex-wrap items-end justify-between gap-6 lg:px-6">
          <div>
            <h1 className="text-4xl font-extrabold">Your path</h1>
            <p className="mt-2 max-w-md text-muted">
              Clear a node to light up the next one. Side quests branch off to the right.
            </p>
            <p className="mt-3 font-mono text-xs tracking-[0.08em] text-muted uppercase">
              {completedCount} / {allNodes.length} nodes completed
            </p>
          </div>
          {continueNode && (
            <ContinueCard
              node={continueNode}
              progress={nodeProgress.get(continueNode.id)}
              starting={statuses.get(continueNode.id) === "available"}
            />
          )}
        </div>

        <SkillTree
          mainNodes={mainNodes}
          sideNodes={sideNodes}
          statuses={statuses}
          nodeProgress={nodeProgress}
          sideUnlockTitles={sideUnlockTitles}
          sideParentId={sideParentId}
        />
      </main>
      </PageTransition>
    </>
  );
}
