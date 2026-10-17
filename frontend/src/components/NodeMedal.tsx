import type { CSSProperties } from "react";
import type { NodeStatus } from "@/lib/skillTree";
import { Icon } from "@/components/Icon";

export type NodeProgress = { done: number; total: number };

/**
 * A node's round "medal" — the visual core of the tree ("Arcade night"):
 * - completed: solid gold coin with a check;
 * - in progress: a blue ring filled to done/total, the count inside;
 * - available: an outlined coin with a play mark and a breathing halo;
 * - locked: a recessed, muted coin with a padlock.
 * Used at full size in the graph and small in the phone list, so every
 * dimension derives from `size`. `nodeId` goes on the coin itself so
 * TreeCelebration's glow follows its round shape.
 */
export function NodeMedal({
  status,
  progress,
  size = 72,
  nodeId,
  square = false,
}: {
  status: NodeStatus;
  progress?: NodeProgress;
  size?: number;
  nodeId?: string;
  /** Side quests use a rounded square so they read as a different kind of stop. */
  square?: boolean;
}) {
  const radius = square ? Math.round(size * 0.3) : size / 2;
  const icon = Math.round(size * 0.42);
  const base: CSSProperties = { width: size, height: size, borderRadius: radius };

  if (status === "completed") {
    return (
      <span
        data-node-id={nodeId}
        className="flex items-center justify-center text-[#3a2a05]"
        style={{
          ...base,
          background: "linear-gradient(180deg, #ffd978, #e0a92e)",
          boxShadow:
            "0 0 0 5px color-mix(in srgb, var(--accent) 20%, transparent), 0 10px 24px rgb(0 0 0 / 0.28), inset 0 2px 0 rgb(255 255 255 / 0.5)",
        }}
      >
        <Icon name="check" size={icon} strokeWidth={2.8} />
      </span>
    );
  }

  if (status === "in_progress") {
    const fraction = progress && progress.total > 0 ? Math.min(1, progress.done / progress.total) : 0;
    const ring = Math.max(3, Math.round(size * 0.075));
    return (
      <span
        data-node-id={nodeId}
        className="flex items-center justify-center"
        style={{
          ...base,
          background: `conic-gradient(var(--primary) 0 ${fraction * 100}%, var(--border) 0)`,
          boxShadow: "0 0 32px color-mix(in srgb, var(--primary) 35%, transparent)",
        }}
      >
        <span
          className="flex items-center justify-center bg-surface font-display font-bold text-foreground tabular-nums"
          style={{
            width: size - ring * 2,
            height: size - ring * 2,
            borderRadius: radius,
            fontSize: Math.round(size * 0.22),
          }}
        >
          {progress && progress.total > 0 ? `${progress.done}/${progress.total}` : <Icon name="play" size={icon} />}
        </span>
      </span>
    );
  }

  if (status === "available") {
    return (
      <span
        data-node-id={nodeId}
        className="animate-node-halo flex items-center justify-center border-[3px] border-foreground bg-surface text-foreground"
        style={{ ...base, boxShadow: "0 10px 24px rgb(0 0 0 / 0.2)" }}
      >
        <Icon name="play" size={Math.round(icon * 0.9)} strokeWidth={2.4} className="translate-x-[6%]" />
      </span>
    );
  }

  return (
    <span
      data-node-id={nodeId}
      className="flex items-center justify-center border border-border bg-surface-2 text-muted opacity-80"
      style={base}
    >
      <Icon name="lock" size={Math.round(icon * 0.85)} />
    </span>
  );
}

const META: Record<NodeStatus, string> = {
  completed: "Done",
  in_progress: "In progress",
  available: "Start",
  locked: "Locked",
};

/** The small line under a node title: "4/6 · IN PROGRESS", a START pill, "LOCKED"… */
export function NodeMeta({ status, progress }: { status: NodeStatus; progress?: NodeProgress }) {
  if (status === "available") {
    return (
      <span className="rounded-full bg-foreground px-2.5 py-1 text-[10px] leading-none font-bold tracking-[0.1em] text-background uppercase">
        {META.available}
      </span>
    );
  }
  const count = progress && progress.total > 0 && status !== "locked" ? `${progress.done}/${progress.total} · ` : "";
  return (
    <span
      className={`font-mono text-[11px] leading-none tracking-[0.06em] uppercase ${
        status === "in_progress" ? "text-primary" : "text-muted"
      }`}
    >
      {count}
      {META[status]}
    </span>
  );
}
