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
