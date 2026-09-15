import { sectionLabel } from "@/lib/sections";

/**
 * Anchors to the section headers SkillTreeGraph renders (id={`section-${key}`}).
 * Plain hash links — no scroll-tracking JS — so it degrades to "just navigation"
 * rather than a feature that can silently go stale. Always rendered `flex`;
 * SkillTree.tsx's `hidden lg:flex` wrapper is what actually gates visibility,
 * so this doesn't need its own (and shouldn't disagree on the breakpoint).
 */
export function TreeIndex({ sections }: { sections: string[] }) {
  return (
    <nav aria-label="Secciones del árbol" className="sticky top-20 flex w-40 shrink-0 flex-col gap-0.5 self-start">
      {sections.map((key) => (
        <a
          key={key}
          href={`#section-${key}`}
          className="rounded-lg px-3 py-2 text-sm text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-foreground"
        >
          {sectionLabel(key)}
        </a>
      ))}
    </nav>
  );
}
