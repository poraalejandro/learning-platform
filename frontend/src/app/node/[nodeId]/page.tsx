import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeNodeStatuses, type SkillNode } from "@/lib/skillTree";
import type { Exercise } from "@/lib/exercises";

const TYPE_LABEL: Record<string, string> = {
  code: "Código",
  flashcard: "Flashcard",
  recall: "Recall",
};

export default async function NodePage({ params }: { params: Promise<{ nodeId: string }> }) {
  const { nodeId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: nodes }, { data: prerequisites }, { data: progress }, { data: exercises }] =
    await Promise.all([
      supabase.from("skill_nodes").select("*"),
      supabase.from("skill_prerequisites").select("*"),
      supabase.from("user_node_progress").select("node_id, status").eq("user_id", user.id),
      supabase
        .from("exercises")
        .select("id, node_id, type, position, content")
        .eq("node_id", nodeId)
        .order("position"),
    ]);

  const node = (nodes ?? []).find((n) => n.id === nodeId) as SkillNode | undefined;
  if (!node) notFound();

  // Same calculation the tree page uses — re-derived here, not trusted from
  // a query param, so a direct link to a locked node can't bypass it.
  const statuses = computeNodeStatuses((nodes ?? []) as SkillNode[], prerequisites ?? [], progress ?? []);
  if (statuses.get(nodeId) === "locked") redirect("/");

  const typedExercises = (exercises ?? []) as Exercise[];
  const exerciseIds = typedExercises.map((e) => e.id);

  const [{ data: passedAttempts }, { data: srsCards }] = await Promise.all([
    exerciseIds.length
      ? supabase
          .from("exercise_attempts")
          .select("exercise_id")
          .eq("user_id", user.id)
          .eq("status", "passed")
          .in("exercise_id", exerciseIds)
      : Promise.resolve({ data: [] }),
    exerciseIds.length
      ? supabase
          .from("srs_cards")
          .select("exercise_id, reps, due_date")
          .eq("user_id", user.id)
          .in("exercise_id", exerciseIds)
      : Promise.resolve({ data: [] }),
  ]);

  const passedIds = new Set((passedAttempts ?? []).map((a) => a.exercise_id));
  const cardsByExercise = new Map((srsCards ?? []).map((c) => [c.exercise_id, c]));
  const today = new Date().toISOString().slice(0, 10);

  function exerciseBadge(exercise: Exercise) {
    if (exercise.type === "code") {
      return passedIds.has(exercise.id) ? "✅ Hecho" : "⬜ Pendiente";
    }
    const card = cardsByExercise.get(exercise.id);
    if (!card || card.reps === 0) return "⬜ Nueva";
    return card.due_date <= today ? "🔁 Repasar hoy" : "✅ Al día";
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6 py-10">
      <div>
        <Link href="/" className="text-sm underline">
          ← Volver al árbol
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{node.title}</h1>
        {node.description && <p className="text-zinc-500">{node.description}</p>}
      </div>

      <ul className="flex flex-col gap-2">
        {typedExercises.map((exercise) => (
          <li key={exercise.id}>
            <Link
              href={`/node/${nodeId}/exercise/${exercise.id}`}
              className="flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <span>
                <span className="mr-2 rounded bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
                  {TYPE_LABEL[exercise.type] ?? exercise.type}
                </span>
                Ejercicio {exercise.position}
              </span>
              <span className="text-sm">{exerciseBadge(exercise)}</span>
            </Link>
          </li>
        ))}
      </ul>

      {typedExercises.length === 0 && (
        <p className="text-zinc-500">Todavía no hay ejercicios para este nodo.</p>
      )}
    </main>
  );
}
