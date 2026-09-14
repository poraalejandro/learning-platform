// Pyodide runs Python entirely in the browser via WebAssembly (see
// docs/architecture.md §1: "sin sandboxing en servidor" — code the student
// writes only ever touches their own tab, never our infrastructure).
//
// Loaded from jsDelivr's CDN at runtime rather than bundled via the npm
// package: Pyodide's loader auto-detects Node vs browser and expects its
// ~10MB of .wasm/stdlib assets served alongside it, which fights with
// Next.js/Turbopack's bundling. A plain <script> tag sidesteps all of that.
const PYODIDE_VERSION = "314.0.7";
const PYODIDE_CDN_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

type PyProxy = { destroy: () => void };
type PyodideInterface = {
  runPythonAsync: (code: string, options?: { globals: PyProxy }) => Promise<unknown>;
  toPy: (value: unknown) => PyProxy;
};

declare global {
  interface Window {
    loadPyodide?: (options: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

let pyodidePromise: Promise<PyodideInterface> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

/** Loads Pyodide once and reuses the same instance for every exercise opened afterwards. */
export function getPyodide(): Promise<PyodideInterface> {
  if (!pyodidePromise) {
    pyodidePromise = loadScript(`${PYODIDE_CDN_BASE}pyodide.js`).then(() => {
      if (!window.loadPyodide) throw new Error("Pyodide script loaded but loadPyodide is missing");
      return window.loadPyodide({ indexURL: PYODIDE_CDN_BASE });
    });
  }
  return pyodidePromise;
}

export type TestCase = { call: string; expected: string };
export type TestResult = { call: string; expected: string; actual: string; passed: boolean; error?: string };

// `call` isn't always a single expression — some exercises use a short
// multi-statement line like "c = Foo(); c.bar(); c.baz()" to set up state
// before the value we actually check. __run_call executes every statement
// but the last, then evaluates the last one as an expression and returns
// its value — via ast so it's not just naive string-splitting on ';'
// (which would break on semicolons inside strings/brackets).
const RUN_CALL_HELPER = `
import ast as __ast

def __run_call(__source):
    __tree = __ast.parse(__source, mode="exec")
    __g = globals()
    if __tree.body and isinstance(__tree.body[-1], __ast.Expr):
        __last = __tree.body.pop()
        exec(compile(__tree, "<call>", "exec"), __g)
        return eval(compile(__ast.Expression(__last.value), "<call>", "eval"), __g)
    exec(compile(__tree, "<call>", "exec"), __g)
    return None
`;

/**
 * Runs the student's code once (to define their function/class), then each
 * test's `call`, comparing its repr() against `expected` — the exercises
 * table stores expected values as Python-repr strings (e.g. "True",
 * "{'a': 2}"), not native JSON, so repr() is the correct comparison here.
 *
 * Each call gets a fresh Python namespace (toPy({})) so one exercise's
 * definitions can never leak into another's — the Pyodide *runtime* is
 * still the single cached instance from getPyodide(), only the globals
 * dict is per-run.
 */
export async function runTests(userCode: string, tests: TestCase[]): Promise<TestResult[]> {
  const pyodide = await getPyodide();
  const namespace = pyodide.toPy({});

  try {
    await pyodide.runPythonAsync(userCode + "\n" + RUN_CALL_HELPER, { globals: namespace });

    const results: TestResult[] = [];
    for (const test of tests) {
      try {
        const actual = (await pyodide.runPythonAsync(
          `repr(__run_call(${JSON.stringify(test.call)}))`,
          { globals: namespace },
        )) as string;
        results.push({ ...test, actual, passed: actual === test.expected });
      } catch (error) {
        results.push({
          ...test,
          actual: "",
          passed: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
    return results;
  } finally {
    namespace.destroy();
  }
}
