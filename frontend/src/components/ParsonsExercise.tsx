"use client";

import { useState } from "react";
import { recordAttempt, recomputeNodeStatus } from "@/lib/progress";
import { flagIfStruggling, maybeAdvanceOnRetry } from "@/lib/mistakes";
import { celebrate } from "@/lib/confetti";
import type { ParsonsContent } from "@/lib/exercises";
import { NextExerciseLink } from "@/components/NextExerciseLink";

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
  nextHref,
  content,
}: {
  exerciseId: string;
  nodeId: string;
  nextHref: string | null;
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
      celebrate();
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
            className="flex items-center gap-3 rounded-lg border bg-surface-2 px-3 py-2 transition-colors"
          >
            <div className="flex flex-col gap-0.5 text-xs">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="Move up"
                className="transition-transform active:scale-90 disabled:opacity-20"
              >
                ▲
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === lines.length - 1}
                aria-label="Move down"
                className="transition-transform active:scale-90 disabled:opacity-20"
              >
                ▼
              </button>
            </div>
            <pre className="overflow-x-auto font-mono text-sm whitespace-pre-wrap">{line}</pre>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleCheck}
          className="rounded-lg bg-primary px-3 py-2 text-sm text-white transition-all duration-150 hover:brightness-110 active:scale-95"
        >
          Check order
        </button>
        {!showSolution && (
          <button
            onClick={handleRevealSolution}
            className="rounded-lg border px-3 py-2 text-sm transition-all duration-150 hover:bg-surface-2 active:scale-95 "
          >
            🏳 Reveal solution
          </button>
        )}
      </div>

      {checked !== null && (
        <p
          className={`animate-pop-in ${checked ? "font-medium text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
        >
          {checked ? "✅ Correct order! Progress saved." : "❌ Not the right order yet."}
        </p>
      )}

      {checked === true && <NextExerciseLink nodeId={nodeId} nextHref={nextHref} />}
    </div>
  );
}
