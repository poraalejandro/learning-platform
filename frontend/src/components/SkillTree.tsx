import Link from "next/link";
import type { NodeStatus, SkillNode } from "@/lib/skillTree";
import { sectionLabel, uniqueSectionsInOrder } from "@/lib/sections";
import { SkillTreeGraph } from "@/components/SkillTreeGraph";
import { TreeIndex } from "@/components/TreeIndex";

// Same opaque-tint approach as SkillTreeGraph — see the note there.
const STATUS_STYLES: Record<NodeStatus, string> = {
  locked: "border-border bg-surface-2 text-muted",
  available: "border-primary/45 bg-tint-primary",
  in_progress: "border-accent/55 bg-tint-accent",
  completed: "border-success/50 bg-tint-success",
};

const STATUS_LABEL: Record<NodeStatus, string> = {
  locked: "Bloqueado",
  available: "Disponible",
  in_progress: "En curso",
  completed: "Completado",
};

const STATUS_ICON: Record<NodeStatus, string> = {
  locked: "\u{1F512}",
  available: "○",
  in_progress: "⏳",
  completed: "✅",
};

function NodeCard({ node, status, unlockHint }: { node: SkillNode; status: NodeStatus; unlockHint?: string }) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">{node.title}</span>
        <span className="text-xs whitespace-nowrap">{STATUS_ICON[status]} {STATUS_LABEL[status]}</span>
      </div>
      {status === "locked" && unlockHint && (
        <p className="mt-1 text-xs opacity-80">Requiere: {unlockHint}</p>
      )}
    </>
  );

  if (status === "locked") {
    return <div className={`rounded-xl border px-4 py-3 ${STATUS_STYLES[status]}`}>{body}</div>;
  }

  return (
    <Link
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
  sideUnlockTitles,
  sideParentId,
}: {
  mainNodes: SkillNode[];
  sideNodes: SkillNode[];
  statuses: Map<string, NodeStatus>;
  sideUnlockTitles: Map<string, string>;
  sideParentId: Map<string, string>;
}) {
  const mainSectionGroups = groupBySection(mainNodes);
  const sections = uniqueSectionsInOrder(mainNodes);

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
                <NodeCard key={node.id} node={node} status={statuses.get(node.id) ?? "locked"} />
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
              unlockHint={sideUnlockTitles.get(node.id)}
            />
          ))}
        </section>
      </div>

      <div className="hidden w-full max-w-5xl gap-6 lg:flex">
        <TreeIndex sections={sections} />
        <div className="min-w-0 flex-1">
          <SkillTreeGraph
            mainNodes={mainNodes}
            sideNodes={sideNodes}
            statuses={statuses}
            sideUnlockTitles={sideUnlockTitles}
            sideParentId={sideParentId}
          />
        </div>
      </div>
    </>
  );
}
