-- Seed de contenido real para M1, M2, M3
-- Migrado de la app anterior (ai-engineer-trainer) + OOP nuevo para M3
-- Reemplaza los ejercicios placeholder de 0005. Idempotente vía DELETE+INSERT.

-- Limpia placeholders previos de estos nodos antes de insertar
delete from exercises where node_id in ('m1-python-basics','m2-data-structures','m3-oop');

-- ===== M1 =====
insert into exercises (id, node_id, type, position, content) values
  ('m1-e1', 'm1-python-basics', 'flashcard', 1, '{"prompt": "¿Qué usa Python para marcar los bloques de código, si no usa llaves {}?", "answer": "La indentación (los espacios al principio de línea). Debe ser consistente o el programa falla.", "explanation": "A diferencia de Java o C, en Python la sangría ES la sintaxis: define qué líneas pertenecen a un if, bucle o función."}'::jsonb);
insert into exercises (id, node_id, type, position, content) values
  ('m1-e2', 'm1-python-basics', 'flashcard', 2, '{"prompt": "¿Qué diferencia hay entre = y == ?", "answer": "= asigna un valor a una variable; == compara si dos valores son iguales y devuelve True o False.", "explanation": "Confundirlos es un error clásico: usar = donde querías comparar cambia el valor en vez de preguntarlo."}'::jsonb);
insert into exercises (id, node_id, type, position, content) values
  ('m1-e3', 'm1-python-basics', 'flashcard', 3, '{"prompt": "¿Qué números genera range(5)?", "answer": "0, 1, 2, 3, 4 — empieza en 0 y no incluye el límite superior.", "explanation": "range(n) va de 0 a n-1. range(1,6) iría de 1 a 5."}'::jsonb);
insert into exercises (id, node_id, type, position, content) values
  ('m1-e4', 'm1-python-basics', 'flashcard', 4, '{"prompt": "¿Qué palabra clave corta un bucle inmediatamente?", "answer": "break. (continue en cambio salta a la siguiente iteración sin salir del bucle.)", "explanation": "break termina el bucle entero; continue solo se salta el resto de la iteración actual."}'::jsonb);
insert into exercises (id, node_id, type, position, content) values
  ('m1-e5', 'm1-python-basics', 'flashcard', 5, '{"prompt": "¿Cuál es la forma moderna de insertar una variable dentro de un string?", "answer": "El f-string: f\"Hola {nombre}\" — una f antes de la comilla y la variable entre llaves.", "explanation": "Más legible que concatenar con + y admite cualquier tipo de dato directamente."}'::jsonb);
insert into exercises (id, node_id, type, position, content) values
  ('m1-e6', 'm1-python-basics', 'recall', 6, '{"prompt": "Escribe de memoria un if/elif/else que, dado un número n, imprima ''positivo'', ''negativo'' o ''cero''.", "isCode": true, "modelAnswer": "n = -5\nif n > 0:\n    print(\"positivo\")\nelif n < 0:\n    print(\"negativo\")\nelse:\n    print(\"cero\")"}'::jsonb);
insert into exercises (id, node_id, type, position, content) values
  ('m1-e7', 'm1-python-basics', 'code', 7, '{"prompt": "Escribe una función es_par(numero) que devuelva True si el número es par y False si es impar.", "starter_code": "def es_par(numero):\n    # tu código aquí\n    pass", "tests": [{"call": "es_par(4)", "expected": "True"}, {"call": "es_par(7)", "expected": "False"}, {"call": "es_par(0)", "expected": "True"}], "hints": ["Usa el operador módulo % para saber el resto de dividir entre 2.", "Un número es par si numero % 2 es igual a 0.", "return numero % 2 == 0"], "solution": "def es_par(numero):\n    return numero % 2 == 0"}'::jsonb);

-- ===== M2 =====
insert into exercises (id, node_id, type, position, content) values
  ('m2-e1', 'm2-data-structures', 'flashcard', 1, '{"prompt": "¿Diferencia entre una lista y una tupla?", "answer": "La lista es mutable (se puede modificar tras crearla); la tupla es inmutable.", "explanation": "Usa tupla para datos que no deberían cambiar; lista para colecciones que evolucionan."}'::jsonb);
insert into exercises (id, node_id, type, position, content) values
  ('m2-e2', 'm2-data-structures', 'flashcard', 2, '{"prompt": "¿Cómo accedes al último elemento de una lista sin saber su longitud?", "answer": "Con el índice -1: lista[-1]. El -2 sería el penúltimo.", "explanation": "Los índices negativos cuentan desde el final."}'::jsonb);
insert into exercises (id, node_id, type, position, content) values
  ('m2-e3', 'm2-data-structures', 'flashcard', 3, '{"prompt": "¿Cuál es la forma segura de leer una clave de un diccionario que puede no existir?", "answer": "dic.get(\"clave\") — devuelve None si no existe, en vez de lanzar un error como dic[\"clave\"].", "explanation": "dic.get() evita el KeyError; incluso puedes dar un valor por defecto: dic.get(\"k\", 0)."}'::jsonb);
insert into exercises (id, node_id, type, position, content) values
  ('m2-e4', 'm2-data-structures', 'flashcard', 4, '{"prompt": "¿Qué colección usarías para eliminar duplicados de una lista rápidamente?", "answer": "Un set: set(lista) guarda solo valores únicos.", "explanation": "Los sets no admiten duplicados y no garantizan orden."}'::jsonb);
insert into exercises (id, node_id, type, position, content) values
  ('m2-e5', 'm2-data-structures', 'recall', 5, '{"prompt": "Escribe de memoria una list comprehension que devuelva los cuadrados de los números del 1 al 5.", "isCode": true, "modelAnswer": "cuadrados = [n**2 for n in range(1, 6)]\n# [1, 4, 9, 16, 25]"}'::jsonb);
insert into exercises (id, node_id, type, position, content) values
  ('m2-e6', 'm2-data-structures', 'code', 6, '{"prompt": "Escribe suma_lista(numeros) que sume todos los números de una lista usando un bucle for (sin usar sum()).", "starter_code": "def suma_lista(numeros):\n    # tu código aquí\n    pass", "tests": [{"call": "suma_lista([1,2,3])", "expected": "6"}, {"call": "suma_lista([])", "expected": "0"}, {"call": "suma_lista([10,-5])", "expected": "5"}], "hints": ["Crea una variable acumuladora que empiece en 0.", "Recórrela con for y ve sumando cada elemento a la acumuladora.", "total = 0; for n in numeros: total += n; return total"], "solution": "def suma_lista(numeros):\n    total = 0\n    for n in numeros:\n        total += n\n    return total"}'::jsonb);
insert into exercises (id, node_id, type, position, content) values
  ('m2-e7', 'm2-data-structures', 'code', 7, '{"prompt": "Escribe cuenta_palabras(texto) que devuelva un dict con cada palabra y cuántas veces aparece.", "starter_code": "def cuenta_palabras(texto):\n    # tu código aquí\n    pass", "tests": [{"call": "cuenta_palabras(''a b a'')", "expected": "{''a'': 2, ''b'': 1}"}, {"call": "cuenta_palabras('''')", "expected": "{}"}], "hints": ["Usa texto.split() para obtener la lista de palabras.", "Usa un dict y dic.get(palabra, 0) para acumular.", "for p in texto.split(): d[p] = d.get(p,0)+1"], "solution": "def cuenta_palabras(texto):\n    d = {}\n    for p in texto.split():\n        d[p] = d.get(p, 0) + 1\n    return d"}'::jsonb);

-- ===== M3 =====
insert into exercises (id, node_id, type, position, content) values
  ('m3-e1', 'm3-oop', 'flashcard', 1, '{"prompt": "¿Qué es una clase y qué es una instancia?", "answer": "La clase es la plantilla (define atributos y métodos); la instancia es un objeto concreto creado a partir de ella.", "explanation": "class Perro define qué es un perro; mi_perro = Perro() crea uno concreto."}'::jsonb);
insert into exercises (id, node_id, type, position, content) values
  ('m3-e2', 'm3-oop', 'flashcard', 2, '{"prompt": "¿Para qué sirve el método __init__ en una clase?", "answer": "Es el constructor: se ejecuta al crear la instancia y sirve para inicializar sus atributos.", "explanation": "def __init__(self, nombre): self.nombre = nombre — guarda el nombre en cada objeto nuevo."}'::jsonb);
insert into exercises (id, node_id, type, position, content) values
  ('m3-e3', 'm3-oop', 'flashcard', 3, '{"prompt": "¿Qué representa self en un método de una clase?", "answer": "La propia instancia sobre la que se llama el método; da acceso a sus atributos y otros métodos.", "explanation": "Python lo pasa automáticamente; por eso es el primer parámetro de los métodos de instancia."}'::jsonb);
insert into exercises (id, node_id, type, position, content) values
  ('m3-e4', 'm3-oop', 'flashcard', 4, '{"prompt": "¿Qué es la herencia en OOP?", "answer": "Que una clase (hija) reciba atributos y métodos de otra (padre), pudiendo añadir o sobrescribir comportamiento.", "explanation": "class Gato(Animal) hace que Gato herede todo lo de Animal."}'::jsonb);
insert into exercises (id, node_id, type, position, content) values
  ('m3-e5', 'm3-oop', 'recall', 5, '{"prompt": "Escribe de memoria una clase Contador con un método incrementar() que suba en 1 un atributo self.valor (empieza en 0), y un método actual() que lo devuelva.", "isCode": true, "modelAnswer": "class Contador:\n    def __init__(self):\n        self.valor = 0\n\n    def incrementar(self):\n        self.valor += 1\n\n    def actual(self):\n        return self.valor"}'::jsonb);
insert into exercises (id, node_id, type, position, content) values
  ('m3-e6', 'm3-oop', 'code', 6, '{"prompt": "Crea una clase CuentaBancaria con __init__(self, saldo=0), un método depositar(cantidad) que sume al saldo, y consultar() que devuelva el saldo. depositar debe ignorar cantidades negativas.", "starter_code": "class CuentaBancaria:\n    # tu código aquí\n    pass", "tests": [{"call": "c = CuentaBancaria(); c.depositar(100); c.consultar()", "expected": "100"}, {"call": "c = CuentaBancaria(50); c.depositar(-10); c.consultar()", "expected": "50"}], "hints": ["En __init__ guarda el saldo inicial en self.saldo.", "depositar suma a self.saldo solo si cantidad > 0.", "consultar hace return self.saldo"], "solution": "class CuentaBancaria:\n    def __init__(self, saldo=0):\n        self.saldo = saldo\n\n    def depositar(self, cantidad):\n        if cantidad > 0:\n            self.saldo += cantidad\n\n    def consultar(self):\n        return self.saldo"}'::jsonb);
