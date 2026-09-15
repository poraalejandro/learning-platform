"use client";

import { useState } from "react";
import { recordAttempt, recomputeNodeStatus } from "@/lib/progress";
import { flagIfStruggling, maybeAdvanceOnRetry } from "@/lib/mistakes";
import type { PredictOutputContent } from "@/lib/exercises";

export function PredictOutputExercise({
  exerciseId,
  nodeId,
  content,
}: {
  exerciseId: string;
  nodeId: string;
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
      await recomputeNodeStatus(nodeId);
      await maybeAdvanceOnRetry(exerciseId);
    } else {
      await flagIfStruggling(exerciseId, "failed");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="whitespace-pre-wrap">{content.prompt}</p>

      <pre className="overflow-x-auto rounded border bg-zinc-50 p-3 text-sm dark:bg-zinc-900">{content.code}</pre>

      <label className="flex flex-col gap-1 text-sm">
        ¿Qué crees que imprime o devuelve este código?
        <input
          type="text"
          value={prediction}
          onChange={(e) => setPrediction(e.target.value)}
          disabled={checked}
          className="rounded border px-3 py-2 disabled:opacity-60"
        />
      </label>

      {!checked && (
        <button
          onClick={handleCheck}
          disabled={!prediction}
          className="self-start rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          Comprobar
        </button>
      )}

      {checked && (
        <div
          className={`rounded border p-3 text-sm ${
            correct
              ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950"
              : "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950"
          }`}
        >
          <p className="font-medium">
            {correct ? "✅ ¡Correcto!" : `❌ La salida real es: ${content.expected_output}`}
          </p>
          {content.explanation && <p className="mt-1 text-zinc-500">{content.explanation}</p>}
        </div>
      )}
    </div>
  );
}
