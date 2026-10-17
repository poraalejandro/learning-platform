-- 0026: data-library side quests (Data section): s7-numpy, s8-pandas
-- s7 opens after M5 (right before embeddings); s8 needs M6 and s7.
-- 2 lessons + 12 exercises each. Idempotent: safe to re-run.

begin;

insert into skill_nodes (id, title, description, track, position, section) values
  ('s7-numpy', 'NumPy for AI work', null, 'side', 7, 'data')
  on conflict (id) do update set title=excluded.title, description=excluded.description,
    track=excluded.track, position=excluded.position, section=excluded.section;

insert into skill_nodes (id, title, description, track, position, section) values
  ('s8-pandas', 'pandas essentials', null, 'side', 8, 'data')
  on conflict (id) do update set title=excluded.title, description=excluded.description,
    track=excluded.track, position=excluded.position, section=excluded.section;

insert into skill_prerequisites (node_id, requires_node_id) values
  ('s7-numpy', 'm5-async'),
  ('s8-pandas', 'm6-rag-vectors'),
  ('s8-pandas', 's7-numpy')
  on conflict do nothing;

insert into lessons (id, node_id, title, position, content_md) values
  ('s7-l1', 's7-numpy', 'Arrays: why not just use lists?', 1, '**Before you read, predict:** what does `[1, 2, 3] * 2` give you in plain Python? And what would you *want* it to give you if those were numbers in a vector?

## The idea

A Python list can hold anything, so every operation on it goes item by item through the interpreter. A **NumPy array** holds values of a single type (its `dtype`) packed together in memory, and its operations run in compiled code over the whole block at once. That''s why NumPy is what every embedding, model and vector database library speaks underneath.

Three attributes tell you what an array is:

- `shape` — the size along each axis: `(3,)` is a vector, `(1000, 384)` is 1,000 embeddings of 384 dimensions
- `dtype` — the type of every element: `int64`, `float64`, `float32`…
- `ndim` — the number of axes (1 for a vector, 2 for a matrix)

Arithmetic is **vectorized**: `a * 2` multiplies every element, `a + b` adds element by element. No loop.

When shapes differ, NumPy **broadcasts**: it stretches the smaller array along the missing or size-1 axes. A `(2, 3)` matrix plus a `(3,)` vector adds the vector to every row.

## Example

```python
import numpy as np

a = np.array([1, 2, 3])
print(a * 2)            # [2 4 6]
print([1, 2, 3] * 2)    # [1, 2, 3, 1, 2, 3]  (a list repeats itself)

m = np.array([[1, 2, 3],
              [4, 5, 6]])
print(m.shape)          # (2, 3)
print(m + np.array([10, 20, 30]))
# [[11 22 33]
#  [14 25 36]]          the vector was added to each row

print(m.mean(axis=0))   # [2.5 3.5 4.5]  one value per column
print(m.mean(axis=1))   # [2. 5.]        one value per row
```

`axis=0` collapses the rows (you get one result per column); `axis=1` collapses the columns (one result per row).

## Recap

- Arrays have one `dtype` and a `shape`; that''s what makes them fast.
- Operators work element-wise on the whole array, no loop needed.
- Broadcasting lines shapes up from the right and stretches size-1 axes.
- `axis=0` → per column, `axis=1` → per row.
- To hand results back to plain Python, use `.tolist()` or `float(...)`.
')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title,
    position=excluded.position, content_md=excluded.content_md;

insert into lessons (id, node_id, title, position, content_md) values
  ('s7-l2', 's7-numpy', 'Masks, dot products and similarity search', 2, '**Before you read, predict:** you have 10,000 document embeddings and one query embedding. How many lines of NumPy does it take to find the 3 most similar documents?

## The idea

**Boolean masks** select elements by condition. `scores > 0.5` gives an array of `True`/`False`, and `scores[scores > 0.5]` keeps only the matching values. To combine conditions use `&` (and), `|` (or) and `~` (not), each condition **in parentheses**: Python''s `and`/`or` don''t work on arrays, they need one single True or False.

The **dot product** `a @ b` multiplies element by element and sums. Divide it by both lengths (`np.linalg.norm`) and you get the **cosine similarity** from M6: 1 for the same direction, 0 for unrelated, -1 for opposite.

With a matrix of embeddings (one per row), `matrix @ query` computes the dot product against every document at once, and `np.linalg.norm(matrix, axis=1)` gives every row''s length. `np.argsort` returns the positions that would sort the array, so the last positions of `argsort(scores)` are the best matches.

## Example

```python
import numpy as np

docs = np.array([[0.9, 0.1],
                 [0.1, 0.9],
                 [0.7, 0.7]])
query = np.array([1.0, 0.0])

scores = docs @ query / (np.linalg.norm(docs, axis=1) * np.linalg.norm(query))
print(scores.round(3))          # [0.994 0.11  0.707]

best_first = np.argsort(scores)[::-1]
print(best_first[:2].tolist())  # [0, 2]

print(scores[(scores > 0.5) & (scores < 0.9)].round(3))  # [0.707]
```

That''s the core of what a vector database does on every query, minus the clever indexing that avoids comparing against every row.

## Recap

- `arr[condition]` filters; combine conditions with `&`, `|`, `~` and parentheses.
- `a @ b` is the dot product; `matrix @ vector` does it for every row.
- Cosine similarity = dot product divided by the two norms.
- `np.argsort(scores)[::-1][:k]` gives the indices of the top-k scores.
')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title,
    position=excluded.position, content_md=excluded.content_md;

insert into lessons (id, node_id, title, position, content_md) values
  ('s8-l1', 's8-pandas', 'DataFrames: tables you can query', 1, '**Before you read, predict:** a CSV has 3 columns and 1,000 rows, and some cells are empty. In plain Python, how would you get the average of one column, skipping the empty cells?

## The idea

pandas gives you a **DataFrame**: a table with named columns, where each column is a **Series** (a NumPy array with labels). You get it from a list of dicts, a dict of lists, or a CSV.

The everyday moves:

- **Select a column**: `df["score"]` returns a Series; `df[["id", "score"]]` returns a smaller DataFrame.
- **Filter rows**: `df[df["score"] > 0.5]`. Same rules as NumPy masks: combine with `&` / `|` and parentheses.
- **Pick by label or position**: `df.loc[row_label, "col"]` uses labels, `df.iloc[0, 1]` uses positions.
- **Add a column**: `df["chars"] = df["text"].str.len()`. The `.str` accessor applies string methods to the whole column.
- **Missing values** show up as `NaN`/`None`: `df.isna()` finds them, `df.dropna()` removes those rows, `df.fillna(value)` replaces them.

To change values in rows that match a condition, use one `loc` call: `df.loc[df["score"] < 0, "score"] = 0`. Chaining `df[mask]["score"] = 0` writes to a temporary copy and leaves `df` untouched. In pandas 3 that''s guaranteed.

## Example

```python
import io
import pandas as pd

csv = """id,text,tokens
1, What is RAG? ,12
2,,0
3,Chunking strategies,310"""

df = pd.read_csv(io.StringIO(csv))
df["text"] = df["text"].str.strip()
df = df.dropna(subset=["text"])

print(df.shape)                        # (2, 3)
print(df[df["tokens"] > 100]["id"].tolist())   # [3]
print(float(df["tokens"].mean()))      # 161.0
```

## Recap

- DataFrame = table; each column is a Series.
- `df["col"]` selects, `df[mask]` filters, `.loc` / `.iloc` pick by label / position.
- `.str` gives string methods for a whole column.
- `isna`, `dropna`, `fillna` for missing data.
- Assign with `df.loc[mask, "col"] = value`, never `df[mask]["col"] = value`.
')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title,
    position=excluded.position, content_md=excluded.content_md;

insert into lessons (id, node_id, title, position, content_md) values
  ('s8-l2', 's8-pandas', 'groupby, merge and evaluating a RAG system', 2, '**Before you read, predict:** you logged 200 RAG answers with the source they came from and whether they were correct. Which source is failing the most, and how would you find out?

## The idea

**groupby** follows *split, apply, combine*: split the rows by the values of a column, apply an aggregation to each group (`mean`, `sum`, `count`, `max`…), combine the results into one Series or DataFrame indexed by the group.

`df.groupby("source")["correct"].mean()` gives the accuracy per source, since the mean of True/False is the fraction of True. Use `.agg(...)` to compute several things at once.

**merge** joins two tables on a shared column, like SQL''s JOIN. `pd.merge(results, questions, on="question_id")` attaches each question''s metadata to its result. `how="left"` keeps every row of the left table even when there''s no match.

This is the bread and butter of evaluating an AI system: log every run as a row, then slice the log by model, prompt version, source or question type until the weak spot shows up.

## Example

```python
import pandas as pd

results = pd.DataFrame({
    "question_id": [1, 2, 3, 4],
    "correct": [True, False, True, True],
})
questions = pd.DataFrame({
    "question_id": [1, 2, 3, 4],
    "source": ["faq", "faq", "manual", "manual"],
})

df = pd.merge(results, questions, on="question_id")
accuracy = df.groupby("source")["correct"].mean()
print(accuracy.to_dict())    # {''faq'': 0.5, ''manual'': 1.0}

print(df.groupby("source").agg(n=("question_id", "count"),
                               acc=("correct", "mean")))
```

## Recap

- `groupby(col)[other].agg_fn()` = one result per group.
- The mean of a boolean column is a rate.
- `merge(a, b, on=key)` joins tables; `how="left"` keeps unmatched rows.
- `.to_dict()` / `.tolist()` turn results back into plain Python.
')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title,
    position=excluded.position, content_md=excluded.content_md;

insert into exercises (id, node_id, type, position, content) values
  ('s7-e1', 's7-numpy', 'flashcard', 1, '{"prompt": "Why is a NumPy array faster than a Python list for numeric work?", "answer": "All its elements share one dtype and sit together in memory, so operations run in compiled code over the whole block at once instead of going item by item through the interpreter.", "explanation": "That''s also why arrays can''t mix types the way lists can: the speed comes from that uniformity."}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('s7-e2', 's7-numpy', 'flashcard', 2, '{"prompt": "What is broadcasting in NumPy?", "answer": "Applying an operation to arrays of different shapes by stretching the smaller one along its missing or size-1 axes, without copying data. A (2, 3) matrix + a (3,) vector adds the vector to every row.", "explanation": "Shapes are compared from the right; two dimensions are compatible if they''re equal or one of them is 1."}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('s7-e3', 's7-numpy', 'match', 3, '{"meta": {"concepts": ["arrays", "shape", "dtype", "axis"], "interview": false, "difficulty": 1}, "prompt": "Match each piece of NumPy with what it tells you or does.", "pairs": [{"term": "arr.shape", "definition": "The size along each axis, e.g. (1000, 384)"}, {"term": "arr.dtype", "definition": "The type every element shares, e.g. float32"}, {"term": "arr.mean(axis=0)", "definition": "One result per column"}, {"term": "a @ b", "definition": "Dot product (or matrix product)"}, {"term": "arr.tolist()", "definition": "Converts back to plain Python lists and numbers"}]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('s7-e4', 's7-numpy', 'predict_output', 4, '{"meta": {"concepts": ["vectorization", "arrays vs lists"], "interview": false, "difficulty": 1}, "prompt": "What does this print?", "code": "import numpy as np\n\na = np.array([1, 2, 3])\nprint(a * 2, [1, 2, 3] * 2)", "expected_output": "[2 4 6] [1, 2, 3, 1, 2, 3]", "explanation": "On an array, * 2 multiplies each element. On a list, * 2 repeats the list. NumPy prints arrays with spaces and no commas."}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('s7-e5', 's7-numpy', 'predict_output', 5, '{"meta": {"concepts": ["broadcasting", "shape"], "interview": true, "difficulty": 2}, "prompt": "A (2, 2) matrix plus a (2,) vector. What does this print?", "code": "import numpy as np\n\nm = np.array([[1, 2], [3, 4]])\nprint(m.shape, (m + np.array([10, 20])).tolist())", "expected_output": "(2, 2) [[11, 22], [13, 24]]", "explanation": "Broadcasting stretches the vector to every row: [1, 2] + [10, 20] and [3, 4] + [10, 20]. .tolist() prints it as nested Python lists."}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('s7-e6', 's7-numpy', 'code', 6, '{"meta": {"concepts": ["vectorization", "norm"], "interview": false, "difficulty": 1}, "prompt": "Write normalize(v) that returns v scaled to length 1, as a Python list with each value rounded to 4 decimals. Use NumPy, no loops. (Embeddings are often normalized like this so that the dot product equals the cosine similarity.)", "starter_code": "import numpy as np\n\ndef normalize(v):\n    # your code here\n    pass", "solution": "import numpy as np\n\ndef normalize(v):\n    v = np.asarray(v, dtype=float)\n    return (v / np.linalg.norm(v)).round(4).tolist()", "hints": ["A vector''s length is np.linalg.norm(v). Dividing every element by it gives length 1.", "Convert the input with np.asarray(v, dtype=float), divide by the norm, then .round(4).tolist().", "return (v / np.linalg.norm(v)).round(4).tolist()"], "tests": [{"call": "normalize([3, 4])", "expected": "[0.6, 0.8]"}, {"call": "normalize([2, 0, 0])", "expected": "[1.0, 0.0, 0.0]"}, {"call": "round(sum(x * x for x in normalize([1, 2, 3])), 3)", "expected": "1.0"}]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('s7-e7', 's7-numpy', 'code', 7, '{"meta": {"concepts": ["cosine similarity", "dot product", "embeddings"], "interview": true, "difficulty": 2, "recuerda_de": "m6-rag-vectors"}, "prompt": "Write cosine_similarity(a, b) for two vectors, using @ and np.linalg.norm. Return a plain Python float rounded to 4 decimals.", "starter_code": "import numpy as np\n\ndef cosine_similarity(a, b):\n    # your code here\n    pass", "solution": "import numpy as np\n\ndef cosine_similarity(a, b):\n    a = np.asarray(a, dtype=float)\n    b = np.asarray(b, dtype=float)\n    return round(float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b))), 4)", "hints": ["Cosine similarity is the dot product divided by the product of the two lengths.", "a @ b is the dot product; np.linalg.norm(x) is the length. Wrap the result in float() before rounding, so you return a Python float and not a NumPy one.", "return round(float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b))), 4)"], "tests": [{"call": "cosine_similarity([1, 0], [0, 1])", "expected": "0.0"}, {"call": "cosine_similarity([1, 2], [2, 4])", "expected": "1.0"}, {"call": "cosine_similarity([1, 0], [1, 1])", "expected": "0.7071"}, {"call": "cosine_similarity([1, 0], [-3, 0])", "expected": "-1.0"}]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('s7-e8', 's7-numpy', 'code', 8, '{"meta": {"concepts": ["similarity search", "argsort", "matrix-vector product"], "interview": true, "difficulty": 3, "recuerda_de": "m6-rag-vectors"}, "prompt": "Write top_k(query, matrix, k) that returns the row indices of the k rows of matrix most similar to query by cosine similarity, best first, as a list of ints. Compare against all rows at once: no Python loop over the rows.", "starter_code": "import numpy as np\n\ndef top_k(query, matrix, k):\n    # your code here\n    pass", "solution": "import numpy as np\n\ndef top_k(query, matrix, k):\n    m = np.asarray(matrix, dtype=float)\n    q = np.asarray(query, dtype=float)\n    scores = m @ q / (np.linalg.norm(m, axis=1) * np.linalg.norm(q))\n    return np.argsort(scores)[::-1][:k].tolist()", "hints": ["matrix @ query gives one dot product per row. np.linalg.norm(matrix, axis=1) gives one length per row.", "Divide to get one cosine score per row, then np.argsort(scores) sorts the positions from worst to best.", "return np.argsort(scores)[::-1][:k].tolist()"], "tests": [{"call": "top_k([1, 0.1], [[1, 0], [0, 1], [0.7, 0.7], [-1, 0]], 2)", "expected": "[0, 2]"}, {"call": "top_k([1, 0.1], [[1, 0], [0, 1], [0.7, 0.7], [-1, 0]], 4)", "expected": "[0, 2, 1, 3]"}, {"call": "top_k([0, 5], [[3, 0], [0, 2]], 1)", "expected": "[1]"}]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('s7-e9', 's7-numpy', 'fix_bug', 9, '{"meta": {"concepts": ["axis", "aggregation"], "interview": false, "difficulty": 1}, "prompt": "row_means should return the average of each row, but the numbers are wrong. Fix it.", "starter_code": "import numpy as np\n\ndef row_means(rows):\n    arr = np.asarray(rows, dtype=float)\n    return arr.mean(axis=0).tolist()", "solution": "import numpy as np\n\ndef row_means(rows):\n    arr = np.asarray(rows, dtype=float)\n    return arr.mean(axis=1).tolist()", "hints": ["Try it on [[1, 2, 3], [4, 5, 6]]: you want 2 results, one per row. How many do you get?", "axis=0 collapses the rows (one result per column). Which axis gives one result per row?", "Use arr.mean(axis=1)."], "tests": [{"call": "row_means([[1, 2, 3], [4, 5, 6]])", "expected": "[2.0, 5.0]"}, {"call": "row_means([[10, 20]])", "expected": "[15.0]"}]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('s7-e10', 's7-numpy', 'fix_bug', 10, '{"meta": {"concepts": ["boolean masks", "& operator"], "interview": false, "difficulty": 2}, "prompt": "in_range should keep the scores strictly between lo and hi, but it crashes. Read the error and fix the mask.", "starter_code": "import numpy as np\n\ndef in_range(scores, lo, hi):\n    s = np.asarray(scores, dtype=float)\n    return s[(s > lo) and (s < hi)].tolist()", "solution": "import numpy as np\n\ndef in_range(scores, lo, hi):\n    s = np.asarray(scores, dtype=float)\n    return s[(s > lo) & (s < hi)].tolist()", "hints": ["The error says the truth value of an array is ambiguous: `and` needs one single True or False, and an array has many.", "NumPy combines boolean arrays element by element with &, | and ~. Keep each condition in parentheses.", "return s[(s > lo) & (s < hi)].tolist()"], "tests": [{"call": "in_range([0.2, 0.6, 0.95, 0.7], 0.5, 0.9)", "expected": "[0.6, 0.7]"}, {"call": "in_range([1, 2, 3], 5, 9)", "expected": "[]"}]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('s7-e11', 's7-numpy', 'parsons', 11, '{"meta": {"concepts": ["similarity search", "argsort"], "interview": false, "difficulty": 2}, "prompt": "Put the lines in order to find the 3 documents most similar to a query. (doc_vectors and query_vector already exist.)", "lines": ["import numpy as np", "embeddings = np.array(doc_vectors)", "query = np.array(query_vector)", "scores = embeddings @ query / (np.linalg.norm(embeddings, axis=1) * np.linalg.norm(query))", "top3 = np.argsort(scores)[::-1][:3]"]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('s7-e12', 's7-numpy', 'recall', 12, '{"meta": {"concepts": ["vectorization", "performance"], "interview": true, "difficulty": 2}, "prompt": "An interviewer asks: \"You need the similarity between one query and 100,000 stored embeddings. Why not just loop over them in Python?\" Answer in your own words.", "isCode": false, "modelAnswer": "A Python loop runs the interpreter once per embedding and per dimension, which is orders of magnitude slower than doing it in compiled code. With the embeddings in one NumPy matrix, matrix @ query computes all 100,000 dot products in a single vectorized call (BLAS underneath), and np.linalg.norm(matrix, axis=1) gets all the lengths the same way. It''s also less code and fewer bugs. Past a certain size even that brute force gets slow, which is when a vector database with an approximate index (HNSW, IVF) takes over."}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('s8-e1', 's8-pandas', 'flashcard', 1, '{"prompt": "What''s the difference between df.loc and df.iloc?", "answer": "loc selects by label (index labels and column names); iloc selects by integer position, like list indexing.", "explanation": "df.loc[3, ''score''] is the row labelled 3; df.iloc[3, 0] is the 4th row, 1st column. They differ as soon as the index isn''t 0, 1, 2…, e.g. after filtering."}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('s8-e2', 's8-pandas', 'flashcard', 2, '{"prompt": "What does df.groupby(''source'')[''score''].mean() do?", "answer": "Splits the rows by the value of ''source'', takes the mean of ''score'' in each group, and returns one value per source (a Series indexed by source).", "explanation": "Split, apply, combine. Swap mean for count, sum, max or .agg(...) for several at once."}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('s8-e3', 's8-pandas', 'match', 3, '{"meta": {"concepts": ["DataFrame", "filtering", "groupby", "merge", "missing values"], "interview": false, "difficulty": 1}, "prompt": "Match each pandas expression with what it does.", "pairs": [{"term": "df[\"score\"]", "definition": "Selects one column as a Series"}, {"term": "df[df[\"score\"] > 0.5]", "definition": "Keeps only the rows that match a condition"}, {"term": "df.groupby(\"k\")[\"v\"].mean()", "definition": "Computes one aggregate per group"}, {"term": "pd.merge(a, b, on=\"id\")", "definition": "Joins two tables on a shared column"}, {"term": "df.dropna()", "definition": "Removes rows with missing values"}]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('s8-e4', 's8-pandas', 'predict_output', 4, '{"meta": {"concepts": ["filtering", "aggregation"], "interview": false, "difficulty": 1}, "prompt": "What does this print?", "code": "import pandas as pd\n\ndf = pd.DataFrame({\"doc\": [\"a\", \"b\", \"c\"], \"tokens\": [120, 80, 300]})\nprint(len(df[df[\"tokens\"] > 100]), df[\"tokens\"].max())", "expected_output": "2 300", "explanation": "The filter keeps the rows with more than 100 tokens (a and c), so len is 2. max() over the whole column is 300."}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('s8-e5', 's8-pandas', 'predict_output', 5, '{"meta": {"concepts": ["groupby"], "interview": true, "difficulty": 2}, "prompt": "What does this print?", "code": "import pandas as pd\n\ndf = pd.DataFrame({\"source\": [\"wiki\", \"pdf\", \"wiki\"], \"score\": [0.9, 0.4, 0.7]})\nprint(df.groupby(\"source\")[\"score\"].mean().round(2).to_dict())", "expected_output": "{''pdf'': 0.4, ''wiki'': 0.8}", "explanation": "Rows are grouped by source: pdf has [0.4], wiki has [0.9, 0.7] whose mean is 0.8. groupby sorts the group keys, so pdf comes first."}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('s8-e6', 's8-pandas', 'code', 6, '{"meta": {"concepts": ["data cleaning", "missing values", "str accessor", "duplicates"], "interview": true, "difficulty": 2}, "prompt": "Before indexing documents for RAG you clean them. Write clean_docs(rows), where rows is a list of dicts with \"id\" and \"text\". Strip whitespace from the text, drop rows whose text is missing or empty after stripping, drop rows whose text duplicates an earlier one, and return the remaining ids as a list in their original order.", "starter_code": "import pandas as pd\n\ndef clean_docs(rows):\n    # your code here\n    pass", "solution": "import pandas as pd\n\ndef clean_docs(rows):\n    df = pd.DataFrame(rows)\n    df[\"text\"] = df[\"text\"].fillna(\"\").str.strip()\n    df = df[df[\"text\"] != \"\"]\n    df = df.drop_duplicates(subset=\"text\")\n    return df[\"id\"].tolist()", "hints": ["Build a DataFrame, then work on the text column: missing values first, then whitespace, then empties, then duplicates.", "fillna(\"\") turns missing text into empty strings, .str.strip() trims every row, a mask removes the empty ones and drop_duplicates(subset=\"text\") keeps the first copy.", "df[\"text\"] = df[\"text\"].fillna(\"\").str.strip(); df = df[df[\"text\"] != \"\"].drop_duplicates(subset=\"text\"); return df[\"id\"].tolist()"], "tests": [{"call": "clean_docs([{''id'': 1, ''text'': '' hello ''}, {''id'': 2, ''text'': None}, {''id'': 3, ''text'': ''   ''}, {''id'': 4, ''text'': ''hello''}, {''id'': 5, ''text'': ''world''}])", "expected": "[1, 5]"}, {"call": "clean_docs([{''id'': 7, ''text'': ''a''}, {''id'': 8, ''text'': ''b''}])", "expected": "[7, 8]"}]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('s8-e7', 's8-pandas', 'code', 7, '{"meta": {"concepts": ["read_csv", "aggregation", "missing values"], "interview": false, "difficulty": 1}, "prompt": "Write mean_score(csv_text) that reads CSV text with a \"score\" column and returns the mean score as a plain Python float rounded to 3 decimals. Empty cells must be ignored, not counted as 0. Use io.StringIO to read the text as if it were a file.", "starter_code": "import io\nimport pandas as pd\n\ndef mean_score(csv_text):\n    # your code here\n    pass", "solution": "import io\nimport pandas as pd\n\ndef mean_score(csv_text):\n    df = pd.read_csv(io.StringIO(csv_text))\n    return round(float(df[\"score\"].mean()), 3)", "hints": ["pd.read_csv accepts any file-like object, and io.StringIO(text) makes one from a string.", "pandas reads empty cells as NaN, and .mean() already skips NaN. Convert with float() before rounding.", "return round(float(pd.read_csv(io.StringIO(csv_text))[\"score\"].mean()), 3)"], "tests": [{"call": "mean_score(''q,score\\na,0.5\\nb,1.0\\nc,0.75'')", "expected": "0.75"}, {"call": "mean_score(''q,score\\na,0.2\\nb,\\nc,0.4'')", "expected": "0.3"}]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('s8-e8', 's8-pandas', 'code', 8, '{"meta": {"concepts": ["merge", "groupby", "RAG evaluation"], "interview": true, "difficulty": 2, "recuerda_de": "m6-rag-vectors"}, "prompt": "You evaluated your RAG retriever. results is a list of dicts {question_id, hit} (hit = the right chunk was retrieved), and questions is a list of dicts {question_id, source}. Write hit_rate_by_source(results, questions) that returns a dict source -> hit rate rounded to 2 decimals.", "starter_code": "import pandas as pd\n\ndef hit_rate_by_source(results, questions):\n    # your code here\n    pass", "solution": "import pandas as pd\n\ndef hit_rate_by_source(results, questions):\n    df = pd.merge(pd.DataFrame(results), pd.DataFrame(questions), on=\"question_id\")\n    return df.groupby(\"source\")[\"hit\"].mean().round(2).to_dict()", "hints": ["The source lives in the other table: join the two on question_id first.", "pd.merge(..., on=\"question_id\"), then group by source. The mean of a True/False column is the rate of True.", "return df.groupby(\"source\")[\"hit\"].mean().round(2).to_dict()"], "tests": [{"call": "hit_rate_by_source([{''question_id'': 1, ''hit'': True}, {''question_id'': 2, ''hit'': False}, {''question_id'': 3, ''hit'': True}], [{''question_id'': 1, ''source'': ''faq''}, {''question_id'': 2, ''source'': ''faq''}, {''question_id'': 3, ''source'': ''manual''}])", "expected": "{''faq'': 0.5, ''manual'': 1.0}"}, {"call": "hit_rate_by_source([{''question_id'': 9, ''hit'': False}], [{''question_id'': 9, ''source'': ''pdf''}])", "expected": "{''pdf'': 0.0}"}]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('s8-e9', 's8-pandas', 'fix_bug', 9, '{"meta": {"concepts": ["filtering", "operator precedence"], "interview": false, "difficulty": 2}, "prompt": "strong_wiki should return the ids of rows from the \"wiki\" source with a score above 0.5, but it crashes. Read the error and fix the filter.", "starter_code": "import pandas as pd\n\ndef strong_wiki(rows):\n    df = pd.DataFrame(rows)\n    return df[df[\"score\"] > 0.5 & df[\"source\"] == \"wiki\"][\"id\"].tolist()", "solution": "import pandas as pd\n\ndef strong_wiki(rows):\n    df = pd.DataFrame(rows)\n    return df[(df[\"score\"] > 0.5) & (df[\"source\"] == \"wiki\")][\"id\"].tolist()", "hints": ["& binds tighter than > and ==, so Python is trying to compute 0.5 & df[\"source\"] first.", "Wrap each condition in its own parentheses so each comparison is done before combining.", "df[(df[\"score\"] > 0.5) & (df[\"source\"] == \"wiki\")]"], "tests": [{"call": "strong_wiki([{''id'': 1, ''source'': ''wiki'', ''score'': 0.9}, {''id'': 2, ''source'': ''pdf'', ''score'': 0.8}, {''id'': 3, ''source'': ''wiki'', ''score'': 0.3}])", "expected": "[1]"}]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('s8-e10', 's8-pandas', 'fix_bug', 10, '{"meta": {"concepts": ["loc", "copy-on-write", "chained assignment"], "interview": true, "difficulty": 2}, "prompt": "clip_negative should replace negative scores with 0, but the scores come back unchanged. No error, it just doesn''t work. Find out why and fix it.", "starter_code": "import pandas as pd\n\ndef clip_negative(rows):\n    df = pd.DataFrame(rows)\n    df[df[\"score\"] < 0][\"score\"] = 0\n    return df[\"score\"].tolist()", "solution": "import pandas as pd\n\ndef clip_negative(rows):\n    df = pd.DataFrame(rows)\n    df.loc[df[\"score\"] < 0, \"score\"] = 0\n    return df[\"score\"].tolist()", "hints": ["df[mask] builds a new, temporary DataFrame. Which object does [\"score\"] = 0 actually write to?", "To assign into the original rows and column in one step, use .loc with the mask and the column name.", "df.loc[df[\"score\"] < 0, \"score\"] = 0"], "tests": [{"call": "clip_negative([{''score'': 0.5}, {''score'': -0.2}, {''score'': -1}])", "expected": "[0.5, 0.0, 0.0]"}]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('s8-e11', 's8-pandas', 'parsons', 11, '{"meta": {"concepts": ["evaluation", "groupby"], "interview": false, "difficulty": 2}, "prompt": "Put the lines in order to compute each model''s accuracy from an evaluation log. (eval_rows already exists.)", "lines": ["import pandas as pd", "df = pd.DataFrame(eval_rows)", "df = df.dropna(subset=[\"answer\"])", "df[\"correct\"] = df[\"answer\"] == df[\"expected\"]", "accuracy = df.groupby(\"model\")[\"correct\"].mean()", "print(accuracy.sort_values(ascending=False))"]}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

insert into exercises (id, node_id, type, position, content) values
  ('s8-e12', 's8-pandas', 'recall', 12, '{"meta": {"concepts": ["pandas", "trade-offs"], "interview": true, "difficulty": 2}, "prompt": "In your own words: in an AI pipeline, when is pandas the right tool, and when are plain lists and dicts (or something else) better?", "isCode": false, "modelAnswer": "pandas shines on tabular, batch work: loading CSVs or logs, cleaning documents before indexing, and slicing evaluation results by model, prompt or source with filters, groupby and merge. For the request path of a live service (one query, one document) it''s overhead: plain dicts, lists or Pydantic models are lighter and clearer. For data that doesn''t fit in memory you''d move to a database, DuckDB or Polars. Rule of thumb: pandas for analysis and offline jobs, plain Python for per-request logic."}'::jsonb)
  on conflict (id) do update set node_id=excluded.node_id, type=excluded.type,
    position=excluded.position, content=excluded.content;

commit;
