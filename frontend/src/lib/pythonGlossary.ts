/**
 * A curated index into Python's own official docs — not a copy of them.
 * Every description below is written from scratch, independent of the
 * source's wording, and deliberately short: the link is where the full,
 * canonical explanation lives, this is just enough to know whether it's
 * the term you want before jumping there.
 *
 * Two sources, both linked to their exact anchor (never guessed — extracted
 * from the live page):
 * - "glossary": docs.python.org/3/glossary.html, Python's own dictionary of
 *   language vocabulary.
 * - "tutorial": a specific section of docs.python.org/3/tutorial/, for real
 *   topics that don't have their own single-word glossary entry (e.g. "for
 *   statements" or "exception chaining").
 *
 * Scope is intentionally the tutorial chapters that map to what PyQuest
 * actually teaches (M1 basics, M2 data structures, M3 OOP, M4 errors) --
 * introduction, control flow, data structures, formatted output, errors and
 * exceptions, classes -- not the whole tutorial (modules, stdlib tour, venv
 * and packaging aren't covered here because PyQuest doesn't teach them as
 * their own topic).
 */
export type GlossarySource = "glossary" | "tutorial";

export type GlossaryEntry = {
  term: string;
  url: string;
  description: string;
  source: GlossarySource;
  /** Our own concept tag(s) this happens to also relate to, if any. */
  fromConcepts?: string[];
};

const GLOSSARY = "https://docs.python.org/3/glossary.html";
const T = {
  intro: "https://docs.python.org/3/tutorial/introduction.html",
  control: "https://docs.python.org/3/tutorial/controlflow.html",
  data: "https://docs.python.org/3/tutorial/datastructures.html",
  io: "https://docs.python.org/3/tutorial/inputoutput.html",
  errors: "https://docs.python.org/3/tutorial/errors.html",
  classes: "https://docs.python.org/3/tutorial/classes.html",
};

export const PYTHON_GLOSSARY: GlossaryEntry[] = [
  // ── Official glossary terms (docs.python.org/3/glossary.html) ──────────
  {
    term: "concurrency",
    url: `${GLOSSARY}#term-concurrency`,
    description: "Managing several tasks by interleaving them on one thread — not running them at the same literal instant.",
    source: "glossary",
    fromConcepts: ["concurrency vs parallelism"],
  },
  {
    term: "context manager",
    url: `${GLOSSARY}#term-context-manager`,
    description: "An object with __enter__/__exit__ that runs setup and guaranteed cleanup around a with block.",
    source: "glossary",
    fromConcepts: ["context manager", "__enter__/__exit__"],
  },
  {
    term: "coroutine",
    url: `${GLOSSARY}#term-coroutine`,
    description: "A function defined with async def — calling it returns a coroutine object that only runs once you await it.",
    source: "glossary",
    fromConcepts: ["coroutines"],
  },
  {
    term: "decorator",
    url: `${GLOSSARY}#term-decorator`,
    description: "A function that wraps another function to add behavior, applied with the @ syntax.",
    source: "glossary",
    fromConcepts: ["Decorator"],
  },
  {
    term: "dictionary",
    url: `${GLOSSARY}#term-dictionary`,
    description: "Python's built-in mapping type: keys to values, looked up by key rather than position.",
    source: "glossary",
    fromConcepts: ["dictionaries", "dict.get"],
  },
  {
    term: "function",
    url: `${GLOSSARY}#term-function`,
    description: "In Python, functions are objects like any other — you can store them in variables, pass them as arguments, or put them in a dict.",
    source: "glossary",
    fromConcepts: ["functions as objects"],
  },
  {
    term: "generator",
    url: `${GLOSSARY}#term-generator`,
    description: "A function with yield that produces values one at a time instead of building a whole list in memory.",
    source: "glossary",
    fromConcepts: ["generators"],
  },
  {
    term: "list",
    url: `${GLOSSARY}#term-list`,
    description: "Python's built-in mutable, ordered sequence type.",
    source: "glossary",
    fromConcepts: ["lists"],
  },
  {
    term: "list comprehension",
    url: `${GLOSSARY}#term-list-comprehension`,
    description: "A compact way to build a list by describing its elements in one line, e.g. [x*2 for x in range(3)] — dict and set comprehensions follow the same idea.",
    source: "glossary",
    fromConcepts: ["comprehensions"],
  },
  {
    term: "mutable",
    url: `${GLOSSARY}#term-mutable`,
    description: "An object whose value can change after creation, like a list — as opposed to immutable ones like tuples or strings.",
    source: "glossary",
    fromConcepts: ["mutable default arguments"],
  },
  {
    term: "parallelism",
    url: `${GLOSSARY}#term-parallelism`,
    description: "Running tasks literally at the same time, on multiple CPU cores or machines.",
    source: "glossary",
    fromConcepts: ["concurrency vs parallelism"],
  },

  // ── Tutorial: 3. An Informal Introduction to Python ─────────────────────
  {
    term: "numbers",
    url: `${T.intro}#numbers`,
    description: "Python's built-in int and float types, with arithmetic operators (+, -, *, /, // for floor division, % for remainder, ** for power).",
    source: "tutorial",
  },
  {
    term: "text (strings)",
    url: `${T.intro}#text`,
    description: "Python's str type: sequences of characters written with single, double, or triple quotes, indexable and sliceable like any sequence.",
    source: "tutorial",
  },

  // ── Tutorial: 4. More Control Flow Tools ────────────────────────────────
  {
    term: "if statements",
    url: `${T.control}#if-statements`,
    description: "Python's conditional branching — if / elif / else, no switch statement needed for most cases.",
    source: "tutorial",
  },
  {
    term: "for statements",
    url: `${T.control}#for-statements`,
    description: "Iterates over the items of any sequence (or other iterable) directly, unlike C-style index-counting loops.",
    source: "tutorial",
  },
  {
    term: "the range() function",
    url: `${T.control}#the-range-function`,
    description: "Generates a sequence of numbers on demand — range(5) is 0..4 — most often used to control how many times a for loop runs.",
    source: "tutorial",
  },
  {
    term: "break and continue statements",
    url: `${T.control}#break-and-continue-statements`,
    description: "break exits a loop entirely; continue skips straight to the next iteration without finishing the current one.",
    source: "tutorial",
    fromConcepts: ["loops"],
  },
  {
    term: "else clauses on loops",
    url: `${T.control}#else-clauses-on-loops`,
    description: "Runs when a loop finishes normally without hitting break — a clean way to express 'searched everything and found nothing'.",
    source: "tutorial",
  },
  {
    term: "pass statements",
    url: `${T.control}#pass-statements`,
    description: "A no-op statement, used as a placeholder wherever the syntax requires a statement but you have nothing to put there yet.",
    source: "tutorial",
  },
  {
    term: "match statements",
    url: `${T.control}#match-statements`,
    description: "Python's structural pattern matching (3.10+): compares a value's shape and content against a series of patterns, closer to destructuring than a C-style switch.",
    source: "tutorial",
  },
  {
    term: "default argument values",
    url: `${T.control}#default-argument-values`,
    description: "Lets a parameter fall back to a value when the caller doesn't supply one — the mechanism behind the mutable-default-argument bug pattern.",
    source: "tutorial",
    fromConcepts: ["mutable default arguments"],
  },
  {
    term: "keyword arguments",
    url: `${T.control}#keyword-arguments`,
    description: "Calling a function with name=value instead of relying on argument position, e.g. greet(name=\"Ana\").",
    source: "tutorial",
  },
  {
    term: "special parameters",
    url: `${T.control}#special-parameters`,
    description: "How a function signature controls whether each parameter can be passed positionally, by keyword, or either — using / and * as separators.",
    source: "tutorial",
  },
  {
    term: "positional-only parameters",
    url: `${T.control}#positional-only-parameters`,
    description: "Parameters that must be passed by position, marked by a / in the function signature — the caller can't name them.",
    source: "tutorial",
  },
  {
    term: "keyword-only arguments",
    url: `${T.control}#keyword-only-arguments`,
    description: "Parameters that must be passed by name, marked by a * in the function signature — the caller can't rely on position.",
    source: "tutorial",
  },
  {
    term: "arbitrary argument lists",
    url: `${T.control}#arbitrary-argument-lists`,
    description: "*args and **kwargs: collect any number of extra positional or keyword arguments into a tuple or dict.",
    source: "tutorial",
  },
  {
    term: "unpacking argument lists",
    url: `${T.control}#unpacking-argument-lists`,
    description: "The reverse of *args/**kwargs: spreading a list or dict you already have across a function call with * or **.",
    source: "tutorial",
  },
  {
    term: "lambda expressions",
    url: `${T.control}#lambda-expressions`,
    description: "A small, unnamed function defined inline as an expression — lambda x: x * 2 — limited to a single expression, no statements.",
    source: "tutorial",
  },
  {
    term: "documentation strings",
    url: `${T.control}#documentation-strings`,
    description: "A string literal as the first line of a function, class, or module body, retrievable at runtime via .__doc__ — Python's built-in docstring convention.",
    source: "tutorial",
  },
  {
    term: "function annotations",
    url: `${T.control}#function-annotations`,
    description: "Optional type hints attached to a function's parameters and return value, stored in .__annotations__ and read by tools like mypy — Python itself doesn't enforce them.",
    source: "tutorial",
  },

  // ── Tutorial: 5. Data Structures ─────────────────────────────────────────
  {
    term: "using lists as stacks",
    url: `${T.data}#using-lists-as-stacks`,
    description: "append() and pop() turn a list into a last-in-first-out stack with no extra data type needed.",
    source: "tutorial",
  },
  {
    term: "using lists as queues",
    url: `${T.data}#using-lists-as-queues`,
    description: "Lists are slow as first-in-first-out queues (popping from the front shifts everything); collections.deque is the real tool for that.",
    source: "tutorial",
  },
  {
    term: "nested list comprehensions",
    url: `${T.data}#nested-list-comprehensions`,
    description: "A comprehension whose expression is itself a comprehension — commonly used to transpose or flatten a matrix in one line.",
    source: "tutorial",
  },
  {
    term: "the del statement",
    url: `${T.data}#the-del-statement`,
    description: "Removes an item by index or slice from a list, or deletes a variable entirely — different from .remove(), which deletes by value.",
    source: "tutorial",
  },
  {
    term: "tuples and sequences",
    url: `${T.data}#tuples-and-sequences`,
    description: "Tuples are immutable, ordered sequences — often used for a fixed group of values (like a coordinate pair) rather than a growing collection.",
    source: "tutorial",
  },
  {
    term: "sets",
    url: `${T.data}#sets`,
    description: "An unordered collection with no duplicate elements, built for fast membership tests and mathematical set operations (union, intersection, difference).",
    source: "tutorial",
  },
  {
    term: "looping techniques",
    url: `${T.data}#looping-techniques`,
    description: "The idiomatic ways to loop in Python — enumerate() for index+value, zip() for parallel sequences, sorted() for order, .items() for dicts.",
    source: "tutorial",
  },
  {
    term: "comparing sequences and other types",
    url: `${T.data}#comparing-sequences-and-other-types`,
    description: "Sequences compare element by element (lexicographically) — [1, 2] < [1, 3] the same way strings compare alphabetically.",
    source: "tutorial",
  },

  // ── Tutorial: 7. Input and Output ────────────────────────────────────────
  {
    term: "formatted string literals",
    url: `${T.io}#formatted-string-literals`,
    description: "f-strings: an f before the opening quote lets you embed any Python expression directly inside {}, e.g. f\"{name} has {n} points\".",
    source: "tutorial",
  },
  {
    term: "the string format() method",
    url: `${T.io}#the-string-format-method`,
    description: "The pre-f-string way to build text from a template — \"{} scored {}\".format(name, n) — still common in older code and in string templates built at runtime.",
    source: "tutorial",
    fromConcepts: ["format"],
  },
  {
    term: "reading and writing files",
    url: `${T.io}#reading-and-writing-files`,
    description: "open() returns a file object; the with statement (a context manager) is the standard way to make sure it gets closed even if an error happens.",
    source: "tutorial",
  },

  // ── Tutorial: 8. Errors and Exceptions ───────────────────────────────────
  {
    term: "syntax errors",
    url: `${T.errors}#syntax-errors`,
    description: "Code the parser can't even read — caught before your program runs at all, unlike an exception raised during execution.",
    source: "tutorial",
  },
  {
    term: "exceptions",
    url: `${T.errors}#exceptions`,
    description: "Errors detected during execution — even syntactically valid code can raise one, like dividing by zero or indexing past the end of a list.",
    source: "tutorial",
  },
  {
    term: "handling exceptions",
    url: `${T.errors}#handling-exceptions`,
    description: "try/except: run code that might fail, and specify exactly which exception types you're prepared to recover from.",
    source: "tutorial",
    fromConcepts: ["try/except"],
  },
  {
    term: "raising exceptions",
    url: `${T.errors}#raising-exceptions`,
    description: "The raise statement lets your own code signal an error condition explicitly, with any exception type and message.",
    source: "tutorial",
    fromConcepts: ["raise"],
  },
  {
    term: "exception chaining",
    url: `${T.errors}#exception-chaining`,
    description: "raise NewError(...) from original_error preserves the original exception as the cause, so the traceback shows both instead of losing the real root cause.",
    source: "tutorial",
    fromConcepts: ["raise from", "chaining exceptions"],
  },
  {
    term: "user-defined exceptions",
    url: `${T.errors}#user-defined-exceptions`,
    description: "Subclassing Exception (or a more specific built-in) to create an error type that names your own failure condition.",
    source: "tutorial",
    fromConcepts: ["custom exceptions"],
  },
  {
    term: "defining clean-up actions",
    url: `${T.errors}#defining-clean-up-actions`,
    description: "The finally clause runs no matter what — exception or not, even after a return — making it the right place for cleanup that must always happen.",
    source: "tutorial",
    fromConcepts: ["finally"],
  },

  // ── Tutorial: 9. Classes ─────────────────────────────────────────────────
  {
    term: "python scopes and namespaces",
    url: `${T.classes}#python-scopes-and-namespaces`,
    description: "Where a name is looked up: local, then enclosing function, then global, then built-in (LEGB) — the rule behind why a variable is or isn't visible somewhere.",
    source: "tutorial",
  },
  {
    term: "class objects",
    url: `${T.classes}#class-objects`,
    description: "A class itself is an object in Python — you can call it to create instances, and also read/set attributes on the class directly.",
    source: "tutorial",
  },
  {
    term: "instance objects",
    url: `${T.classes}#instance-objects`,
    description: "The concrete object created by calling a class — the only kind of attribute access it supports directly is its own data attributes and methods.",
    source: "tutorial",
  },
  {
    term: "method objects",
    url: `${T.classes}#method-objects`,
    description: "Accessing obj.method doesn't call it — it creates a bound method object, which is why you can store it in a variable and call it later.",
    source: "tutorial",
  },
  {
    term: "class and instance variables",
    url: `${T.classes}#class-and-instance-variables`,
    description: "A class variable is shared by every instance; an instance variable (set via self) belongs to just one object — mixing them up is a classic bug source.",
    source: "tutorial",
  },
  {
    term: "inheritance",
    url: `${T.classes}#inheritance`,
    description: "A class can derive from another, reusing and optionally overriding its methods and attributes — Python's syntax is class Child(Parent):.",
    source: "tutorial",
    fromConcepts: ["inheritance", "inheritance vs composition"],
  },
  {
    term: "multiple inheritance",
    url: `${T.classes}#multiple-inheritance`,
    description: "A class can derive from more than one base class at once; Python resolves name conflicts with a well-defined method resolution order (MRO).",
    source: "tutorial",
  },
  {
    term: "private variables",
    url: `${T.classes}#private-variables`,
    description: "Python has no true access control — a leading double underscore (like __secret) just triggers name mangling, a naming convention rather than real enforcement.",
    source: "tutorial",
  },
  {
    term: "iterators",
    url: `${T.classes}#iterators`,
    description: "Any object with a __next__ method (and __iter__ returning itself) — what a for loop actually asks for under the hood.",
    source: "tutorial",
  },
  {
    term: "generator expressions",
    url: `${T.classes}#generator-expressions`,
    description: "The generator equivalent of a list comprehension — (x*x for x in xs) — produces values lazily instead of building a list.",
    source: "tutorial",
    fromConcepts: ["generators"],
  },
];

export const PYTHON_GLOSSARY_HOME = "https://docs.python.org/3/glossary.html";
