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

export type ExerciseType =
  | "code"
  | "flashcard"
  | "recall"
  | "match"
  | "fix_bug"
  | "parsons"
  | "predict_output";

export type Exercise = {
  id: string;
  node_id: string;
  type: ExerciseType;
  position: number;
  content: CodeContent | FlashcardContent | RecallContent | Record<string, unknown>;
};
