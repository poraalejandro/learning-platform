-- PLACEHOLDER-in-spirit but written as real, usable content (unlike 0005/
-- 0008's throwaway examples) — one lesson on m1-python-basics, to prove the
-- Markdown pipeline end-to-end. More lessons get added the same way, one
-- INSERT per lesson, no schema changes needed.

insert into lessons (id, node_id, title, position, content_md) values (
  'm1-lesson-basics',
  'm1-python-basics',
  'Sintaxis básica de Python',
  1,
  $md$## La indentación es la sintaxis

A diferencia de Java, C o JavaScript, Python no usa llaves `{}` para marcar
bloques de código. Usa la **indentación** (los espacios al principio de
línea). Todo lo que esté indentado al mismo nivel pertenece al mismo bloque:

```python
def saludar(nombre):
    if nombre:
        print(f"Hola, {nombre}")
    else:
        print("Hola, desconocido")
```

Si la indentación no es consistente, Python lanza un `IndentationError` — no
es un aviso de estilo, es un error real. La convención estándar es **4
espacios** por nivel (no tabs).

## Asignación (`=`) vs comparación (`==`)

Uno de los errores más comunes al empezar:

```python
edad = 25      # asigna 25 a la variable edad
edad == 25     # compara: ¿edad es igual a 25? → True
```

`=` cambia el valor. `==` pregunta si dos valores son iguales y devuelve
`True` o `False`. Confundirlos suele dar errores de sintaxis (`if edad = 25`
no es válido) o, peor, bugs silenciosos en contextos donde sí es válido.

## f-strings: la forma moderna de construir texto

```python
nombre = "Ana"
puntos = 42
print(f"{nombre} tiene {puntos} puntos")
# Ana tiene 42 puntos
```

Una `f` antes de las comillas activa el f-string: cualquier cosa entre `{}`
se evalúa como código Python. Funciona con expresiones, no solo variables:

```python
print(f"El doble es {puntos * 2}")
```

## Control de flujo: `if` / `elif` / `else`

```python
if puntos >= 50:
    nivel = "avanzado"
elif puntos >= 20:
    nivel = "intermedio"
else:
    nivel = "principiante"
```

Python evalúa las condiciones en orden y ejecuta el primer bloque cuyo
resultado sea `True`. `elif` es la contracción de "else if" — puedes
encadenar tantos como necesites.

## Bucles: `for`, `range()`, `break` y `continue`

```python
for i in range(5):
    print(i)
# 0 1 2 3 4
```

`range(n)` genera números desde `0` hasta `n - 1` — no incluye `n`. Si
necesitas otro punto de partida: `range(2, 6)` da `2, 3, 4, 5`.

Dentro de un bucle, dos palabras clave cambian el flujo:

```python
for n in range(10):
    if n == 3:
        continue   # salta esta vuelta, sigue con la siguiente
    if n == 6:
        break      # corta el bucle entero, aquí termina
    print(n)
# 0 1 2 4 5
```

`continue` se salta el resto de esa vuelta concreta. `break` termina el
bucle por completo, sin ejecutar las vueltas que quedaban.

## Repaso rápido

- La indentación define los bloques — sin excepciones.
- `=` asigna, `==` compara.
- `f"texto {expresion}"` interpola cualquier expresión Python.
- `elif` encadena condiciones sin anidar `if`s.
- `range(n)` no incluye `n`; `break` corta el bucle, `continue` salta la vuelta.
$md$
);
