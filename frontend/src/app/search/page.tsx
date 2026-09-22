import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SkillNode } from "@/lib/skillTree";
import { getExercisePrompt, type Exercise, type ExerciseType } from "@/lib/exercises";
import type { Lesson } from "@/lib/lessons";
import { matchExercise, matchText } from "@/lib/search";
import { Navbar } from "@/components/Navbar";

const TYPE_LABEL: Record<ExerciseType, string> = {
  code: "Code",
  fix_bug: "Fix the bug",
  predict_output: "Predict the output",
  match: "Match",
  parsons: "Reorder lines",
  flashcard: "Flashcard",
  recall: "Recall",
};

// A plain GET <form> (no client JS) means the query lives in the URL and
// back/forward + reload behave exactly as expected for a search page.
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let groups: {
    node: SkillNode;
    exerciseMatches: { exercise: Exercise; kind: "concept" | "prompt" }[];
    lessonMatches: Lesson[];
  }[] = [];

  if (query) {
    const [{ data: nodes }, { data: exercises }, { data: lessons }] = await Promise.all([
      supabase.from("skill_nodes").select("*").order("track").order("position"),
      supabase.from("exercises").select("id, node_id, type, position, content"),
      supabase.from("lessons").select("id, node_id, title, position, content_md"),
    ]);

    const nodesById = new Map(((nodes ?? []) as SkillNode[]).map((n) => [n.id, n]));
    const nodeOrder = (nodes ?? []).map((n) => n.id) as string[];

    const exerciseMatchesByNode = new Map<string, { exercise: Exercise; kind: "concept" | "prompt" }[]>();
    for (const exercise of (exercises ?? []) as Exercise[]) {
      const kind = matchExercise(exercise, query);
      if (!kind) continue;
      const list = exerciseMatchesByNode.get(exercise.node_id) ?? [];
      list.push({ exercise, kind });
      exerciseMatchesByNode.set(exercise.node_id, list);
    }

    const lessonMatchesByNode = new Map<string, Lesson[]>();
    for (const lesson of (lessons ?? []) as Lesson[]) {
      if (matchText(lesson.title, query) || matchText(lesson.content_md, query)) {
        const list = lessonMatchesByNode.get(lesson.node_id) ?? [];
        list.push(lesson);
        lessonMatchesByNode.set(lesson.node_id, list);
      }
    }

    groups = nodeOrder
      .filter((nodeId) => exerciseMatchesByNode.has(nodeId) || lessonMatchesByNode.has(nodeId))
      .map((nodeId) => ({
        node: nodesById.get(nodeId)!,
        exerciseMatches: exerciseMatchesByNode.get(nodeId) ?? [],
        lessonMatches: lessonMatchesByNode.get(nodeId) ?? [],
      }));
  }

  return (
    <>
      <Navbar userEmail={user.email ?? ""} active="search" />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
        <div className="animate-rise-in">
          <h1 className="text-2xl font-semibold">Search</h1>
          <p className="mt-1 text-sm text-muted">
            Find which node or lesson covers a concept — try &quot;dict&quot;, &quot;SOLID&quot;, or &quot;gather&quot;.
          </p>
        </div>

        <form action="/search" className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search concepts..."
            autoFocus
            className="flex-1 rounded-lg border bg-background px-3 py-2.5 transition-colors outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:brightness-110 active:scale-95"
          >
            🔍 Search
          </button>
        </form>

        {query && groups.length === 0 && (
          <p className="text-muted">No matches for &quot;{query}&quot;.</p>
        )}

        {groups.length > 0 && (
          <div className="flex flex-col gap-6">
            {groups.map(({ node, exerciseMatches, lessonMatches }) => (
              <section key={node.id} className="flex flex-col gap-2">
                <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">{node.title}</h2>

                {lessonMatches.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/lessons/${lesson.id}`}
                    className="flex items-center justify-between rounded-xl border bg-surface px-4 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
                  >
                    <span className="font-medium">📖 {lesson.title}</span>
                    <span className="text-muted">→</span>
                  </Link>
                ))}

                {exerciseMatches.length > 0 && (
                  <Link
                    href={`/node/${node.id}`}
                    className="flex flex-col gap-2 rounded-xl border bg-surface px-4 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
                  >
                    {exerciseMatches.map(({ exercise, kind }) => (
                      <div key={exercise.id} className="flex items-center gap-2 text-sm">
                        <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs">
                          {TYPE_LABEL[exercise.type]}
                        </span>
                        <span className="truncate">
                          {kind === "concept"
                            ? `matched concept in: ${getExercisePrompt(exercise)}`
                            : getExercisePrompt(exercise)}
                        </span>
                      </div>
                    ))}
                  </Link>
                )}
              </section>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
