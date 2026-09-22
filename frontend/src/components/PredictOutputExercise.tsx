"use client";

import { useState } from "react";
import { recordAttempt, recomputeNodeStatus } from "@/lib/progress";
import { flagIfStruggling, maybeAdvanceOnRetry } from "@/lib/mistakes";
import { celebrate } from "@/lib/confetti";
import type { PredictOutputContent } from "@/lib/exercises";
import { NextExerciseLink } from "@/components/NextExerciseLink";

export function PredictOutputExercise({
  exerciseId,
  nodeId,
  nextHref,
  content,
}: {
  exerciseId: string;
  nodeId: string;
  nextHref: string | null;
  content: PredictOutputContent;
}) {
  const [prediction, setPrediction] = useState("");
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [solved, setSolved] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // Cleared as soon as they start editing again, so a red "not correct"
  // doesn't sit there contradicting the answer they're currently typing.
  const [showWrong, setShowWrong] = useState(false);

  const finished = solved || revealed;

  async function handleCheck() {
    const isCorrect = prediction.trim() === content.expected_output.trim();
    await recordAttempt({
      exerciseId,
      status: isCorrect ? "passed" : "failed",
      submittedCode: prediction,
    });

    if (isCorrect) {
      setSolved(true);
      celebrate();
      await recomputeNodeStatus(nodeId);
      await maybeAdvanceOnRetry(exerciseId);
    } else {
      setShowWrong(true);
      setWrongAttempts((n) => n + 1);
      await flagIfStruggling(exerciseId, "failed");
    }
  }

  async function handleReveal() {
    setRevealed(true);
    await recordAttempt({ exerciseId, status: "revealed", submittedCode: prediction });
    await flagIfStruggling(exerciseId, "revealed");
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="whitespace-pre-wrap">{content.prompt}</p>

      <pre className="overflow-x-auto rounded-lg border bg-surface-2 p-3 text-sm">{content.code}</pre>

      <label className="flex flex-col gap-1 text-sm">
        What do you think this code prints or returns?
        <input
          type="text"
          value={prediction}
          onChange={(e) => {
            setPrediction(e.target.value);
            setShowWrong(false);
          }}
          disabled={finished}
          className="rounded-lg border bg-background px-3 py-2 transition-colors outline-none focus:border-primary disabled:opacity-60"
        />
      </label>

      {!finished && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCheck}
            disabled={!prediction}
            className="rounded-lg bg-primary px-3 py-2 text-sm text-white transition-all duration-150 hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            Check
          </button>
          {/* Only offered once they've actually tried — otherwise the answer
              is one click away without any thinking. */}
          {wrongAttempts > 0 && (
            <button
              onClick={handleReveal}
              className="rounded-lg border px-3 py-2 text-sm transition-all duration-150 hover:bg-surface-2 active:scale-95"
            >
              🏳 Reveal the answer
            </button>
          )}
        </div>
      )}

      {showWrong && !finished && (
        <p className="animate-shake text-red-600 dark:text-red-400">
          ❌ Not correct. Trace through the code line by line and try again.
        </p>
      )}

      {finished && (
        <div
          className={`animate-pop-in rounded-lg border p-3 text-sm ${
            solved ? "border-success/40 bg-tint-success" : "border-border bg-surface-2"
          }`}
        >
          <p className="font-medium">
            {solved ? "✅ Correct!" : `The actual output is: ${content.expected_output}`}
          </p>
          {content.explanation && <p className="mt-1 text-muted">{content.explanation}</p>}
        </div>
      )}

      {solved && <NextExerciseLink nodeId={nodeId} nextHref={nextHref} />}
    </div>
  );
}
