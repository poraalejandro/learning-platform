-- The predict_output placeholder used variables named x and y. In a Spanish
-- explanation "Modificar y también modifica x" reads as "modifying AND also
-- modifies x" — the variable name collides with the conjunction "y" and the
-- sentence becomes unparseable. Renamed to lista_a/lista_b, which also makes
-- the point about two names pointing at one object clearer.

update public.exercises
set content = '{
  "prompt": "¿Qué imprime este código? No lo ejecutes, razónalo primero.",
  "code": "lista_a = [1, 2, 3]\nlista_b = lista_a\nlista_b.append(4)\nprint(lista_a)",
  "expected_output": "[1, 2, 3, 4]",
  "explanation": "La línea lista_b = lista_a no crea una lista nueva: deja los dos nombres apuntando a la misma lista en memoria. Por eso, al añadir un elemento usando lista_b, lista_a refleja ese mismo cambio. Para obtener una copia independiente harías lista_b = lista_a.copy()."
}'::jsonb
where id = 'm2-predict1';
