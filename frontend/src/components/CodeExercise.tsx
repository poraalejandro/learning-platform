"use client";

import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { runTests, type TestResult } from "@/lib/pyodide";
import { recordAttempt, recomputeNodeStatus } from "@/lib/progress";
import { requestHint, TutorError } from "@/lib/tutor";
import type { CodeContent } from "@/lib/exercises";

const MAX_HINT_LEVEL = 3;

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
      if (allPassed) await recomputeNodeStatus(nodeId);
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
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="whitespace-pre-wrap">{content.prompt}</p>

      <CodeMirror
        value={code}
        height="220px"
        extensions={[python()]}
        onChange={(value) => setCode(value)}
      />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleRun}
          disabled={running}
          className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          {running ? "Ejecutando..." : "▶ Ejecutar"}
        </button>
        {hintLevel < maxLevel && (
          <button
            onClick={handleRequestHint}
            disabled={hintLoading}
            className="rounded border px-3 py-2 text-sm disabled:opacity-50"
          >
            {hintLoading ? "Pensando..." : `💡 Pista (${hintLevel}/${maxLevel})`}
          </button>
        )}
        {!showSolution && (
          <button onClick={handleRevealSolution} className="rounded border px-3 py-2 text-sm">
            🏳 Ver solución
          </button>
        )}
      </div>

      {hints.length > 0 && (
        <ul className="flex flex-col gap-1 rounded border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950">
          {hints.map((hint, i) => (
            <li key={i}>💡 {hint.text}</li>
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
        <p className="font-medium text-green-700 dark:text-green-400">
          ¡Correcto! Progreso guardado.
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
