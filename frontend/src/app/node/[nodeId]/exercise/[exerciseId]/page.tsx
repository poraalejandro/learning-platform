import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  GATING_EXERCISE_TYPES,
  type CodeContent,
  type Exercise,
  type MatchContent,
  type ParsonsContent,
  type PredictOutputContent,
} from "@/lib/exercises";
import { CodeExercise } from "@/components/CodeExercise";
import { PredictOutputExercise } from "@/components/PredictOutputExercise";
import { MatchExercise } from "@/components/MatchExercise";
import { ParsonsExercise } from "@/components/ParsonsExercise";
import { Navbar } from "@/components/Navbar";

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

  // Where "Next exercise" goes once this one is solved: the next
  // exercise in this node the user hasn't passed yet, wrapping back to the
  // start if the remaining ones are behind the current position. Null means
  // there's nothing left to do in this node.
  const [{ data: siblings }, { data: passedAttempts }] = await Promise.all([
    supabase
      .from("exercises")
      .select("id, position")
      .eq("node_id", nodeId)
      .in("type", GATING_EXERCISE_TYPES)
      .order("position"),
    supabase
      .from("exercise_attempts")
      .select("exercise_id")
      .eq("user_id", user.id)
      .eq("status", "passed"),
  ]);

  const passedIds = new Set((passedAttempts ?? []).map((a) => a.exercise_id));
  const pending = (siblings ?? []).filter((e) => e.id !== exerciseId && !passedIds.has(e.id));
  const nextExercise =
    pending.find((e) => e.position > typedExercise.position) ?? pending[0] ?? null;
  const nextHref = nextExercise ? `/node/${nodeId}/exercise/${nextExercise.id}` : null;

  return (
    <>
      <Navbar userEmail={user.email ?? ""} active="tree" />
      <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6 py-10">
        <Link href={`/node/${nodeId}`} className="text-sm text-primary underline transition-opacity hover:opacity-75">
          ← Back to exercises
        </Link>

        {/* fix_bug reuses CodeExercise as-is: same content shape (starter_code
            just happens to be broken instead of a stub), same editor + test
            runner. */}
        {(typedExercise.type === "code" || typedExercise.type === "fix_bug") && (
          <CodeExercise
            exerciseId={exerciseId}
            nodeId={nodeId}
            nextHref={nextHref}
            content={typedExercise.content as CodeContent}
          />
        )}
        {typedExercise.type === "predict_output" && (
          <PredictOutputExercise
            exerciseId={exerciseId}
            nodeId={nodeId}
            nextHref={nextHref}
            content={typedExercise.content as PredictOutputContent}
          />
        )}
        {typedExercise.type === "match" && (
          <MatchExercise
            exerciseId={exerciseId}
            nodeId={nodeId}
            nextHref={nextHref}
            content={typedExercise.content as MatchContent}
          />
        )}
        {typedExercise.type === "parsons" && (
          <ParsonsExercise
            exerciseId={exerciseId}
            nodeId={nodeId}
            nextHref={nextHref}
            content={typedExercise.content as ParsonsContent}
          />
        )}
      </main>
    </>
  );
}
