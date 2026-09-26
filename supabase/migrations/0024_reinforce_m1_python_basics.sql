-- 0024: reinforce m1-python-basics (entry node)
-- Adds 2 lessons (m1-l2, m1-l3) and 10 exercises (m1-e8..m1-e17).
-- Covers: types & conversions, input(), // % **, and/or/not, while, reading IndentationError.
-- Adds the node's first match, predict_output, parsons and fix_bug exercises.
-- Idempotent: safe to re-run (ON CONFLICT DO UPDATE). Does not touch m1-e1..m1-e7 or m1-lesson-basics.

begin;

insert into lessons (id, node_id, title, position, content_md) values
  ('m1-l2', 'm1-python-basics', 'Types, conversions and operators', 2, '**Before you read, predict:** what does `"30" + "1"` print? And `int("30") + 1`?

## The idea

Every value in Python has a **type**. The four you''ll use constantly:

- `int` — whole numbers: `42`, `-7`
- `float` — decimals: `3.14`, `2.0`
- `str` — text, in quotes: `"hello"`
- `bool` — `True` or `False`

Plus `None`, which means "no value". Check any type with `type(x)`.

Types decide what operators do. `+` adds two numbers but **joins** two strings. That''s why `"30" + "1"` gives `"301"`, not `31`.

To switch types, convert explicitly: `int("30")`, `float("2.5")`, `str(42)`. This matters because `input()` **always returns a `str`**, even when the user types a number.

Arithmetic operators beyond `+ - * /`:

- `//` — integer division: `7 // 2` is `3`
- `%` — remainder (modulo): `7 % 2` is `1`
- `**` — power: `2 ** 3` is `8`

Logical operators combine booleans, and they''re words, not symbols:

- `and` — True only if both sides are True
- `or` — True if at least one side is True
- `not` — flips the value

## Example

```python
age_text = input("Your age: ")   # always a str, e.g. "30"
age = int(age_text)              # now an int: 30

next_year = age + 1              # 31
minutes = 125 // 60              # 2
seconds = 125 % 60               # 5

can_rent_car = age >= 25 and not age > 75
print(f"{minutes}m {seconds}s, can rent: {can_rent_car}")
```

## Recap

- Types: `int`, `float`, `str`, `bool`, `None`. Inspect with `type()`.
- `input()` returns text. Convert with `int()` / `float()` before doing math.
- `//` is integer division, `%` is the remainder, `**` is power.
- `and`, `or`, `not` are words in Python, not `&&`, `||`, `!`.
')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title,
    position=excluded.position, content_md=excluded.content_md;

insert into lessons (id, node_id, title, position, content_md) values
  ('m1-l3', 'm1-python-basics', 'while loops and reading errors', 3, '**Before you read, predict:** a `while` loop''s condition never becomes `False`. What happens?

## The idea

A `for` loop runs once per item in a sequence. A `while` loop runs **as long as a condition is True**, which makes it the right tool when you don''t know in advance how many repetitions you need.

The one rule: something inside the loop must eventually make the condition `False`. If not, you get an **infinite loop** and the program never finishes.

Errors are part of the job, and Python''s error messages are more helpful than they look. Read them **from the bottom up**:

1. The **last line** tells you the error type and a short message, e.g. `IndentationError: expected an indented block`.
2. The lines above point to the **file and line number** where it happened.
3. A caret `^` often marks the exact spot.

`IndentationError` is the classic first error: a line inside a block (an `if`, a loop, a function) isn''t indented consistently.

## Example

```python
count = 3
while count > 0:        # checked before every repetition
    print(count)
    count -= 1          # without this line, the loop never ends
print("Liftoff!")
```

A typical error, read bottom-up:

```text
  File "main.py", line 3
    print(count)
    ^
IndentationError: expected an indented block after ''while'' statement on line 2
```

Last line: what went wrong. Line above: where. Fix: indent `print(count)` under the `while`.

## Recap

- `while condition:` repeats while the condition is True.
- Always update something the condition depends on, or the loop never stops.
- Read tracebacks bottom-up: error type first, then the line number.
- `IndentationError` = a block''s body isn''t indented correctly.
')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title,
    position=excluded.position, content_md=excluded.content_md;

insert into exercises (id, node_id, type, position, content) values
  ('m1-e8', 'm1-python-basics', 'match', 8, '{"meta": {"concepts": ["types"], "interview": false, "difficulty": 1}, "prompt": "Match each type with an example value.", "pairs": [{"term": "int", "definition": "42"}, {"term": "float", "definition": "3.14"}, {"term": "str", "definition": "\"42\""}, {"term": "bool", "definition": "True"}, {"term": "NoneType", "definition": "None"}]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('m1-e9', 'm1-python-basics', 'predict_output', 9, '{"meta": {"concepts": ["operators", "integer division", "modulo"], "interview": false, "difficulty": 1}, "prompt": "What does this code print?", "code": "print(7 // 2, 7 % 2, 2 ** 3)", "expected_output": "3 1 8", "explanation": "// is integer division (7 // 2 = 3), % is the remainder (7 % 2 = 1) and ** is power (2 ** 3 = 8). print separates its arguments with spaces."}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('m1-e10', 'm1-python-basics', 'predict_output', 10, '{"meta": {"concepts": ["types", "type conversion", "input"], "interview": true, "difficulty": 2}, "prompt": "age holds text, exactly as input() would return it. What does this code print?", "code": "age = \"30\"\nprint(age + \"1\")\nprint(int(age) + 1)", "expected_output": "301\n31", "explanation": "With two strings, + joins them: \"30\" + \"1\" is \"301\". After int(age), + adds numbers: 30 + 1 is 31. This is why you convert input() before doing math."}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('m1-e11', 'm1-python-basics', 'code', 11, '{"meta": {"concepts": ["integer division", "modulo", "tuples"], "interview": false, "difficulty": 1}, "prompt": "Write split_seconds(total) that converts a number of seconds into a tuple (minutes, seconds). For example, 125 seconds is (2, 5).", "starter_code": "def split_seconds(total):\n    # your code here\n    pass", "solution": "def split_seconds(total):\n    minutes = total // 60\n    seconds = total % 60\n    return (minutes, seconds)", "hints": ["Minutes are how many full groups of 60 fit into total. Seconds are what''s left over.", "Integer division // counts full groups; modulo % gives the remainder.", "return (total // 60, total % 60)"], "tests": [{"call": "split_seconds(125)", "expected": "(2, 5)"}, {"call": "split_seconds(60)", "expected": "(1, 0)"}, {"call": "split_seconds(59)", "expected": "(0, 59)"}]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('m1-e12', 'm1-python-basics', 'parsons', 12, '{"meta": {"concepts": ["while loop"], "interview": false, "difficulty": 1}, "prompt": "Put the lines in order so the program counts down from 3 and then prints ''Liftoff!''.", "lines": ["count = 3", "while count > 0:", "    print(count)", "    count -= 1", "print(''Liftoff!'')"]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('m1-e13', 'm1-python-basics', 'fix_bug', 13, '{"meta": {"concepts": ["indentation", "IndentationError", "while loop"], "interview": false, "difficulty": 1}, "prompt": "This function should add up the numbers from 1 to n, but Python refuses to run it. Read the error, find the indentation problem and fix it.", "starter_code": "def sum_to(n):\n    total = 0\n    i = 1\n    while i <= n:\n    total += i\n        i += 1\n    return total", "solution": "def sum_to(n):\n    total = 0\n    i = 1\n    while i <= n:\n        total += i\n        i += 1\n    return total", "hints": ["Read the error from the bottom up: the last line says what''s wrong, the line number says where.", "Everything inside the while loop must be indented one level deeper than the while line.", "Indent ''total += i'' to line up with ''i += 1''."], "tests": [{"call": "sum_to(3)", "expected": "6"}, {"call": "sum_to(1)", "expected": "1"}, {"call": "sum_to(0)", "expected": "0"}]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('m1-e14', 'm1-python-basics', 'fix_bug', 14, '{"meta": {"concepts": ["logical operators", "and", "or"], "interview": false, "difficulty": 2}, "prompt": "can_vote(age, is_citizen) should return True only for citizens aged 18 or over. It runs without errors but gives wrong answers. Find the bug.", "starter_code": "def can_vote(age, is_citizen):\n    return age >= 18 or is_citizen", "solution": "def can_vote(age, is_citizen):\n    return age >= 18 and is_citizen", "hints": ["Try it by hand: what does it return for a 16-year-old citizen?", "Both conditions must hold at the same time. Which logical operator requires that?", "Replace or with and."], "tests": [{"call": "can_vote(20, True)", "expected": "True"}, {"call": "can_vote(16, True)", "expected": "False"}, {"call": "can_vote(20, False)", "expected": "False"}]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('m1-e15', 'm1-python-basics', 'recall', 15, '{"meta": {"concepts": ["input", "type conversion"], "interview": true, "difficulty": 1}, "prompt": "In your own words: why does input() usually need int() or float() around it when you ask the user for a number? What goes wrong without it?", "isCode": false, "modelAnswer": "input() always returns a string, even if the user types digits. Without converting, arithmetic either fails or does something else: \"5\" + \"1\" joins the text into \"51\" instead of adding, and \"5\" + 1 raises a TypeError because you can''t add a str and an int. Wrapping it in int() or float() turns the text into a number first, so the math behaves as expected."}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('m1-e16', 'm1-python-basics', 'code', 16, '{"meta": {"concepts": ["while loop", "integer division"], "interview": false, "difficulty": 2}, "prompt": "Write count_digits(n) that returns how many digits a non-negative integer has, using a while loop and // (no str()). count_digits(0) should return 1.", "starter_code": "def count_digits(n):\n    # your code here\n    pass", "solution": "def count_digits(n):\n    if n == 0:\n        return 1\n    digits = 0\n    while n > 0:\n        n //= 10\n        digits += 1\n    return digits", "hints": ["Each time you integer-divide by 10, the number loses its last digit. 1234 // 10 is 123.", "Keep dividing while n > 0 and count how many times you did it. 0 is a special case: handle it first.", "while n > 0: n //= 10; digits += 1"], "tests": [{"call": "count_digits(7)", "expected": "1"}, {"call": "count_digits(1234)", "expected": "4"}, {"call": "count_digits(0)", "expected": "1"}, {"call": "count_digits(100)", "expected": "3"}]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('m1-e17', 'm1-python-basics', 'flashcard', 17, '{"prompt": "Which values are ''falsy'' in Python, i.e. treated as False in an if?", "answer": "False, None, 0, 0.0, the empty string \"\" and empty collections ([], {}, (), set()). Everything else is truthy.", "explanation": "That''s why ''if my_list:'' is the idiomatic way to check that a list isn''t empty."}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

commit;
