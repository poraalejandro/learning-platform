import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchDueMistakes, parseScope } from "@/lib/mistakesQueue";
import { SECTION_ORDER, sectionLabel } from "@/lib/sections";
import { MistakesReview } from "@/components/MistakesReview";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/PageTransition";

export default async function MistakesPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const { section } = await searchParams;
  const scope = parseScope(section);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { due, scheduledLater } = await fetchDueMistakes(supabase, user.id);

  const sections = SECTION_ORDER.map((key) => ({
    key,
    label: sectionLabel(key),
    count: due.filter((item) => item.section === key).length,
  }));
  const items = scope === "all" ? due : due.filter((item) => item.section === scope);

  return (
    <>
      <Navbar userEmail={user.email ?? ""} active="mistakes" />
      <PageTransition>
        <main className="mx-auto max-w-2xl p-6 py-10">
          <MistakesReview
            scope={scope}
            total={due.length}
            sections={sections}
            items={items}
            scheduledLater={scheduledLater}
          />
        </main>
      </PageTransition>
    </>
  );
}
