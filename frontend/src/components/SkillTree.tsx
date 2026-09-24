import Link from "next/link";
import type { NodeStatus, SkillNode } from "@/lib/skillTree";
import { sectionLabel, uniqueSectionsInOrder } from "@/lib/sections";
import {
  NodeProgressLine,
  SkillTreeGraph,
  computeMainPositions,
  computeTotalHeight,
  computeZones,
  zoneGradient,
  type NodeProgress,
} from "@/components/SkillTreeGraph";
import { TreeIndex } from "@/components/TreeIndex";

// Same opaque-tint approach as SkillTreeGraph — see the note there.
const STATUS_STYLES: Record<NodeStatus, string> = {
  locked: "border-border bg-surface-2 text-muted",
  available: "border-primary/45 bg-tint-primary",
  in_progress: "border-accent/55 bg-tint-accent",
  completed: "border-success/50 bg-tint-success",
};

const STATUS_LABEL: Record<NodeStatus, string> = {
  locked: "Locked",
  available: "Available",
  in_progress: "In progress",
  completed: "Completed",
};

function NodeCard({
  node,
  status,
  progress,
  unlockHint,
}: {
  node: SkillNode;
  status: NodeStatus;
  progress?: NodeProgress;
  unlockHint?: string;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">{node.title}</span>
        <span className="flex items-center gap-2 text-xs whitespace-nowrap">
          <NodeProgressLine status={status} progress={progress} />
          <span className="text-muted">{STATUS_LABEL[status]}</span>
        </span>
      </div>
      {status === "locked" && unlockHint && (
        <p className="mt-1 text-xs opacity-80">Requires: {unlockHint}</p>
      )}
    </>
  );

  if (status === "locked") {
    return (
      <div data-node-id={node.id} className={`rounded-xl border px-4 py-3 ${STATUS_STYLES[status]}`}>
        {body}
      </div>
    );
  }

  return (
    <Link
      data-node-id={node.id}
      href={`/node/${node.id}`}
      className={`rounded-xl border px-4 py-3 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] active:duration-75 ${STATUS_STYLES[status]}`}
    >
      {body}
    </Link>
  );
}

/** Consecutive runs of same-section nodes, in the order they're given — mirrors
 * the zone bands SkillTreeGraph draws, just without the pixel geometry. */
function groupBySection(nodes: SkillNode[]): { section: string; nodes: SkillNode[] }[] {
  const groups: { section: string; nodes: SkillNode[] }[] = [];
  for (const node of nodes) {
    const last = groups[groups.length - 1];
    if (last && last.section === node.section) last.nodes.push(node);
    else groups.push({ section: node.section, nodes: [node] });
  }
  return groups;
}

/**
 * The winding-path graph needs real horizontal room for its zigzag + side
 * branches, and the index sidebar eats into that room further — verified
 * the geometry stays overlap-free with the sidebar down to a 792px graph
 * area, which is what `lg:` (1024px) guarantees once the sidebar (160px)
 * and gap are subtracted. `md:` (768px) was fine for the graph alone but
 * would squeeze it to ~536px with a sidebar next to it, which does overlap.
 * Below `lg:`, this simple list — already proven not to break at phone
 * width — is what shows instead, rather than betting the layout on pixel
 * math I can't check in a real browser from here.
 */
export function SkillTree({
  mainNodes,
  sideNodes,
  statuses,
  nodeProgress,
  sideUnlockTitles,
  sideParentId,
}: {
  mainNodes: SkillNode[];
  sideNodes: SkillNode[];
  statuses: Map<string, NodeStatus>;
  nodeProgress: Map<string, NodeProgress>;
  sideUnlockTitles: Map<string, string>;
  sideParentId: Map<string, string>;
}) {
  const mainSectionGroups = groupBySection(mainNodes);
  const sections = uniqueSectionsInOrder(mainNodes);

  // Computed here (not inside SkillTreeGraph) specifically so the section
  // backdrop can be rendered on its own full-bleed element, independent of
  // the centred, max-w-5xl content row it sits behind — the graph's own
  // column (or even that whole row) was too narrow to call it immersive.
  const mainPositions = computeMainPositions(mainNodes);
  const totalHeight = computeTotalHeight(mainNodes.length);
  const zones = computeZones(mainPositions, totalHeight);
  const backdrop = zoneGradient(zones, totalHeight);

  return (
    <>
      <div className="grid w-full max-w-3xl grid-cols-1 gap-8 lg:hidden">
        <div className="flex flex-col gap-6">
          {mainSectionGroups.map((group) => (
            <section key={group.section} className="flex flex-col gap-2">
              <h2 className="mb-1 text-sm font-semibold tracking-wide text-muted uppercase">
                {sectionLabel(group.section)}
              </h2>
              {group.nodes.map((node) => (
                <NodeCard
                  key={node.id}
                  node={node}
                  status={statuses.get(node.id) ?? "locked"}
                  progress={nodeProgress.get(node.id)}
                />
              ))}
            </section>
          ))}
        </div>

        <section className="flex flex-col gap-2">
          <h2 className="mb-1 text-sm font-semibold tracking-wide text-muted uppercase">
            Side quests
          </h2>
          {sideNodes.map((node) => (
            <NodeCard
              key={node.id}
              node={node}
              status={statuses.get(node.id) ?? "locked"}
              progress={nodeProgress.get(node.id)}
              unlockHint={sideUnlockTitles.get(node.id)}
            />
          ))}
        </section>
      </div>

      {/* Full-bleed wrapper: unlike the content row inside it, this has no
          max-w, so the backdrop it holds reaches the actual viewport edge
          instead of stopping at the row's own 5xl cap. */}
      <div className="relative hidden w-full lg:block">
        <div
          className="absolute inset-x-0 top-0 z-0"
          style={{ height: totalHeight, backgroundImage: backdrop }}
        />
        <div className="relative z-[1] mx-auto flex w-full max-w-5xl gap-6 px-6">
          <TreeIndex sections={sections} />
          <div className="min-w-0 flex-1">
            <SkillTreeGraph
              mainNodes={mainNodes}
              sideNodes={sideNodes}
              statuses={statuses}
              nodeProgress={nodeProgress}
              sideUnlockTitles={sideUnlockTitles}
              sideParentId={sideParentId}
            />
          </div>
        </div>
      </div>
    </>
  );
}
