import Link from "next/link";
import { EXERCISE_TYPE_LABEL } from "@/lib/exercises";
import { exerciseHref, mistakesHref, type MistakeItem } from "@/lib/mistakesQueue";

export type SectionCount = { key: string; label: string; count: number };

/**
 * One line of plain text for a list row: code ticks, bold marks and line
 * breaks dropped, cut at a word. Underscores stay — they're part of
 * identifiers like __or__ or snake_case far more often than emphasis.
 */
function summarize(prompt: string, max = 110): string {
  const text = prompt.replace(/`|\*\*/g, "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

/**
 * The mistakes list itself, kept free of data fetching so the page stays
 * thin. `scope` is "all" or a section key; `sections` carries the counts
 * for the filter chips, `items` is already filtered to the scope.
 */
export function MistakesReview({
  scope,
  total,
  sections,
  items,
  scheduledLater,
}: {
  scope: string;
  total: number;
  sections: SectionCount[];
  items: MistakeItem[];
  scheduledLater: number;
}) {
  const groups: { nodeId: string; nodeTitle: string; items: MistakeItem[] }[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.nodeId === item.nodeId) last.items.push(item);
    else groups.push({ nodeId: item.nodeId, nodeTitle: item.nodeTitle, items: [item] });
  }

  const chips: { key: string; label: string; count: number }[] = [
    { key: "all", label: "All", count: total },
    ...sections,
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Mistakes review</h1>
        <p className="mt-1 text-sm text-muted">
          Exercises you failed twice or gave up on come back here on a spaced schedule. Solve one
          again and it goes away for longer.
        </p>
      </div>

      <nav aria-label="Filter by section" className="flex flex-wrap gap-2">
        {chips.map((chip) => {
          const active = chip.key === scope;
          return (
            <Link
              key={chip.key}
              href={mistakesHref(chip.key)}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors duration-150 ${
                active
                  ? "border-primary/50 bg-tint-primary font-medium text-primary"
                  : chip.count === 0
                    ? "text-muted hover:bg-surface-2"
                    : "hover:bg-surface-2"
              }`}
            >
              {chip.label}
              <span className="rounded-full bg-surface-2 px-1.5 text-xs tabular-nums">{chip.count}</span>
            </Link>
          );
        })}
      </nav>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border py-14 text-center">
          <p className="text-4xl" aria-hidden>
            🎉
          </p>
          <p className="font-medium">
            {total === 0 ? "No mistakes to review right now." : "Nothing due in this section."}
          </p>
          {scheduledLater > 0 && (
            <p className="text-sm text-muted">
              {scheduledLater} more {scheduledLater === 1 ? "is" : "are"} scheduled for later.
            </p>
          )}
          {scope !== "all" && total > 0 && (
            <Link href="/mistakes" className="mt-1 text-sm text-primary underline transition-opacity hover:opacity-75">
              See all sections
            </Link>
          )}
        </div>
      ) : (
        <>
          <Link
            href={exerciseHref(items[0], scope)}
            className="self-start rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md hover:brightness-110 active:scale-95"
          >
            Start review · {items.length}
          </Link>

          <div className="flex flex-col gap-5">
            {groups.map((group) => (
              <section key={group.nodeId} className="flex flex-col gap-2">
                <h2 className="text-sm font-medium text-muted">{group.nodeTitle}</h2>
                {group.items.map((item) => (
                  <Link
                    key={item.exerciseId}
                    href={exerciseHref(item, scope)}
                    className="flex items-center justify-between gap-3 rounded-xl border bg-surface px-4 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
                  >
                    <span className="min-w-0">
                      <span className="mr-2 rounded-md bg-surface-2 px-2 py-0.5 text-xs whitespace-nowrap">
                        {EXERCISE_TYPE_LABEL[item.type]}
                      </span>
                      <span className="text-sm">{summarize(item.prompt)}</span>
                    </span>
                    <span className="text-muted" aria-hidden>
                      →
                    </span>
                  </Link>
                ))}
              </section>
            ))}
          </div>

          {scheduledLater > 0 && (
            <p className="text-sm text-muted">
              {scheduledLater} more {scheduledLater === 1 ? "is" : "are"} scheduled for later.
            </p>
          )}
        </>
      )}
    </div>
  );
}
