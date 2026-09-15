"use client";

import { useState } from "react";
import { recordAttempt, recomputeNodeStatus } from "@/lib/progress";
import { flagIfStruggling, maybeAdvanceOnRetry } from "@/lib/mistakes";
import type { ParsonsContent } from "@/lib/exercises";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function ParsonsExercise({
  exerciseId,
  nodeId,
  content,
}: {
  exerciseId: string;
  nodeId: string;
  content: ParsonsContent;
}) {
  // Reordered with up/down buttons rather than drag-and-drop: native HTML5
  // drag-and-drop doesn't work on touch screens without an extra library,
  // and this app has to work on mobile.
  const [lines, setLines] = useState<string[]>(() => shuffle(content.lines));
  const [checked, setChecked] = useState<boolean | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= lines.length) return;
    const next = [...lines];
    [next[index], next[target]] = [next[target], next[index]];
    setLines(next);
    setChecked(null);
  }

  async function handleCheck() {
    const isCorrect = lines.every((line, i) => line === content.lines[i]);
    setChecked(isCorrect);
    await recordAttempt({ exerciseId, status: isCorrect ? "passed" : "failed" });
    if (isCorrect) {
      await recomputeNodeStatus(nodeId);
      await maybeAdvanceOnRetry(exerciseId);
    } else {
      await flagIfStruggling(exerciseId, "failed");
    }
  }

  async function handleRevealSolution() {
    setShowSolution(true);
    setLines(content.lines);
    await recordAttempt({ exerciseId, status: "revealed" });
    await flagIfStruggling(exerciseId, "revealed");
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="whitespace-pre-wrap">{content.prompt}</p>

      <ol className="flex flex-col gap-1">
        {lines.map((line, i) => (
          <li
            key={`${i}-${line}`}
            className="flex items-center gap-3 rounded border bg-zinc-50 px-3 py-2 dark:bg-zinc-900"
          >
            <div className="flex flex-col gap-0.5 text-xs">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="Subir línea"
                className="disabled:opacity-20"
              >
                ▲
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === lines.length - 1}
                aria-label="Bajar línea"
                className="disabled:opacity-20"
              >
                ▼
              </button>
            </div>
            <pre className="overflow-x-auto font-mono text-sm whitespace-pre-wrap">{line}</pre>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-2">
        <button onClick={handleCheck} className="rounded bg-black px-3 py-2 text-sm text-white">
          Comprobar orden
        </button>
        {!showSolution && (
          <button onClick={handleRevealSolution} className="rounded border px-3 py-2 text-sm">
            🏳 Ver solución
          </button>
        )}
      </div>

      {checked !== null && (
        <p className={checked ? "font-medium text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
          {checked ? "✅ ¡Orden correcto! Progreso guardado." : "❌ Todavía no es el orden correcto."}
        </p>
      )}
    </div>
  );
}
