import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SkillNode } from "@/lib/skillTree";
import { getExercisePrompt, isInterviewExercise, type Exercise, type ExerciseType } from "@/lib/exercises";
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

/**
 * `meta.interview: true` was hand-picked while writing each exercise (M4
 * onward — M1-M3 predate `meta` and so have none), flagging the ones whose
 * prompt mirrors an actual interview question rather than just drilling the
 * mechanic. This page is the first thing in the app that reads that flag.
 */
export default async function InterviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: nodes }, { data: exercises }] = await Promise.all([
    supabase.from("skill_nodes").select("*").order("track").order("position"),
    supabase.from("exercises").select("id, node_id, type, position, content"),
  ]);

  const nodesById = new Map(((nodes ?? []) as SkillNode[]).map((n) => [n.id, n]));
  const nodeOrder = (nodes ?? []).map((n) => n.id) as string[];

  const byNode = new Map<string, Exercise[]>();
  for (const exercise of (exercises ?? []) as Exercise[]) {
    if (!isInterviewExercise(exercise)) continue;
    const list = byNode.get(exercise.node_id) ?? [];
    list.push(exercise);
    byNode.set(exercise.node_id, list);
  }
  for (const list of byNode.values()) list.sort((a, b) => a.position - b.position);

  const groups = nodeOrder
    .filter((nodeId) => byNode.has(nodeId))
    .map((nodeId) => ({ node: nodesById.get(nodeId)!, exercises: byNode.get(nodeId)! }));
  const total = groups.reduce((sum, g) => sum + g.exercises.length, 0);

  return (
    <>
      <Navbar userEmail={user.email ?? ""} active="interview" />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
        <div className="animate-rise-in">
          <h1 className="text-2xl font-semibold">Interview mode</h1>
          <p className="mt-1 text-sm text-muted">
            {total} exercise{total === 1 ? "" : "s"} whose prompt mirrors a real interview question,
            across every node you&apos;ve unlocked content for.
          </p>
        </div>

        {groups.length === 0 ? (
          <p className="text-muted">No interview-flagged exercises yet.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {groups.map(({ node, exercises: nodeExercises }) => (
              <section key={node.id} className="flex flex-col gap-2">
                <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">{node.title}</h2>
                <Link
                  href={`/node/${node.id}`}
                  className="flex flex-col gap-2 rounded-xl border bg-surface px-4 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
                >
                  {nodeExercises.map((exercise) => (
                    <div key={exercise.id} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 shrink-0 rounded-md bg-surface-2 px-2 py-0.5 text-xs">
                        {TYPE_LABEL[exercise.type]}
                      </span>
                      <span>{getExercisePrompt(exercise)}</span>
                    </div>
                  ))}
                </Link>
              </section>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
