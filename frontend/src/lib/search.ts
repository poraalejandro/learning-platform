import type { Exercise } from "./exercises";

/**
 * Matches against an exercise's prompt and its curated `meta.concepts`
 * keywords -- not the whole JSONB blob. Searching full content would surface
 * incidental hits inside example code or solutions ("k" matching almost
 * every code exercise's tests), which isn't what a concept search is for.
 * `meta` is only present on exercises seeded from 22 sep onward (M4+); older
 * M1-M3 content still matches on `concept` since flashcards/recall never had
 * a dedicated concepts field to begin with, and the built prompt already
 * carries the concept for those.
 */
export type ExerciseMatchKind = "concept" | "prompt";

function readConcepts(content: unknown): string[] {
  if (typeof content !== "object" || content === null) return [];
  const meta = (content as Record<string, unknown>).meta;
  if (typeof meta !== "object" || meta === null) return [];
  const concepts = (meta as Record<string, unknown>).concepts;
  if (!Array.isArray(concepts)) return [];
  return concepts.filter((c): c is string => typeof c === "string");
}

function readPrompt(content: unknown): string {
  if (typeof content !== "object" || content === null) return "";
  const prompt = (content as Record<string, unknown>).prompt;
  return typeof prompt === "string" ? prompt : "";
}

export function matchExercise(exercise: Exercise, query: string): ExerciseMatchKind | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  if (readConcepts(exercise.content).some((c) => c.toLowerCase().includes(q))) return "concept";
  if (readPrompt(exercise.content).toLowerCase().includes(q)) return "prompt";
  return null;
}

export function matchText(text: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  return q.length > 0 && text.toLowerCase().includes(q);
}
