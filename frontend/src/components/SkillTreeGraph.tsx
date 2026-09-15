import Link from "next/link";
import type { NodeStatus, SkillNode } from "@/lib/skillTree";
import { sectionLabel } from "@/lib/sections";

// Faint, distinct per section — these are large background bands, so they
// have to stay quiet enough not to compete with node status colours.
const ZONE_STYLES: Record<string, string> = {
  python: "bg-primary/[6%]",
  genai: "bg-accent/[8%]",
  project: "bg-success/[6%]",
};

// Opaque tints (status colour mixed into the surface), not alpha washes:
// the nodes sit on top of the connector lines, so a translucent card let
// the line show straight through it. The label stays neutral foreground —
// coloured text on a tinted background measured about 2.5:1 contrast,
// under the 4.5:1 minimum for body text.
const STATUS_STYLES: Record<NodeStatus, string> = {
  locked: "border-border bg-surface-2 text-muted",
  available: "border-primary/45 bg-tint-primary shadow-sm",
  in_progress: "border-accent/55 bg-tint-accent shadow-sm",
  completed: "border-success/50 bg-tint-success shadow-sm",
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

// Connectors are anchored to node *centres*, so each end has to be pulled
// back to the card's edge — otherwise the line is born in the middle of a
// node and disappears under it. Vertical trim is in px (same unit as y);
// horizontal trim is in the viewBox's percent-ish x unit, sized for the
// narrowest width the graph renders at (md:, ~720px of content) so the
// line never tucks under a card at any width.
const VERTICAL_TRIM = 32;
const MAIN_CARD_X_TRIM = 10.5;
const SIDE_CARD_X_TRIM = 8;

type Position = { node: SkillNode; x: number; y: number };
type Zone = { section: string; top: number; bottom: number };

/** Bands that tile the full height, split where the section changes — the
 * boundary sits midway between the last node of one section and the first
 * of the next, not glued to either card. */
function computeZones(mainPositions: Position[], totalHeight: number): Zone[] {
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
      <div style={wrapperStyle} className="absolute z-10 -translate-x-1/2 -translate-y-1/2">
        <div title={title} className={`rounded-xl border px-3 py-2 ${STATUS_STYLES[status]}`}>
          {body}
        </div>
      </div>
    );
  }

  return (
    <div style={wrapperStyle} className="absolute z-10 -translate-x-1/2 -translate-y-1/2">
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
  const zones = computeZones(mainPositions, totalHeight);

  return (
    <div className="relative w-full" style={{ height: totalHeight }}>
      {zones.map((zone) => (
        <div
          key={`zone-${zone.section}`}
          className={`absolute inset-x-0 z-0 ${ZONE_STYLES[zone.section] ?? "bg-surface-2/40"}`}
          style={{ top: zone.top, height: zone.bottom - zone.top }}
        />
      ))}
      {zones.map((zone) => (
        <div
          key={`label-${zone.section}`}
          id={`section-${zone.section}`}
          className="absolute left-2 z-[3] scroll-mt-24 text-xs font-semibold tracking-wide text-muted uppercase"
          style={{ top: zone.top + 10 }}
        >
          {sectionLabel(zone.section)}
        </div>
      ))}

      <svg
        viewBox={`0 0 100 ${totalHeight}`}
        preserveAspectRatio="none"
        className="absolute inset-0 z-[2] h-full w-full"
      >
        {mainPositions.slice(0, -1).map((from, i) => {
          const to = mainPositions[i + 1];
          const walked = statuses.get(from.node.id) === "completed";

          // Pull both ends back to the card edges, following the line's own
          // direction so the x offset stays proportional to the y trim.
          const dy = to.y - from.y;
          const ratio = VERTICAL_TRIM / dy;
          const startX = from.x + (to.x - from.x) * ratio;
          const startY = from.y + VERTICAL_TRIM;
          const endX = to.x - (to.x - from.x) * ratio;
          const endY = to.y - VERTICAL_TRIM;

          // Cubic that leaves and arrives vertically — reads as a path
          // between two stops rather than a diagonal rule across the page.
          const span = endY - startY;
          const d = `M ${startX} ${startY} C ${startX} ${startY + span * 0.5}, ${endX} ${endY - span * 0.5}, ${endX} ${endY}`;

          // A completed connector is drawn twice: the solid track, plus a
          // lit segment looping along it so the path reads as live rather
          // than as a line that animated once on load and then died.
          return (
            <g key={`main-${from.node.id}`}>
              <path
                d={d}
                fill="none"
                pathLength={1}
                strokeWidth={2}
                strokeLinecap="round"
                className={walked ? "stroke-success/45" : "stroke-border"}
                strokeDasharray={walked ? undefined : "0.03 0.03"}
                vectorEffect="non-scaling-stroke"
              />
              {walked && (
                <path
                  d={d}
                  fill="none"
                  pathLength={1}
                  strokeWidth={3}
                  strokeLinecap="round"
                  className="animate-flow-line stroke-success"
                  vectorEffect="non-scaling-stroke"
                />
              )}
            </g>
          );
        })}
        {sidePositions.map(({ node, x, y, parent }) => {
          if (!parent) return null;
          const walked = statuses.get(parent.node.id) === "completed";

          // Side branches run horizontally at their parent's row, so the
          // trim is on x here rather than y.
          const startX = parent.x + MAIN_CARD_X_TRIM;
          const endX = x - SIDE_CARD_X_TRIM;

          return (
            <g key={`side-${node.id}`}>
              <line
                x1={startX}
                y1={parent.y}
                x2={endX}
                y2={y}
                pathLength={1}
                strokeWidth={2}
                strokeLinecap="round"
                className={walked ? "stroke-success/45" : "stroke-border"}
                strokeDasharray={walked ? undefined : "0.03 0.03"}
                vectorEffect="non-scaling-stroke"
              />
              {walked && (
                <line
                  x1={startX}
                  y1={parent.y}
                  x2={endX}
                  y2={y}
                  pathLength={1}
                  strokeWidth={3}
                  strokeLinecap="round"
                  className="animate-flow-line stroke-success"
                  vectorEffect="non-scaling-stroke"
                />
              )}
            </g>
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
