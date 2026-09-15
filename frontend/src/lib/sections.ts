/**
 * skill_nodes.section stores a key, not a display label, specifically so
 * that adding a language switcher later means changing this map, not
 * every row in the database.
 */
export const SECTION_LABELS: Record<string, string> = {
  python: "Python",
  genai: "IA generativa",
  project: "Proyecto",
  engineering: "Ingeniería de software",
};

export const SECTION_ORDER = ["python", "genai", "project", "engineering"];

export function sectionLabel(key: string): string {
  return SECTION_LABELS[key] ?? key;
}

/** Unique section keys in first-seen order — nodes are already position-sorted by the caller. */
export function uniqueSectionsInOrder(nodes: { section: string }[]): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const node of nodes) {
    if (!seen.has(node.section)) {
      seen.add(node.section);
      order.push(node.section);
    }
  }
  return order;
}
