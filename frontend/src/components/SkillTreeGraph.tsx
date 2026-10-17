import Link from "next/link";
import type { NodeStatus, SkillNode } from "@/lib/skillTree";
import { sectionLabel } from "@/lib/sections";
import { NodeMedal, NodeMeta, type NodeProgress } from "@/components/NodeMedal";

export type { NodeProgress };

// Faint, distinct per section — these are large background bands, so they
// have to stay quiet enough not to compete with the medals.
// color-mix against transparent (not a flat colour) so a single linear-
// gradient across the whole tree can fade smoothly between sections *and*
// fade out to the page background at the very top and bottom, rather than
// each section being a flat rect with a hard edge.
const ZONE_GRADIENT_COLOR: Record<string, string> = {
  python: "color-mix(in srgb, var(--primary) 11%, transparent)",
  genai: "color-mix(in srgb, var(--accent) 12%, transparent)",
  project: "color-mix(in srgb, var(--success) 11%, transparent)",
};

// Layout constants for the winding main-quest path + side-quest branches.
// x is a percentage (matches the SVG viewBox and the nodes' `left: x%`), y
// is real pixels (the container's height is computed from these same
// constants, so SVG and HTML positioning always agree). A node's (x, y) is
// the centre of its medal; the title and status line hang below it, which
// is what ROW_HEIGHT and BOTTOM_PAD leave room for.
const ROW_HEIGHT = 168;
const TOP_PAD = 72;
const BOTTOM_PAD = 128;
const ZIGZAG = 13;
const SIDE_X = 86;
const MEDAL = 72;
const SIDE_MEDAL = 52;
const LABEL_WIDTH = 176;
const SIDE_LABEL_WIDTH = 124;

export type Position = { node: SkillNode; x: number; y: number };
export type Zone = { section: string; top: number; bottom: number };

/** Same maths SkillTreeGraph uses internally to lay out the main-quest
 * column, exported so SkillTree.tsx can compute the same totalHeight/zones
 * for a full-width backdrop that sits *outside* this component's own
 * (narrower, shares its row with the index sidebar) column. */
export function computeMainPositions(mainNodes: SkillNode[]): Position[] {
  return mainNodes.map((node, i) => ({
    node,
    x: 50 + (i % 2 === 0 ? -ZIGZAG : ZIGZAG),
    y: TOP_PAD + i * ROW_HEIGHT,
  }));
}

export function computeTotalHeight(mainNodeCount: number): number {
  return TOP_PAD + Math.max(0, mainNodeCount - 1) * ROW_HEIGHT + BOTTOM_PAD;
}

/** Bands that tile the full height, split where the section changes — the
 * boundary sits midway between the last node of one section and the first
 * of the next, not glued to either card. */
export function computeZones(mainPositions: Position[], totalHeight: number): Zone[] {
  if (mainPositions.length === 0) return [];

  const zones: Zone[] = [];
  let currentSection = mainPositions[0].node.section;
  let zoneStart = 0;

  for (let i = 1; i < mainPositions.length; i++) {
    if (mainPositions[i].node.section !== currentSection) {
      const boundary = (mainPositions[i - 1].y + mainPositions[i].y) / 2;
      zones.push({ section: currentSection, top: zoneStart, bottom: boundary });
      currentSection = mainPositions[i].node.section;
      zoneStart = boundary;
    }
  }
  zones.push({ section: currentSection, top: zoneStart, bottom: totalHeight });
  return zones;
}

/**
 * One gradient for the whole tree rather than one rect per zone: a colour
 * stop at each zone's midpoint, transparent at 0% and 100%. Adjacent
 * sections blend into each other across their shared boundary instead of
 * meeting at a hard edge, and the very top/bottom fade into the page
 * background — light or dark — since "transparent" is genuinely transparent,
 * not a hardcoded colour.
 */
export function zoneGradient(zones: Zone[], totalHeight: number): string {
  if (zones.length === 0 || totalHeight === 0) return "none";

  const stops = ["transparent 0%"];
  for (const zone of zones) {
    const midpoint = (((zone.top + zone.bottom) / 2) / totalHeight) * 100;
    const color = ZONE_GRADIENT_COLOR[zone.section] ?? "transparent";
    stops.push(`${color} ${midpoint.toFixed(2)}%`);
  }
  stops.push("transparent 100%");

  return `linear-gradient(to bottom, ${stops.join(", ")})`;
}

function GraphNode({
  position,
  status,
  progress,
  title,
  side = false,
}: {
  position: Position;
  status: NodeStatus;
  progress?: NodeProgress;
  title?: string;
  side?: boolean;
}) {
  const medal = side ? SIDE_MEDAL : MEDAL;
  const locked = status === "locked";

  const body = (
    <>
      <NodeMedal status={status} progress={progress} size={medal} nodeId={position.node.id} square={side} />
      <span
        className={`text-center leading-tight font-semibold ${side ? "text-xs" : "text-sm"} ${
          locked ? "text-muted" : "text-foreground"
        }`}
      >
        {position.node.title}
      </span>
      {side ? (
        <span className="font-mono text-[10px] leading-none tracking-[0.08em] text-muted uppercase">Side quest</span>
      ) : (
        <NodeMeta status={status} progress={progress} />
      )}
    </>
  );

  // Anchored on the medal's centre (not the whole card's), so connectors
  // drawn centre-to-centre disappear under the medals at both ends.
  // Positioning lives on this outer wrapper; the hover transform lives on
  // the inner element, because inline `transform` here would fight with
  // Tailwind's hover utilities on the same property.
  const wrapperStyle = {
    left: `${position.x}%`,
    top: position.y,
    width: side ? SIDE_LABEL_WIDTH : LABEL_WIDTH,
    transform: `translate(-50%, -${medal / 2}px)`,
  };
  const inner = "flex flex-col items-center gap-2";

  if (locked) {
    return (
      <div style={wrapperStyle} className="absolute z-10" title={title}>
        <div className={inner}>{body}</div>
      </div>
    );
  }

  return (
    <div style={wrapperStyle} className="absolute z-10">
      <Link
        href={`/node/${position.node.id}`}
        title={title}
        className={`${inner} rounded-2xl transition-transform duration-200 ease-out hover:-translate-y-1 active:scale-95 active:duration-75`}
      >
        {body}
      </Link>
    </div>
  );
}

/** How a connector out of a node looks: lit gold once that node is done,
 * a plain track toward what you're on now, dotted toward what's locked. */
function edgeStyle(fromStatus: NodeStatus | undefined): "lit" | "track" | "dotted" {
  if (fromStatus === "completed") return "lit";
  if (fromStatus === "in_progress" || fromStatus === "available") return "track";
  return "dotted";
}

function Edge({ d, fromId, kind }: { d: string; fromId: string; kind: "lit" | "track" | "dotted" }) {
  if (kind === "lit") {
    // Glow + solid gold, plus a lit segment looping along it so the path
    // reads as live rather than as a line that animated once and died.
    return (
      <g>
        <path d={d} fill="none" strokeWidth={12} strokeLinecap="round" className="stroke-accent/20" vectorEffect="non-scaling-stroke" />
        <path
          data-edge-from={fromId}
          d={d}
          fill="none"
          pathLength={1}
          strokeWidth={4}
          strokeLinecap="round"
          className="stroke-accent"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={d}
          fill="none"
          pathLength={1}
          strokeWidth={4}
          strokeLinecap="round"
          className="animate-flow-line stroke-[#fff1c2] dark:stroke-white/70"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    );
  }
  // No pathLength here: with a non-scaling stroke the dash pattern is in
  // screen pixels, which is what makes these read as evenly spaced dots.
  return (
    <path
      data-edge-from={fromId}
      d={d}
      fill="none"
      strokeWidth={kind === "track" ? 4 : 3}
      strokeLinecap="round"
      className="stroke-border"
      strokeDasharray={kind === "dotted" ? "0.5 9" : undefined}
      vectorEffect="non-scaling-stroke"
    />
  );
}

export function SkillTreeGraph({
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
  const mainPositions = computeMainPositions(mainNodes);
  const mainPosById = new Map(mainPositions.map((p) => [p.node.id, p]));

  const sidePositions: (Position & { parent?: Position })[] = sideNodes.map((node) => {
    const parent = sideParentId.has(node.id) ? mainPosById.get(sideParentId.get(node.id)!) : undefined;
    return { node, x: SIDE_X, y: parent?.y ?? TOP_PAD, parent };
  });

  const totalHeight = computeTotalHeight(mainNodes.length);
  const zones = computeZones(mainPositions, totalHeight);

  return (
    <div className="relative w-full" style={{ height: totalHeight }}>
      {/* The section-colour backdrop itself lives one level up, in
          SkillTree.tsx — it needs to span the full row (index sidebar
          included), not just this component's narrower column. Only the
          zone labels stay here, since their position is this component's
          own coordinate math. */}
      {zones.map((zone, i) => (
        <div
          key={`label-${zone.section}`}
          id={`section-${zone.section}`}
          className="absolute inset-x-0 z-[3] flex scroll-mt-24 items-center gap-3"
          style={{ top: zone.top + (i === 0 ? 4 : 0) }}
        >
          <span className="font-mono text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
            {sectionLabel(zone.section)}
          </span>
          {i > 0 && <span className="h-px flex-1 border-t border-dashed border-border" />}
        </div>
      ))}

      <svg
        viewBox={`0 0 100 ${totalHeight}`}
        preserveAspectRatio="none"
        className="absolute inset-0 z-[2] h-full w-full"
        aria-hidden
      >
        {mainPositions.slice(0, -1).map((from, i) => {
          const to = mainPositions[i + 1];
          // Leaves the medal sideways at its own height, then turns down
          // into the next medal from above — so it never runs through the
          // title hanging under either one. Both ends sit under a medal.
          const d = `M ${from.x} ${from.y} C ${to.x} ${from.y}, ${to.x} ${from.y}, ${to.x} ${to.y}`;
          return <Edge key={`main-${from.node.id}`} d={d} fromId={from.node.id} kind={edgeStyle(statuses.get(from.node.id))} />;
        })}
        {sidePositions.map(({ node, x, y, parent }) => {
          if (!parent) return null;
          const d = `M ${parent.x} ${parent.y} L ${x} ${y}`;
          const kind = statuses.get(parent.node.id) === "completed" ? "lit" : "dotted";
          return <Edge key={`side-${node.id}`} d={d} fromId={parent.node.id} kind={kind} />;
        })}
      </svg>

      {mainPositions.map((position) => (
        <GraphNode
          key={position.node.id}
          position={position}
          status={statuses.get(position.node.id) ?? "locked"}
          progress={nodeProgress.get(position.node.id)}
        />
      ))}
      {sidePositions.map((position) => (
        <GraphNode
          key={position.node.id}
          position={position}
          status={statuses.get(position.node.id) ?? "locked"}
          progress={nodeProgress.get(position.node.id)}
          title={sideUnlockTitles.get(position.node.id) ? `Requires: ${sideUnlockTitles.get(position.node.id)}` : undefined}
          side
        />
      ))}
    </div>
  );
}
