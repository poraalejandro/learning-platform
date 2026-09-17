import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { computeNodeStatuses, type SkillNode } from "@/lib/skillTree";
import { fetchTreeProgress } from "@/lib/treeProgress";
import { SkillTree } from "@/components/SkillTree";
import { Navbar } from "@/components/Navbar";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="animate-rise-in flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="text-4xl" aria-hidden>
          🐍
        </span>
        <h1 className="text-3xl font-semibold">PyQuest</h1>
        <p className="max-w-sm text-muted">
          Aprende Python e ingeniería de IA resolviendo ejercicios, no leyendo lecciones.
        </p>
        <Link
          href="/login"
          className="mt-2 rounded-lg bg-primary px-5 py-2.5 font-medium text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md hover:brightness-110 active:scale-95"
        >
          Entrar
        </Link>
      </main>
    );
  }

  const [{ data: nodes }, { data: prerequisites }, treeProgress] = await Promise.all([
    supabase.from("skill_nodes").select("*").order("track").order("position"),
    supabase.from("skill_prerequisites").select("*"),
    fetchTreeProgress(user.id),
  ]);

  const allNodes = (nodes ?? []) as SkillNode[];
  const mainNodes = allNodes.filter((n) => n.track === "main");
  const sideNodes = allNodes.filter((n) => n.track === "side");
  const nodesById = new Map(allNodes.map((n) => [n.id, n]));

  const statuses = computeNodeStatuses(allNodes, prerequisites ?? [], treeProgress);

  const sideUnlockTitles = new Map<string, string>();
  const sideParentId = new Map<string, string>();
  for (const { node_id, requires_node_id } of prerequisites ?? []) {
    const sideNode = nodesById.get(node_id);
    if (sideNode?.track === "side") {
      sideUnlockTitles.set(node_id, nodesById.get(requires_node_id)?.title ?? requires_node_id);
      sideParentId.set(node_id, requires_node_id);
    }
  }

  const completedCount = [...statuses.values()].filter((s) => s === "completed").length;

  return (
    <>
      <Navbar userEmail={user.email ?? ""} active="tree" />

      {/* No horizontal padding at lg: — SkillTree's section backdrop needs to
          reach the true viewport edge there. Below lg: (no backdrop rendered)
          this still supplies the padding every child relies on. */}
      <main className="flex flex-col items-center gap-8 px-6 py-10 lg:px-0">
        <div className="animate-rise-in flex w-full max-w-5xl flex-wrap items-end justify-between gap-3 lg:px-6">
          <div>
            <h1 className="text-2xl font-semibold">Tu ruta</h1>
            <p className="mt-1 text-sm text-muted">
              Completa los nodos para desbloquear los siguientes. Las side quests se abren desde su
              nodo principal.
            </p>
          </div>
          <span className="rounded-full border border-primary/30 bg-primary-light px-3 py-1 text-xs font-medium text-primary dark:text-white">
            {completedCount} / {allNodes.length} completados
          </span>
        </div>

        <SkillTree
          mainNodes={mainNodes}
          sideNodes={sideNodes}
          statuses={statuses}
          sideUnlockTitles={sideUnlockTitles}
          sideParentId={sideParentId}
        />
      </main>
    </>
  );
}
