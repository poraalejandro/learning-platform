import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/PageTransition";
import type { Lesson } from "@/lib/lessons";
import type { SkillNode } from "@/lib/skillTree";

export default async function LessonsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: lessons }, { data: nodes }] = await Promise.all([
    supabase.from("lessons").select("id, node_id, title, position").order("position"),
    supabase.from("skill_nodes").select("*").order("track").order("position"),
  ]);

  const nodesById = new Map(((nodes ?? []) as SkillNode[]).map((n) => [n.id, n]));
  const nodeOrder = (nodes ?? []).map((n) => n.id) as string[];

  // Grouped by node, in the tree's own order — reading top to bottom here
  // roughly follows the order you'd actually reach each topic.
  const lessonsByNode = new Map<string, Pick<Lesson, "id" | "title" | "position">[]>();
  for (const lesson of (lessons ?? []) as Pick<Lesson, "id" | "node_id" | "title" | "position">[]) {
    const list = lessonsByNode.get(lesson.node_id) ?? [];
    list.push(lesson);
    lessonsByNode.set(lesson.node_id, list);
  }

  const groups = nodeOrder
    .filter((nodeId) => lessonsByNode.has(nodeId))
    .map((nodeId) => ({ node: nodesById.get(nodeId)!, lessons: lessonsByNode.get(nodeId)! }));

  return (
    <>
      <Navbar userEmail={user.email ?? ""} active="lessons" />
      <PageTransition>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10">
        <div className="animate-rise-in">
          <h1 className="text-2xl font-semibold">Lessons</h1>
          <p className="mt-1 text-sm text-muted">
            Reference material by topic — to consult while you solve exercises, not a
            requirement to progress.
          </p>
        </div>

        {groups.length === 0 ? (
          <p className="text-muted">No lessons published yet.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {groups.map(({ node, lessons: nodeLessons }) => (
              <section key={node.id} className="flex flex-col gap-2">
                <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">{node.title}</h2>
                {nodeLessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/lessons/${lesson.id}`}
                    className="flex items-center justify-between rounded-xl border bg-surface px-4 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
                  >
                    <span className="font-medium">📖 {lesson.title}</span>
                    <span className="text-muted">→</span>
                  </Link>
                ))}
              </section>
            ))}
          </div>
        )}
      </main>
      </PageTransition>
    </>
  );
}
