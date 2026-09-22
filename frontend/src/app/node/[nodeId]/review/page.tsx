import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeNodeStatuses, type SkillNode } from "@/lib/skillTree";
import { fetchTreeProgress } from "@/lib/treeProgress";
import type { Exercise } from "@/lib/exercises";
import type { SrsCard } from "@/lib/sm2";
import { FlashcardSession } from "@/components/FlashcardSession";
import { Navbar } from "@/components/Navbar";

export default async function ReviewPage({ params }: { params: Promise<{ nodeId: string }> }) {
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
        .in("type", ["flashcard", "recall"])
        .order("position"),
    ]);

  const node = (nodes ?? []).find((n) => n.id === nodeId) as SkillNode | undefined;
  if (!node) notFound();

  const statuses = computeNodeStatuses((nodes ?? []) as SkillNode[], prerequisites ?? [], treeProgress);
  if (statuses.get(nodeId) === "locked") redirect("/");

  const typedExercises = (exercises ?? []) as Exercise[];
  const exerciseIds = typedExercises.map((e) => e.id);

  const { data: srsCards } = exerciseIds.length
    ? await supabase
        .from("srs_cards")
        .select("exercise_id, interval_days, ease, reps, lapses, due_date")
        .eq("user_id", user.id)
        .in("exercise_id", exerciseIds)
    : { data: [] };

  const cardsByExercise = new Map((srsCards ?? []).map((c) => [c.exercise_id, c]));
  const today = new Date().toISOString().slice(0, 10);

  const dueQueue = typedExercises
    .map((exercise) => ({ exercise, card: cardsByExercise.get(exercise.id) }))
    .filter(({ card }) => !card || card.due_date <= today)
    .map(({ exercise, card }) => ({
      exercise,
      card: (card ?? { interval_days: 0, ease: 2.5, reps: 0, lapses: 0 }) as SrsCard,
    }));

  return (
    <>
      <Navbar userEmail={user.email ?? ""} active="tree" />
      <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6 py-10">
        <Link href={`/node/${nodeId}`} className="text-sm text-primary underline transition-opacity hover:opacity-75">
          ← Back to exercises
        </Link>

        {dueQueue.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border py-16 text-center">
            <p className="text-4xl">🎉</p>
            <p className="font-medium">Nothing due for review in {node.title} right now.</p>
            <Link href={`/node/${nodeId}`} className="text-sm text-primary underline transition-opacity hover:opacity-75">
              Back to exercises
            </Link>
          </div>
        ) : (
          <FlashcardSession nodeId={nodeId} items={dueQueue} />
        )}
      </main>
    </>
  );
}
