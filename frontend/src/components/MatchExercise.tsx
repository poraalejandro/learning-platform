"use client";

import { useMemo, useState } from "react";
import { recordAttempt, recomputeNodeStatus } from "@/lib/progress";
import { flagIfStruggling, maybeAdvanceOnRetry } from "@/lib/mistakes";
import { celebrate } from "@/lib/confetti";
import type { MatchContent } from "@/lib/exercises";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function MatchExercise({
  exerciseId,
  nodeId,
  content,
}: {
  exerciseId: string;
  nodeId: string;
  content: MatchContent;
}) {
  // Shuffled once per mount, not on every render — recomputing on each
  // render would re-scramble mid-attempt every time state changes.
  const terms = useMemo(() => shuffle(content.pairs.map((p) => p.term)), [content.pairs]);
  const definitions = useMemo(() => shuffle(content.pairs.map((p) => p.definition)), [content.pairs]);
  const definitionByTerm = useMemo(() => new Map(content.pairs.map((p) => [p.term, p.definition])), [content.pairs]);

  const [matchedTerms, setMatchedTerms] = useState<Set<string>>(new Set());
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [shakeDefinition, setShakeDefinition] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleDefinitionClick(definition: string) {
    if (!selectedTerm || done) return;

    const isCorrect = definitionByTerm.get(selectedTerm) === definition;
    if (isCorrect) {
      const updated = new Set(matchedTerms);
      updated.add(selectedTerm);
      setMatchedTerms(updated);
      setSelectedTerm(null);

      if (updated.size === content.pairs.length) {
        setDone(true);
        celebrate();
        await recordAttempt({ exerciseId, status: "passed" });
        await recomputeNodeStatus(nodeId);
        await maybeAdvanceOnRetry(exerciseId);
      }
    } else {
      setShakeDefinition(definition);
      setSelectedTerm(null);
      await recordAttempt({ exerciseId, status: "failed" });
      await flagIfStruggling(exerciseId, "failed");
      setTimeout(() => setShakeDefinition(null), 400);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="whitespace-pre-wrap">{content.prompt}</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          {terms.map((term) => {
            const isMatched = matchedTerms.has(term);
            const isSelected = selectedTerm === term;
            return (
              <button
                key={term}
                onClick={() => !isMatched && setSelectedTerm(isSelected ? null : term)}
                disabled={isMatched}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition-all duration-150 active:scale-95 ${
                  isMatched
                    ? "border-green-500/40 bg-green-500/10"
                    : isSelected
                      ? "border-primary bg-primary-light"
                      : "hover:bg-surface-2"
                }`}
              >
                {term}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          {definitions.map((definition) => {
            const isMatched = [...matchedTerms].some((term) => definitionByTerm.get(term) === definition);
            return (
              <button
                key={definition}
                onClick={() => handleDefinitionClick(definition)}
                disabled={isMatched || !selectedTerm}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition-all duration-150 active:scale-95 ${
                  isMatched
                    ? "border-green-500/40 bg-green-500/10"
                    : shakeDefinition === definition
                      ? "animate-shake border-red-500/50 bg-red-500/10"
                      : "hover:bg-surface-2 disabled:opacity-60"
                }`}
              >
                {definition}
              </button>
            );
          })}
        </div>
      </div>

      {done && (
        <p className="animate-pop-in font-medium text-green-600 dark:text-green-400">
          ✅ ¡Todo emparejado correctamente! Progreso guardado.
        </p>
      )}
    </div>
  );
}
