-- 0025: insert node m7b-langchain (LangChain & LCEL) between M7 and M8
-- Renumbers M8 -> 9 and M9 -> 10, rewires prerequisites m7 -> m7b -> m8,
-- and adds 3 lessons + 14 exercises. Idempotent: safe to re-run.

begin;

-- 1) Renumber, highest first, so no two nodes ever share a position mid-migration
update skill_nodes set position = 10 where id = 'm9-capstone';
update skill_nodes set position = 9  where id = 'm8-agents-langgraph';

-- 2) The new node
insert into skill_nodes (id, title, description, track, position, section) values
  ('m7b-langchain', 'LangChain & LCEL', null, 'main', 8, 'genai')
  on conflict (id) do update set title=excluded.title, description=excluded.description,
    track=excluded.track, position=excluded.position, section=excluded.section;

-- 3) Rewire prerequisites: m7 -> m7b -> m8 (side quests and m9 unchanged)
delete from skill_prerequisites where node_id = 'm8-agents-langgraph' and requires_node_id = 'm7-prompting-tools';
insert into skill_prerequisites (node_id, requires_node_id) values
  ('m7b-langchain', 'm7-prompting-tools'),
  ('m8-agents-langgraph', 'm7b-langchain')
  on conflict do nothing;

-- 4) Lessons
insert into lessons (id, node_id, title, position, content_md) values
  ('m7b-l1', 'm7b-langchain', 'Runnables and LCEL', 1, '**Before you read, predict:** in `chain = prompt | model | parser`, what does the `|` operator actually do in Python?

## The idea

In M7 you wired prompts, model calls and tool calls by hand. LangChain packages those same steps behind **one shared interface: the Runnable**.

Prompts, models, output parsers, retrievers and tools are all Runnables, so they all expose the same methods:

- `invoke(input)` — run once, return the output
- `batch([inputs])` — run over a list of inputs
- `stream(input)` — yield the output in chunks as it''s generated

Because every piece speaks the same interface, you can **compose** them. That''s **LCEL**, the LangChain Expression Language: chaining Runnables with `|`, where the output of each step becomes the input of the next.

There''s no magic in `|`. Python calls the left object''s `__or__` method, and LangChain''s `__or__` returns a `RunnableSequence` holding both steps. Invoking the sequence runs each step in order.

## Example

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

prompt = ChatPromptTemplate.from_template("Summarize in one line: {text}")
chain = prompt | model | StrOutputParser()

chain.invoke({"text": report})                       # one input
chain.batch([{"text": r} for r in reports])          # many inputs
for chunk in chain.stream({"text": report}):         # token by token
    print(chunk, end="")
```

## Recap

- A Runnable is anything with `invoke`, `batch` and `stream`.
- LCEL composes Runnables with `|`; data flows left to right.
- `a | b` is just `a.__or__(b)`, which returns a `RunnableSequence`.
- Same interface everywhere means you can swap a model or parser without touching the rest of the chain.
')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title,
    position=excluded.position, content_md=excluded.content_md;

insert into lessons (id, node_id, title, position, content_md) values
  ('m7b-l2', 'm7b-langchain', 'Prompts, parsers and structured output', 2, '**Before you read, predict:** a model replies with the text `{"ticker": "NVDA"}`. Is that a Python dict?

## The idea

A chat model returns a **message**, not the data you want. Two pieces sit around it in almost every chain:

- **Prompt templates** turn your variables into model input. `ChatPromptTemplate.from_template("Explain {topic}")` fills `{topic}` at invoke time, so the prompt is data, not string concatenation scattered through your code.
- **Output parsers** turn the model''s message into something usable. `StrOutputParser` extracts the plain text; `JsonOutputParser` parses JSON text into a dict.

The model''s `{"ticker": "NVDA"}` is **a string that looks like JSON**. It only becomes a dict after parsing, and parsing can fail: the model might add a sentence before the JSON, or skip a field.

For anything you''ll use programmatically, prefer **structured output**: `model.with_structured_output(Schema)` asks the provider to return data matching a schema (a Pydantic model or a TypedDict) and hands you a validated object. It''s the framework version of the JSON-mode prompting you did in M7.

## Example

```python
from pydantic import BaseModel

class Signal(BaseModel):
    ticker: str
    sentiment: str      # "bullish" | "bearish" | "neutral"
    confidence: float

structured = model.with_structured_output(Signal)
signal = structured.invoke("NVDA beat earnings and raised guidance.")
signal.ticker        # "NVDA" — a real attribute, not text to parse
```

## Recap

- Prompt templates keep prompts as reusable, testable data.
- Model output is text until a parser turns it into data.
- `StrOutputParser` for text, `JsonOutputParser` for JSON strings.
- For data your code depends on, use `with_structured_output(Schema)`: validated objects, not strings.
')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title,
    position=excluded.position, content_md=excluded.content_md;

insert into lessons (id, node_id, title, position, content_md) values
  ('m7b-l3', 'm7b-langchain', 'From manual tool calling to create_agent', 3, '**Before you read, predict:** in your own tool-calling loop from M7, which parts would you happily never write again?

## The idea

A tool-calling agent is always the same loop: send messages and tool schemas to the model, execute any tool it requests, append the result, and repeat until it answers. In M7 you wrote that loop yourself.

LangChain 1.x gives you the loop ready-made with `create_agent`:

- The `@tool` decorator builds the tool schema from your function''s **type hints** and uses its **docstring** as the description the model reads.
- `create_agent(model, tools, system_prompt)` returns an agent that runs the loop, keeps the message history, and stops when the model gives a final answer. Under the hood it runs on LangGraph, which you''ll meet in the next node.

What the framework saves you: the loop, message bookkeeping, schema writing, provider differences. What it hides: exactly what''s sent to the model, why a tool was or wasn''t called, and where time and tokens go. When something breaks, you need to know what''s under the abstraction. That''s why you built it by hand first.

## Example

```python
from langchain.agents import create_agent
from langchain.tools import tool

@tool
def get_close_price(ticker: str) -> float:
    """Return the latest closing price for a stock ticker."""
    return prices[ticker]

agent = create_agent(
    model="google_genai:gemini-2.5-flash",
    tools=[get_close_price],
    system_prompt="You answer questions about stock prices. Use tools for numbers.",
)

result = agent.invoke(
    {"messages": [{"role": "user", "content": "Where did NVDA close?"}]}
)
print(result["messages"][-1].content)
```

## Recap

- `@tool` turns a typed, documented function into a tool the model can call.
- `create_agent` runs the call-tools-until-done loop for you.
- The docstring is the model''s only guide to when to use a tool, so write it for the model.
- Frameworks trade control for speed. Knowing the manual loop is what lets you debug the automatic one.
')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title,
    position=excluded.position, content_md=excluded.content_md;

-- 5) Exercises
insert into exercises (id, node_id, type, position, content) values
  ('m7b-e1', 'm7b-langchain', 'flashcard', 1, '{"prompt": "What is LCEL in LangChain?", "answer": "The LangChain Expression Language: composing Runnables (prompts, models, parsers, retrievers) with the | operator, so each step''s output becomes the next step''s input.", "explanation": "prompt | model | parser is an LCEL chain. It''s a RunnableSequence, and it has invoke, batch and stream like any single Runnable."}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('m7b-e2', 'm7b-langchain', 'flashcard', 2, '{"prompt": "LangChain vs LangGraph: what''s the difference?", "answer": "LangChain gives you the building blocks (models, prompts, parsers, tools) and simple chains. LangGraph orchestrates stateful, multi-step workflows as a graph with branches, loops and persistence.", "explanation": "Linear pipeline: an LCEL chain is enough. Loops, conditional routing, several agents or long-running state: LangGraph. LangChain''s create_agent itself runs on LangGraph."}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('m7b-e3', 'm7b-langchain', 'flashcard', 3, '{"prompt": "What does model.with_structured_output(Schema) do?", "answer": "It returns a version of the model that answers with data matching Schema (a Pydantic model or TypedDict) and gives you a validated object instead of free text.", "explanation": "Preferred over parsing JSON out of text: the provider''s structured-output support enforces the shape, and validation fails loudly if it doesn''t match."}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('m7b-e4', 'm7b-langchain', 'match', 4, '{"meta": {"concepts": ["Runnable", "LCEL"], "interview": false, "difficulty": 1}, "prompt": "Match each part of the Runnable interface with what it does.", "pairs": [{"term": "invoke()", "definition": "Run once on a single input and return the output"}, {"term": "batch()", "definition": "Run over a list of inputs and return a list of outputs"}, {"term": "stream()", "definition": "Yield the output in chunks while it''s being generated"}, {"term": "| (pipe)", "definition": "Compose two Runnables so the first one''s output feeds the second"}]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('m7b-e5', 'm7b-langchain', 'match', 5, '{"meta": {"concepts": ["LangChain", "prompt templates", "output parsers", "tools"], "interview": true, "difficulty": 2}, "prompt": "Match each LangChain building block with its job.", "pairs": [{"term": "ChatPromptTemplate", "definition": "Fills variables into a reusable prompt at invoke time"}, {"term": "StrOutputParser", "definition": "Extracts the plain text from a model''s message"}, {"term": "with_structured_output", "definition": "Makes the model return a validated object matching a schema"}, {"term": "@tool", "definition": "Turns a typed, documented function into something the model can call"}, {"term": "create_agent", "definition": "Runs the call-tools-until-done loop with message history"}]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('m7b-e6', 'm7b-langchain', 'predict_output', 6, '{"meta": {"concepts": ["LCEL", "RunnableSequence"], "interview": false, "difficulty": 1}, "prompt": "PromptTemplate, FakeChatModel and StrOutputParser work like the classes in this node''s lessons (see the stub above the chain). What does this print?", "code": "# --- do not touch ---\nclass Runnable:\n    \"\"\"Minimal stand-in for LangChain''s Runnable interface.\"\"\"\n    def invoke(self, value):\n        raise NotImplementedError\n\n    def batch(self, values):\n        return [self.invoke(v) for v in values]\n\n    def __or__(self, other):\n        return RunnableSequence([self, other])\n\n\nclass RunnableSequence(Runnable):\n    def __init__(self, steps):\n        self.steps = steps\n\n    def invoke(self, value):\n        for step in self.steps:\n            value = step.invoke(value)\n        return value\n\n    def __or__(self, other):\n        return RunnableSequence(self.steps + [other])\n\n\nclass PromptTemplate(Runnable):\n    def __init__(self, template):\n        self.template = template\n\n    def invoke(self, variables):\n        return self.template.format(**variables)\n\n\nclass FakeChatModel(Runnable):\n    \"\"\"Returns a canned reply so tests are deterministic.\"\"\"\n    def invoke(self, prompt):\n        return f\"  AI: {prompt}  \"\n\n\nclass StrOutputParser(Runnable):\n    def invoke(self, text):\n        return text.strip()\n# --- end ---\n\nchain = PromptTemplate(\"Explain {topic}\") | FakeChatModel() | StrOutputParser()\nprint(chain.invoke({\"topic\": \"RAG\"}))", "expected_output": "AI: Explain RAG", "explanation": "The template fills {topic} -> ''Explain RAG''; the fake model wraps it -> ''  AI: Explain RAG  ''; the parser strips the spaces. Each step''s output is the next step''s input."}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('m7b-e7', 'm7b-langchain', 'code', 7, '{"meta": {"concepts": ["LCEL", "chains"], "interview": false, "difficulty": 1}, "prompt": "Write build_chain() that returns an LCEL chain: a PromptTemplate with the template \"Summarize: {text}\", then a FakeChatModel, then a StrOutputParser.", "starter_code": "# --- do not touch ---\nclass Runnable:\n    \"\"\"Minimal stand-in for LangChain''s Runnable interface.\"\"\"\n    def invoke(self, value):\n        raise NotImplementedError\n\n    def batch(self, values):\n        return [self.invoke(v) for v in values]\n\n    def __or__(self, other):\n        return RunnableSequence([self, other])\n\n\nclass RunnableSequence(Runnable):\n    def __init__(self, steps):\n        self.steps = steps\n\n    def invoke(self, value):\n        for step in self.steps:\n            value = step.invoke(value)\n        return value\n\n    def __or__(self, other):\n        return RunnableSequence(self.steps + [other])\n\n\nclass PromptTemplate(Runnable):\n    def __init__(self, template):\n        self.template = template\n\n    def invoke(self, variables):\n        return self.template.format(**variables)\n\n\nclass FakeChatModel(Runnable):\n    \"\"\"Returns a canned reply so tests are deterministic.\"\"\"\n    def invoke(self, prompt):\n        return f\"  AI: {prompt}  \"\n\n\nclass StrOutputParser(Runnable):\n    def invoke(self, text):\n        return text.strip()\n# --- end ---\n\n\ndef build_chain():\n    # your code here\n    pass", "solution": "# --- do not touch ---\nclass Runnable:\n    \"\"\"Minimal stand-in for LangChain''s Runnable interface.\"\"\"\n    def invoke(self, value):\n        raise NotImplementedError\n\n    def batch(self, values):\n        return [self.invoke(v) for v in values]\n\n    def __or__(self, other):\n        return RunnableSequence([self, other])\n\n\nclass RunnableSequence(Runnable):\n    def __init__(self, steps):\n        self.steps = steps\n\n    def invoke(self, value):\n        for step in self.steps:\n            value = step.invoke(value)\n        return value\n\n    def __or__(self, other):\n        return RunnableSequence(self.steps + [other])\n\n\nclass PromptTemplate(Runnable):\n    def __init__(self, template):\n        self.template = template\n\n    def invoke(self, variables):\n        return self.template.format(**variables)\n\n\nclass FakeChatModel(Runnable):\n    \"\"\"Returns a canned reply so tests are deterministic.\"\"\"\n    def invoke(self, prompt):\n        return f\"  AI: {prompt}  \"\n\n\nclass StrOutputParser(Runnable):\n    def invoke(self, text):\n        return text.strip()\n# --- end ---\n\n\ndef build_chain():\n    return PromptTemplate(\"Summarize: {text}\") | FakeChatModel() | StrOutputParser()", "hints": ["A chain is just Runnables joined with |, in the order the data flows.", "Prompt first (it needs the variables), then the model, then the parser.", "return PromptTemplate(\"Summarize: {text}\") | FakeChatModel() | StrOutputParser()"], "tests": [{"call": "type(build_chain()).__name__", "expected": "''RunnableSequence''"}, {"call": "build_chain().invoke({''text'': ''Q3 report''})", "expected": "''AI: Summarize: Q3 report''"}, {"call": "build_chain().invoke({''text'': ''NVDA 10-K''})", "expected": "''AI: Summarize: NVDA 10-K''"}]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('m7b-e8', 'm7b-langchain', 'code', 8, '{"meta": {"concepts": ["batch", "Runnable"], "interview": false, "difficulty": 1}, "prompt": "`chain` is already built for you. Write summarize_all(texts) that summarizes a list of texts in one call using the chain''s batch method. Each input must be a dict with a \"text\" key.", "starter_code": "# --- do not touch ---\nclass Runnable:\n    \"\"\"Minimal stand-in for LangChain''s Runnable interface.\"\"\"\n    def invoke(self, value):\n        raise NotImplementedError\n\n    def batch(self, values):\n        return [self.invoke(v) for v in values]\n\n    def __or__(self, other):\n        return RunnableSequence([self, other])\n\n\nclass RunnableSequence(Runnable):\n    def __init__(self, steps):\n        self.steps = steps\n\n    def invoke(self, value):\n        for step in self.steps:\n            value = step.invoke(value)\n        return value\n\n    def __or__(self, other):\n        return RunnableSequence(self.steps + [other])\n\n\nclass PromptTemplate(Runnable):\n    def __init__(self, template):\n        self.template = template\n\n    def invoke(self, variables):\n        return self.template.format(**variables)\n\n\nclass FakeChatModel(Runnable):\n    \"\"\"Returns a canned reply so tests are deterministic.\"\"\"\n    def invoke(self, prompt):\n        return f\"  AI: {prompt}  \"\n\n\nclass StrOutputParser(Runnable):\n    def invoke(self, text):\n        return text.strip()\n# --- end ---\n\n# --- do not touch ---\nchain = PromptTemplate(\"Summarize: {text}\") | FakeChatModel() | StrOutputParser()\n# --- end ---\n\n\ndef summarize_all(texts):\n    # your code here\n    pass", "solution": "# --- do not touch ---\nclass Runnable:\n    \"\"\"Minimal stand-in for LangChain''s Runnable interface.\"\"\"\n    def invoke(self, value):\n        raise NotImplementedError\n\n    def batch(self, values):\n        return [self.invoke(v) for v in values]\n\n    def __or__(self, other):\n        return RunnableSequence([self, other])\n\n\nclass RunnableSequence(Runnable):\n    def __init__(self, steps):\n        self.steps = steps\n\n    def invoke(self, value):\n        for step in self.steps:\n            value = step.invoke(value)\n        return value\n\n    def __or__(self, other):\n        return RunnableSequence(self.steps + [other])\n\n\nclass PromptTemplate(Runnable):\n    def __init__(self, template):\n        self.template = template\n\n    def invoke(self, variables):\n        return self.template.format(**variables)\n\n\nclass FakeChatModel(Runnable):\n    \"\"\"Returns a canned reply so tests are deterministic.\"\"\"\n    def invoke(self, prompt):\n        return f\"  AI: {prompt}  \"\n\n\nclass StrOutputParser(Runnable):\n    def invoke(self, text):\n        return text.strip()\n# --- end ---\n\n# --- do not touch ---\nchain = PromptTemplate(\"Summarize: {text}\") | FakeChatModel() | StrOutputParser()\n# --- end ---\n\n\ndef summarize_all(texts):\n    return chain.batch([{\"text\": t} for t in texts])", "hints": ["batch takes a list of inputs, one per run, and returns a list of outputs.", "Each input must look like what invoke expects: {\"text\": ...}. Build that list first.", "return chain.batch([{\"text\": t} for t in texts])"], "tests": [{"call": "summarize_all([''a'', ''b''])", "expected": "[''AI: Summarize: a'', ''AI: Summarize: b'']"}, {"call": "summarize_all([])", "expected": "[]"}]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('m7b-e9', 'm7b-langchain', 'fix_bug', 9, '{"meta": {"concepts": ["LCEL", "chains"], "interview": false, "difficulty": 1}, "prompt": "make_chain() should translate text, but invoking it crashes. Read the error, figure out what each step receives, and fix the chain.", "starter_code": "# --- do not touch ---\nclass Runnable:\n    \"\"\"Minimal stand-in for LangChain''s Runnable interface.\"\"\"\n    def invoke(self, value):\n        raise NotImplementedError\n\n    def batch(self, values):\n        return [self.invoke(v) for v in values]\n\n    def __or__(self, other):\n        return RunnableSequence([self, other])\n\n\nclass RunnableSequence(Runnable):\n    def __init__(self, steps):\n        self.steps = steps\n\n    def invoke(self, value):\n        for step in self.steps:\n            value = step.invoke(value)\n        return value\n\n    def __or__(self, other):\n        return RunnableSequence(self.steps + [other])\n\n\nclass PromptTemplate(Runnable):\n    def __init__(self, template):\n        self.template = template\n\n    def invoke(self, variables):\n        return self.template.format(**variables)\n\n\nclass FakeChatModel(Runnable):\n    \"\"\"Returns a canned reply so tests are deterministic.\"\"\"\n    def invoke(self, prompt):\n        return f\"  AI: {prompt}  \"\n\n\nclass StrOutputParser(Runnable):\n    def invoke(self, text):\n        return text.strip()\n# --- end ---\n\n\ndef make_chain():\n    return StrOutputParser() | FakeChatModel() | PromptTemplate(\"Translate: {text}\")", "solution": "# --- do not touch ---\nclass Runnable:\n    \"\"\"Minimal stand-in for LangChain''s Runnable interface.\"\"\"\n    def invoke(self, value):\n        raise NotImplementedError\n\n    def batch(self, values):\n        return [self.invoke(v) for v in values]\n\n    def __or__(self, other):\n        return RunnableSequence([self, other])\n\n\nclass RunnableSequence(Runnable):\n    def __init__(self, steps):\n        self.steps = steps\n\n    def invoke(self, value):\n        for step in self.steps:\n            value = step.invoke(value)\n        return value\n\n    def __or__(self, other):\n        return RunnableSequence(self.steps + [other])\n\n\nclass PromptTemplate(Runnable):\n    def __init__(self, template):\n        self.template = template\n\n    def invoke(self, variables):\n        return self.template.format(**variables)\n\n\nclass FakeChatModel(Runnable):\n    \"\"\"Returns a canned reply so tests are deterministic.\"\"\"\n    def invoke(self, prompt):\n        return f\"  AI: {prompt}  \"\n\n\nclass StrOutputParser(Runnable):\n    def invoke(self, text):\n        return text.strip()\n# --- end ---\n\n\ndef make_chain():\n    return PromptTemplate(\"Translate: {text}\") | FakeChatModel() | StrOutputParser()", "hints": ["The dict you pass to invoke goes to the FIRST step. Which step knows what to do with a dict?", "Data flows left to right: the prompt must come first and the parser last.", "return PromptTemplate(\"Translate: {text}\") | FakeChatModel() | StrOutputParser()"], "tests": [{"call": "make_chain().invoke({''text'': ''hola''})", "expected": "''AI: Translate: hola''"}]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('m7b-e10', 'm7b-langchain', 'code', 10, '{"meta": {"concepts": ["LCEL", "operator overloading", "__or__"], "interview": true, "difficulty": 3}, "prompt": "Build the core of LCEL yourself. Implement Runnable.__or__ so that `a | b` returns a RunnableSequence that runs a, then b. RunnableSequence, Upper and Exclaim are provided below your class.", "starter_code": "class Runnable:\n    def invoke(self, value):\n        raise NotImplementedError\n\n    def __or__(self, other):\n        # your code here: return a RunnableSequence that runs self, then other\n        pass\n\n\n# --- do not touch ---\nclass RunnableSequence(Runnable):\n    def __init__(self, steps):\n        self.steps = steps\n\n    def invoke(self, value):\n        for step in self.steps:\n            value = step.invoke(value)\n        return value\n\n\nclass Upper(Runnable):\n    def invoke(self, value):\n        return value.upper()\n\n\nclass Exclaim(Runnable):\n    def invoke(self, value):\n        return value + \"!\"\n# --- end ---", "solution": "class Runnable:\n    def invoke(self, value):\n        raise NotImplementedError\n\n    def __or__(self, other):\n        return RunnableSequence([self, other])\n\n\n# --- do not touch ---\nclass RunnableSequence(Runnable):\n    def __init__(self, steps):\n        self.steps = steps\n\n    def invoke(self, value):\n        for step in self.steps:\n            value = step.invoke(value)\n        return value\n\n\nclass Upper(Runnable):\n    def invoke(self, value):\n        return value.upper()\n\n\nclass Exclaim(Runnable):\n    def invoke(self, value):\n        return value + \"!\"\n# --- end ---", "hints": ["Python translates a | b into a.__or__(b). Whatever __or__ returns is the result of the pipe.", "RunnableSequence takes a list of steps and runs them in order. Which two steps belong in it?", "return RunnableSequence([self, other])"], "tests": [{"call": "type(Upper() | Exclaim()).__name__", "expected": "''RunnableSequence''"}, {"call": "(Upper() | Exclaim()).invoke(''hi'')", "expected": "''HI!''"}, {"call": "(Exclaim() | Exclaim() | Upper()).invoke(''ok'')", "expected": "''OK!!''"}]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('m7b-e11', 'm7b-langchain', 'code', 11, '{"meta": {"concepts": ["output parsers", "structured output", "validation"], "interview": false, "difficulty": 2, "recuerda_de": "m7-prompting-tools"}, "prompt": "Write a JsonSignalParser Runnable whose invoke(text) parses the model''s JSON text into a dict and raises ValueError if the \"ticker\" or \"sentiment\" key is missing. It should work at the end of a chain: FakeJsonModel() | JsonSignalParser().", "starter_code": "# --- do not touch ---\nimport json\n\nclass Runnable:\n    \"\"\"Minimal stand-in for LangChain''s Runnable interface.\"\"\"\n    def invoke(self, value):\n        raise NotImplementedError\n\n    def batch(self, values):\n        return [self.invoke(v) for v in values]\n\n    def __or__(self, other):\n        return RunnableSequence([self, other])\n\n\nclass RunnableSequence(Runnable):\n    def __init__(self, steps):\n        self.steps = steps\n\n    def invoke(self, value):\n        for step in self.steps:\n            value = step.invoke(value)\n        return value\n\n    def __or__(self, other):\n        return RunnableSequence(self.steps + [other])\n\n\nclass PromptTemplate(Runnable):\n    def __init__(self, template):\n        self.template = template\n\n    def invoke(self, variables):\n        return self.template.format(**variables)\n\n\nclass FakeChatModel(Runnable):\n    \"\"\"Returns a canned reply so tests are deterministic.\"\"\"\n    def invoke(self, prompt):\n        return f\"  AI: {prompt}  \"\n\n\nclass StrOutputParser(Runnable):\n    def invoke(self, text):\n        return text.strip()\n\n\nclass FakeJsonModel(Runnable):\n    \"\"\"Pretends to be a model asked to answer in JSON.\"\"\"\n    def invoke(self, prompt):\n        return ''{\"ticker\": \"NVDA\", \"sentiment\": \"bullish\"}''\n\n\ndef raises_value_error(fn):\n    try:\n        fn()\n    except ValueError:\n        return True\n    return False\n# --- end ---\n\n\nclass JsonSignalParser(Runnable):\n    def invoke(self, text):\n        # your code here\n        pass", "solution": "# --- do not touch ---\nimport json\n\nclass Runnable:\n    \"\"\"Minimal stand-in for LangChain''s Runnable interface.\"\"\"\n    def invoke(self, value):\n        raise NotImplementedError\n\n    def batch(self, values):\n        return [self.invoke(v) for v in values]\n\n    def __or__(self, other):\n        return RunnableSequence([self, other])\n\n\nclass RunnableSequence(Runnable):\n    def __init__(self, steps):\n        self.steps = steps\n\n    def invoke(self, value):\n        for step in self.steps:\n            value = step.invoke(value)\n        return value\n\n    def __or__(self, other):\n        return RunnableSequence(self.steps + [other])\n\n\nclass PromptTemplate(Runnable):\n    def __init__(self, template):\n        self.template = template\n\n    def invoke(self, variables):\n        return self.template.format(**variables)\n\n\nclass FakeChatModel(Runnable):\n    \"\"\"Returns a canned reply so tests are deterministic.\"\"\"\n    def invoke(self, prompt):\n        return f\"  AI: {prompt}  \"\n\n\nclass StrOutputParser(Runnable):\n    def invoke(self, text):\n        return text.strip()\n\n\nclass FakeJsonModel(Runnable):\n    \"\"\"Pretends to be a model asked to answer in JSON.\"\"\"\n    def invoke(self, prompt):\n        return ''{\"ticker\": \"NVDA\", \"sentiment\": \"bullish\"}''\n\n\ndef raises_value_error(fn):\n    try:\n        fn()\n    except ValueError:\n        return True\n    return False\n# --- end ---\n\n\nclass JsonSignalParser(Runnable):\n    def invoke(self, text):\n        data = json.loads(text)\n        for key in (\"ticker\", \"sentiment\"):\n            if key not in data:\n                raise ValueError(f\"missing key: {key}\")\n        return data", "hints": ["The model gives you a string that looks like JSON. json.loads turns it into a dict.", "After parsing, check each required key and raise ValueError if one is missing; otherwise return the dict.", "data = json.loads(text); for key in (\"ticker\", \"sentiment\"): if key not in data: raise ValueError(key)"], "tests": [{"call": "(FakeJsonModel() | JsonSignalParser()).invoke(''NVDA earnings'')", "expected": "{''ticker'': ''NVDA'', ''sentiment'': ''bullish''}"}, {"call": "JsonSignalParser().invoke(''{\"ticker\": \"AAPL\", \"sentiment\": \"neutral\"}'')[''sentiment'']", "expected": "''neutral''"}, {"call": "raises_value_error(lambda: JsonSignalParser().invoke(''{\"ticker\": \"NVDA\"}''))", "expected": "True"}]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('m7b-e12', 'm7b-langchain', 'parsons', 12, '{"meta": {"concepts": ["LCEL", "ChatPromptTemplate", "StrOutputParser"], "interview": false, "difficulty": 1}, "prompt": "Put the lines in order to build and run a real LangChain summarization chain. (`model` and `report` already exist.)", "lines": ["from langchain_core.prompts import ChatPromptTemplate", "from langchain_core.output_parsers import StrOutputParser", "prompt = ChatPromptTemplate.from_template(\"Summarize in one line: {text}\")", "chain = prompt | model | StrOutputParser()", "summary = chain.invoke({\"text\": report})"]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('m7b-e13', 'm7b-langchain', 'recall', 13, '{"meta": {"concepts": ["LCEL", "__or__", "operator overloading"], "interview": true, "difficulty": 2}, "prompt": "An interviewer asks: \"How does the | operator work in a LangChain chain?\" Explain it in your own words.", "isCode": false, "modelAnswer": "It''s plain Python operator overloading. a | b calls a.__or__(b), and LangChain''s Runnable implements __or__ to return a RunnableSequence containing both steps. Invoking that sequence runs each step in order, passing each output as the next input. Since the sequence is itself a Runnable, it also has invoke, batch and stream and can be piped again, which is why prompt | model | parser works."}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('m7b-e14', 'm7b-langchain', 'recall', 14, '{"meta": {"concepts": ["LangChain", "trade-offs", "tool calling"], "interview": true, "difficulty": 2, "recuerda_de": "m7-prompting-tools"}, "prompt": "An interviewer asks: \"When would you NOT use LangChain?\" Answer with the trade-offs, and use your own experience if you have it.", "isCode": false, "modelAnswer": "When the task is small and stable, e.g. one model call or a single tool-calling loop, the SDK directly is often simpler: fewer dependencies, less abstraction, and you see exactly what''s sent to the model. Frameworks pay off when you need many integrations, to swap providers, or orchestration with state and branching (LangGraph). The cost is that abstractions hide prompts, retries and token use, which makes debugging harder, so it''s worth building the manual loop once to understand what the framework does. In my RAG and trading-agent projects I did it without LangChain for that reason, so I know what create_agent replaces."}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

commit;
