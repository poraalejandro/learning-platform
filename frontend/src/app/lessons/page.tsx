import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";

// Placeholder: the lessons system (content stored as Markdown in Supabase,
// read alongside the tree) is the next piece of work, not built yet. This
// exists so the navbar link doesn't 404 in the meantime.
export default async function LessonsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <>
      <Navbar userEmail={user.email ?? ""} active="lessons" />
      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="text-4xl" aria-hidden>
          📚
        </span>
        <h1 className="text-2xl font-semibold">Lecciones</h1>
        <p className="max-w-sm text-muted">
          Próximamente: contenido de referencia por tema, al estilo de un tutorial, para consultar
          mientras resuelves ejercicios.
        </p>
      </main>
    </>
  );
}
