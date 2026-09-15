"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FlashcardCard } from "@/components/FlashcardCard";
import { celebrate } from "@/lib/confetti";
import type { Exercise } from "@/lib/exercises";
import type { SrsCard } from "@/lib/sm2";

export function FlashcardSession({
  nodeId,
  items,
}: {
  nodeId: string;
  items: { exercise: Exercise; card: SrsCard }[];
}) {
  const [index, setIndex] = useState(0);
  const done = index >= items.length;

  useEffect(() => {
    if (done) celebrate();
  }, [done]);

  if (done) {
    return (
      <div className="animate-pop-in flex flex-col items-center gap-3 rounded-2xl border py-16 text-center">
        <p className="text-4xl">✅</p>
        <p className="font-medium">
          Sesión completada — {items.length} tarjeta{items.length === 1 ? "" : "s"} repasadas.
        </p>
        <Link href={`/node/${nodeId}`} className="text-sm text-primary underline">
          Volver a los ejercicios
        </Link>
      </div>
    );
  }

  const current = items[index];
  const progress = ((index + 1) / items.length) * 100;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-1 flex justify-between text-sm text-muted">
          <span>
            Tarjeta {index + 1} de {items.length}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <FlashcardCard
        key={current.exercise.id}
        exercise={current.exercise}
        card={current.card}
        onAdvance={() => setIndex((i) => i + 1)}
      />
    </div>
  );
}
