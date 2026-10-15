import type { SupabaseClient } from "@supabase/supabase-js";

export type Lesson = {
  id: string;
  node_id: string;
  title: string;
  position: number;
  content_md: string;
};

export type LessonStop = { id: string; title: string };

/**
 * Every lesson in the order /lessons lists them: nodes in tree order (main
 * quest before side quests), then each node's lessons by position. Prev/Next
 * on a lesson walks this list, so it follows the same path as the index —
 * and crosses from one node's last lesson into the next node's first.
 */
export async function fetchLessonOrder(supabase: SupabaseClient): Promise<LessonStop[]> {
  const [{ data: lessons }, { data: nodes }] = await Promise.all([
    supabase.from("lessons").select("id, node_id, title, position").order("position"),
    supabase.from("skill_nodes").select("id").order("track").order("position"),
  ]);

  const nodeRank = new Map((nodes ?? []).map((n, i) => [n.id as string, i]));
  return [...(lessons ?? [])]
    .filter((l) => nodeRank.has(l.node_id))
    .sort((a, b) => nodeRank.get(a.node_id)! - nodeRank.get(b.node_id)! || a.position - b.position)
    .map((l) => ({ id: l.id as string, title: l.title as string }));
}
