import Link from "next/link";
import type { NodeStatus, SkillNode } from "@/lib/skillTree";

const STATUS_STYLES: Record<NodeStatus, string> = {
  locked: "border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-600",
  available:
    "border-blue-300 bg-blue-50 text-blue-900 shadow-sm shadow-blue-200/60 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-100",
  in_progress:
    "border-amber-300 bg-amber-50 text-amber-900 shadow-sm shadow-amber-200/60 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100",
  completed:
    "border-green-300 bg-green-50 text-green-900 shadow-sm shadow-green-200/60 dark:border-green-700 dark:bg-green-950 dark:text-green-100",
};

const STATUS_ICON: Record<NodeStatus, string> = {
  locked: "\u{1F512}",
  available: "○",
  in_progress: "⏳",
  completed: "✅",
};

// Layout constants for the winding main-quest path + side-quest branches.
// x is a percentage (matches the SVG viewBox and the nodes' `left: x%`), y
// is real pixels (the container's height is computed from these same
// constants, so SVG and HTML positioning always agree).
const ROW_HEIGHT = 130;
const TOP_PAD = 60;
const BOTTOM_PAD = 60;
const ZIGZAG = 13;
const SIDE_X = 86;
const CARD_WIDTH = 152;
const SIDE_CARD_WIDTH = 116;

type Position = { node: SkillNode; x: number; y: number };

function GraphNode({
  position,
  status,
  title,
  width = CARD_WIDTH,
}: {
  position: Position;
  status: NodeStatus;
  title?: string;
  width?: number;
}) {
  const body = (
    <>
      <div className="text-center text-xs leading-tight font-medium">{position.node.title}</div>
      <div className="mt-1 text-center text-[11px]">{STATUS_ICON[status]}</div>
    </>
  );

  const style = {
    left: `${position.x}%`,
    top: `${position.y}px`,
    width,
    transform: "translate(-50%, -50%)",
  };

  if (status === "locked") {
    return (
      <div
        title={title}
        style={style}
        className={`absolute rounded-xl border px-3 py-2 ${STATUS_STYLES[status]}`}
      >
        {body}
      </div>
    );
  }

  return (
    <Link
      href={`/node/${position.node.id}`}
      style={style}
      className={`absolute rounded-xl border px-3 py-2 transition hover:scale-105 hover:brightness-95 ${STATUS_STYLES[status]}`}
    >
      {body}
    </Link>
  );
}

export function SkillTreeGraph({
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
  const mainPositions: Position[] = mainNodes.map((node, i) => ({
    node,
    x: 50 + (i % 2 === 0 ? -ZIGZAG : ZIGZAG),
    y: TOP_PAD + i * ROW_HEIGHT,
  }));
  const mainPosById = new Map(mainPositions.map((p) => [p.node.id, p]));

  const sidePositions: (Position & { parent?: Position })[] = sideNodes.map((node) => {
    const parent = sideParentId.has(node.id) ? mainPosById.get(sideParentId.get(node.id)!) : undefined;
    return { node, x: SIDE_X, y: parent?.y ?? TOP_PAD, parent };
  });

  const totalHeight = TOP_PAD + Math.max(0, mainNodes.length - 1) * ROW_HEIGHT + BOTTOM_PAD;

  return (
    <div className="relative w-full" style={{ height: totalHeight }}>
      <svg
        viewBox={`0 0 100 ${totalHeight}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {mainPositions.slice(0, -1).map((from, i) => {
          const to = mainPositions[i + 1];
          const walked = statuses.get(from.node.id) === "completed";
          return (
            <line
              key={`main-${from.node.id}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              strokeWidth={2}
              className={walked ? "stroke-green-400 dark:stroke-green-700" : "stroke-zinc-200 dark:stroke-zinc-800"}
              strokeDasharray={walked ? undefined : "4 4"}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
        {sidePositions.map(
          ({ node, x, y, parent }) =>
            parent && (
              <line
                key={`side-${node.id}`}
                x1={parent.x}
                y1={parent.y}
                x2={x}
                y2={y}
                strokeWidth={2}
                className={
                  statuses.get(parent.node.id) === "completed"
                    ? "stroke-green-400 dark:stroke-green-700"
                    : "stroke-zinc-200 dark:stroke-zinc-800"
                }
                strokeDasharray={statuses.get(parent.node.id) === "completed" ? undefined : "4 4"}
                vectorEffect="non-scaling-stroke"
              />
            ),
        )}
      </svg>

      {mainPositions.map((position) => (
        <GraphNode key={position.node.id} position={position} status={statuses.get(position.node.id) ?? "locked"} />
      ))}
      {sidePositions.map((position) => (
        <GraphNode
          key={position.node.id}
          position={position}
          status={statuses.get(position.node.id) ?? "locked"}
          title={sideUnlockTitles.get(position.node.id) ? `Requiere: ${sideUnlockTitles.get(position.node.id)}` : undefined}
          width={SIDE_CARD_WIDTH}
        />
      ))}
    </div>
  );
}
