import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { computeNodeStatuses, type SkillNode } from "@/lib/skillTree";
import { SkillTree } from "@/components/SkillTree";
import { signOut } from "./actions";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-6">
        <h1 className="text-2xl font-semibold">learning-platform</h1>
        <p>Not signed in.</p>
        <Link
          href="/login"
          className="rounded bg-primary px-3 py-2 text-white transition-all duration-150 hover:brightness-110 active:scale-95"
        >
          Sign in
        </Link>
      </main>
    );
  }

  const [{ data: nodes }, { data: prerequisites }, { data: progress }] = await Promise.all([
    supabase.from("skill_nodes").select("*").order("track").order("position"),
    supabase.from("skill_prerequisites").select("*"),
    supabase.from("user_node_progress").select("node_id, status").eq("user_id", user.id),
  ]);

  const allNodes = (nodes ?? []) as SkillNode[];
  const mainNodes = allNodes.filter((n) => n.track === "main");
  const sideNodes = allNodes.filter((n) => n.track === "side");
  const nodesById = new Map(allNodes.map((n) => [n.id, n]));

  const statuses = computeNodeStatuses(allNodes, prerequisites ?? [], progress ?? []);

  const sideUnlockTitles = new Map<string, string>();
  const sideParentId = new Map<string, string>();
  for (const { node_id, requires_node_id } of prerequisites ?? []) {
    const sideNode = nodesById.get(node_id);
    if (sideNode?.track === "side") {
      sideUnlockTitles.set(node_id, nodesById.get(requires_node_id)?.title ?? requires_node_id);
      sideParentId.set(node_id, requires_node_id);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 p-6 py-10">
      <div className="flex w-full max-w-3xl items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">learning-platform</h1>
          <p className="text-sm text-zinc-500">
            Signed in as <span className="font-medium">{user.email}</span>
          </p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded border px-3 py-2 text-sm underline transition-colors duration-150 hover:bg-zinc-50 active:scale-95 dark:hover:bg-zinc-900"
          >
            Sign out
          </button>
        </form>
      </div>

      <SkillTree
        mainNodes={mainNodes}
        sideNodes={sideNodes}
        statuses={statuses}
        sideUnlockTitles={sideUnlockTitles}
        sideParentId={sideParentId}
      />
    </main>
  );
}
