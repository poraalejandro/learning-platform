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
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);

  async function handleCheck() {
    const isCorrect = prediction.trim() === content.expected_output.trim();
    setCorrect(isCorrect);
    setChecked(true);
    await recordAttempt({ exerciseId, status: isCorrect ? "passed" : "failed", submittedCode: prediction });
    if (isCorrect) {
      celebrate();
      await recomputeNodeStatus(nodeId);
      await maybeAdvanceOnRetry(exerciseId);
    } else {
      await flagIfStruggling(exerciseId, "failed");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="whitespace-pre-wrap">{content.prompt}</p>

      <pre className="overflow-x-auto rounded-lg border bg-surface-2 p-3 text-sm">{content.code}</pre>

      <label className="flex flex-col gap-1 text-sm">
        ¿Qué crees que imprime o devuelve este código?
        <input
          type="text"
          value={prediction}
          onChange={(e) => setPrediction(e.target.value)}
          disabled={checked}
          className="rounded-lg border px-3 py-2 disabled:opacity-60"
        />
      </label>

      {!checked && (
        <button
          onClick={handleCheck}
          disabled={!prediction}
          className="self-start rounded-lg bg-primary px-3 py-2 text-sm text-white transition-all duration-150 hover:brightness-110 active:scale-95 disabled:opacity-50"
        >
          Comprobar
        </button>
      )}

      {checked && (
        <div
          className={`animate-pop-in rounded-lg border p-3 text-sm ${
            correct
              ? "border-green-500/40 bg-green-500/10"
              : "border-red-500/40 bg-red-500/10"
          }`}
        >
          <p className="font-medium">
            {correct ? "✅ ¡Correcto!" : `❌ La salida real es: ${content.expected_output}`}
          </p>
          {content.explanation && <p className="mt-1 text-muted">{content.explanation}</p>}
        </div>
      )}

      {correct && <NextExerciseLink nodeId={nodeId} nextHref={nextHref} />}
    </div>
  );
}
