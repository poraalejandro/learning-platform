-- English migration, step 2: M1-M3 exercises + lessons content. Idempotent (plain updates by id).

update exercises set content = '{"prompt": "What does Python use to mark code blocks, if it doesn''t use braces {}?", "answer": "Indentation (the whitespace at the start of a line). It must be consistent or the program fails.", "explanation": "Unlike Java or C, in Python indentation IS the syntax: it defines which lines belong to an if, loop, or function."}'::jsonb where id = 'm1-e1';
update exercises set content = '{"prompt": "What''s the difference between = and ==?", "answer": "= assigns a value to a variable; == compares whether two values are equal and returns True or False.", "explanation": "Mixing them up is a classic mistake: using = where you meant to compare changes the value instead of asking about it."}'::jsonb where id = 'm1-e2';
update exercises set content = '{"prompt": "What numbers does range(5) generate?", "answer": "0, 1, 2, 3, 4 -- it starts at 0 and doesn''t include the upper limit.", "explanation": "range(n) goes from 0 to n-1. range(1, 6) would go from 1 to 5."}'::jsonb where id = 'm1-e3';
update exercises set content = '{"prompt": "Which keyword stops a loop immediately?", "answer": "break. (continue, instead, skips to the next iteration without exiting the loop.)", "explanation": "break ends the whole loop; continue only skips the rest of the current iteration."}'::jsonb where id = 'm1-e4';
update exercises set content = '{"prompt": "What''s the modern way to insert a variable inside a string?", "answer": "The f-string: f\"Hello {name}\" -- an f before the quote and the variable inside braces.", "explanation": "More readable than concatenating with + and it accepts any data type directly."}'::jsonb where id = 'm1-e5';
update exercises set content = '{"isCode": true, "prompt": "From memory, write an if/elif/else that, given a number n, prints ''positive'', ''negative'', or ''zero''.", "modelAnswer": "n = -5\nif n > 0:\n    print(\"positive\")\nelif n < 0:\n    print(\"negative\")\nelse:\n    print(\"zero\")"}'::jsonb where id = 'm1-e6';
update exercises set content = '{"prompt": "Write a function is_even(number) that returns True if the number is even and False if it''s odd.", "starter_code": "def is_even(number):\n    # your code here\n    pass", "tests": [{"call": "is_even(4)", "expected": "True"}, {"call": "is_even(7)", "expected": "False"}, {"call": "is_even(0)", "expected": "True"}], "hints": ["Use the modulo operator % to find the remainder of dividing by 2.", "A number is even if number % 2 equals 0.", "return number % 2 == 0"], "solution": "def is_even(number):\n    return number % 2 == 0"}'::jsonb where id = 'm1-e7';
update exercises set content = '{"prompt": "What''s the difference between a list and a tuple?", "answer": "A list is mutable (you can change it after creating it); a tuple is immutable.", "explanation": "Use a tuple for data that shouldn''t change; a list for collections that evolve."}'::jsonb where id = 'm2-e1';
update exercises set content = '{"prompt": "How do you access the last element of a list without knowing its length?", "answer": "With index -1: list[-1]. -2 would be the second-to-last.", "explanation": "Negative indices count from the end."}'::jsonb where id = 'm2-e2';
update exercises set content = '{"prompt": "What''s the safe way to read a dictionary key that might not exist?", "answer": "dict.get(\"key\") -- returns None if it doesn''t exist, instead of raising an error like dict[\"key\"].", "explanation": "dict.get() avoids the KeyError; you can even give a default value: dict.get(\"k\", 0)."}'::jsonb where id = 'm2-e3';
update exercises set content = '{"prompt": "Which collection would you use to quickly remove duplicates from a list?", "answer": "A set: set(list) keeps only unique values.", "explanation": "Sets don''t allow duplicates and don''t guarantee order."}'::jsonb where id = 'm2-e4';
update exercises set content = '{"isCode": true, "prompt": "From memory, write a list comprehension that returns the squares of the numbers from 1 to 5.", "modelAnswer": "squares = [n**2 for n in range(1, 6)]\n# [1, 4, 9, 16, 25]"}'::jsonb where id = 'm2-e5';
update exercises set content = '{"prompt": "Write sum_list(numbers) that adds up all the numbers in a list using a for loop (without using sum()).", "starter_code": "def sum_list(numbers):\n    # your code here\n    pass", "tests": [{"call": "sum_list([1,2,3])", "expected": "6"}, {"call": "sum_list([])", "expected": "0"}, {"call": "sum_list([10,-5])", "expected": "5"}], "hints": ["Create an accumulator variable starting at 0.", "Loop through it with for and add each element to the accumulator.", "total = 0; for n in numbers: total += n; return total"], "solution": "def sum_list(numbers):\n    total = 0\n    for n in numbers:\n        total += n\n    return total"}'::jsonb where id = 'm2-e6';
update exercises set content = '{"prompt": "Write count_words(text) that returns a dict with each word and how many times it appears.", "starter_code": "def count_words(text):\n    # your code here\n    pass", "tests": [{"call": "count_words(''a b a'')", "expected": "{''a'': 2, ''b'': 1}"}, {"call": "count_words('''')", "expected": "{}"}], "hints": ["Use text.split() to get the list of words.", "Use a dict and dict.get(word, 0) to accumulate.", "for w in text.split(): d[w] = d.get(w,0)+1"], "solution": "def count_words(text):\n    d = {}\n    for w in text.split():\n        d[w] = d.get(w, 0) + 1\n    return d"}'::jsonb where id = 'm2-e7';
update exercises set content = '{"prompt": "This function adds an item to a list and returns it. Called several times without passing a list, it should always return a list with just one item, but it keeps accumulating. Fix it.", "starter_code": "def add(x, items=[]):\n    items.append(x)\n    return items", "tests": [{"call": "add(1); add(2)", "expected": "[2]"}, {"call": "add(5, [1, 2])", "expected": "[1, 2, 5]"}, {"call": "add(''a'') == [''a'']", "expected": "True"}], "hints": ["Default values are evaluated only once, when the function is defined, not on every call.", "Use an immutable default (None) as a sentinel and create the list inside.", "if items is None: items = []"], "solution": "def add(x, items=None):\n    if items is None:\n        items = []\n    items.append(x)\n    return items", "meta": {"difficulty": 2, "interview": true, "concepts": ["mutable default arguments", "lists"]}}'::jsonb where id = 'm2-fixbug1';
update exercises set content = '{"prompt": "What does this code print? Think about what the variables share and what they don''t.", "code": "a = [1, 2, 3]\nb = a\nc = a[:]\nb.append(4)\nc.append(5)\nprint(a)\nprint(c)\nprint(a is b, a is c)", "expected_output": "[1, 2, 3, 4]\n[1, 2, 3, 5]\nTrue False", "explanation": "b = a doesn''t copy anything: both names point to the same list, so appending to b is also seen in a. a[:] creates a new (shallow) copy, which is why c evolves separately. is compares identity, not content.", "meta": {"difficulty": 2, "interview": true, "concepts": ["aliasing", "shallow copy", "is vs =="]}}'::jsonb where id = 'm2-predict1';
update exercises set content = '{"prompt": "Match each construct with what it produces.", "pairs": [{"term": "[x*2 for x in range(3)]", "definition": "A full list in memory: [0, 2, 4]"}, {"term": "(x*2 for x in range(3))", "definition": "A lazy generator: produces values only as you iterate"}, {"term": "{x: x*2 for x in range(3)}", "definition": "A dictionary: {0: 0, 1: 2, 2: 4}"}, {"term": "{x*2 for x in range(3)}", "definition": "A set with no duplicates or guaranteed order"}, {"term": "list(map(lambda x: x*2, range(3)))", "definition": "The same list as the comprehension, in a functional style"}], "meta": {"difficulty": 2, "interview": false, "concepts": ["comprehensions", "generators"]}}'::jsonb where id = 'm2-match1';
update exercises set content = '{"prompt": "Order the lines to count how many times each word appears in a list, using dict.get with a default value.", "lines": ["def count_words(words):", "    counts = {}", "    for w in words:", "        counts[w] = counts.get(w, 0) + 1", "    return counts"], "meta": {"difficulty": 1, "interview": false, "concepts": ["dictionaries", "dict.get"]}}'::jsonb where id = 'm2-parsons1';
update exercises set content = '{"prompt": "What is a class and what is an instance?", "answer": "The class is the template (defines attributes and methods); the instance is a concrete object created from it.", "explanation": "class Dog defines what a dog is; my_dog = Dog() creates a concrete one."}'::jsonb where id = 'm3-e1';
update exercises set content = '{"prompt": "What is the __init__ method for in a class?", "answer": "It''s the constructor: it runs when the instance is created and is used to initialize its attributes.", "explanation": "def __init__(self, name): self.name = name -- stores the name on every new object."}'::jsonb where id = 'm3-e2';
update exercises set content = '{"prompt": "What does self represent in a class method?", "answer": "The instance the method is called on; it gives access to its attributes and other methods.", "explanation": "Python passes it automatically; that''s why it''s the first parameter of instance methods."}'::jsonb where id = 'm3-e3';
update exercises set content = '{"prompt": "What is inheritance in OOP?", "answer": "That a class (child) receives attributes and methods from another (parent), and can add or override behavior.", "explanation": "class Cat(Animal) makes Cat inherit everything from Animal."}'::jsonb where id = 'm3-e4';
update exercises set content = '{"isCode": true, "prompt": "From memory, write a Counter class with an increment() method that adds 1 to an attribute self.value (starts at 0), and a current() method that returns it.", "modelAnswer": "class Counter:\n    def __init__(self):\n        self.value = 0\n\n    def increment(self):\n        self.value += 1\n\n    def current(self):\n        return self.value"}'::jsonb where id = 'm3-e5';
update exercises set content = '{"prompt": "Create a BankAccount class with __init__(self, balance=0), a deposit(amount) method that adds to the balance, and a check_balance() method that returns the balance. deposit should ignore negative amounts.", "starter_code": "class BankAccount:\n    # your code here\n    pass", "tests": [{"call": "c = BankAccount(); c.deposit(100); c.check_balance()", "expected": "100"}, {"call": "c = BankAccount(50); c.deposit(-10); c.check_balance()", "expected": "50"}], "hints": ["In __init__, store the starting balance in self.balance.", "deposit adds to self.balance only if amount > 0.", "check_balance does return self.balance"], "solution": "class BankAccount:\n    def __init__(self, balance=0):\n        self.balance = balance\n\n    def deposit(self, amount):\n        if amount > 0:\n            self.balance += amount\n\n    def check_balance(self):\n        return self.balance"}'::jsonb where id = 'm3-e6';

update lessons set content_md = $md$## Indentation is the syntax

Unlike Java, C, or JavaScript, Python doesn't use braces `{}` to mark
code blocks. It uses **indentation** (the whitespace at the start of a
line). Everything indented at the same level belongs to the same block:

```python
def greet(name):
    if name:
        print(f"Hello, {name}")
    else:
        print("Hello, stranger")
```

If the indentation isn't consistent, Python raises an `IndentationError` --
it's not a style warning, it's a real error. The standard convention is
**4 spaces** per level (no tabs).

## Assignment (`=`) vs comparison (`==`)

One of the most common mistakes when starting out:

```python
age = 25      # assigns 25 to the variable age
age == 25     # compares: is age equal to 25? -> True
```

`=` changes the value. `==` asks whether two values are equal and returns
`True` or `False`. Mixing them up usually causes syntax errors (`if age = 25`
isn't valid) or, worse, silent bugs in contexts where it *is* valid.

## f-strings: the modern way to build text

```python
name = "Ana"
points = 42
print(f"{name} has {points} points")
# Ana has 42 points
```

An `f` before the quotes turns on the f-string: anything between `{}`
is evaluated as Python code. It works with expressions, not just variables:

```python
print(f"Double that is {points * 2}")
```

## Control flow: `if` / `elif` / `else`

```python
if points >= 50:
    level = "advanced"
elif points >= 20:
    level = "intermediate"
else:
    level = "beginner"
```

Python evaluates the conditions in order and runs the first block whose
result is `True`. `elif` is short for "else if" -- you can chain as many
as you need.

## Loops: `for`, `range()`, `break`, and `continue`

```python
for i in range(5):
    print(i)
# 0 1 2 3 4
```

`range(n)` generates numbers from `0` up to `n - 1` -- it doesn't include
`n`. If you need a different starting point: `range(2, 6)` gives
`2, 3, 4, 5`.

Inside a loop, two keywords change the flow:

```python
for n in range(10):
    if n == 3:
        continue   # skip this round, move to the next
    if n == 6:
        break      # stop the loop entirely, right here
    print(n)
# 0 1 2 4 5
```

`continue` skips the rest of that specific round. `break` ends the loop
completely, without running the rounds that were left.

## Quick recap

- Indentation defines blocks -- no exceptions.
- `=` assigns, `==` compares.
- `f"text {expression}"` interpolates any Python expression.
- `elif` chains conditions without nesting `if`s.
- `range(n)` doesn't include `n`; `break` stops the loop, `continue` skips the round.
$md$ where id = 'm1-lesson-basics';
update lessons set content_md = $md$**Before reading, predict:** `a = [1, 2]; b = a; b.append(3)` -- what does `a` contain?

## The idea
A variable in Python doesn't *contain* a list: it *points* to it. `b = a` creates a second name for the same object. If you want an independent list, you have to copy it: `a[:]`, `list(a)`, or `a.copy()`. All of these are *shallow* copies: the elements are still shared if they're mutable (a list of lists).

## Example
```python
a = [1, 2]
b = a          # same object
c = a.copy()   # new object
b.append(3)
print(a, c)    # [1, 2, 3] [1, 2]
print(a is b, a == c)  # True False
```

## The typical mistake
Mutable default arguments. `def f(x, items=[])` creates **one** list when the function is defined and reuses it across every call. The correct pattern is `items=None` and creating it inside.

## What they ask in interviews
"What's the difference between `is` and `==`?" -- `is` compares identity (same object), `==` compares value. "What does this code print with `items=[]` as default?" is a classic to check whether you understand the object model.
$md$ where id = 'm2-l1';
update lessons set content_md = $md$**Before reading, predict:** how much memory does `(x*x for x in range(10**9))` use?

## The idea
A list comprehension `[f(x) for x in xs]` builds the whole list in memory. A generator `(f(x) for x in xs)` produces each value when someone asks for it and stores nothing. If you're only going to walk through the result once (sum it, pass it to `max`, write it to a file), the generator is the right choice: same code, constant memory.

## Example
```python
total = sum(x*x for x in range(10**6))   # no intermediate list
evens = [x for x in data if x % 2 == 0]  # yes, if you'll index or reuse it
```
Dict comprehensions `{k: v for ...}` and set comprehensions `{x for ...}` also exist.

## The typical mistake
A generator can only be walked through once. `g = (x for x in xs); list(g); list(g)` returns an empty list the second time. If you need two passes, materialize it.

## What they ask in interviews
"When would you use a generator?" -- when the data is large or infinite and consumed sequentially. In a RAG pipeline, reading chunks from a file with millions of lines is exactly this case.
$md$ where id = 'm2-l2';
update lessons set content_md = $md$**Before reading, predict:** if you define `def greet(self)` and call `p.greet()`, who passes `self`?

## The idea
A class is a template; an instance is a concrete object created from it. `__init__` runs when the instance is created and is where attributes get stored. `self` is the instance the method is called on: Python passes it automatically, which is why it appears as the first parameter but not in the call.

## Example
```python
class Account:
    def __init__(self, balance=0):
        self.balance = balance
    def deposit(self, amount):
        if amount > 0:
            self.balance += amount

a = Account(50)
a.deposit(25)   # Python calls Account.deposit(a, 25)
```

## The typical mistake
Forgetting `self` in the method definition (`def deposit(amount)`) or writing `balance` instead of `self.balance`, creating a local variable that dies when the method ends.

## What they ask in interviews
"What's the difference between a class attribute and an instance attribute?" -- the class one is defined outside `__init__` and shared by every instance; the instance one lives on `self` and belongs to each object.
$md$ where id = 'm3-l1';
update lessons set content_md = $md$**Before reading, predict:** should a `Square` inherit from `Rectangle`?

## The idea
Inheritance (`class Cat(Animal)`) expresses "is-a": the child receives the parent's methods and can override them. `super().__init__()` calls the parent's constructor so it can initialize its own state. Composition expresses "has-a": an object stores another as an attribute and delegates to it. Composition couples less and is easier to change; inheritance is reserved for real hierarchies where substitution actually makes sense.

## Example
```python
class Animal:
    def __init__(self, name):
        self.name = name
    def speak(self):
        return '...'

class Dog(Animal):
    def speak(self):
        return 'woof'
```

## The typical mistake
Inheriting to reuse code when the relationship isn't "is-a". The Square/Rectangle case: a square *is* a rectangle in geometry, but if `set_width` has to keep the sides equal, it breaks what code using `Rectangle` expects. That's a Liskov violation (you'll see it in SOLID).

## What they ask in interviews
"When do you prefer composition?" -- almost whenever you can: it's more flexible, more testable, and doesn't create fragile hierarchies.
$md$ where id = 'm3-l2';
