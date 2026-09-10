-- PLACEHOLDER content. Phase 1's brief calls for "one real content unit
-- migrated from the existing learning app," but that app wasn't reachable
-- while building this migration. These two `code` exercises exist only to
-- prove the exercises table / JSONB content shape end-to-end for the Phase
-- 1 skill tree UI. Replace with real migrated content before Phase 2.

insert into public.exercises (id, node_id, type, position, content) values
  (
    'm2-ex1-reverse-list',
    'm2-data-structures',
    'code',
    1,
    '{
      "prompt": "Escribe una función reverse_list(items) que devuelva la lista invertida, sin usar items[::-1] ni reversed().",
      "starter_code": "def reverse_list(items):\n    pass\n",
      "tests": [
        {"call": "reverse_list([1, 2, 3])", "expected": [3, 2, 1]},
        {"call": "reverse_list([])", "expected": []},
        {"call": "reverse_list([\"a\"])", "expected": ["a"]}
      ],
      "hints": [
        "Piensa en recorrer la lista de atrás hacia adelante con un índice.",
        "Puedes construir una lista nueva y usar .insert(0, item) o .append() recorriendo al revés.",
        "for i in range(len(items) - 1, -1, -1): ..."
      ],
      "solution": "def reverse_list(items):\n    result = []\n    for i in range(len(items) - 1, -1, -1):\n        result.append(items[i])\n    return result\n"
    }'::jsonb
  ),
  (
    'm2-ex2-merge-dicts',
    'm2-data-structures',
    'code',
    2,
    '{
      "prompt": "Escribe una función merge_dicts(a, b) que devuelva un nuevo diccionario con las claves de ambos. Si una clave existe en los dos, gana el valor de b.",
      "starter_code": "def merge_dicts(a, b):\n    pass\n",
      "tests": [
        {"call": "merge_dicts({\"x\": 1}, {\"y\": 2})", "expected": {"x": 1, "y": 2}},
        {"call": "merge_dicts({\"x\": 1}, {\"x\": 9})", "expected": {"x": 9}},
        {"call": "merge_dicts({}, {})", "expected": {}}
      ],
      "hints": [
        "Un dict tiene un método para actualizarse con los pares de otro dict.",
        "a.copy() te da una copia que puedes modificar sin tocar el original.",
        "result = a.copy(); result.update(b); return result"
      ],
      "solution": "def merge_dicts(a, b):\n    result = a.copy()\n    result.update(b)\n    return result\n"
    }'::jsonb
  );
