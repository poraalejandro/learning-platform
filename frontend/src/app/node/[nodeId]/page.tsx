import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeNodeStatuses, type SkillNode } from "@/lib/skillTree";
import { fetchTreeProgress } from "@/lib/treeProgress";
import { GATING_EXERCISE_TYPES, type Exercise, type ExerciseType } from "@/lib/exercises";

const TYPE_LABEL: Record<ExerciseType, string> = {
  code: "Código",
  fix_bug: "Arregla el bug",
  predict_output: "Predice la salida",
  match: "Emparejar",
  parsons: "Ordenar líneas",
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

  const [{ data: nodes }, { data: prerequisites }, treeProgress, { data: exercises }] =
    await Promise.all([
      supabase.from("skill_nodes").select("*"),
      supabase.from("skill_prerequisites").select("*"),
      fetchTreeProgress(user.id),
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
  const statuses = computeNodeStatuses((nodes ?? []) as SkillNode[], prerequisites ?? [], treeProgress);
  if (statuses.get(nodeId) === "locked") redirect("/");

  const typedExercises = (exercises ?? []) as Exercise[];
  const gatingExercises = typedExercises.filter((e) => GATING_EXERCISE_TYPES.includes(e.type));
  const reviewExercises = typedExercises.filter((e) => e.type === "flashcard" || e.type === "recall");
  const gatingExerciseIds = gatingExercises.map((e) => e.id);
  const allExerciseIds = typedExercises.map((e) => e.id);

  const [{ data: passedAttempts }, { data: srsCards }] = await Promise.all([
    gatingExerciseIds.length
      ? supabase
          .from("exercise_attempts")
          .select("exercise_id")
          .eq("user_id", user.id)
          .eq("status", "passed")
          .in("exercise_id", gatingExerciseIds)
      : Promise.resolve({ data: [] }),
    allExerciseIds.length
      ? supabase
          .from("srs_cards")
          .select("exercise_id, reps, due_date")
          .eq("user_id", user.id)
          .in("exercise_id", allExerciseIds)
      : Promise.resolve({ data: [] }),
  ]);

  const passedIds = new Set((passedAttempts ?? []).map((a) => a.exercise_id));
  const cardsByExercise = new Map((srsCards ?? []).map((c) => [c.exercise_id, c]));
  const today = new Date().toISOString().slice(0, 10);

  const dueCount = reviewExercises.filter((e) => {
    const card = cardsByExercise.get(e.id);
    return !card || card.due_date <= today;
  }).length;

  // A gating exercise only gets an srs_cards row via flagIfStruggling (see
  // lib/mistakes.ts) — reveal a solution, or fail twice — so its mere
  // presence here means "this one needs another look," not just "seen
  // before." Due-date filtering still applies once it's been reviewed once.
  function gatingExerciseBadge(exerciseId: string) {
    const card = cardsByExercise.get(exerciseId);
    if (card && card.due_date <= today) return "🔁 Repasar";
    return passedIds.has(exerciseId) ? "✅ Hecho" : "⬜ Pendiente";
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6 py-10">
      <div>
        <Link href="/" className="text-sm text-primary underline transition-opacity hover:opacity-75">
          ← Volver al árbol
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{node.title}</h1>
        {node.description && <p className="text-muted">{node.description}</p>}
      </div>

      <div className="flex flex-col gap-2">
        {reviewExercises.length > 0 && (
          <Link
            href={`/node/${nodeId}/review`}
            className="flex items-center justify-between rounded-xl border border-primary/45 bg-primary/10 px-4 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
          >
            <span className="font-medium">📚 Flashcards y recall</span>
            <span className="text-sm">
              {dueCount > 0 ? `🔁 ${dueCount} pendiente${dueCount === 1 ? "" : "s"}` : "✅ Al día"}
            </span>
          </Link>
        )}

        {gatingExercises.map((exercise) => (
          <Link
            key={exercise.id}
            href={`/node/${nodeId}/exercise/${exercise.id}`}
            className="flex items-center justify-between rounded-xl border bg-surface px-4 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
          >
            <span>
              <span className="mr-2 rounded-md bg-surface-2 px-2 py-0.5 text-xs">
                {TYPE_LABEL[exercise.type]}
              </span>
              Ejercicio {exercise.position}
            </span>
            <span className="text-sm">{gatingExerciseBadge(exercise.id)}</span>
          </Link>
        ))}
      </div>

      {typedExercises.length === 0 && (
        <p className="text-muted">Todavía no hay ejercicios para este nodo.</p>
      )}
    </main>
  );
}
