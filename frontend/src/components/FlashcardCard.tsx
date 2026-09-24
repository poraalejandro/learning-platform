"use client";

import { useEffect, useRef, useState } from "react";
import { rateCard } from "@/lib/srs";
import { awardXp } from "@/lib/xp";
import { centerOf, pointFromClick, type Point } from "@/lib/fx";
import { dissolveIn, dissolveOut, primeDissolveIn, type DissolveOrigin } from "@/lib/dissolve";
import { isTypingTarget } from "@/lib/keys";
import type { Rating, SrsCard } from "@/lib/sm2";
import type { Exercise, FlashcardContent, RecallContent } from "@/lib/exercises";

const RATING_BUTTONS: { rating: Rating; label: string; key: string; classes: string }[] = [
  { rating: "again", label: "Again", key: "1", classes: "bg-red-600 hover:bg-red-700" },
  { rating: "hard", label: "Hard", key: "2", classes: "bg-orange-500 hover:bg-orange-600" },
  { rating: "good", label: "Good", key: "3", classes: "bg-green-600 hover:bg-green-700" },
  { rating: "easy", label: "Easy", key: "4", classes: "bg-primary hover:brightness-110" },
];

const TYPE_LABEL: Record<string, string> = { flashcard: "Flashcard", recall: "Recall" };

// Below these a pointer gesture is a tap, above them (horizontally) a swipe.
const TAP_MAX_PX = 10;
const SWIPE_MIN_PX = 50;

/**
 * Reveal and advance are "dissolves" that start where the user acted:
 * - click/tap: a soft circle grows from the exact point touched;
 * - swipe (touch/pen only): a soft edge sweeps the way the finger moved;
 * - keyboard (desktop): from the center of whatever the key stands for.
 * After revealing, a horizontal swipe also rates the card: ← Again, → Good.
 * Vertical movement is left to the browser (touch-action: pan-y) so the
 * page still scrolls when a drag starts on the card.
 */
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
  const [leaving, setLeaving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);
  const ratingRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const gesture = useRef<{ x: number; y: number; type: string } | null>(null);

  const content = exercise.content as FlashcardContent | RecallContent;
  const isRecall = exercise.type === "recall";
  const answerText = isRecall ? (content as RecallContent).modelAnswer : (content as FlashcardContent).answer;
  const explanation = isRecall ? undefined : (content as FlashcardContent).explanation;

  function reveal(origin: DissolveOrigin) {
    if (revealed || !answerRef.current) return;
    const answer = answerRef.current;
    // Masked *before* it becomes visible, so the first painted frame is
    // already hidden and the dissolve grows out of nothing.
    primeDissolveIn(answer);
    setRevealed(true);
    void dissolveIn(answer, origin);
  }

  async function rate(rating: Rating, origin: DissolveOrigin, xpAt?: Point) {
    if (!revealed || leaving || !cardRef.current) return;
    setLeaving(true);
    // Saved in the background: the next card doesn't depend on this write,
    // and waiting for three round-trips would leave a blank gap after the
    // card has already dissolved.
    void rateCard(exercise.id, card, rating).then(() => awardXp(rating === "again" ? 1 : 2, xpAt));
    await dissolveOut(cardRef.current, origin);
    onAdvance();
  }

  // Keyboard (desktop): Space/Enter reveals, 1–4 rate. Read through a ref so
  // the single listener always sees the current revealed/leaving state.
  const latest = useRef({ reveal, rate, revealed });
  useEffect(() => {
    latest.current = { reveal, rate, revealed };
  });
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
      // A focused button handles its own Enter/Space as a click.
      if (e.target instanceof HTMLButtonElement) return;
      const { reveal, rate, revealed } = latest.current;

      if (!revealed && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        const at = centerOf(cardRef.current);
        if (at) reveal({ kind: "point", at });
        return;
      }
      const index = RATING_BUTTONS.findIndex((b) => b.key === e.key);
      if (revealed && index >= 0) {
        e.preventDefault();
        const at = centerOf(ratingRefs.current[index]) ?? centerOf(cardRef.current);
        if (at) void rate(RATING_BUTTONS[index].rating, { kind: "point", at }, at);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("button")) return;
    gesture.current = { x: e.clientX, y: e.clientY, type: e.pointerType };
  }

  function onPointerUp(e: React.PointerEvent) {
    const start = gesture.current;
    gesture.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const at = { x: e.clientX, y: e.clientY };

    if (Math.hypot(dx, dy) < TAP_MAX_PX) {
      if (!revealed) reveal({ kind: "point", at });
      return;
    }
    // Mouse drags are text selection, not swipes — only touch/pen swipe.
    const isSwipe = start.type !== "mouse" && Math.abs(dx) > SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy);
    if (!isSwipe) return;
    if (!revealed) reveal({ kind: "direction", dx, dy: 0 });
    else void rate(dx < 0 ? "again" : "good", { kind: "direction", dx, dy: 0 }, at);
  }

  return (
    <div
      ref={cardRef}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (gesture.current = null)}
      className={`animate-rise-in flex min-h-[22rem] touch-pan-y flex-col justify-between rounded-2xl border bg-surface p-6 shadow-sm sm:p-8 ${
        revealed ? "" : "cursor-pointer"
      }`}
    >
      <div>
        <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-muted">
          {TYPE_LABEL[exercise.type] ?? exercise.type}
        </span>

        <p className="mt-6 text-center text-xl leading-relaxed whitespace-pre-wrap">{content.prompt}</p>

        {/* Placeholder and answer share one grid cell, so the card is sized
            for the answer from the start and doesn't jump on reveal. */}
        <div className="mt-6 grid">
          <div
            aria-hidden={revealed}
            className="col-start-1 row-start-1 flex items-center justify-center rounded-xl border border-dashed p-5 text-center text-sm text-muted transition-[opacity,filter] duration-300"
            style={revealed ? { opacity: 0, filter: "blur(4px)" } : undefined}
          >
            Think of your answer, then reveal it.
          </div>
          <div
            ref={answerRef}
            aria-hidden={!revealed}
            className={`col-start-1 row-start-1 rounded-xl border-t-2 border-primary/30 bg-primary-light/60 p-5 ${
              revealed ? "" : "invisible"
            }`}
          >
            <pre className="text-center font-sans text-base whitespace-pre-wrap">{answerText}</pre>
            {explanation && <p className="mt-3 text-center text-sm text-muted">{explanation}</p>}
          </div>
        </div>
      </div>

      <div className="mt-8">
        {!revealed ? (
          <>
            <button
              onClick={(e) => {
                const at = pointFromClick(e);
                if (at) reveal({ kind: "point", at });
              }}
              className="w-full rounded-xl bg-primary py-3 font-medium text-white transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
            >
              Show answer
            </button>
            <p className="mt-2 hidden text-center text-xs text-muted pointer-fine:block">
              or press <kbd className="rounded border px-1 font-mono">Space</kbd>
            </p>
            <p className="mt-2 hidden text-center text-xs text-muted pointer-coarse:block">
              or tap the card · swipe to reveal
            </p>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {RATING_BUTTONS.map(({ rating, label, key, classes }, i) => (
                <button
                  key={rating}
                  ref={(el) => {
                    ratingRefs.current[i] = el;
                  }}
                  onClick={(e) => {
                    const at = pointFromClick(e);
                    if (at) void rate(rating, { kind: "point", at }, at);
                  }}
                  disabled={leaving}
                  className={`animate-pop-in flex items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-medium text-white transition-all duration-150 active:scale-95 disabled:opacity-50 ${classes}`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {label}
                  <kbd className="hidden rounded bg-white/20 px-1 font-mono text-[10px] pointer-fine:inline">{key}</kbd>
                </button>
              ))}
            </div>
            <p className="mt-2 hidden text-center text-xs text-muted pointer-coarse:block">
              Swipe ← Again · → Good
            </p>
          </>
        )}
      </div>
    </div>
  );
}
