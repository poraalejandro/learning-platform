import Link from "next/link";
import type { NodeStatus, SkillNode } from "@/lib/skillTree";

const STATUS_STYLES: Record<NodeStatus, string> = {
  locked: "border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-600",
  available: "border-primary/40 bg-primary-light text-primary shadow-sm dark:text-white",
  in_progress: "border-accent/50 bg-accent-light text-accent shadow-sm dark:text-white",
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

  // Positioning (left/top + centering translate) lives on this outer,
  // non-animated wrapper. The hover/active transform lives on the inner
  // element instead of also living here, because inline `style.transform`
  // (needed for the percentage-based x) would otherwise fight with
  // Tailwind's hover:scale/active:scale utilities, which compose onto the
  // same `transform` property — same node, two independent transforms.
  const wrapperStyle = { left: `${position.x}%`, top: `${position.y}px`, width };

  if (status === "locked") {
    return (
      <div style={wrapperStyle} className="absolute -translate-x-1/2 -translate-y-1/2">
        <div title={title} className={`rounded-xl border px-3 py-2 ${STATUS_STYLES[status]}`}>
          {body}
        </div>
      </div>
    );
  }

  return (
    <div style={wrapperStyle} className="absolute -translate-x-1/2 -translate-y-1/2">
      <Link
        href={`/node/${position.node.id}`}
        className={`block rounded-xl border px-3 py-2 transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-105 hover:shadow-lg active:scale-95 active:duration-75 ${STATUS_STYLES[status]}`}
      >
        {body}
      </Link>
    </div>
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
              pathLength={1}
              strokeWidth={2}
              className={
                walked
                  ? "animate-draw-line stroke-green-400 dark:stroke-green-700"
                  : "stroke-zinc-200 dark:stroke-zinc-800"
              }
              strokeDasharray={walked ? undefined : "0.03 0.03"}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
        {sidePositions.map(({ node, x, y, parent }) => {
          if (!parent) return null;
          const walked = statuses.get(parent.node.id) === "completed";
          return (
            <line
              key={`side-${node.id}`}
              x1={parent.x}
              y1={parent.y}
              x2={x}
              y2={y}
              pathLength={1}
              strokeWidth={2}
              className={
                walked
                  ? "animate-draw-line stroke-green-400 dark:stroke-green-700"
                  : "stroke-zinc-200 dark:stroke-zinc-800"
              }
              strokeDasharray={walked ? undefined : "0.03 0.03"}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
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
