"use client";

import { useState } from "react";
import { rateCard } from "@/lib/srs";
import type { Rating, SrsCard } from "@/lib/sm2";
import type { Exercise, FlashcardContent, RecallContent } from "@/lib/exercises";

const RATING_BUTTONS: { rating: Rating; label: string; classes: string }[] = [
  { rating: "again", label: "Otra vez", classes: "bg-red-600 hover:bg-red-700" },
  { rating: "hard", label: "Difícil", classes: "bg-orange-500 hover:bg-orange-600" },
  { rating: "good", label: "Bien", classes: "bg-green-600 hover:bg-green-700" },
  { rating: "easy", label: "Fácil", classes: "bg-primary hover:brightness-110" },
];

const TYPE_LABEL: Record<string, string> = { flashcard: "Flashcard", recall: "Recall" };

export function FlashcardCard({
  exercise,
  card,
  onAdvance,
}: {
  exercise: Exercise;
  card: SrsCard;
  onAdvance: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [saving, setSaving] = useState(false);

  const content = exercise.content as FlashcardContent | RecallContent;
  const isRecall = exercise.type === "recall";
  const answerText = isRecall ? (content as RecallContent).modelAnswer : (content as FlashcardContent).answer;
  const explanation = isRecall ? undefined : (content as FlashcardContent).explanation;

  async function handleRate(rating: Rating) {
    setSaving(true);
    await rateCard(exercise.id, card, rating);
    setSaving(false);
    onAdvance();
  }

  return (
    <div className="flex min-h-[22rem] flex-col justify-between rounded-2xl border bg-white p-8 shadow-sm dark:bg-zinc-950">
      <div>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500 dark:bg-zinc-800">
          {TYPE_LABEL[exercise.type] ?? exercise.type}
        </span>

        <p className="mt-6 text-center text-xl leading-relaxed whitespace-pre-wrap">{content.prompt}</p>

        <div
          className={`mt-6 grid transition-all duration-300 ease-out ${
            revealed ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="animate-pop-in rounded-xl border-t-2 border-primary/30 bg-primary-light/60 p-5">
              <pre className="text-center font-sans text-base whitespace-pre-wrap">{answerText}</pre>
              {explanation && (
                <p className="mt-3 text-center text-sm text-zinc-500">{explanation}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full rounded-xl bg-primary py-3 font-medium text-white transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
          >
            Mostrar respuesta
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {RATING_BUTTONS.map(({ rating, label, classes }) => (
              <button
                key={rating}
                onClick={() => handleRate(rating)}
                disabled={saving}
                className={`rounded-xl py-3 text-sm font-medium text-white transition-all duration-150 active:scale-95 disabled:opacity-50 ${classes}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
