/**
 * A curated cross-reference between the concepts our own exercises tag
 * (`meta.concepts`) and Python's official glossary
 * (docs.python.org/3/glossary.html) — not a copy of it. Each description
 * below is written from scratch, independent of the source's own wording,
 * and is deliberately short: the anchor link is where the full, canonical
 * definition lives, this is just enough to know whether it's the term you
 * want and jump there.
 *
 * Scope is intentionally narrow: only concepts we actually tag that map to
 * a real, dedicated glossary entry. Most of what we teach (RAG, LangGraph,
 * testing patterns, architecture) isn't Python-language vocabulary, so it
 * has no glossary entry to link to — this list is small on purpose, not
 * incomplete.
 */
export type GlossaryEntry = {
  term: string;
  slug: string; // anchor on docs.python.org/3/glossary.html#term-<slug>
  description: string;
  /** Our own concept tag(s) that led to this entry, shown as context. */
  fromConcepts: string[];
};

export const PYTHON_GLOSSARY: GlossaryEntry[] = [
  {
    term: "concurrency",
    slug: "concurrency",
    description: "Managing several tasks by interleaving them on one thread — not running them at the same literal instant.",
    fromConcepts: ["concurrency vs parallelism"],
  },
  {
    term: "context manager",
    slug: "context-manager",
    description: "An object with __enter__/__exit__ that runs setup and guaranteed cleanup around a with block.",
    fromConcepts: ["context manager", "__enter__/__exit__"],
  },
  {
    term: "coroutine",
    slug: "coroutine",
    description: "A function defined with async def — calling it returns a coroutine object that only runs once you await it.",
    fromConcepts: ["coroutines"],
  },
  {
    term: "decorator",
    slug: "decorator",
    description: "A function that wraps another function to add behavior, applied with the @ syntax.",
    fromConcepts: ["Decorator"],
  },
  {
    term: "dictionary",
    slug: "dictionary",
    description: "Python's built-in mapping type: keys to values, looked up by key rather than position.",
    fromConcepts: ["dictionaries", "dict.get"],
  },
  {
    term: "function",
    slug: "function",
    description: "In Python, functions are objects like any other — you can store them in variables, pass them as arguments, or put them in a dict.",
    fromConcepts: ["functions as objects"],
  },
  {
    term: "generator",
    slug: "generator",
    description: "A function with yield that produces values one at a time instead of building a whole list in memory.",
    fromConcepts: ["generators"],
  },
  {
    term: "list",
    slug: "list",
    description: "Python's built-in mutable, ordered sequence type.",
    fromConcepts: ["lists"],
  },
  {
    term: "list comprehension",
    slug: "list-comprehension",
    description: "A compact way to build a list by describing its elements in one line, e.g. [x*2 for x in range(3)] — dict and set comprehensions follow the same idea.",
    fromConcepts: ["comprehensions"],
  },
  {
    term: "mutable",
    slug: "mutable",
    description: "An object whose value can change after creation, like a list — as opposed to immutable ones like tuples or strings.",
    fromConcepts: ["mutable default arguments"],
  },
  {
    term: "parallelism",
    slug: "parallelism",
    description: "Running tasks literally at the same time, on multiple CPU cores or machines.",
    fromConcepts: ["concurrency vs parallelism"],
  },
];

export const PYTHON_GLOSSARY_URL = "https://docs.python.org/3/glossary.html";
