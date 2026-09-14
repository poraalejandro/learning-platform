import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CodeContent, Exercise } from "@/lib/exercises";
import { CodeExercise } from "@/components/CodeExercise";

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ nodeId: string; exerciseId: string }>;
}) {
  const { nodeId, exerciseId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: exercise } = await supabase
    .from("exercises")
    .select("id, node_id, type, position, content")
    .eq("id", exerciseId)
    .eq("node_id", nodeId)
    .single();

  if (!exercise) notFound();
  const typedExercise = exercise as Exercise;

  // flashcard/recall are always worked through the review queue now (it
  // auto-advances to the next due card instead of bouncing back to this
  // node's list after every single one) — a direct link to one just enters
  // that same queue rather than showing a dead-end single-card view.
  if (typedExercise.type === "flashcard" || typedExercise.type === "recall") {
    redirect(`/node/${nodeId}/review`);
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6 py-10">
      <Link href={`/node/${nodeId}`} className="text-sm underline">
        ← Volver a los ejercicios
      </Link>

      {typedExercise.type === "code" && (
        <CodeExercise exerciseId={exerciseId} nodeId={nodeId} content={typedExercise.content as CodeContent} />
      )}
      {!["code", "flashcard", "recall"].includes(typedExercise.type) && (
        <p className="text-zinc-500">
          El tipo &quot;{typedExercise.type}&quot; todavía no tiene motor — llega en la Fase 4.
        </p>
      )}
    </main>
  );
}
