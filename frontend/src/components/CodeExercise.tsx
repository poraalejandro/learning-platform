"use client";

import { useState, useSyncExternalStore } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { runTests, type TestResult } from "@/lib/pyodide";
import { recordAttempt, recomputeNodeStatus } from "@/lib/progress";
import { flagIfStruggling, maybeAdvanceOnRetry } from "@/lib/mistakes";
import { requestHint, TutorError } from "@/lib/tutor";
import { celebrate } from "@/lib/confetti";
import type { CodeContent } from "@/lib/exercises";

const MAX_HINT_LEVEL = 3;

function subscribeToColorScheme(callback: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getColorScheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getServerColorScheme(): "light" | "dark" {
  return "light";
}

export function CodeExercise({
  exerciseId,
  nodeId,
  content,
}: {
  exerciseId: string;
  nodeId: string;
  content: CodeContent;
}) {
  const [code, setCode] = useState(content.starter_code);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [hints, setHints] = useState<{ text: string; isFallback: boolean }[]>([]);
  const [hintLoading, setHintLoading] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [passed, setPassed] = useState(false);

  const hintLevel = hints.length;
  const maxLevel = Math.min(MAX_HINT_LEVEL, content.hints.length);

  // CodeMirror needs an explicit theme: left unset, its default light theme's
  // dark text ends up on this page's dark-mode background (inherited, not
  // set by CodeMirror itself) — dark-on-dark, unreadable. useSyncExternalStore
  // (not useEffect+useState) is the correct tool for reading a live external
  // value like this: it reads synchronously during render, so there's no
  // extra render-then-correct flash, and getServerColorScheme keeps the
  // server-rendered pass (no `window`) from crashing.
  const editorTheme = useSyncExternalStore(subscribeToColorScheme, getColorScheme, getServerColorScheme);

  async function handleRun() {
    setRunning(true);
    setResults(null);
    try {
      const testResults = await runTests(code, content.tests);
      setResults(testResults);

      const allPassed = testResults.every((r) => r.passed);
      setPassed(allPassed);
      await recordAttempt({
        exerciseId,
        status: allPassed ? "passed" : "failed",
        submittedCode: code,
        hintsUsed: hintLevel,
      });
      if (allPassed) {
        celebrate();
        await recomputeNodeStatus(nodeId);
        await maybeAdvanceOnRetry(exerciseId);
      } else {
        await flagIfStruggling(exerciseId, "failed");
      }
    } finally {
      setRunning(false);
    }
  }

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
          ? " (límite de pistas alcanzado por ahora — esta es una pista estática de reserva)"
          : " (el tutor no está disponible ahora mismo — pista estática de reserva)";
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

  return (
    <div className="flex flex-col gap-4">
      <p className="whitespace-pre-wrap">{content.prompt}</p>

      <CodeMirror
        value={code}
        height="220px"
        theme={editorTheme}
        extensions={[python()]}
        onChange={(value) => setCode(value)}
      />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleRun}
          disabled={running}
          className="rounded bg-primary px-3 py-2 text-sm text-white transition-all duration-150 hover:brightness-110 active:scale-95 disabled:opacity-50"
        >
          {running ? "Ejecutando..." : "▶ Ejecutar"}
        </button>
        {hintLevel < maxLevel && (
          <button
            onClick={handleRequestHint}
            disabled={hintLoading}
            className="rounded border px-3 py-2 text-sm transition-all duration-150 hover:bg-zinc-50 active:scale-95 disabled:opacity-50 dark:hover:bg-zinc-900"
          >
            {hintLoading ? "Pensando..." : `💡 Pista (${hintLevel}/${maxLevel})`}
          </button>
        )}
        {!showSolution && (
          <button
            onClick={handleRevealSolution}
            className="rounded border px-3 py-2 text-sm transition-all duration-150 hover:bg-zinc-50 active:scale-95 dark:hover:bg-zinc-900"
          >
            🏳 Ver solución
          </button>
        )}
      </div>

      {hints.length > 0 && (
        <ul className="flex flex-col gap-1 rounded border border-accent/40 bg-accent-light p-3 text-sm">
          {hints.map((hint, i) => (
            <li key={i} className="animate-pop-in">
              💡 {hint.text}
            </li>
          ))}
        </ul>
      )}

      {results && (
        <ul className="flex flex-col gap-1 text-sm">
          {results.map((result, i) => (
            <li
              key={i}
              className={result.passed ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}
            >
              {result.passed ? "✅" : "❌"} {result.call} → {result.error ?? result.actual}
              {!result.passed && !result.error && ` (esperado: ${result.expected})`}
            </li>
          ))}
        </ul>
      )}

      {passed && (
        <p className="animate-pop-in font-medium text-green-700 dark:text-green-400">
          ✅ ¡Correcto! Progreso guardado.
        </p>
      )}

      {showSolution && (
        <pre className="overflow-x-auto rounded border bg-zinc-50 p-3 text-sm dark:bg-zinc-900">
          {content.solution}
        </pre>
      )}
    </div>
  );
}
