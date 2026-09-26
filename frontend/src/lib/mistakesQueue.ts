import type { SupabaseClient } from "@supabase/supabase-js";
import { GATING_EXERCISE_TYPES, type ExerciseType } from "./exercises";
import { SECTION_ORDER } from "./sections";

/**
 * "Mistakes review": a gating exercise gets an srs_cards row only when the
 * student revealed its solution or failed it twice (lib/mistakes.ts), and
 * passing it again pushes the due date out. So "has a card and it's due" is
 * exactly "a mistake that's ready for another go" — no extra table needed.
 * Flashcards and recall cards also live in srs_cards but are reviewed per
 * node, so they're excluded here by type.
 */

export type MistakeItem = {
  exerciseId: string;
  nodeId: string;
  nodeTitle: string;
  section: string;
  type: ExerciseType;
  prompt: string;
};

/** "all", or one of the section keys (python, genai, …). Anything else → "all". */
export function parseScope(value: string | undefined): string {
  return value && SECTION_ORDER.includes(value) ? value : "all";
}

export function mistakesHref(scope: string): string {
  return scope === "all" ? "/mistakes" : `/mistakes?section=${scope}`;
}

/** An exercise opened as part of a review run: `?review=` makes its page chain to the next mistake. */
export function exerciseHref(item: MistakeItem, scope: string): string {
  return `/node/${item.nodeId}/exercise/${item.exerciseId}?review=${scope}`;
}

// UTC date, the same way lib/mistakes.ts writes due_date — comparing like
// with like matters more here than which timezone "today" is in.
const todayUtc = () => new Date().toISOString().slice(0, 10);

/**
 * Cheap count for the navbar badge: one query when nothing is due (the
 * common case). No user filter on purpose — RLS already limits srs_cards to
 * the signed-in user's rows, and the navbar has no user id at hand.
 */
export async function countDueMistakes(supabase: SupabaseClient): Promise<number> {
  const { data: cards } = await supabase.from("srs_cards").select("exercise_id").lte("due_date", todayUtc());
  const ids = (cards ?? []).map((c) => c.exercise_id as string);
  if (ids.length === 0) return 0;

  const { count } = await supabase
    .from("exercises")
    .select("id", { count: "exact", head: true })
    .in("id", ids)
    .in("type", GATING_EXERCISE_TYPES);
  return count ?? 0;
}

/**
 * Every mistake due today, in tree order (main quest before side quests,
 * then by node position, then by exercise position), plus how many more are
 * scheduled for later. The caller filters by section, so one fetch also
 * gives the per-section counts.
 */
export async function fetchDueMistakes(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ due: MistakeItem[]; scheduledLater: number }> {
  const [{ data: cards }, { data: exercises }, { data: nodes }] = await Promise.all([
    supabase.from("srs_cards").select("exercise_id, due_date").eq("user_id", userId),
    // The prompt is pulled out of the JSONB server-side so we don't ship
    // every solution and starter file just to show a one-line summary.
    supabase
      .from("exercises")
      .select("id, node_id, type, position, prompt:content->>prompt")
      .in("type", GATING_EXERCISE_TYPES),
    supabase.from("skill_nodes").select("id, title, section, track, position"),
  ]);

  const dueDate = new Map((cards ?? []).map((c) => [c.exercise_id as string, c.due_date as string]));
  const nodeById = new Map((nodes ?? []).map((n) => [n.id as string, n]));
  const today = todayUtc();

  const flagged = (exercises ?? []).filter((e) => dueDate.has(e.id));
  const dueNow = flagged.filter((e) => (dueDate.get(e.id) as string) <= today);

  const trackRank = (track: string) => (track === "main" ? 0 : 1);
  const ordered = dueNow
    .filter((e) => nodeById.has(e.node_id))
    .sort((a, b) => {
      const na = nodeById.get(a.node_id)!;
      const nb = nodeById.get(b.node_id)!;
      return (
        trackRank(na.track) - trackRank(nb.track) ||
        na.position - nb.position ||
        a.position - b.position
      );
    });

  return {
    due: ordered.map((e) => {
      const node = nodeById.get(e.node_id)!;
      return {
        exerciseId: e.id,
        nodeId: e.node_id,
        nodeTitle: node.title,
        section: node.section,
        type: e.type as ExerciseType,
        prompt: (e.prompt as string | null) ?? "",
      };
    }),
    scheduledLater: flagged.length - dueNow.length,
  };
}
