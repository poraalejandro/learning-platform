-- PLACEHOLDER content, same spirit as 0005: one exercise per new Phase 4
-- type (fix_bug, predict_output, match, parsons) on m2-data-structures,
-- purely to prove each engine works end-to-end. Replace with real content
-- later, same as the rest of the placeholder content.

insert into public.exercises (id, node_id, type, position, content) values
  (
    'm2-fixbug1',
    'm2-data-structures',
    'fix_bug',
    8,
    '{
      "prompt": "Esta función debería sumar todos los números de una lista, pero tiene un bug. Arréglalo.",
      "starter_code": "def suma_lista(numeros):\n    total = 0\n    for n in numeros:\n        total = n\n    return total\n",
      "tests": [
        {"call": "suma_lista([1, 2, 3])", "expected": "6"},
        {"call": "suma_lista([])", "expected": "0"},
        {"call": "suma_lista([10, -5])", "expected": "5"}
      ],
      "hints": [
        "Ejecuta mentalmente el bucle con [1, 2, 3]: ¿qué valor tiene total al final de cada vuelta?",
        "total = n reemplaza el valor en cada vuelta en vez de acumularlo.",
        "Cambia total = n por total += n"
      ],
      "solution": "def suma_lista(numeros):\n    total = 0\n    for n in numeros:\n        total += n\n    return total\n"
    }'::jsonb
  ),
  (
    'm2-predict1',
    'm2-data-structures',
    'predict_output',
    9,
    '{
      "prompt": "¿Qué imprime este código? No lo ejecutes, razónalo primero.",
      "code": "x = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)",
      "expected_output": "[1, 2, 3, 4]",
      "explanation": "y = x no copia la lista, hace que y apunte al mismo objeto que x. Modificar y también modifica x."
    }'::jsonb
  ),
  (
    'm2-match1',
    'm2-data-structures',
    'match',
    10,
    '{
      "prompt": "Une cada estructura de datos con su definición.",
      "pairs": [
        {"term": "list", "definition": "Colección ordenada y mutable"},
        {"term": "tuple", "definition": "Colección ordenada e inmutable"},
        {"term": "set", "definition": "Colección sin orden ni duplicados"},
        {"term": "dict", "definition": "Colección de pares clave-valor"}
      ]
    }'::jsonb
  ),
  (
    'm2-parsons1',
    'm2-data-structures',
    'parsons',
    11,
    '{
      "prompt": "Ordena estas líneas para formar una función que encuentre el número máximo de una lista sin usar max().",
      "lines": [
        "def encontrar_maximo(numeros):",
        "    maximo = numeros[0]",
        "    for n in numeros:",
        "        if n > maximo:",
        "            maximo = n",
        "    return maximo"
      ]
    }'::jsonb
  );
