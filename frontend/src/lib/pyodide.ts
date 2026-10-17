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
  loadPackage: (names: string[]) => Promise<unknown>;
};

declare global {
  interface Window {
    loadPyodide?: (options: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

let pyodidePromise: Promise<PyodideInterface> | null = null;

/**
 * Observable load state, so the UI can say "downloading the Python runtime"
 * on the one slow first run instead of a Run button that just seems stuck.
 * Shaped for useSyncExternalStore.
 */
export type RuntimeStatus = "idle" | "loading" | "ready" | "error";
let runtimeStatus: RuntimeStatus = "idle";
const runtimeListeners = new Set<() => void>();

function setRuntimeStatus(next: RuntimeStatus) {
  runtimeStatus = next;
  runtimeListeners.forEach((listener) => listener());
}

export function getRuntimeStatus(): RuntimeStatus {
  return runtimeStatus;
}

export function subscribeRuntime(listener: () => void): () => void {
  runtimeListeners.add(listener);
  return () => runtimeListeners.delete(listener);
}

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
    setRuntimeStatus("loading");
    pyodidePromise = loadScript(`${PYODIDE_CDN_BASE}pyodide.js`)
      .then(() => {
        if (!window.loadPyodide) throw new Error("Pyodide script loaded but loadPyodide is missing");
        return window.loadPyodide({ indexURL: PYODIDE_CDN_BASE });
      })
      .then((pyodide) => {
        setRuntimeStatus("ready");
        return pyodide;
      })
      .catch((error) => {
        // Forget the failed promise so the next Run retries instead of
        // replaying the same rejection forever.
        pyodidePromise = null;
        setRuntimeStatus("error");
        throw error;
      });
  }
  return pyodidePromise;
}

// Libraries that ship with Pyodide but aren't loaded at startup: the bare
// runtime is ~10 MB, and NumPy/pandas add several more each, so they're
// fetched only when an exercise actually imports them (then cached by the
// browser and kept loaded for the rest of the session). Keys are the import
// names; values are what the loading banner calls them.
const ON_DEMAND_PACKAGES: Record<string, string> = { numpy: "NumPy", pandas: "pandas" };
const IMPORT_PATTERN = /^\s*(?:import|from)\s+([A-Za-z_]\w*)/gm;

const packagePromises = new Map<string, Promise<unknown>>();

/** "" when idle, otherwise the display names being downloaded ("NumPy, pandas"). Shaped for useSyncExternalStore. */
let packagesLoading = "";
const packageListeners = new Set<() => void>();
const pendingPackages = new Set<string>();

function refreshPackagesLoading() {
  packagesLoading = [...pendingPackages].map((name) => ON_DEMAND_PACKAGES[name]).join(", ");
  packageListeners.forEach((listener) => listener());
}

export function getPackagesLoading(): string {
  return packagesLoading;
}

export function subscribePackages(listener: () => void): () => void {
  packageListeners.add(listener);
  return () => packageListeners.delete(listener);
}

/** Import names in `code` that need an on-demand package. */
function packagesImportedBy(code: string): string[] {
  const found = new Set<string>();
  for (const match of code.matchAll(IMPORT_PATTERN)) {
    if (match[1] in ON_DEMAND_PACKAGES) found.add(match[1]);
  }
  return [...found];
}

/**
 * Makes sure every on-demand library `code` imports is loaded. Safe to call
 * repeatedly and concurrently (each package is fetched once); a failed
 * download is forgotten so the next call retries.
 */
export async function ensurePackagesFor(code: string): Promise<void> {
  const names = packagesImportedBy(code);
  if (names.length === 0) return;
  const pyodide = await getPyodide();

  await Promise.all(
    names.map((name) => {
      let promise = packagePromises.get(name);
      if (!promise) {
        pendingPackages.add(name);
        refreshPackagesLoading();
        promise = pyodide
          .loadPackage([name])
          .catch((error) => {
            packagePromises.delete(name);
            throw error;
          })
          .finally(() => {
            pendingPackages.delete(name);
            refreshPackagesLoading();
          });
        packagePromises.set(name, promise);
      }
      return promise;
    }),
  );
}

/**
 * Pyodide's error message is the full traceback, including frames inside
 * Pyodide itself (/lib/python3.x/_pyodide/...) that mean nothing to a
 * student. Keep only what starts at their own code — "<exec>" is the
 * student's code, "<call>" a test call — or just the final "XError: …"
 * line when there's no such frame.
 */
function formatPythonError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const lines = message.trimEnd().split("\n");
  const start = lines.findIndex((line) => line.includes('File "<exec>"') || line.includes('File "<call>"'));
  if (start < 0) return lines.slice(-1).join("\n");
  const kept = lines.slice(start);
  // A failing test call also passes through our own __run_call wrapper
  // (and the one-line "<module>" that invokes it); those frames are ours.
  if (!kept.some((line) => line.includes("in __run_call"))) return kept.join("\n");
  return kept
    .filter((line) => !/^\s*File ".*", line \d+, in (<module>|__run_call|__wrapped)$/.test(line))
    .join("\n");
}

export type TestCase = { call: string; expected: string };
export type TestResult = { call: string; expected: string; actual: string; passed: boolean; error?: string };

// `call` isn't always a single expression — some exercises use a short
// multi-statement line like "c = Foo(); c.bar(); c.baz()" to set up state
// before the value we actually check, and M5's (async) exercises use `await`
// inside it (e.g. "await sumar([1, 2, 3])"). __run_call handles both by
// unparsing the statements back into the body of a generated `async def`
// (turning the trailing expression into its `return`) and awaiting it —
// `await` is only legal inside an async function, and wrapping unconditionally
// means sync and async calls go through one path, not two. Still AST-based,
// not naive string-splitting on ';' (which would break on semicolons inside
// strings/brackets).
const RUN_CALL_HELPER = `
import ast as __ast

async def __run_call(__source):
    __tree = __ast.parse(__source, mode="exec")
    __body = __tree.body
    if __body and isinstance(__body[-1], __ast.Expr):
        __body[-1] = __ast.Return(value=__body[-1].value)
    if not __body:
        __body = [__ast.Pass()]
    __lines = [__line for __stmt in __body for __line in __ast.unparse(__stmt).splitlines()]
    __src = "async def __wrapped():\\n" + "\\n".join("    " + __line for __line in __lines)
    __g = globals()
    exec(compile(__src, "<call>", "exec"), __g)
    return await __g["__wrapped"]()
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
  // Test calls can import too (e.g. "import numpy as np; f(np.array(...))").
  await ensurePackagesFor([userCode, ...tests.map((test) => test.call)].join("\n"));
  const namespace = pyodide.toPy({});

  try {
    try {
      await pyodide.runPythonAsync(userCode + "\n" + RUN_CALL_HELPER, { globals: namespace });
    } catch (error) {
      // The student's code itself didn't load (SyntaxError, IndentationError,
      // a NameError at module level…). That's a normal failed run, not a
      // runtime failure: report it as one result so they can read and fix it.
      return [{ call: "", expected: "", actual: "", passed: false, error: formatPythonError(error) }];
    }

    const results: TestResult[] = [];
    for (const test of tests) {
      try {
        const actual = (await pyodide.runPythonAsync(
          `repr(await __run_call(${JSON.stringify(test.call)}))`,
          { globals: namespace },
        )) as string;
        results.push({ ...test, actual, passed: actual === test.expected });
      } catch (error) {
        results.push({
          ...test,
          actual: "",
          passed: false,
          error: formatPythonError(error),
        });
      }
    }
    return results;
  } finally {
    namespace.destroy();
  }
}
