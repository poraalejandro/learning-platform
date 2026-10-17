import Link from "next/link";
import type { SkillNode } from "@/lib/skillTree";
import { NodeMedal, type NodeProgress } from "@/components/NodeMedal";
import { Icon } from "@/components/Icon";

/**
 * "Pick up where you left off": the node in progress (or, when nothing is,
 * the next one ready to start), one click away at the top of the tree.
 */
export function ContinueCard({
  node,
  progress,
  starting,
}: {
  node: SkillNode;
  progress?: NodeProgress;
  /** True when the node isn't started yet — the copy says "start" instead of "continue". */
  starting: boolean;
}) {
  const remaining = progress ? progress.total - progress.done : 0;

  return (
    <div className="flex w-full items-center gap-4 rounded-2xl border bg-surface p-4 shadow-[0_16px_40px_rgb(0_0_0/0.12)] sm:w-auto sm:min-w-[340px]">
      <NodeMedal status={starting ? "available" : "in_progress"} progress={progress} size={56} />
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[11px] tracking-[0.1em] text-muted uppercase">
          {starting ? "Up next" : "Continue"}
        </div>
        <div className="truncate font-display text-lg font-bold">{node.title}</div>
        {progress && progress.total > 0 && (
          <div className="text-xs text-muted">
            {starting
              ? `${progress.total} exercises`
              : `${remaining} exercise${remaining === 1 ? "" : "s"} to go`}
          </div>
        )}
      </div>
      <Link
        href={`/node/${node.id}`}
        className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-on-primary shadow-[0_4px_0_color-mix(in_srgb,var(--primary)_60%,black)] transition-all duration-150 hover:brightness-110 active:translate-y-0.5 active:shadow-none"
      >
        {starting ? "Start" : "Resume"}
        <Icon name="arrowRight" size={16} strokeWidth={2.4} />
      </Link>
    </div>
  );
}
