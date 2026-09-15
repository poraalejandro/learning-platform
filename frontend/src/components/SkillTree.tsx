import Link from "next/link";
import type { NodeStatus, SkillNode } from "@/lib/skillTree";
import { SkillTreeGraph } from "@/components/SkillTreeGraph";

// Same alpha-tint approach as SkillTreeGraph — see the note there.
const STATUS_STYLES: Record<NodeStatus, string> = {
  locked: "border-border bg-surface-2 text-muted",
  available: "border-primary/45 bg-primary/10",
  in_progress: "border-accent/55 bg-accent/12",
  completed: "border-green-500/40 bg-green-500/10",
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

/**
 * The winding-path graph (SkillTreeGraph) needs real horizontal room for
 * its zigzag + side branches, so it only renders md: and up. Below that,
 * this simple two-column list — already proven not to break at phone
 * width — is what shows instead, rather than betting the whole tree on
 * pixel math I can't check in a real browser from here.
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
  return (
    <>
      <div className="grid w-full max-w-3xl grid-cols-1 gap-8 md:hidden">
        <section className="flex flex-col gap-2">
          <h2 className="mb-1 text-sm font-semibold tracking-wide text-muted uppercase">
            Main quest
          </h2>
          {mainNodes.map((node) => (
            <NodeCard key={node.id} node={node} status={statuses.get(node.id) ?? "locked"} />
          ))}
        </section>

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

      <div className="hidden w-full max-w-4xl md:block">
        <SkillTreeGraph
          mainNodes={mainNodes}
          sideNodes={sideNodes}
          statuses={statuses}
          sideUnlockTitles={sideUnlockTitles}
          sideParentId={sideParentId}
        />
      </div>
    </>
  );
}
