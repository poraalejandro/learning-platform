"use client";

import { useEffect, useState } from "react";
import { getOrCreateCard, rateCard } from "@/lib/srs";
import type { Rating, SrsCard } from "@/lib/sm2";
import type { FlashcardContent, RecallContent } from "@/lib/exercises";

const RATING_BUTTONS: { rating: Rating; label: string }[] = [
  { rating: "again", label: "Otra vez" },
  { rating: "hard", label: "Difícil" },
  { rating: "good", label: "Bien" },
  { rating: "easy", label: "Fácil" },
];

export function FlashcardExercise({
  exerciseId,
  kind,
  content,
}: {
  exerciseId: string;
  kind: "flashcard" | "recall";
  content: FlashcardContent | RecallContent;
}) {
  const [card, setCard] = useState<SrsCard | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [rated, setRated] = useState<Rating | null>(null);

  useEffect(() => {
    getOrCreateCard(exerciseId).then(setCard);
  }, [exerciseId]);

  async function handleRate(rating: Rating) {
    if (!card) return;
    setRated(rating);
    await rateCard(exerciseId, card, rating);
  }

  const answerText = kind === "flashcard" ? (content as FlashcardContent).answer : (content as RecallContent).modelAnswer;
  const explanation = kind === "flashcard" ? (content as FlashcardContent).explanation : undefined;

  return (
    <div className="flex flex-col gap-4">
      <p className="whitespace-pre-wrap text-lg">{content.prompt}</p>

      {!revealed && (
        <button
          onClick={() => setRevealed(true)}
          className="self-start rounded bg-black px-3 py-2 text-sm text-white"
        >
          Mostrar respuesta
        </button>
      )}

      {revealed && (
        <div className="flex flex-col gap-3 rounded border bg-zinc-50 p-4 dark:bg-zinc-900">
          <pre className="whitespace-pre-wrap font-sans text-sm">{answerText}</pre>
          {explanation && <p className="text-sm text-zinc-500">{explanation}</p>}
        </div>
      )}

      {revealed && !rated && (
        <div className="flex flex-wrap gap-2">
          {RATING_BUTTONS.map(({ rating, label }) => (
            <button
              key={rating}
              onClick={() => handleRate(rating)}
              disabled={!card}
              className="rounded border px-3 py-2 text-sm disabled:opacity-50"
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {rated && <p className="text-sm text-green-700 dark:text-green-400">Repaso guardado.</p>}
    </div>
  );
}
