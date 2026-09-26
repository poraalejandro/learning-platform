import type { TestCase } from "./pyodide";

export type CodeContent = {
  prompt: string;
  starter_code: string;
  tests: TestCase[];
  hints: string[];
  solution: string;
};

export type FlashcardContent = {
  prompt: string;
  answer: string;
  explanation?: string;
};

export type RecallContent = {
  prompt: string;
  isCode?: boolean;
  modelAnswer: string;
};

export type PredictOutputContent = {
  prompt: string;
  code: string;
  expected_output: string;
  explanation?: string;
};

export type MatchPair = { term: string; definition: string };
export type MatchContent = {
  prompt: string;
  pairs: MatchPair[];
};

export type ParsonsContent = {
  prompt: string;
  lines: string[];
};

export type ExerciseType =
  | "code"
  | "flashcard"
  | "recall"
  | "match"
  | "fix_bug"
  | "parsons"
  | "predict_output";

// Types the student has to actively solve (pass/fail, once is enough to
// count toward node completion) — everything except flashcard/recall, which
// are review cards meant to be repeated forever, never "finished."
export const GATING_EXERCISE_TYPES: ExerciseType[] = [
  "code",
  "fix_bug",
  "predict_output",
  "match",
  "parsons",
];

export type Exercise = {
  id: string;
  node_id: string;
  type: ExerciseType;
  position: number;
  content:
    | CodeContent
    | FlashcardContent
    | RecallContent
    | PredictOutputContent
    | MatchContent
    | ParsonsContent
    | Record<string, unknown>;
};

// `meta` was introduced with the 22 sep content seed (M4 onward) and the
// engine otherwise ignores it — this is its first real consumer. M1-M3
// exercises predate it, so every reader here must treat a missing `meta`
// (or a missing field on it) as "no", not as an error.
export type ExerciseMeta = {
  difficulty?: 1 | 2 | 3;
  interview?: boolean;
  concepts?: string[];
  recuerda_de?: string;
};

export function getExerciseMeta(exercise: Exercise): ExerciseMeta {
  const content = exercise.content as { meta?: ExerciseMeta };
  return content.meta ?? {};
}

export function isInterviewExercise(exercise: Exercise): boolean {
  return getExerciseMeta(exercise).interview === true;
}

export function getExercisePrompt(exercise: Exercise): string {
  const content = exercise.content as { prompt?: string };
  return content.prompt ?? "";
}

export const EXERCISE_TYPE_LABEL: Record<ExerciseType, string> = {
  code: "Code",
  fix_bug: "Fix the bug",
  predict_output: "Predict the output",
  match: "Match",
  parsons: "Reorder lines",
  flashcard: "Flashcard",
  recall: "Recall",
};
