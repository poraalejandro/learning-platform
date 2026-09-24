import { getExerciseMeta, getExercisePrompt, type Exercise } from "./exercises";

/**
 * Matches against an exercise's prompt and its curated `meta.concepts`
 * keywords -- not the whole JSONB blob. Searching full content would surface
 * incidental hits inside example code or solutions ("k" matching almost
 * every code exercise's tests), which isn't what a concept search is for.
 * `meta` is only present on exercises seeded from 22 sep onward (M4+); older
 * M1-M3 content still matches on `prompt` since flashcards/recall never had
 * a dedicated concepts field to begin with, and the prompt already carries
 * the concept for those.
 */
export type ExerciseMatchKind = "concept" | "prompt";

export function matchExercise(exercise: Exercise, query: string): ExerciseMatchKind | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  const concepts = getExerciseMeta(exercise).concepts ?? [];
  if (concepts.some((c) => c.toLowerCase().includes(q))) return "concept";
  if (getExercisePrompt(exercise).toLowerCase().includes(q)) return "prompt";
  return null;
}

export function matchedConcepts(exercise: Exercise, query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return (getExerciseMeta(exercise).concepts ?? []).filter((c) => c.toLowerCase().includes(q));
}

/** Splits text into alternating [non-match, match, non-match, ...] parts, case-insensitively. */
export function splitOnMatch(text: string, query: string): { text: string; match: boolean }[] {
  const q = query.trim();
  if (!q) return [{ text, match: false }];
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text
    .split(new RegExp(`(${escaped})`, "gi"))
    .filter((part) => part.length > 0)
    .map((part) => ({ text: part, match: part.toLowerCase() === q.toLowerCase() }));
}

/**
 * ~120 characters of plain text around the first match in a lesson's
 * Markdown — enough context to see *why* it matched without opening it.
 * Markdown syntax is stripped roughly (it's a preview, not a render).
 */
export function snippetAround(markdown: string, query: string, radius = 60): string | null {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[*_`#>|]/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  const index = plain.toLowerCase().indexOf(query.trim().toLowerCase());
  if (index < 0) return null;
  const start = Math.max(0, index - radius);
  const end = Math.min(plain.length, index + query.trim().length + radius);
  return `${start > 0 ? "…" : ""}${plain.slice(start, end).trim()}${end < plain.length ? "…" : ""}`;
}

export function matchText(text: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  return q.length > 0 && text.toLowerCase().includes(q);
}
