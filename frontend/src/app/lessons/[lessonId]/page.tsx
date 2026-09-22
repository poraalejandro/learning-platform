import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { LessonContent } from "@/components/LessonContent";

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, node_id, title, content_md")
    .eq("id", lessonId)
    .single();

  if (!lesson) notFound();

  const { data: node } = await supabase
    .from("skill_nodes")
    .select("id, title")
    .eq("id", lesson.node_id)
    .single();

  return (
    <>
      <Navbar userEmail={user.email ?? ""} active="lessons" />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
        <div>
          <Link href="/lessons" className="text-sm text-primary underline transition-opacity hover:opacity-75">
            ← All lessons
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">{lesson.title}</h1>
          {node && (
            <p className="mt-1 text-sm text-muted">
              Part of{" "}
              <Link href={`/node/${node.id}`} className="text-primary underline underline-offset-2">
                {node.title}
              </Link>
            </p>
          )}
        </div>

        <LessonContent markdown={lesson.content_md} />
      </main>
    </>
  );
}
