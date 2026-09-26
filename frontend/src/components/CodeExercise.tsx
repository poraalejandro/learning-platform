"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { keymap } from "@codemirror/view";
import { Prec } from "@codemirror/state";
import { getPyodide, getRuntimeStatus, runTests, subscribeRuntime, type TestResult } from "@/lib/pyodide";
import { recordAttempt } from "@/lib/progress";
import { flagIfStruggling } from "@/lib/mistakes";
import { handleGatingPass } from "@/lib/game";
import { requestHint, TutorError } from "@/lib/tutor";
import { centerOf, pointFromClick, type Point } from "@/lib/fx";
import { getEffectiveTheme, subscribeTheme } from "@/lib/theme";
import { XP_HINT_COST } from "@/lib/xp";
import type { CodeContent } from "@/lib/exercises";
import { NextExerciseLink } from "@/components/NextExerciseLink";

const MAX_HINT_LEVEL = 3;
const RUNG_LABELS = ["Conceptual", "Strategy", "Almost code"];
const RESULT_STAGGER_MS = 90;

// Ctrl/⌘+Enter inside the editor. The extension is module-level (built
// once, no component state captured): it only announces the keypress as a
// DOM event, and the component — which owns the current code — listens for
// it and runs. Keeps CodeMirror's config static across renders.
const RUN_EVENT = "pyquest:run-code";
const EDITOR_EXTENSIONS = [
  python(),
  Prec.highest(
    keymap.of([
      {
        key: "Mod-Enter",
        run: (view) => {
          view.dom.dispatchEvent(new CustomEvent(RUN_EVENT, { bubbles: true }));
          return true;
        },
      },
    ]),
  ),
];

export function CodeExercise({
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
  content: CodeContent;
}) {
  const [code, setCode] = useState(content.starter_code);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [hints, setHints] = useState<{ text: string; isFallback: boolean }[]>([]);
  const [hintLoading, setHintLoading] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [passed, setPassed] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const runButtonRef = useRef<HTMLButtonElement>(null);

  const hintLevel = hints.length;
  const maxLevel = Math.min(MAX_HINT_LEVEL, content.hints.length);

  // CodeMirror needs an explicit theme: left unset, its default light theme's
  // dark text lands on the page's dark background. Follows the app theme
  // (manual toggle or OS), read synchronously so there's no wrong-theme flash.
  const editorTheme = useSyncExternalStore(subscribeTheme, getEffectiveTheme, () => "light" as const);

  // The first Run on a device downloads ~10 MB of Python runtime. Starting
  // that the moment the exercise opens (instead of on the first click) means
  // it's usually done before the student finishes reading the prompt — and
  // the status below says what's happening if it isn't.
  const runtime = useSyncExternalStore(subscribeRuntime, getRuntimeStatus, () => "idle" as const);
  useEffect(() => {
    getPyodide().catch(() => {
      // surfaced through the runtime status; Run retries the load
    });
  }, []);

  async function handleRun(origin?: Point) {
    if (running) return;
    setRunning(true);
    setResults(null);
    try {
      const testResults = await runTests(code, content.tests);
      setResults(testResults);

      const allPassed = testResults.every((r) => r.passed);
      setPassed(allPassed);
      if (allPassed) {
        setFlashKey((k) => k + 1);
        await handleGatingPass({
          exerciseId,
          nodeId,
          hintsUsed: hintLevel,
          submittedCode: code,
          origin: origin ?? centerOf(runButtonRef.current),
        });
      } else {
        await recordAttempt({ exerciseId, status: "failed", submittedCode: code, hintsUsed: hintLevel });
        await flagIfStruggling(exerciseId, "failed");
      }
    } catch {
      setResults([
        {
          call: "",
          expected: "",
          actual: "",
          passed: false,
          error: "Couldn't start the Python runtime — check your connection and try again.",
        },
      ]);
    } finally {
      setRunning(false);
    }
  }

  // The listener is attached once; the ref gives it the latest handleRun
  // (which closes over the current code), not the one from the first render.
  const editorWrapRef = useRef<HTMLDivElement>(null);
  const runRef = useRef(handleRun);
  useEffect(() => {
    runRef.current = handleRun;
  });
  useEffect(() => {
    const wrap = editorWrapRef.current;
    if (!wrap) return;
    const onRun = () => void runRef.current();
    wrap.addEventListener(RUN_EVENT, onRun);
    return () => wrap.removeEventListener(RUN_EVENT, onRun);
  }, []);

  async function handleRequestHint() {
    setHintLoading(true);
    const nextLevel = hintLevel + 1;
    try {
      const hint = await requestHint(exerciseId, code, nextLevel);
      setHints((prev) => [...prev, { text: hint, isFallback: false }]);
    } catch (error) {
      // The tutor is the only piece of the app with a real per-request cost
      // and a live external dependency (Groq) — if it's down or the user
      // hit their rate limit, fall back to the pre-written hint at this
      // level instead of leaving the student stuck with nothing.
      const fallback = content.hints[nextLevel - 1];
      const note =
        error instanceof TutorError && error.status === 429
          ? " (hint limit reached for now — this is a static fallback hint)"
          : " (the tutor isn't available right now — static fallback hint)";
      setHints((prev) => [...prev, { text: (fallback ?? "") + note, isFallback: true }]);
    } finally {
      setHintLoading(false);
    }
  }

  async function handleRevealSolution() {
    setShowSolution(true);
    await recordAttempt({ exerciseId, status: "revealed", submittedCode: code, hintsUsed: hintLevel });
    await flagIfStruggling(exerciseId, "revealed");
  }

  const runtimeLoading = runtime === "loading";
  const flashDelay = (results?.length ?? 0) * RESULT_STAGGER_MS;

  return (
    <div className="flex flex-col gap-4">
      <p className="whitespace-pre-wrap">{content.prompt}</p>

      {(runtimeLoading || runtime === "error") && (
        <div className="animate-rise-in flex flex-col gap-1.5 rounded-lg border bg-surface-2 px-3 py-2 text-xs text-muted">
          <span>
            {runtimeLoading
              ? "Loading the Python runtime — only the first time on this device (~10 MB)…"
              : "Couldn't load the Python runtime. Check your connection; Run will try again."}
          </span>
          {runtimeLoading && (
            <span className="block h-1 overflow-hidden rounded-full bg-border">
              <span className="animate-indeterminate block h-full w-2/5 rounded-full bg-primary" />
            </span>
          )}
        </div>
      )}

      <div ref={editorWrapRef} className="relative">
        <CodeMirror
          value={code}
          height="220px"
          theme={editorTheme}
          extensions={EDITOR_EXTENSIONS}
          onChange={(value) => setCode(value)}
        />
        {flashKey > 0 && (
          <div
            key={flashKey}
            aria-hidden
            className="animate-success-flash pointer-events-none absolute inset-0 rounded ring-2 ring-success"
            style={{
              animationDelay: `${flashDelay}ms`,
              backgroundColor: "color-mix(in srgb, var(--success) 14%, transparent)",
            }}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          ref={runButtonRef}
          onClick={(e) => handleRun(pointFromClick(e))}
          disabled={running || runtimeLoading}
          className="rounded-lg bg-primary px-3 py-2 text-sm text-white transition-all duration-150 hover:brightness-110 active:scale-95 disabled:opacity-50"
        >
          {runtimeLoading ? "Loading Python…" : running ? "Running..." : "▶ Run"}
        </button>
        {!showSolution && (
          <button
            onClick={handleRevealSolution}
            className="rounded-lg border px-3 py-2 text-sm transition-all duration-150 hover:bg-surface-2 active:scale-95"
          >
            🏳 Reveal solution
          </button>
        )}
        <span className="ml-auto hidden text-xs text-muted pointer-fine:inline">
          <kbd className="rounded border px-1 font-mono">Ctrl</kbd>/<kbd className="rounded border px-1 font-mono">⌘</kbd> +{" "}
          <kbd className="rounded border px-1 font-mono">Enter</kbd> to run
        </span>
      </div>

      {maxLevel > 0 && (
        <HintLadder
          hints={hints}
          maxLevel={maxLevel}
          loading={hintLoading}
          disabled={passed}
          onUnlock={handleRequestHint}
        />
      )}

      {results && (
        <ul className="flex flex-col gap-1 text-sm">
          {results.map((result, i) => (
            <li
              key={i}
              className={`animate-rise-in ${result.passed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
              style={{ animationDelay: `${i * RESULT_STAGGER_MS}ms` }}
            >
              <span className="inline-block animate-pop-in" style={{ animationDelay: `${i * RESULT_STAGGER_MS + 60}ms` }}>
                {result.passed ? "✅" : "❌"}
              </span>{" "}
              {result.call && <>{result.call} → </>}
              {result.error ?? result.actual}
              {!result.passed && !result.error && ` (expected: ${result.expected})`}
            </li>
          ))}
        </ul>
      )}

      {passed && (
        <>
          <p
            className="animate-pop-in font-medium text-green-600 dark:text-green-400"
            style={{ animationDelay: `${flashDelay}ms` }}
          >
            ✅ Correct! Progress saved.
          </p>
          <NextExerciseLink nodeId={nodeId} nextHref={nextHref} doneHref={doneHref} />
        </>
      )}

      {showSolution && (
        <pre className="animate-rise-in overflow-x-auto rounded-lg border bg-surface-2 p-3 text-sm">{content.solution}</pre>
      )}
    </div>
  );
}

/**
 * The hint ladder (docs/architecture.md §3): each rung gives away more than
 * the last, and only the next locked rung can be opened — so a student can't
 * skip straight to "almost code". Each one opened lowers the XP this
 * exercise pays out (lib/xp.ts), which is why the cost is on the button.
 */
function HintLadder({
  hints,
  maxLevel,
  loading,
  disabled,
  onUnlock,
}: {
  hints: { text: string; isFallback: boolean }[];
  maxLevel: number;
  loading: boolean;
  disabled: boolean;
  onUnlock: () => void;
}) {
  return (
    <ol className="flex flex-col gap-1.5 rounded-lg border border-accent/40 bg-accent-light p-3 text-sm" aria-label="Hints">
      <li className="mb-0.5 text-xs font-semibold tracking-wide text-accent uppercase">💡 Hints</li>
      {Array.from({ length: maxLevel }, (_, i) => {
        const unlocked = i < hints.length;
        const isNext = i === hints.length;
        return (
          <li
            key={i}
            className={`flex items-start gap-2 rounded-md px-2 py-1.5 transition-colors duration-200 ${
              unlocked ? "bg-surface/70" : ""
            }`}
          >
            <span
              aria-hidden
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                unlocked ? "animate-pop-in bg-accent text-neutral-900" : "border border-accent/50 text-muted"
              }`}
            >
              {unlocked ? i + 1 : "🔒"}
            </span>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-medium text-muted">{RUNG_LABELS[i] ?? `Hint ${i + 1}`}</span>
              {unlocked ? (
                <p className="animate-rise-in">{hints[i].text}</p>
              ) : isNext && !disabled ? (
                <button
                  onClick={onUnlock}
                  disabled={loading}
                  className="mt-1 block rounded-md border border-accent/50 px-2 py-1 text-xs transition-all duration-150 hover:bg-surface active:scale-95 disabled:opacity-50"
                >
                  {loading ? "Thinking…" : `Unlock (−${XP_HINT_COST} XP)`}
                </button>
              ) : (
                <p className="text-xs text-muted">Locked</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
