"use client";

import { useState } from "react";
import { recordAttempt } from "@/lib/progress";
import { flagIfStruggling } from "@/lib/mistakes";
import { handleGatingPass } from "@/lib/game";
import { pointFromClick, type Point } from "@/lib/fx";
import type { ParsonsContent } from "@/lib/exercises";
import { NextExerciseLink } from "@/components/NextExerciseLink";
import { seededShuffle } from "@/lib/shuffle";
import { Icon } from "@/components/Icon";

export function ParsonsExercise({
  exerciseId,
  nodeId,
  nextHref,
  doneHref,
  content,
}: {
  exerciseId: string;
  nodeId: string;
  nextHref: string | null;
  doneHref?: string;
  content: ParsonsContent;
}) {
  // Reordered with up/down buttons rather than drag-and-drop: native HTML5
  // drag-and-drop doesn't work on touch screens without an extra library,
  // and this app has to work on mobile.
  const [lines, setLines] = useState<string[]>(() => seededShuffle(content.lines, exerciseId));
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

  async function handleCheck(origin?: Point) {
    const isCorrect = lines.every((line, i) => line === content.lines[i]);
    setChecked(isCorrect);
    if (isCorrect) {
      await handleGatingPass({ exerciseId, nodeId, origin });
    } else {
      await recordAttempt({ exerciseId, status: "failed" });
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
          onClick={(e) => handleCheck(pointFromClick(e))}
          className="rounded-lg bg-primary px-3 py-2 text-sm text-on-primary transition-all duration-150 hover:brightness-110 active:scale-95"
        >
          Check order
        </button>
        {!showSolution && (
          <button
            onClick={handleRevealSolution}
            className="rounded-lg border px-3 py-2 text-sm transition-all duration-150 hover:bg-surface-2 active:scale-95 "
          >
            <Icon name="flag" size={14} className="inline align-[-3px] mr-1.5" />Reveal solution
          </button>
        )}
      </div>

      {checked !== null && (
        <p
          className={`animate-pop-in ${checked ? "font-medium text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
        >
          <Icon name={checked ? "check" : "x"} size={16} strokeWidth={2.6} className="inline align-[-3px] mr-1.5" />
        {checked ? "Correct order! Progress saved." : "Not the right order yet."}
        </p>
      )}

      {checked === true && <NextExerciseLink nodeId={nodeId} nextHref={nextHref} doneHref={doneHref} />}
    </div>
  );
}
