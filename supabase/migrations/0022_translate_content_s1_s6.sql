-- English migration, step 5 (final): S1-S6 exercises + lessons content + lesson titles. Idempotent.

update exercises set content = '{"prompt": "Two versions of the same calculation. What does this print? Then ask yourself which one you''d understand in six months.", "code": "def f(l, t):\n    r = 0\n    for x in l:\n        if x > t:\n            r += x\n    return r\n\ndef sum_greater_than(values, threshold):\n    return sum(v for v in values if v > threshold)\n\nprint(f([1, 5, 10], 4), sum_greater_than([1, 5, 10], 4))", "expected_output": "15 15", "explanation": "They do the same thing. The second one reads like a sentence: names that say what they are, no intermediate state, no comments needed. Readability doesn''t change the result, it changes the cost of maintaining it.", "meta": {"difficulty": 1, "interview": false, "concepts": ["names", "readability"]}}'::jsonb where id = 's1-e1';
update exercises set content = '{"prompt": "This code works and passes the tests. The ''bug'' is readability: cryptic names, a magic number, and a double-negated condition. Refactor without changing behavior: the function must be called `apply_discount`, take `price` and `is_member`, and use a constant `MEMBER_DISCOUNT = 0.1`.", "starter_code": "def ad(p, s):\n    if not (not s):\n        return p - p * 0.1\n    return p\n\ndef apply_discount(price, is_member):\n    return ad(price, is_member)", "tests": [{"call": "apply_discount(100, True)", "expected": "90.0"}, {"call": "apply_discount(100, False)", "expected": "100"}, {"call": "MEMBER_DISCOUNT", "expected": "0.1"}, {"call": "''ad'' in globals()", "expected": "False"}], "hints": ["Remove the intermediate function: one function with names that explain the intent.", "Replace 0.1 with a named, uppercase, module-level constant.", "if is_member: return price * (1 - MEMBER_DISCOUNT)"], "solution": "MEMBER_DISCOUNT = 0.1\n\ndef apply_discount(price, is_member):\n    if is_member:\n        return price - price * MEMBER_DISCOUNT\n    return price", "meta": {"difficulty": 2, "interview": true, "concepts": ["refactoring", "magic numbers", "names"]}}'::jsonb where id = 's1-e2';
update exercises set content = '{"prompt": "Match each code ''smell'' with the Clean Code principle that fixes it.", "pairs": [{"term": "An 80-line function that validates, calculates, and saves", "definition": "A function does one thing (single level of abstraction)"}, {"term": "if x == 7 with no explanation", "definition": "Magic numbers: replace with named constants"}, {"term": "# increments i by 1 above i += 1", "definition": "The comment adds nothing: the code already says it; comment the why, not the what"}, {"term": "The same block copied in three places", "definition": "DRY: extract to a function"}, {"term": "A function with 7 parameters", "definition": "Group into an object or dataclass; too many parameters hide an abstraction"}], "meta": {"difficulty": 2, "interview": true, "concepts": ["code smells"]}}'::jsonb where id = 's1-e3';
update exercises set content = '{"isCode": false, "prompt": "Interview: when do you actually write a comment in code? Give two legitimate cases and one where the comment signals a design problem.", "modelAnswer": "Legitimate: explaining a non-obvious why (a business decision, a workaround for a library bug) and warning of consequences (performance, call order). Sign of a problem: a comment that explains what a block of code does; that''s asking for the block to be extracted into a function with that name.", "meta": {"difficulty": 2, "interview": true, "concepts": ["comments"]}}'::jsonb where id = 's1-e4';
update exercises set content = '{"isCode": true, "prompt": "From memory, write a function `is_adult(birth_year, current_year)` with clear names and no magic numbers, using a constant `LEGAL_ADULT_AGE = 18`. Just the structure, no date libraries: assume you receive years as integers.", "modelAnswer": "LEGAL_ADULT_AGE = 18\n\ndef is_adult(birth_year, current_year):\n    age = current_year - birth_year\n    return age >= LEGAL_ADULT_AGE", "meta": {"difficulty": 1, "interview": false, "concepts": ["constants", "names"]}}'::jsonb where id = 's1-e5';
update exercises set content = '{"prompt": "What does the boy scout rule say, applied to code?", "answer": "Leave the code a little better than you found it: a better name, an extracted function, a stale comment removed.", "explanation": "Incremental improvement on every PR instead of big refactors that never happen.", "meta": {"difficulty": 1, "interview": false, "concepts": ["boy scout rule"]}}'::jsonb where id = 's1-e6';
update exercises set content = '{"prompt": "What''s an ''intention-revealing'' name?", "answer": "One that answers what it is, why it exists, and how it''s used without needing a comment: days_since_last_payment instead of d.", "explanation": "The cost of reading a long name is lower than the cost of decoding a short one.", "meta": {"difficulty": 1, "interview": false, "concepts": ["names"]}}'::jsonb where id = 's1-e7';
update exercises set content = '{"prompt": "What''s DRY, and what''s its trap?", "answer": "Don''t Repeat Yourself: each piece of knowledge in one place. Trap: unifying code that only looks similar by coincidence creates coupling; duplicating twice is acceptable, abstract on the third time.", "explanation": "Duplication of knowledge is the problem, not duplication of lines.", "meta": {"difficulty": 2, "interview": true, "concepts": ["DRY"]}}'::jsonb where id = 's1-e8';
update exercises set content = '{"isCode": false, "prompt": "Warm-up (M3): what''s the difference between inheritance and composition? Give one example of each in a sentence.", "modelAnswer": "Inheritance: ''is-a'' (Cat is an Animal, inherits behavior). Composition: ''has-a'' (Car has an Engine, delegates to it). Composition couples less and can be changed at runtime.", "meta": {"difficulty": 1, "interview": true, "concepts": ["inheritance vs composition"], "recuerda_de": "m3-oop"}}'::jsonb where id = 's2-e1';
update exercises set content = '{"prompt": "Match each SOLID principle with its practical formulation.", "pairs": [{"term": "S - Single responsibility", "definition": "A class has only one reason to change"}, {"term": "O - Open/closed", "definition": "Add new behavior without modifying existing code (extend, don''t edit)"}, {"term": "L - Liskov substitution", "definition": "Any subclass can be used wherever the base class is expected without breaking anything"}, {"term": "I - Interface segregation", "definition": "Several small interfaces are better than one big one that forces you to implement what you don''t use"}, {"term": "D - Dependency inversion", "definition": "Depend on abstractions (protocols), not on concrete implementations"}], "meta": {"difficulty": 2, "interview": true, "concepts": ["SOLID"]}}'::jsonb where id = 's2-e2';
update exercises set content = '{"prompt": "A Liskov violation. What does this print? Think about why the second case ''surprises'' whoever uses the base class.", "code": "class Rectangle:\n    def __init__(self, width, height):\n        self.width, self.height = width, height\n    def set_width(self, w):\n        self.width = w\n    def area(self):\n        return self.width * self.height\n\nclass Square(Rectangle):\n    def set_width(self, w):\n        self.width = self.height = w\n\ndef double_width(r):\n    r.set_width(r.width * 2)\n    return r.area()\n\nprint(double_width(Rectangle(2, 3)))\nprint(double_width(Square(2, 2)))", "expected_output": "12\n16", "explanation": "Whoever wrote double_width expects that changing the width doesn''t touch the height: with Rectangle(2,3) they get 4*3=12. Square breaks that expectation (4*4=16). Square ''is a'' rectangle in mathematics but not as a substitutable subtype.", "meta": {"difficulty": 3, "interview": true, "concepts": ["Liskov"]}}'::jsonb where id = 's2-e3';
update exercises set content = '{"prompt": "Dependency inversion. `Notifier` is coupled to `RealEmail`. Refactor it to receive in its constructor any object with a `send(recipient, text)` method, and return whatever that method returns. That way it can be tested with a double. Don''t touch the marked block.", "starter_code": "# --- do not touch ---\nclass RealEmail:\n    def send(self, recipient, text):\n        return f''email to {recipient}''\n\nclass Fake:\n    def __init__(self):\n        self.sent = []\n    def send(self, recipient, text):\n        self.sent.append((recipient, text))\n        return ''fake''\n# --- end ---\n\nclass Notifier:\n    def __init__(self):\n        self.channel = RealEmail()\n\n    def notify(self, user, text):\n        return self.channel.send(user, text)", "tests": [{"call": "Notifier(RealEmail()).notify(''ana'', ''hi'')", "expected": "''email to ana''"}, {"call": "f = Fake(); n = Notifier(f); n.notify(''bob'', ''hey''); f.sent", "expected": "[(''bob'', ''hey'')]"}], "hints": ["The constructor should receive the channel as a parameter instead of creating it inside.", "In Python you don''t need a formal interface: it''s enough for the object to have the method (duck typing).", "def __init__(self, channel): self.channel = channel"], "solution": "# --- do not touch ---\nclass RealEmail:\n    def send(self, recipient, text):\n        return f''email to {recipient}''\n\nclass Fake:\n    def __init__(self):\n        self.sent = []\n    def send(self, recipient, text):\n        self.sent.append((recipient, text))\n        return ''fake''\n# --- end ---\n\nclass Notifier:\n    def __init__(self, channel):\n        self.channel = channel\n\n    def notify(self, user, text):\n        return self.channel.send(user, text)", "meta": {"difficulty": 2, "interview": true, "concepts": ["dependency inversion", "injection"]}}'::jsonb where id = 's2-e4';
update exercises set content = '{"isCode": false, "prompt": "Interview: this class loads a CSV, calculates statistics, and generates a PDF report. Which principle does it violate, and how many classes would you split it into? Name them.", "modelAnswer": "It violates single responsibility: it has three reasons to change (input format, calculation logic, output format). I''d split it into three: CsvReader (or a load function), StatsCalculator (pure logic, testable without files), and PdfGenerator. A small orchestrator connects them.", "meta": {"difficulty": 2, "interview": true, "concepts": ["SRP"]}}'::jsonb where id = 's2-e5';
update exercises set content = '{"prompt": "How do you express an ''interface'' in modern Python without inheritance?", "answer": "With typing.Protocol: you define the expected methods and any class that has them satisfies it, without inheriting (structural subtyping).", "explanation": "It''s duck typing with optional static checking from mypy.", "meta": {"difficulty": 2, "interview": true, "concepts": ["Protocol"]}}'::jsonb where id = 's2-e6';
update exercises set content = '{"prompt": "What''s the clearest sign that you''re violating Open/Closed?", "answer": "Every new variant forces you to add another elif to the same function (if kind == ''pdf'' ... elif kind == ''csv'' ...).", "explanation": "The fix is usually polymorphism: one object per variant with the same method, or a dict of strategies.", "meta": {"difficulty": 2, "interview": false, "concepts": ["OCP"]}}'::jsonb where id = 's2-e7';
update exercises set content = '{"prompt": "Why does dependency injection make testing easier?", "answer": "Because you can pass a double (fake, stub, mock) instead of the real implementation: no network, no database, fast and deterministic tests.", "explanation": "It''s the same principle you used when passing the channel to Notifier.", "meta": {"difficulty": 1, "interview": true, "concepts": ["DI and testing"]}}'::jsonb where id = 's2-e8';
update exercises set content = '{"isCode": false, "prompt": "Warm-up (M4): what''s the difference between a failure and an error in a unittest test?", "modelAnswer": "Failure: the test ran and an assertion wasn''t met (the code does something other than expected). Error: the test couldn''t complete because an unexpected exception was raised (a bug or a badly written test).", "meta": {"difficulty": 1, "interview": false, "concepts": ["failure vs error"], "recuerda_de": "m4-testing-errors"}}'::jsonb where id = 's3-e1';
update exercises set content = '{"prompt": "Match each level of the testing pyramid with what it verifies and how many there should be.", "pairs": [{"term": "Unit", "definition": "An isolated function or class, with doubles for everything external; many and fast (ms)"}, {"term": "Integration", "definition": "Several pieces together (code + real DB, code + API); fewer, slower"}, {"term": "End-to-end", "definition": "The whole system as a user uses it; very few, slow and fragile"}, {"term": "Contract", "definition": "That the shape of a response (JSON schema) doesn''t change without warning consumers"}, {"term": "LLM evaluation", "definition": "Statistical metrics over a fixed dataset; not pass/fail, but better/worse"}], "meta": {"difficulty": 2, "interview": true, "concepts": ["testing pyramid"]}}'::jsonb where id = 's3-e2';
update exercises set content = '{"prompt": "Test doubles: match each type with its definition.", "pairs": [{"term": "Stub", "definition": "Returns fixed responses; doesn''t care how it''s called"}, {"term": "Mock", "definition": "Also records the calls so you can assert it was called with certain arguments"}, {"term": "Fake", "definition": "A simplified but functional implementation (an in-memory database)"}, {"term": "Spy", "definition": "Wraps the real object and records what happens without changing its behavior"}], "meta": {"difficulty": 2, "interview": true, "concepts": ["test doubles"]}}'::jsonb where id = 's3-e3';
update exercises set content = '{"prompt": "Write a fake for testing without network: `class FakeLLMClient` (don''t touch the marked block) with `__init__(self, responses)` (a list) and `complete(self, prompt)` that returns the responses in order and records each prompt in `self.prompts`. Once the responses run out, raise RuntimeError(''no responses left'').", "starter_code": "# --- do not touch ---\ndef capture(fn):\n    try:\n        fn()\n        return None\n    except Exception as e:\n        return str(e)\n# --- end ---\n\nclass FakeLLMClient:\n    pass", "tests": [{"call": "c = FakeLLMClient([''a'', ''b'']); c.complete(''p1''); c.complete(''p2'')", "expected": "''b''"}, {"call": "c = FakeLLMClient([''a'']); c.complete(''p1''); c.prompts", "expected": "[''p1'']"}, {"call": "c = FakeLLMClient([]); capture(lambda: c.complete(''x''))", "expected": "''no responses left''"}], "hints": ["Keep a copy of the list and an index, or use pop(0).", "Record the prompt before checking whether any responses are left.", "if not self.responses: raise RuntimeError(''no responses left'')"], "solution": "# --- do not touch ---\ndef capture(fn):\n    try:\n        fn()\n        return None\n    except Exception as e:\n        return str(e)\n# --- end ---\n\nclass FakeLLMClient:\n    def __init__(self, responses):\n        self.responses = list(responses)\n        self.prompts = []\n\n    def complete(self, prompt):\n        self.prompts.append(prompt)\n        if not self.responses:\n            raise RuntimeError(''no responses left'')\n        return self.responses.pop(0)", "meta": {"difficulty": 2, "interview": true, "concepts": ["fake", "testing LLM-backed code"]}}'::jsonb where id = 's3-e4';
update exercises set content = '{"isCode": false, "prompt": "Interview: how do you test a RAG pipeline without calling the LLM API on every test? Describe what gets tested with doubles and what needs the real model.", "modelAnswer": "With doubles: chunking, retrieval (a small in-memory index with fixed embeddings), prompt construction, response parsing, agent logic (with a fake LLM client that returns scripted responses). With the real model: only the end-to-end evaluation against the fixed dataset (RAGAS), which runs separately, less often, with results compared across versions rather than pass/fail.", "meta": {"difficulty": 3, "interview": true, "concepts": ["testing RAG"]}}'::jsonb where id = 's3-e5';
update exercises set content = '{"prompt": "What''s a flaky test, and what''s its most common cause?", "answer": "One that sometimes passes and sometimes fails without any code change. Typical causes: dependence on time, execution order, the network, or shared state between tests.", "explanation": "A flaky test is worse than none: it ends up being ignored and hides real failures.", "meta": {"difficulty": 1, "interview": true, "concepts": ["flaky"]}}'::jsonb where id = 's3-e6';
update exercises set content = '{"prompt": "What does code coverage measure, and what does it NOT guarantee?", "answer": "What percentage of lines ran during the tests. It doesn''t guarantee the assertions are any good: you can have 100% coverage without checking anything.", "explanation": "Low coverage is a warning sign; high coverage isn''t proof of quality.", "meta": {"difficulty": 1, "interview": true, "concepts": ["coverage"]}}'::jsonb where id = 's3-e7';
update exercises set content = '{"prompt": "What''s TDD in three steps?", "answer": "Red: write a test that fails. Green: the minimum code to make it pass. Refactor: clean up while staying green.", "explanation": "The cycle forces you to design the interface before the implementation.", "meta": {"difficulty": 1, "interview": false, "concepts": ["TDD"]}}'::jsonb where id = 's3-e8';
update exercises set content = '{"prompt": "Strategy in idiomatic Python: no class hierarchy, the strategies are functions in a dict. Order the lines.", "lines": ["def by_price(items):", "    return sorted(items, key=lambda i: i[''price''])", "", "def by_name(items):", "    return sorted(items, key=lambda i: i[''name''])", "", "STRATEGIES = {''price'': by_price, ''name'': by_name}", "", "def sort_items(items, criterion):", "    return STRATEGIES[criterion](items)"], "meta": {"difficulty": 2, "interview": true, "concepts": ["Strategy", "functions as objects"]}}'::jsonb where id = 's4-e1';
update exercises set content = '{"prompt": "Factory: write `create_retriever(kind, **kwargs)` that returns an instance of `Lexical` or `Vector` based on kind (''lexical''/''vector''), passing kwargs to the constructor, and raises ValueError(f''unknown kind: {kind}'') otherwise. Use a dict of classes, not a chain of ifs. Don''t touch the marked block.", "starter_code": "# --- do not touch ---\nclass Lexical:\n    def __init__(self, k=5):\n        self.k = k\n\nclass Vector:\n    def __init__(self, k=5, model=''mini''):\n        self.k, self.model = k, model\n\ndef capture(fn):\n    try:\n        fn()\n        return None\n    except Exception as e:\n        return str(e)\n# --- end ---\n\ndef create_retriever(kind, **kwargs):\n    pass", "tests": [{"call": "r = create_retriever(''vector'', k=3, model=''large''); (type(r).__name__, r.k, r.model)", "expected": "(''Vector'', 3, ''large'')"}, {"call": "type(create_retriever(''lexical'')).__name__", "expected": "''Lexical''"}, {"call": "capture(lambda: create_retriever(''graph''))", "expected": "''unknown kind: graph''"}], "hints": ["Classes are objects: you can store them in a dict {''lexical'': Lexical, ...}.", "Look it up with .get and check for None to raise the error.", "return cls(**kwargs)"], "solution": "# --- do not touch ---\nclass Lexical:\n    def __init__(self, k=5):\n        self.k = k\n\nclass Vector:\n    def __init__(self, k=5, model=''mini''):\n        self.k, self.model = k, model\n\ndef capture(fn):\n    try:\n        fn()\n        return None\n    except Exception as e:\n        return str(e)\n# --- end ---\n\nKINDS = {''lexical'': Lexical, ''vector'': Vector}\n\ndef create_retriever(kind, **kwargs):\n    cls = KINDS.get(kind)\n    if cls is None:\n        raise ValueError(f''unknown kind: {kind}'')\n    return cls(**kwargs)", "meta": {"difficulty": 2, "interview": true, "concepts": ["Factory"]}}'::jsonb where id = 's4-e2';
update exercises set content = '{"prompt": "Decorator (the pattern, implemented with Python''s decorator). What does this print?", "code": "def with_cache(fn):\n    cache = {}\n    def wrapped(x):\n        if x not in cache:\n            print(''computing'', x)\n            cache[x] = fn(x)\n        return cache[x]\n    return wrapped\n\n@with_cache\ndef square(x):\n    return x * x\n\nprint(square(3))\nprint(square(3))\nprint(square(4))", "expected_output": "computing 3\n9\n9\ncomputing 4\n16", "explanation": "The decorator wraps the function and adds behavior (caching) without touching it. The second call with 3 doesn''t print ''computing'' because it''s already cached. functools.lru_cache does exactly this.", "meta": {"difficulty": 2, "interview": true, "concepts": ["Decorator", "cache"]}}'::jsonb where id = 's4-e3';
update exercises set content = '{"prompt": "Match each pattern with the problem it solves in an AI system.", "pairs": [{"term": "Strategy", "definition": "Swap the chunking or retrieval algorithm without touching the pipeline"}, {"term": "Factory", "definition": "Create the right LLM client (OpenAI, Gemini, local) from the configuration"}, {"term": "Adapter", "definition": "Give two LLM APIs with different signatures a common interface"}, {"term": "Decorator", "definition": "Add retries, caching, or logging to a call without modifying it"}, {"term": "Observer", "definition": "Notify several components (metrics, logs, UI) every time the agent takes a step"}], "meta": {"difficulty": 2, "interview": true, "concepts": ["patterns in AI"]}}'::jsonb where id = 's4-e4';
update exercises set content = '{"isCode": false, "prompt": "Interview: in Python, many classic patterns (Strategy, Command, Singleton) are ''simpler'' than in Java. Why? Give two reasons with an example.", "modelAnswer": "1) Functions are first-class objects: a Strategy is a function in a dict, with no interface or per-variant class. 2) Duck typing removes formal interfaces: an Adapter is any object with the expected method. Also, modules are already natural singletons, and the language''s decorators implement the Decorator pattern directly.", "meta": {"difficulty": 3, "interview": true, "concepts": ["idiomatic patterns"]}}'::jsonb where id = 's4-e5';
update exercises set content = '{"prompt": "What''s the Adapter pattern?", "answer": "A class that translates an existing object''s interface into the one your code expects, so you don''t couple to the external API.", "explanation": "It''s what you do when you wrap each LLM provider''s SDK behind a common complete(prompt) method.", "meta": {"difficulty": 1, "interview": true, "concepts": ["Adapter"]}}'::jsonb where id = 's4-e6';
update exercises set content = '{"prompt": "Why is Singleton considered an anti-pattern in many cases?", "answer": "It introduces hidden global state, makes tests harder (you can''t substitute it), and couples everything that uses it.", "explanation": "In Python, a module-level instance injected as a dependency gives you the same thing without the downsides.", "meta": {"difficulty": 2, "interview": true, "concepts": ["Singleton"]}}'::jsonb where id = 's4-e7';
update exercises set content = '{"prompt": "Which pattern does functools.lru_cache implement?", "answer": "Decorator: it wraps the function, adding memoization without changing its code.", "explanation": "A Python decorator is the Decorator pattern with language syntax.", "meta": {"difficulty": 1, "interview": false, "concepts": ["lru_cache"]}}'::jsonb where id = 's4-e8';
update exercises set content = '{"prompt": "PyQuest''s architecture: match each component with its responsibility.", "pairs": [{"term": "Next.js on Vercel", "definition": "Interface, routes, and rendering; talks to Supabase directly for progress"}, {"term": "Supabase (Postgres + Auth + RLS)", "definition": "Data, identity, and the rule that every user only sees their own rows"}, {"term": "FastAPI on Render", "definition": "Only the tutor: calls the LLM with per-user rate limiting, verifying the JWT"}, {"term": "Pyodide", "definition": "Runs the student''s code in the browser, with no server-side sandbox"}, {"term": "Supabase Auth''s JWT", "definition": "The single credential that both Supabase (RLS) and FastAPI verify"}], "meta": {"difficulty": 2, "interview": true, "concepts": ["PyQuest architecture"]}}'::jsonb where id = 's5-e1';
update exercises set content = '{"isCode": false, "prompt": "Design decision: in PyQuest the client writes its progress directly to Supabase, protected by RLS, without going through FastAPI. What does it gain, and what risk does it take on? When would this stop being a good idea?", "modelAnswer": "Gains: less latency, less code, no Render cold starts on every action, and authorization lives in the database. Risk: any business rule (e.g. ''you can''t mark something completed without attempts'') has to be expressed in SQL/RLS or triggers, or a modified client could bypass it. It would stop being a good idea if progress affected something with real external value (a public leaderboard, certificates): then validation would move to the backend.", "meta": {"difficulty": 3, "interview": true, "concepts": ["RLS", "trusting the client"]}}'::jsonb where id = 's5-e2';
update exercises set content = '{"isCode": false, "prompt": "Design decision: a node''s ''available'' status is calculated on every load from the attempts, never stored. Explain the failure this avoids and the cost it has.", "modelAnswer": "It avoids stale derived state: if it were stored, adding exercises to an already-completed node or changing prerequisites would leave inconsistent data that would need migrating. By deriving it from the source of truth (the attempts), adding content never corrupts progress. Cost: computation on every load; irrelevant with 15 nodes, and if it grew it would be cached, not persisted.", "meta": {"difficulty": 3, "interview": true, "concepts": ["derived state", "source of truth"]}}'::jsonb where id = 's5-e3';
update exercises set content = '{"isCode": false, "prompt": "Design decision: exercise_attempts is an event log (append-only, never edited), not a table of ''current exercise state.'' What does that design let you do that the other one doesn''t?", "modelAnswer": "Reconstruct any view after the fact: ''review your mistakes,'' per-concept statistics, streaks, or a new metric that didn''t exist when the data was stored. With current state you only have the latest snapshot and lose the history. It''s event sourcing on a small scale.", "meta": {"difficulty": 2, "interview": true, "concepts": ["event log", "event sourcing"]}}'::jsonb where id = 's5-e4';
update exercises set content = '{"prompt": "Calculating a node''s status (simplified). What does this print?", "code": "prereqs = {''m1'': [], ''m2'': [''m1''], ''m3'': [''m2''], ''s1'': [''m1'']}\ncompleted = {''m1''}\n\ndef status(n):\n    if n in completed:\n        return ''completed''\n    if all(p in completed for p in prereqs[n]):\n        return ''available''\n    return ''locked''\n\nfor n in [''m1'', ''m2'', ''m3'', ''s1'']:\n    print(n, status(n))", "expected_output": "m1 completed\nm2 available\nm3 locked\ns1 available", "explanation": "m2 and s1 only depend on m1, which is completed, so they''re available. m3 depends on m2, not yet completed: locked. all([]) is True, which is why m1 with no prerequisites is always at least available.", "meta": {"difficulty": 1, "interview": false, "concepts": ["derived state", "prerequisites"]}}'::jsonb where id = 's5-e5';
update exercises set content = '{"prompt": "What''s a modular monolith, and why is it usually a better starting point than microservices?", "answer": "A single deployable application with well-separated modules inside it. It avoids the operational complexity of the network, multiple deployments, and distributed data until there''s a real reason (teams, scale) to split it up.", "explanation": "PyQuest is two services only because Pyodide+Next and the Python tutor have different requirements, not out of fashion.", "meta": {"difficulty": 2, "interview": true, "concepts": ["modular monolith"]}}'::jsonb where id = 's5-e6';
update exercises set content = '{"prompt": "What are the 12 factors (12-factor app) in one sentence?", "answer": "A set of practices for cloud-deployable apps: configuration in environment variables, declared dependencies, stateless processes, logs as streams, dev/prod parity.", "explanation": "Vercel and Render assume these practices; that''s why PyQuest''s config lives in environment variables.", "meta": {"difficulty": 1, "interview": false, "concepts": ["12-factor"]}}'::jsonb where id = 's5-e7';
update exercises set content = '{"prompt": "What''s an ADR (Architecture Decision Record)?", "answer": "A short document per decision: context, options considered, decision, and consequences. Stored in the repo.", "explanation": "PyQuest''s status.md already has implicit ADRs (''design rules, do not relitigate''); formalizing them is cheap and pays off a lot in interviews.", "meta": {"difficulty": 1, "interview": true, "concepts": ["ADR"]}}'::jsonb where id = 's5-e8';
update exercises set content = '{"lang": "dockerfile", "prompt": "Order the lines of this Dockerfile for a FastAPI API. Hint: the order affects layer caching, so dependencies go before the code.", "lines": ["FROM python:3.12-slim", "WORKDIR /app", "COPY requirements.txt .", "RUN pip install --no-cache-dir -r requirements.txt", "COPY . .", "EXPOSE 8000", "CMD [\"uvicorn\", \"main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]"], "meta": {"difficulty": 2, "interview": true, "concepts": ["Dockerfile", "layer cache"]}}'::jsonb where id = 's6-e1';
update exercises set content = '{"prompt": "A simulation of Docker''s layer cache. What does this print? Each layer rebuilds if its own content changes or if any earlier layer changed.", "code": "layers = [''FROM'', ''COPY requirements'', ''RUN pip install'', ''COPY code'']\nchanged = {''COPY code''}\n\ninvalidated = False\nfor layer in layers:\n    if layer in changed:\n        invalidated = True\n    print(layer, ''cache'' if not invalidated else ''rebuild'')", "expected_output": "FROM cache\nCOPY requirements cache\nRUN pip install cache\nCOPY code rebuild", "explanation": "Only the code changed, and it''s in the last layer: pip install gets reused from cache. If COPY of the code were before requirements, every one-line code change would reinstall all the dependencies.", "meta": {"difficulty": 2, "interview": true, "concepts": ["layer cache"]}}'::jsonb where id = 's6-e2';
update exercises set content = '{"prompt": "Match each Docker instruction or concept with its meaning.", "pairs": [{"term": "FROM", "definition": "The base image yours starts from"}, {"term": "COPY vs volume", "definition": "COPY puts files into the image at build time; a volume mounts them at runtime"}, {"term": "CMD vs ENTRYPOINT", "definition": "CMD is the default command (overridable); ENTRYPOINT is fixed and CMD passes it arguments"}, {"term": "EXPOSE", "definition": "Documents the port; doesn''t publish it (that''s -p at run time)"}, {"term": ".dockerignore", "definition": "Excludes files from the build context (.git, venv, .env) for smaller, safer images"}], "meta": {"difficulty": 2, "interview": true, "concepts": ["Docker instructions"]}}'::jsonb where id = 's6-e3';
update exercises set content = '{"isCode": false, "prompt": "Interview: explain the difference between an image and a container with an analogy, and what happens to data written inside a container when it''s removed.", "modelAnswer": "The image is the immutable template (like a class); the container is a running instance with its own writable layer. Data written to that layer is lost when the container is removed; to persist it you use volumes or external services (PyQuest''s database lives in Supabase, not in the container).", "meta": {"difficulty": 2, "interview": true, "concepts": ["image vs container", "persistence"]}}'::jsonb where id = 's6-e4';
update exercises set content = '{"isCode": true, "prompt": "From memory, write a minimal docker-compose with two services: `api` (build from the current directory, port 8000:8000, an LLM_API_KEY environment variable taken from the host) and `db` (postgres:16 image, with a volume for the data).", "modelAnswer": "services:\n  api:\n    build: .\n    ports:\n      - \"8000:8000\"\n    environment:\n      - LLM_API_KEY=${LLM_API_KEY}\n    depends_on:\n      - db\n  db:\n    image: postgres:16\n    volumes:\n      - pgdata:/var/lib/postgresql/data\nvolumes:\n  pgdata:", "meta": {"difficulty": 2, "interview": false, "concepts": ["docker compose"]}}'::jsonb where id = 's6-e5';
update exercises set content = '{"prompt": "Why use python:3.12-slim instead of python:3.12?", "answer": "It''s much smaller (fewer system tools), so the image builds, uploads, and starts faster and has a smaller attack surface.", "explanation": "alpine is even smaller but uses musl and causes problems with packages that have binaries (numpy).", "meta": {"difficulty": 1, "interview": false, "concepts": ["base images"]}}'::jsonb where id = 's6-e6';
update exercises set content = '{"prompt": "How do you pass secrets to a container without putting them in the image?", "answer": "With runtime environment variables (-e, env_file, or the platform''s secrets manager), never with COPY .env or hardcoding them in the Dockerfile.", "explanation": "Anything that goes into an image layer stays in its history even if you delete it afterward.", "meta": {"difficulty": 2, "interview": true, "concepts": ["secrets"]}}'::jsonb where id = 's6-e7';
update exercises set content = '{"prompt": "What''s a multi-stage build, and what''s it for?", "answer": "A Dockerfile with several FROM stages: one compiles or installs dependencies, and the final one copies only the result, leaving out compilers and caches.", "explanation": "Smaller final images, with no build tools in production.", "meta": {"difficulty": 2, "interview": true, "concepts": ["multi-stage"]}}'::jsonb where id = 's6-e8';

update lessons set title = 'Names and functions that read like sentences' where id = 's1-l1';
update lessons set title = 'Comments, duplication, and the boy scout rule' where id = 's1-l2';
update lessons set title = 'SOLID in Python: what each letter really means' where id = 's2-l1';
update lessons set title = 'Interfaces without inheritance: duck typing and Protocol' where id = 's2-l2';
update lessons set title = 'The testing pyramid and doubles' where id = 's3-l1';
update lessons set title = 'Testing LLM-backed systems without calling the LLM' where id = 's3-l2';
update lessons set title = 'Patterns in idiomatic Python: Strategy, Factory, Decorator' where id = 's4-l1';
update lessons set title = 'Patterns applied to AI systems' where id = 's4-l2';
update lessons set title = 'PyQuest as a case study: why it''s built this way' where id = 's5-l1';
update lessons set title = 'Pragmatic architecture: modular monolith, 12 factors, ADRs' where id = 's5-l2';
update lessons set title = 'Images, containers, and the Dockerfile' where id = 's6-l1';
update lessons set title = 'Layer cache, secrets, and compose' where id = 's6-l2';

update lessons set content_md = $md$**Before reading, predict:** how long does it take you to understand `def f(l, t)` versus `def sum_greater_than(values, threshold)`?

## The idea
Code is read far more often than it's written. An **intention-revealing** name answers what it is, why it exists, and how it's used, without a comment: `days_since_last_payment`, not `d`. A function does **one thing** and stays at **one level of abstraction**: if it validates, calculates, and saves, that's three functions and an orchestrator.

**Magic numbers** (`if x == 7`) get replaced with named constants (`LEGAL_ADULT_AGE = 18`). Double-negated conditions (`if not (not s)`) get straightened out.

## Example
```python
MEMBER_DISCOUNT = 0.1

def apply_discount(price, is_member):
    if is_member:
        return price * (1 - MEMBER_DISCOUNT)
    return price
```

## The typical mistake
Long functions "because it's all related." If you need a comment to separate blocks inside a function, each block wants to be a function with that name.

## What they ask in interviews
"What's clean code to you?" -- the useful answer talks about names, small functions, and the cost of maintenance, not style.
$md$ where id = 's1-l1';
update lessons set content_md = $md$**Before reading, predict:** `# increments i by 1` above `i += 1` -- does it help or get in the way?

## The idea
A comment that explains **what** the code does is a sign the code doesn't explain itself. Good comments explain the **why**: a business decision, a workaround for a library bug, a performance warning.

**DRY** (Don't Repeat Yourself) is about knowledge, not lines: each rule in one place. But unifying code that only looks similar by coincidence creates coupling. Practical rule: duplicating twice is tolerated; on the third time, extract.

**Boy scout**: leave the code a little better than you found it, on every PR. A better name, an extracted function, a stale comment removed. Big refactors never happen; small ones do.

## The typical mistake
Comments that lie: the code changed and the comment didn't. That's why fewer comments and more names.

## What they ask in interviews
"When do you write a comment?" -- for the non-obvious why. "What do you think of DRY?" -- the premature-abstraction trap shows judgment.
$md$ where id = 's1-l2';
update lessons set content_md = $md$**Before reading, predict:** a class that loads a CSV, calculates statistics, and generates a PDF -- how many reasons does it have to change?

## The idea
- **S**ingle responsibility: one class, one reason to change. The CSV+calculation+PDF one has three -> three classes.
- **O**pen/closed: add behavior without editing what exists. The sign of a violation is an `elif` that grows with every variant; the fix is polymorphism or a dict of strategies.
- **L**iskov: a subclass must be usable wherever the base is expected, **with no surprises**. `Square(Rectangle)` that changes the height when you change the width breaks whoever uses `Rectangle`.
- **I**nterface segregation: small interfaces; nobody implements what they don't use. In Python, small `Protocol`s.
- **D**ependency inversion: depend on abstractions, not implementations. In practice: **inject** dependencies through the constructor.

## Example (D)
```python
class Notifier:
    def __init__(self, channel):      # any object with .send()
        self.channel = channel
```
Now it can be tested with a fake, no network needed.

## The typical mistake
Applying SOLID as a checklist and ending up with ten classes for a 40-line script. The principles are for code that changes; a script that doesn't change doesn't need them.

## What they ask in interviews
"Explain Liskov with an example" and "what's dependency inversion and what's it for?" -- the answer that convinces connects D to testing.
$md$ where id = 's2-l1';
update lessons set content_md = $md$**Before reading, predict:** does `Fake` need to inherit from `RealEmail` to substitute for it?

## The idea
Python doesn't need formal interfaces: if an object has the `send` method, it works (**duck typing**). So mypy and the reader know what's expected, `typing.Protocol` declares the shape without forcing inheritance:

```python
from typing import Protocol

class Channel(Protocol):
    def send(self, recipient: str, text: str) -> str: ...

class Notifier:
    def __init__(self, channel: Channel): ...
```
`RealEmail`, `Fake`, or any class with that method satisfy `Channel` automatically (*structural subtyping*).

Composition over inheritance: instead of `class EmailNotifier(Notifier)`, a `Notifier` that **has** a channel. It can be swapped at runtime and doesn't create fragile hierarchies.

## The typical mistake
Abstract base classes with `raise NotImplementedError` in five methods so two implementations "share an interface." A `Protocol` with only the method that's actually used is smaller and more honest.

## What they ask in interviews
"How do you define an interface in Python?" -- `Protocol` for the shape, `ABC` when you also want to share implementation.
$md$ where id = 's2-l2';
update lessons set content_md = $md$**Before reading, predict:** how many end-to-end tests should a project with 500 tests have?

## The idea
**Unit** (many, milliseconds): an isolated function or class, everything external replaced. **Integration** (fewer, slower): several pieces together, with a real DB or API. **End-to-end** (very few, fragile): the whole system as a user uses it. The pyramid is wide at the bottom because unit tests pinpoint the failure and run on every commit.

**Doubles** replace what's external:
- **Stub**: returns fixed responses.
- **Mock**: also records the calls so you can assert against them.
- **Fake**: a simplified but functional implementation (an in-memory database).
- **Spy**: wraps the real object and observes.

## Example
```python
class FakeLLMClient:
    def __init__(self, responses): self.responses, self.prompts = list(responses), []
    def complete(self, prompt):
        self.prompts.append(prompt)
        return self.responses.pop(0)
```

## The typical mistake
**Flaky** tests: pass or fail depending on the time, the order, or the network. A flaky test is worse than none: it gets ignored and hides real failures.

## What they ask in interviews
"Difference between mock and stub?" and "what does coverage measure?" -- lines executed, not the quality of the assertions.
$md$ where id = 's3-l1';
update lessons set content_md = $md$**Before reading, predict:** which parts of a RAG pipeline are deterministic?

## The idea
Almost everything you write yourself is deterministic: chunking, prompt construction, response parsing, JSON validation, the tool dispatcher, the agent's logic. All of that gets tested with **doubles**: a small in-memory index with fixed embeddings, a fake LLM client with scripted responses (including one broken response to test the retry).

The only thing that needs the real model is **end-to-end evaluation** against the fixed dataset (RAGAS). It runs separately, less often, and its results **get compared across versions**: it's not pass/fail, it's better/worse.

## Example breakdown
| Piece | How |
|---|---|
| `chunk_text` | unit, edge cases |
| `extract_json` | unit, with markdown around it |
| retry loop | unit, a fake that gets it right on the second try |
| agent | integration with a fake LLM and real in-memory tools |
| response quality | evaluation with the real model |

## The typical mistake
Tests that call the real API: slow, expensive, non-deterministic, and they fail without network access. Or the opposite: zero evaluation because "you can't test an LLM."

## What they ask in interviews
"How do you test code that uses an LLM?" -- injecting the client + a fake for the logic, evaluation with a dataset for the quality.
$md$ where id = 's3-l2';
update lessons set content_md = $md$**Before reading, predict:** how many classes do you need to implement Strategy in Python?

## The idea
The classic book's patterns are written for languages without first-class functions. In Python, many of them collapse into something simpler:

- **Strategy**: a `dict` of functions. `STRATEGIES['price'](items)`. No interface, no per-variant class.
- **Factory**: a `dict` of classes. `KINDS[kind](**kwargs)`. Classes are objects.
- **Decorator**: the language's own decorator. `@with_cache`, `@lru_cache`, `@retry`: add behavior without touching the function.
- **Adapter**: any object with the expected method (duck typing) that wraps someone else's API.
- **Singleton**: a module already is one; and an injected instance is almost always better than a hidden global.

## Example
```python
STRATEGIES = {'price': by_price, 'name': by_name}
def sort_items(items, criterion):
    return STRATEGIES[criterion](items)
```

## The typical mistake
Bringing over the Java version: `class PriceSorter(SortingStrategy)` with an abstract class and an `execute` method. Correct, but triples the code for no gain.

## What they ask in interviews
"Which patterns have you used?" -- naming the pattern **and** the idiomatic version shows you understand the problem, not just the name.
$md$ where id = 's4-l1';
update lessons set content_md = $md$**Before reading, predict:** if you switch from Gemini to another provider tomorrow, how many files do you touch?

## The idea
An AI system has pieces that change often (LLM provider, embeddings model, chunking strategy, retriever) and stable pieces (the pipeline). Patterns exist so that what changes doesn't drag the stable parts along with it:

- **Adapter** for each LLM provider behind a common `complete(prompt)` method. Switching providers is one file.
- **Factory** that builds the right client from configuration (`LLM_PROVIDER=gemini`).
- **Strategy** for chunking and retrieval: `chunkers['by_paragraph']`, `retrievers['hybrid']`. Comparing strategies in `eval.py` becomes a loop.
- **Decorator** for retries with backoff, embedding cache, per-call latency logging.
- **Observer** so each step of the agent notifies metrics, logs, and the UI without the agent knowing who's listening.

## Example
```python
@retry(attempts=3, backoff=0.5)
@with_cache
def embed(text): ...
```

## The typical mistake
Calling the provider's SDK from ten different places. The day you switch providers (or they raise the price), you pay for it.

## What they ask in interviews
"How would you design the system so you could switch models?" -- adapter + factory + configuration, and evaluation to compare.
$md$ where id = 's4-l2';
update lessons set content_md = $md$**Before reading, predict:** why doesn't the student's progress go through FastAPI?

## The idea
PyQuest has three pieces, and each one exists for a specific reason:

- **Next.js on Vercel**: the interface. Writes progress **directly to Supabase**, protected by **RLS** (`user_id = auth.uid()`). Less latency, less code, no cold start per action.
- **Supabase**: data + identity. The **JWT** it issues is the single credential: the database (RLS) verifies it, and so does FastAPI.
- **FastAPI on Render**: **only the tutor**. Calls the LLM with per-user rate limiting. It's a separate service because it's Python and because it's the only piece with a per-call cost.
- **Pyodide**: the student's code runs in the browser. No server-side sandbox, no cost, works offline.

## Two decisions that don't get relitigated
1. A node's status (`available`) **is calculated**, never stored: it's derived from the attempts. Adding content never corrupts progress.
2. `exercise_attempts` is an **event log**, not state: it lets you reconstruct any view later (reviewing mistakes, new statistics).

## The risk taken on
Trusting the client with progress. It's fine because progress has no external value. If there were a public leaderboard or certificates, validation would move to the backend.

## What they ask in interviews
"Tell me about a project's architecture and one decision you'd make differently." This lesson is the answer.
$md$ where id = 's5-l1';
update lessons set content_md = $md$**Before reading, predict:** is PyQuest microservices?

## The idea
No. It's two services because they have different requirements (Next+Pyodide vs. Python with an LLM), not by design. A **modular monolith** (one application, well-separated modules inside) is almost always the best starting point: it avoids the complexity of the network, multiple deployments, and distributed data until there's a real reason (teams, scale).

**12-factor app**: the practices Vercel and Render assume: configuration in environment variables, declared dependencies, stateless processes, logs as streams, dev/prod parity. If your app follows them, it deploys anywhere.

**ADR** (Architecture Decision Record): a short document per decision: context, options, decision, consequences. Lives in the repo. Your `status.md` already has implicit ADRs ("design rules, do not relitigate"); formalizing them takes ten minutes and is gold in interviews.

## Example ADR
> **Context**: the client needs to read/write progress. **Options**: go through FastAPI / direct RLS. **Decision**: direct RLS. **Consequences**: less latency; business rules live in SQL; revisit if progress gains external value.

## The typical mistake
Designing for scale you don't have. Ten users don't need queues, distributed caches, or Kubernetes.

## What they ask in interviews
"Monolith or microservices?" -- it depends, and knowing what it depends on (teams, scale, domain boundaries) is the answer.
$md$ where id = 's5-l2';
update lessons set content_md = $md$**Before reading, predict:** if you delete a container, what happens to the files it wrote?

## The idea
An **image** is an immutable template (like a class); a **container** is a running instance with its own writable layer (like an object). What's written to that layer dies with the container: to persist it, use **volumes** or external services (PyQuest's database lives in Supabase, not in a container).

The **Dockerfile** describes the image layer by layer:
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```
`FROM` sets the base; `COPY` puts files in at build time; `EXPOSE` documents the port (doesn't publish it: that's `-p` at run time); `CMD` is the default command.

## The typical mistake
`COPY . .` before installing dependencies: every one-line code change invalidates the cache and reinstalls everything. Dependencies go **before** the code.

## What they ask in interviews
"Difference between an image and a container?" and "why `slim`?" -- smaller, faster, smaller attack surface.
$md$ where id = 's6-l1';
update lessons set content_md = $md$**Before reading, predict:** if you put `.env` in the image and then delete it in another layer, is it still there?

## The idea
Every Dockerfile instruction is a cached **layer**. A layer rebuilds if its own content changes **or if any earlier layer changed**. That's why the order goes from what changes least (base, dependencies) to what changes most (code).

**Secrets**: never in the image. Anything that enters a layer stays in its history even if you delete it afterward. They go in through runtime environment variables (`-e`, `env_file`, the platform's manager). `.dockerignore` excludes `.git`, `venv`, `.env` from the build context.

**Multi-stage**: one stage installs and compiles; the final one copies only the result. A smaller image, with no compilers in production.

**docker compose**: several services declared in YAML:
```yaml
services:
  api:
    build: .
    ports: ["8000:8000"]
    environment: [LLM_API_KEY=${LLM_API_KEY}]
    depends_on: [db]
  db:
    image: postgres:16
    volumes: [pgdata:/var/lib/postgresql/data]
volumes:
  pgdata:
```

## The typical mistake
`COPY .env .` "to make it work locally." And using `latest` as a tag: it works today, but the base image will have changed tomorrow.

## What they ask in interviews
"How do you pass secrets to a container?" and "what's multi-stage for?" -- both are filter questions at any job involving deployment.
$md$ where id = 's6-l2';
