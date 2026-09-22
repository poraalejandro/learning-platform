-- Seed de lecciones — todos los nodos
-- Idempotente: on conflict (id) do update.

-- ===== m2 =====
insert into lessons (id, node_id, title, position, content_md) values
  ('m2-l1', 'm2-data-structures', 'Listas: alias, copias y el argumento mutable', 1, '**Antes de leer, predice:** `a = [1, 2]; b = a; b.append(3)` — ¿qué contiene `a`?

## La idea
Una variable en Python no *contiene* una lista: *apunta* a ella. `b = a` crea un segundo nombre para el mismo objeto. Si quieres una lista independiente, tienes que copiarla: `a[:]`, `list(a)` o `a.copy()`. Todas son copias *superficiales*: los elementos siguen siendo compartidos si son mutables (una lista de listas).

## Ejemplo
```python
a = [1, 2]
b = a          # mismo objeto
c = a.copy()   # objeto nuevo
b.append(3)
print(a, c)    # [1, 2, 3] [1, 2]
print(a is b, a == c)  # True False
```

## El error típico
Argumentos por defecto mutables. `def f(x, lista=[])` crea **una** lista al definir la función y la reutiliza en todas las llamadas. El patrón correcto es `lista=None` y crearla dentro.

## Lo que te preguntan en entrevista
"¿Diferencia entre `is` y `==`?" — `is` compara identidad (mismo objeto), `==` compara valor. "¿Qué imprime este código con `lista=[]` por defecto?" es un clásico para ver si entiendes el modelo de objetos.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;
insert into lessons (id, node_id, title, position, content_md) values
  ('m2-l2', 'm2-data-structures', 'Comprensiones y generadores: cuándo materializar', 2, '**Antes de leer, predice:** ¿cuánta memoria ocupa `(x*x for x in range(10**9))`?

## La idea
Una comprensión de lista `[f(x) for x in xs]` construye la lista entera en memoria. Un generador `(f(x) for x in xs)` produce cada valor cuando alguien lo pide y no guarda nada. Si solo vas a recorrer el resultado una vez (sumarlo, pasarlo a `max`, escribirlo a fichero), el generador es la opción correcta: mismo código, memoria constante.

## Ejemplo
```python
total = sum(x*x for x in range(10**6))   # sin lista intermedia
pares = [x for x in datos if x % 2 == 0] # sí, si la vas a indexar o reutilizar
```
También existen comprensiones de dict `{k: v for ...}` y de set `{x for ...}`.

## El error típico
Un generador solo se puede recorrer una vez. `g = (x for x in xs); list(g); list(g)` devuelve una lista vacía la segunda vez. Si necesitas dos pasadas, materializa.

## Lo que te preguntan en entrevista
"¿Cuándo usarías un generador?" — cuando el dato es grande o infinito y se consume secuencialmente. En un pipeline de RAG, leer chunks de un fichero de millones de líneas es exactamente este caso.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;

-- ===== m3 =====
insert into lessons (id, node_id, title, position, content_md) values
  ('m3-l1', 'm3-oop', 'Clases: qué es self y para qué sirve __init__', 1, '**Antes de leer, predice:** si defines `def saludar(self)` y llamas `p.saludar()`, ¿quién pasa `self`?

## La idea
Una clase es una plantilla; una instancia es un objeto concreto creado a partir de ella. `__init__` se ejecuta al crear la instancia y es donde se guardan los atributos. `self` es la instancia sobre la que se llama el método: Python lo pasa automáticamente, por eso aparece como primer parámetro pero no en la llamada.

## Ejemplo
```python
class Cuenta:
    def __init__(self, saldo=0):
        self.saldo = saldo
    def depositar(self, cantidad):
        if cantidad > 0:
            self.saldo += cantidad

c = Cuenta(50)
c.depositar(25)   # Python llama Cuenta.depositar(c, 25)
```

## El error típico
Olvidar `self` en la definición del método (`def depositar(cantidad)`) o escribir `saldo` en vez de `self.saldo`, creando una variable local que muere al terminar el método.

## Lo que te preguntan en entrevista
"¿Diferencia entre atributo de clase y de instancia?" — el de clase se define fuera de `__init__` y lo comparten todas las instancias; el de instancia va en `self` y es propio de cada objeto.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;
insert into lessons (id, node_id, title, position, content_md) values
  ('m3-l2', 'm3-oop', 'Herencia y composición: ''es un'' frente a ''tiene un''', 2, '**Antes de leer, predice:** ¿un `Cuadrado` debería heredar de `Rectangulo`?

## La idea
Herencia (`class Gato(Animal)`) expresa "es un": la hija recibe los métodos del padre y puede sobrescribirlos. `super().__init__()` llama al constructor del padre para que inicialice lo suyo. Composición expresa "tiene un": un objeto guarda otro como atributo y delega en él. Composición acopla menos y es más fácil de cambiar; la herencia se reserva para jerarquías reales donde la sustitución tiene sentido.

## Ejemplo
```python
class Animal:
    def __init__(self, nombre):
        self.nombre = nombre
    def hablar(self):
        return ''...''

class Perro(Animal):
    def hablar(self):
        return ''guau''
```

## El error típico
Heredar para reutilizar código cuando la relación no es "es un". El caso Cuadrado/Rectángulo: un cuadrado *es* un rectángulo en geometría, pero si `set_ancho` debe mantener los lados iguales, rompe lo que el código que usa `Rectangulo` espera. Eso es una violación de Liskov (lo verás en SOLID).

## Lo que te preguntan en entrevista
"¿Cuándo prefieres composición?" — casi siempre que puedas: es más flexible, más testeable y no crea jerarquías frágiles.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;

-- ===== m4 =====
insert into lessons (id, node_id, title, position, content_md) values
  ('m4-l1', 'm4-testing-errors', 'Excepciones bien hechas', 1, '**Antes de leer, predice:** ¿qué diferencia hay entre `int(''3.5'')` e `int(None)`?

## La idea
Las excepciones forman una jerarquía. `Exception` es la raíz de las que debes capturar; `BaseException` incluye además `KeyboardInterrupt` y `SystemExit`, que casi nunca quieres interceptar. `ValueError` significa "tipo correcto, valor inválido"; `TypeError`, "tipo incorrecto". Captura **solo lo que esperas** y lo más específico posible.

Cuando traduces un error de bajo nivel a uno de dominio, encadena con `from` para no perder la causa:
```python
try:
    return float(texto)
except ValueError as e:
    raise ValueError(f''no es un número: {texto}'') from e
```

## El orden de ejecución
`try` → si hay excepción, `except`; si no, `else` → `finally` **siempre**, incluso tras un `return`.

## El error típico
`except:` desnudo o `except Exception: pass`. Oculta el fallo, deja estado inconsistente y hace imposible depurar. Si de verdad debes continuar, registra el error (`logging.exception`) y decide explícitamente.

## Lo que te preguntan en entrevista
"¿Por qué es peligroso un `except` vacío?" y "¿Qué hace `raise ... from`?". Las dos son preguntas de filtro: distinguen quien ha depurado producción de quien no.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;
insert into lessons (id, node_id, title, position, content_md) values
  ('m4-l2', 'm4-testing-errors', 'Testing con unittest y assert', 2, '**Antes de leer, predice:** ¿un test que no tiene ningún `assert` puede fallar?

## La idea
Un test es una función que llama a tu código con datos conocidos y comprueba el resultado. Con `unittest`, agrupas tests en una clase que hereda de `TestCase`; cada método `test_*` es un caso; `setUp` prepara estado común. `assertEqual`, `assertTrue`, `assertRaises` dan mensajes mejores que un `assert` a secas.

```python
import unittest

class TestParsear(unittest.TestCase):
    def test_valido(self):
        self.assertEqual(parsear_edad('' 42 ''), 42)
    def test_invalido(self):
        with self.assertRaises(ValueError):
            parsear_edad(''abc'')
```
`pytest` (no disponible en el navegador, sí en cualquier repo real) simplifica esto: funciones sueltas con `assert`, y `pytest.raises` para excepciones.

## Fallo frente a error
Un **fallo** es una aserción que no se cumple: tu código hace otra cosa. Un **error** es una excepción inesperada: el test ni siquiera pudo terminar.

## El error típico
Testear solo el camino feliz. Cada función con validación necesita al menos un test del caso inválido y uno del límite (0, vacío, None).

## Lo que te preguntan en entrevista
"¿Cómo testeas que una función lanza una excepción?" — `assertRaises` / `pytest.raises`. "¿Qué es un fixture?" — código de preparación y limpieza compartido entre tests.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;
insert into lessons (id, node_id, title, position, content_md) values
  ('m4-l3', 'm4-testing-errors', 'Qué se testea y qué no', 3, '**Antes de leer, predice:** ¿tiene sentido escribir un test para `sum(lista) / len(lista)`?

## La idea
Testea **comportamiento observable**, no implementación: qué devuelve, qué lanza, qué efecto deja. Testea las decisiones (ramas, validaciones, límites) y las transformaciones que escribiste tú. No testees el lenguaje ni las librerías estándar, ni detalles internos que puedas refactorizar mañana.

Un test bueno es **determinista** (mismo resultado siempre), **aislado** (no depende de otros tests ni de la red) y **rápido**. Cuando algo externo estorba (una API, un reloj, una base de datos), se sustituye por un doble: un objeto que se comporta igual de cara a tu código.

## Ejemplo de prioridad
Para `parsear_edad`: sí a `'' 42 ''`, `''abc''`, `''200''`, `''-1''`, `''''`. No a "que `int()` funcione".

## Testing y sistemas con LLM
Un test unitario es pasa/falla. Un sistema con LLM se **evalúa**: métricas sobre un dataset fijo (faithfulness, recall), que se comparan entre versiones. Lo primero verifica corrección de una unidad; lo segundo, tendencia de calidad. Las dos cosas conviven en un proyecto de IA: tests para chunking, parseo y lógica; evaluación para la salida del modelo.

## Lo que te preguntan en entrevista
"¿Cómo testeas código que llama a una API de LLM?" — inyectando un cliente fake que devuelve respuestas guionizadas, y dejando el modelo real solo para la evaluación end-to-end.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;

-- ===== m5 =====
insert into lessons (id, node_id, title, position, content_md) values
  ('m5-l1', 'm5-async', 'Concurrencia no es paralelismo', 1, '**Antes de leer, predice:** ¿un programa `asyncio` usa más de un núcleo de CPU?

## La idea
**Concurrencia**: gestionar varias tareas intercalándolas. **Paralelismo**: ejecutarlas literalmente a la vez en varios núcleos. `asyncio` da lo primero, no lo segundo: un solo hilo con un *event loop* que salta de una tarea a otra cada vez que una hace `await` (espera E/S). Mientras una espera la respuesta de una API, otra avanza.

Por eso async acelera lo **I/O-bound** (red, disco, APIs) y no hace nada por lo **CPU-bound** (cálculo pesado). Para CPU necesitas procesos (`multiprocessing`) o, en Python 3.13+, hilos sin GIL.

## Ejemplo
Cinco llamadas a una API de 1 s cada una: secuencial tarda 5 s; con `gather`, ~1 s. Cinco cálculos de 1 s de CPU: con `asyncio` siguen siendo 5 s.

## El error típico
Meter algo bloqueante dentro de una corrutina: `time.sleep`, `requests.get`, un bucle largo. Congela el loop entero; ninguna otra tarea avanza. Usa `asyncio.sleep`, un cliente HTTP async, o `run_in_executor`.

## Lo que te preguntan en entrevista
"Explica concurrencia vs paralelismo y dónde encaja asyncio." Es la pregunta de async número uno. La respuesta corta: un hilo, cooperativo, gana en espera de E/S.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;
insert into lessons (id, node_id, title, position, content_md) values
  ('m5-l2', 'm5-async', 'await, gather y el event loop', 2, '**Antes de leer, predice:** ¿qué devuelve `tarea()` si `tarea` es `async def` y no pones `await`?

## La idea
Llamar a una `async def` **no la ejecuta**: devuelve un objeto corrutina. Se ejecuta cuando le haces `await` (esperas su resultado ahí mismo) o la planificas con `asyncio.create_task` (corre en segundo plano). `asyncio.gather(*coros)` planifica varias, las intercala, y devuelve sus resultados **en el orden en que las pasaste**.

```python
async def main():
    a = await tarea(''A'')                  # secuencial: B espera a A
    r = await asyncio.gather(tarea(''B''), tarea(''C''))  # concurrente
```
El loop solo cambia de tarea en un `await`. Una corrutina sin ningún `await` corre entera sin ceder.

## El error típico
Sumar, imprimir o devolver corrutinas en vez de resultados (`sum([f(x) for x in xs])` con `f` async). El síntoma es `TypeError` con "coroutine" en el mensaje o un `RuntimeWarning: coroutine was never awaited`.

## Lo que te preguntan en entrevista
"¿Diferencia entre `await` y `create_task`?" — `await` espera; `create_task` lanza y sigue. "¿Qué pasa si una corrutina de `gather` falla?" — propaga la primera excepción y pierdes el resto, salvo `return_exceptions=True`.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;
insert into lessons (id, node_id, title, position, content_md) values
  ('m5-l3', 'm5-async', 'Patrones que usas de verdad: límite, timeout y reintento', 3, '**Antes de leer, predice:** si lanzas 5.000 llamadas a una API con `gather` a la vez, ¿qué pasa?

## La idea
La concurrencia sin control se convierte en un ataque a tu propio proveedor. Tres herramientas resuelven el 90% de los casos:

- **`Semaphore(n)`**: como máximo `n` corrutinas dentro del bloque `async with sem:` a la vez. Es el rate limiter más simple.
- **`wait_for(coro, timeout)`**: lanza `TimeoutError` si tarda más. Ninguna llamada externa debería ir sin timeout.
- **Reintento con backoff**: ante un 429 o un timeout, espera (0.5 s, 1 s, 2 s…) y reintenta un número acotado de veces.

```python
sem = asyncio.Semaphore(10)
async def embed(chunk):
    async with sem:
        return await asyncio.wait_for(api.embed(chunk), 30)
vectores = await asyncio.gather(*[embed(c) for c in chunks])
```

## El error típico
Poner el `Semaphore` fuera de la función y olvidar el `async with`; o crear el semáforo dentro de cada corrutina (cada una tiene el suyo y no limita nada).

## Lo que te preguntan en entrevista
"¿Cómo generarías embeddings de 5.000 chunks sin saturar la API?" — gather + semáforo + timeout + backoff, y batch si la API lo admite. Es exactamente la pregunta que conecta este módulo con RAG.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;

-- ===== m6 =====
insert into lessons (id, node_id, title, position, content_md) values
  ('m6-l1', 'm6-rag-vectors', 'Embeddings: qué son y por qué existen los modos consulta/documento', 1, '**Antes de leer, predice:** ¿"¿cuánto facturó Nvidia?" y "Nvidia reportó ingresos récord" comparten alguna palabra clave?

## La idea
Un embedding es un vector de números que representa el **significado** de un texto: textos con sentido parecido quedan cerca en ese espacio, aunque no compartan palabras. Se comparan con **similitud coseno**, que mide el ángulo entre vectores, no su longitud; por eso se normalizan y el producto escalar pasa a equivaler al coseno.

Muchos modelos son **asimétricos**: una pregunta (corta, interrogativa) y el pasaje que la responde (largo, declarativo) tienen forma distinta, así que el modelo ofrece un modo para consultas y otro para documentos que los proyectan al mismo espacio. En rag-finance usaste `task_type` de Gemini precisamente para esto.

## Ejemplo
```python
def cos(a, b):
    dot = sum(x*y for x, y in zip(a, b))
    return dot / (norma(a) * norma(b))
```

## El error típico
Embeber consultas con el modo documento (o mezclar dos modelos en el mismo índice). No da error: simplemente el retrieval empeora y nadie sabe por qué. Se detecta solo con evaluación.

## Lo que te preguntan en entrevista
"¿Por qué coseno y no distancia euclídea?" — porque interesa la dirección semántica, no la magnitud. "¿Qué pasa si cambias de modelo de embeddings?" — hay que reindexar todo.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;
insert into lessons (id, node_id, title, position, content_md) values
  ('m6-l2', 'm6-rag-vectors', 'Chunking: el parámetro que más importa', 2, '**Antes de leer, predice:** si una frase clave cae justo en el corte entre dos chunks, ¿la recupera alguno?

## La idea
El LLM no lee el documento entero: lee los **chunks** recuperados. Si el chunk es demasiado grande, mete ruido y desperdicia contexto; si es demasiado pequeño, pierde el contexto necesario para entender la frase. El **solapamiento** repite unas palabras entre chunks consecutivos para que ninguna idea quede partida.

Estrategias, de simple a sofisticada: por número fijo de tokens con solape; por párrafos o secciones (respeta la estructura del documento); semántica (corta donde cambia el tema). Guarda **metadatos** con cada chunk (documento, sección, página): los necesitarás para citar y filtrar.

## Ejemplo
Tamaño 4, solape 1 sobre `ABCDEFGH` → `ABCD`, `DEFG`, `GH`. El chunk final corto es una decisión real: descartarlo, rellenarlo o fusionarlo.

## El error típico
Elegir tamaño y solape "a ojo" y no volver a tocarlos. El chunking es lo primero que hay que variar cuando el context recall es bajo, y lo único que lo justifica es medir.

## Lo que te preguntan en entrevista
"¿Cómo elegiste el tamaño de chunk?" — la respuesta que convence es "probé varios y medí recall@k sobre mi dataset de evaluación", no "500 tokens porque lo leí".')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;
insert into lessons (id, node_id, title, position, content_md) values
  ('m6-l3', 'm6-rag-vectors', 'Retrieval híbrido y evaluación', 3, '**Antes de leer, predice:** ¿qué encuentra mejor "NVDA Q3 FY2024": búsqueda por palabras o por embeddings?

## La idea
El retrieval vectorial entiende paráfrasis pero falla con nombres propios, cifras y siglas. El léxico (BM25) es al revés. La **búsqueda híbrida** lanza ambos y fusiona los rankings con **RRF** (Reciprocal Rank Fusion): suma `1/(k + posición)` de cada resultado, porque las posiciones son comparables y las puntuaciones brutas no. Opcionalmente, un **reranker** (cross-encoder) reordena los top-k con más precisión antes de pasarlos al LLM.

## Medir antes de generar
El retrieval se evalúa **sin LLM**: para cada pregunta de tu dataset sabes qué chunks son relevantes, y mides **recall@k** (qué fracción de ellos está entre los k recuperados). Si el recall es bajo, ningún prompt lo arregla.

Después, sobre la respuesta generada, RAGAS mide:
- **Faithfulness**: la respuesta se sustenta en el contexto (no alucina).
- **Context recall**: el contexto recuperado contiene lo necesario.
- **Answer relevancy**: la respuesta ataca exactamente la pregunta.

## El error típico
Evaluar solo "a mano" con tres preguntas. Sin un dataset fijo y versionado, no puedes saber si un cambio mejoró o empeoró.

## Lo que te preguntan en entrevista
"Tu faithfulness fue 1.0 y relevancy 0.85: ¿qué significa?" — que no inventa, pero a veces responde con información de más o no va al grano.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;

-- ===== m7 =====
insert into lessons (id, node_id, title, position, content_md) values
  ('m7-l1', 'm7-prompting-tools', 'Prompts como código: plantillas, contexto y citas', 1, '**Antes de leer, predice:** ¿qué produce `''{{x}}''.format(x=1)`?

## La idea
Un prompt en producción es una **plantilla** con huecos, no un texto suelto. Se construye con `format` o f-strings, y las llaves literales (necesarias para mostrar JSON de ejemplo) se escapan con `{{ }}`. El contexto recuperado se inyecta con identificadores (`[1]`, `[2]`) para que el modelo pueda **citar** y tú puedas verificar después qué chunk sustentó qué frase.

Estructura habitual: *system* (rol, límites, formato de salida) + *contexto etiquetado* + *pregunta*. Y una instrucción explícita de qué hacer cuando el contexto no basta: decirlo, no inventar.

## Ejemplo
```python
SYSTEM = "Eres un analista. Responde solo con el contexto. Cita como [n]. Si no está, dilo."
prompt = "Contexto:\n{ctx}\n---\nPregunta: {q}".format(ctx=..., q=...)
```

## El error típico
Tratar el contexto recuperado como instrucciones. Un documento puede contener "ignora lo anterior y…": eso es **prompt injection**. El contexto es dato; el prompt debe decirlo y tu código no debe ejecutar nada que venga de ahí.

## Lo que te preguntan en entrevista
"¿Cómo evitas que el modelo alucine?" — contexto citado, instrucción de abstención, temperatura baja, y medirlo con faithfulness.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;
insert into lessons (id, node_id, title, position, content_md) values
  ('m7-l2', 'm7-prompting-tools', 'Salida estructurada: pedir JSON no es garantizar JSON', 2, '**Antes de leer, predice:** si pides "responde solo en JSON", ¿qué puede venir además del JSON?

## La idea
Cuando la salida la consume **código**, quieres datos tipados, no prosa. Dos niveles:

1. **Pedirlo en el prompt**: funciona a menudo, pero el modelo puede envolverlo en ```` ```json ````, añadir una frase antes, o romper el esquema. Hay que parsear defensivamente (extraer entre la primera `{` y la última `}`), **validar** contra el esquema esperado, y **reintentar** pasando los errores como feedback.
2. **Modo estructurado del API** (JSON schema / tool calling): la generación queda restringida al esquema. Garantiza forma válida, no verdad.

## Ejemplo del bucle
```python
feedback = None
for _ in range(3):
    salida = extraer_json(modelo(prompt, feedback))
    errores = validar(salida, esquema)
    if not errores:
        break
    feedback = ''; ''.join(errores)
```

## El error típico
Hacer `json.loads` directamente sobre la respuesta y dejar que el `JSONDecodeError` tumbe el pipeline en producción.

## Lo que te preguntan en entrevista
"¿Prompt con ''responde en JSON'' o structured output?" — prototipo: lo primero; producción con código consumiendo la salida: lo segundo, y aun así valida.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;
insert into lessons (id, node_id, title, position, content_md) values
  ('m7-l3', 'm7-prompting-tools', 'Tool calling: el ciclo completo', 3, '**Antes de leer, predice:** cuando un modelo "llama a una herramienta", ¿quién ejecuta el código?

## La idea
El modelo **no ejecuta nada**. Recibe los **esquemas** de las herramientas (nombre, descripción, parámetros tipados) y, en vez de responder con texto, puede devolver "llama a `buscar` con `{q: ..., k: 3}`". Tu código:

1. Recibe la petición de llamada.
2. Busca la función en un **registro** (`dict` nombre → función) y la ejecuta con los argumentos.
3. Devuelve el resultado al modelo como mensaje de tipo *tool result*.
4. El modelo decide: otra herramienta o respuesta final.

El bucle lo controla tu código, con un **máximo de pasos**. Así funcionó tu trade-signal-agent con function calling de Gemini.

## Ejemplo
```python
def esquema(fn):
    return {''name'': fn.__name__, ''description'': fn.__doc__,
            ''parameters'': {n: TIPOS[t] for n, t in fn.__annotations__.items() if n != ''return''}}
```
La descripción es lo que el modelo lee para decidir cuándo usarla: escríbela como para un compañero nuevo.

## El error típico
Herramientas con descripciones vagas o parámetros sin tipo: el modelo las usa mal o no las usa. Y ejecutar sin validar argumentos: el modelo puede pasar un `k` de 10.000.

## Lo que te preguntan en entrevista
"Describe el ciclo de una llamada a herramienta" y "¿qué haces si el modelo entra en bucle llamando lo mismo?" — límite de pasos y, mejor, detectar la repetición y devolverle un error explicativo.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;

-- ===== m8 =====
insert into lessons (id, node_id, title, position, content_md) values
  ('m8-l1', 'm8-agents-langgraph', 'Un agente es un bucle con estado', 1, '**Antes de leer, predice:** ¿qué diferencia hay entre "un LLM con herramientas" y "un agente"?

## La idea
Un agente es un LLM en un **bucle**: observa el estado, razona, elige una acción (herramienta o respuesta), observa el resultado, y repite. Es el patrón **ReAct** (Reason + Act). Lo que lo hace agente no es el modelo, sino el bucle y el **estado** que lleva entre pasos: mensajes, resultados de herramientas, contadores.

Dos cosas separan un juguete de un sistema: un **límite de pasos** (el modelo puede no converger) y **trazabilidad** (qué hizo en cada paso, para depurar y evaluar).

## Ejemplo mínimo
```python
estado = {''mensajes'': [pregunta]}
for paso in range(MAX):
    decision = modelo(estado)
    if decision.es_respuesta: break
    resultado = herramientas[decision.tool](**decision.args)
    estado[''mensajes''].append(resultado)
```

## El error típico
Sin `MAX`: un bucle infinito de llamadas a la misma herramienta, con coste y latencia disparados. Y sin traza: cuando falla, no hay forma de saber en qué paso.

## Lo que te preguntan en entrevista
"¿Cómo evalúas un agente?" — con un baseline y las mismas reglas. En trade-signal-agent comparaste contra selección aleatoria y publicaste que no había ventaja: eso es evaluar; "parece que funciona" no lo es.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;
insert into lessons (id, node_id, title, position, content_md) values
  ('m8-l2', 'm8-agents-langgraph', 'De bucle a grafo: nodos, aristas y estado', 2, '**Antes de leer, predice:** ¿por qué querrías pausar un agente a mitad y reanudarlo mañana?

## La idea
Un `while` con `if/else` mezcla control de flujo y lógica. Un **grafo de estados** los separa: cada **nodo** es una función pura `estado → cambios`; las **aristas** dicen qué nodo sigue; las **aristas condicionales** deciden según el estado (eso permite bucles). El estado se actualiza aplicando los cambios, y un **reducer** define cómo se combina cada campo: `mensajes` acumula, `paso` se sustituye.

Ventajas concretas: cada nodo se testea solo; el flujo se dibuja; se puede hacer **checkpoint** tras cada nodo y reanudar; se puede insertar un paso de **aprobación humana** entre dos nodos sin reescribir nada.

## Ejemplo (tu mini-LangGraph)
```python
g.add_node(''pensar'', pensar)
g.add_node(''buscar'', buscar)
g.add_conditional_edge(''pensar'', lambda s: s[''accion''])  # ''buscar'' | ''responder''
g.add_edge(''buscar'', ''pensar'')
g.add_edge(''responder'', ''END'')
```

## El error típico
Nodos que mutan el estado recibido en vez de devolver cambios. Rompe la trazabilidad y el checkpointing: ya no sabes qué cambió en cada paso.

## Lo que te preguntan en entrevista
"¿Por qué un grafo y no un bucle?" — testabilidad por nodo, flujo explícito, pausa/reanudación, human-in-the-loop.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;
insert into lessons (id, node_id, title, position, content_md) values
  ('m8-l3', 'm8-agents-langgraph', 'LangGraph: lo que construiste, con nombres reales', 3, '**Antes de leer, predice:** ¿cómo se declara en LangGraph que el campo `mensajes` debe acumular en vez de sustituirse?

## La idea
LangGraph es tu `Grafo` con producción encima. Correspondencias:

| Tuyo | LangGraph |
|---|---|
| `Grafo()` | `StateGraph(Estado)` con un `TypedDict` |
| reducer de mensajes | `Annotated[list, add_messages]` |
| `add_conditional_edge` | `add_conditional_edges(origen, fn, mapa)` |
| `''END''` | constante `END` |
| `max_steps` | `recursion_limit` en `invoke` |
| `traza` | **checkpointer** (`MemorySaver`, Postgres) con `thread_id` |

El checkpointer es la pieza nueva: persiste el estado tras cada nodo. Con él tienes memoria entre turnos, *time-travel* para depurar, y `interrupt_before=[''ejecutar_orden'']` para **human-in-the-loop**: el grafo se para, una persona aprueba, y se reanuda desde el checkpoint.

## Ejemplo
```python
graph = StateGraph(Estado)
graph.add_node(''agente'', llamar_modelo)
graph.add_node(''tools'', ejecutar_tools)
graph.add_conditional_edges(''agente'', decidir, {''tools'': ''tools'', ''end'': END})
graph.add_edge(''tools'', ''agente'')
app = graph.compile(checkpointer=MemorySaver())
```

## El error típico
Usar el framework sin entender el estado: campos que se pisan porque no tienen reducer, o `recursion_limit` alcanzado sin saber por qué. Haberlo construido a mano es lo que evita esto.

## Lo que te preguntan en entrevista
"¿Qué es un checkpointer?" y "¿Cómo meterías aprobación humana antes de ejecutar una operación?" — en un agente de trading, es la diferencia entre sugerir y ejecutar.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;

-- ===== m9 =====
insert into lessons (id, node_id, title, position, content_md) values
  ('m9-l1', 'm9-capstone', 'El proyecto integrador: enunciado y checkpoints', 1, '**Antes de leer, predice:** ¿qué parte del sistema construirías primero, la API o la evaluación?

## Qué vas a construir
Un asistente sobre documentos reales (informes 10-K, o el dominio que elijas) que combine: pipeline RAG híbrido con reranking, un agente que decide cuándo buscar, calcular o responder, evaluación reproducible, y una API FastAPI desplegada con auth, rate limit y logs estructurados. Cada pieza hace una sola cosa: `ingest.py`, `retrieve.py`, `generate.py`, `agent.py`, `eval.py`, `api.py`.

## Checkpoints (en este orden)
1. **Dataset de evaluación** (20–30 preguntas con chunks relevantes marcados). Sin esto no hay forma de saber si avanzas.
2. Ingestión + chunking + índice. Mide **recall@k**.
3. Retrieval híbrido + RRF. Vuelve a medir. Añade reranker solo si el número lo justifica.
4. Generación con contexto citado y abstención. Mide RAGAS.
5. Agente con herramientas y límite de pasos. Traza cada paso.
6. API + despliegue. Un endpoint, autenticado, con rate limit por usuario.
7. README con arquitectura, decisiones, números y limitaciones.

## La regla
No pases al siguiente checkpoint sin desplegar o medir el anterior. Es la misma regla con la que construiste PyQuest.

## Lo que te preguntan en entrevista
Todo el proyecto es una respuesta a "cuéntame un proyecto del que estés orgulloso". Prepara la versión de 60 segundos: problema, arquitectura en una frase, la decisión más interesante, el resultado medido.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;
insert into lessons (id, node_id, title, position, content_md) values
  ('m9-l2', 'm9-capstone', 'Revisión de diseño: las preguntas que te harán', 2, '**Antes de leer, predice:** si cambias el modelo de embeddings, ¿qué se rompe sin dar ningún error?

## La idea
Un sistema de IA en producción falla de formas silenciosas. La revisión de diseño consiste en anticiparlas. Cuatro que aparecen siempre:

**Lentitud.** Mide por fase antes de optimizar: retrieval, tokens del prompt, llamadas secuenciales que podrían ser concurrentes, cold starts. Sin timestamps por fase, cualquier optimización es a ciegas.

**Pregunta fuera de los documentos.** Umbral de similitud en retrieval (sin contexto por encima del umbral, no hay respuesta) + instrucción de abstención en el prompt + casos negativos en el dataset de evaluación.

**Cambio de modelo de embeddings.** Reindexar todo: dos modelos no comparten espacio, mezclarlos degrada el retrieval sin error. Se detecta corriendo `eval.py` antes y después.

**Coste.** Tokens por petición × peticiones por día. Cache de respuestas frecuentes, chunks más pequeños, modelo más barato para clasificar y el caro solo para generar.

## El error típico
Optimizar lo que se ve (el prompt) en vez de lo que se mide (el retrieval). La mayoría de los fallos de un RAG son de retrieval, no de generación.

## Lo que te preguntan en entrevista
Estas cuatro, casi literalmente. Y una más: "¿cuál es la limitación principal de tu sistema?" — tener una respuesta honesta y concreta vale más que cualquier número.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;

-- ===== s1 =====
insert into lessons (id, node_id, title, position, content_md) values
  ('s1-l1', 's1-clean-code', 'Nombres y funciones que se leen como frases', 1, '**Antes de leer, predice:** ¿cuánto tardas en entender `def f(l, t)` frente a `def suma_mayores_que(valores, umbral)`?

## La idea
El código se lee muchas más veces de las que se escribe. Un nombre **con intención** responde qué es, para qué existe y cómo se usa, sin comentario: `dias_desde_ultimo_pago`, no `d`. Una función hace **una cosa** y se queda en **un nivel de abstracción**: si valida, calcula y guarda, son tres funciones y un orquestador.

Los **números mágicos** (`if x == 7`) se sustituyen por constantes con nombre (`MAYORIA_DE_EDAD = 18`). Las condiciones negadas dobles (`if not (not s)`) se enderezan.

## Ejemplo
```python
DESCUENTO_SOCIO = 0.1

def aplicar_descuento(precio, es_socio):
    if es_socio:
        return precio * (1 - DESCUENTO_SOCIO)
    return precio
```

## El error típico
Funciones largas "porque todo está relacionado". Si necesitas un comentario para separar bloques dentro de una función, cada bloque quiere ser una función con ese nombre.

## Lo que te preguntan en entrevista
"¿Qué es código limpio para ti?" — la respuesta útil habla de nombres, funciones pequeñas, y del coste de mantenimiento, no de estilo.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;
insert into lessons (id, node_id, title, position, content_md) values
  ('s1-l2', 's1-clean-code', 'Comentarios, duplicación y la regla del boy scout', 2, '**Antes de leer, predice:** `# incrementa i en 1` encima de `i += 1`, ¿ayuda o estorba?

## La idea
Un comentario que explica **qué** hace el código es una señal de que el código no se explica solo. Los comentarios buenos explican el **porqué**: una decisión de negocio, un workaround por un bug de una librería, una advertencia de rendimiento.

**DRY** (Don''t Repeat Yourself) trata de conocimiento, no de líneas: cada regla en un solo sitio. Pero unificar código que solo se parece por casualidad crea acoplamiento. Regla práctica: duplicar dos veces se tolera; a la tercera, extraer.

**Boy scout**: deja el código un poco mejor de como lo encontraste, en cada PR. Un nombre mejor, una función extraída, un comentario obsoleto borrado. Los grandes refactors nunca llegan; los pequeños, sí.

## El error típico
Comentarios que mienten: el código cambió y el comentario no. Por eso menos comentarios y más nombres.

## Lo que te preguntan en entrevista
"¿Cuándo escribes un comentario?" — para el porqué no evidente. "¿Qué opinas de DRY?" — la trampa de la abstracción prematura demuestra criterio.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;

-- ===== s2 =====
insert into lessons (id, node_id, title, position, content_md) values
  ('s2-l1', 's2-solid', 'SOLID en Python: qué significa cada letra de verdad', 1, '**Antes de leer, predice:** una clase que carga un CSV, calcula estadísticas y genera un PDF, ¿cuántas razones tiene para cambiar?

## La idea
- **S**ingle responsibility: una clase, una razón para cambiar. La del CSV+cálculo+PDF tiene tres → tres clases.
- **O**pen/closed: añadir comportamiento sin editar lo existente. La señal de violación es el `elif` que crece con cada variante; la solución, polimorfismo o un dict de estrategias.
- **L**iskov: una subclase debe poder usarse donde se espera la base **sin sorpresas**. `Cuadrado(Rectangulo)` que cambia el alto al cambiar el ancho rompe a quien usa `Rectangulo`.
- **I**nterface segregation: interfaces pequeñas; nadie implementa lo que no usa. En Python, `Protocol`s pequeños.
- **D**ependency inversion: depender de abstracciones, no de implementaciones. En la práctica: **inyectar** las dependencias por el constructor.

## Ejemplo (D)
```python
class Notificador:
    def __init__(self, canal):      # cualquier objeto con .enviar()
        self.canal = canal
```
Ahora se testea con un fake, sin red.

## El error típico
Aplicar SOLID como checklist y acabar con diez clases para un script de 40 líneas. Los principios son para código que cambia; un script que no cambia no los necesita.

## Lo que te preguntan en entrevista
"Explica Liskov con un ejemplo" y "¿qué es inversión de dependencias y para qué sirve?" — la respuesta que convence conecta D con testing.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;
insert into lessons (id, node_id, title, position, content_md) values
  ('s2-l2', 's2-solid', 'Interfaces sin herencia: duck typing y Protocol', 2, '**Antes de leer, predice:** ¿necesita `Fake` heredar de `EmailReal` para sustituirlo?

## La idea
Python no necesita interfaces formales: si un objeto tiene el método `enviar`, sirve (**duck typing**). Para que mypy y el lector sepan qué se espera, `typing.Protocol` declara la forma sin obligar a heredar:

```python
from typing import Protocol

class Canal(Protocol):
    def enviar(self, destino: str, texto: str) -> str: ...

class Notificador:
    def __init__(self, canal: Canal): ...
```
`EmailReal`, `Fake` o cualquier clase con ese método cumplen `Canal` automáticamente (*structural subtyping*).

Composición sobre herencia: en vez de `class NotificadorEmail(Notificador)`, un `Notificador` que **tiene** un canal. Se cambia en tiempo de ejecución y no crea jerarquías frágiles.

## El error típico
Clases base abstractas con `raise NotImplementedError` en cinco métodos para que dos implementaciones "compartan interfaz". Un `Protocol` con solo el método que se usa es más pequeño y más honesto.

## Lo que te preguntan en entrevista
"¿Cómo defines una interfaz en Python?" — `Protocol` para la forma, `ABC` cuando además quieres compartir implementación.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;

-- ===== s3 =====
insert into lessons (id, node_id, title, position, content_md) values
  ('s3-l1', 's3-testing-types', 'La pirámide de tests y los dobles', 1, '**Antes de leer, predice:** ¿cuántos tests end-to-end debería tener un proyecto con 500 tests?

## La idea
**Unitarios** (muchos, milisegundos): una función o clase aislada, todo lo externo sustituido. **Integración** (menos, más lentos): varias piezas juntas, con BD o API reales. **End-to-end** (muy pocos, frágiles): el sistema completo como lo usa un usuario. La pirámide es ancha abajo porque los unitarios localizan el fallo y corren en cada commit.

Los **dobles** sustituyen lo externo:
- **Stub**: devuelve respuestas fijas.
- **Mock**: además registra las llamadas para afirmar sobre ellas.
- **Fake**: implementación simplificada pero funcional (BD en memoria).
- **Spy**: envuelve el objeto real y observa.

## Ejemplo
```python
class ClienteLLMFake:
    def __init__(self, respuestas): self.respuestas, self.prompts = list(respuestas), []
    def completar(self, prompt):
        self.prompts.append(prompt)
        return self.respuestas.pop(0)
```

## El error típico
Tests **flaky**: pasan o fallan según la hora, el orden o la red. Uno flaky es peor que ninguno: se ignora y esconde fallos reales.

## Lo que te preguntan en entrevista
"¿Diferencia entre mock y stub?" y "¿qué mide la cobertura?" — líneas ejecutadas, no calidad de las aserciones.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;
insert into lessons (id, node_id, title, position, content_md) values
  ('s3-l2', 's3-testing-types', 'Testear sistemas con LLM sin llamar al LLM', 2, '**Antes de leer, predice:** ¿qué partes de un pipeline RAG son deterministas?

## La idea
Casi todo lo que escribes tú es determinista: chunking, construcción del prompt, parseo de la respuesta, validación del JSON, dispatcher de herramientas, la lógica del agente. Todo eso se testea con **dobles**: un índice pequeño en memoria con embeddings fijos, un cliente LLM fake con respuestas guionizadas (incluida una respuesta rota para probar el reintento).

Lo único que necesita el modelo real es la **evaluación end-to-end** sobre el dataset fijo (RAGAS). Se corre aparte, menos veces, y sus resultados **se comparan entre versiones**: no es pasa/falla, es mejora/empeora.

## Ejemplo de reparto
| Pieza | Cómo |
|---|---|
| `chunk_texto` | unitario, casos límite |
| `extraer_json` | unitario, con markdown alrededor |
| bucle de reintento | unitario, fake que acierta a la segunda |
| agente | integración con fake de LLM y tools reales en memoria |
| calidad de respuestas | evaluación con modelo real |

## El error típico
Tests que llaman a la API real: lentos, caros, no deterministas y fallan sin red. O el opuesto: cero evaluación porque "no se puede testear un LLM".

## Lo que te preguntan en entrevista
"¿Cómo testeas código que usa un LLM?" — inyección del cliente + fake para la lógica, evaluación con dataset para la calidad.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;

-- ===== s4 =====
insert into lessons (id, node_id, title, position, content_md) values
  ('s4-l1', 's4-design-patterns', 'Patrones en Python idiomático: Strategy, Factory, Decorator', 1, '**Antes de leer, predice:** ¿cuántas clases necesitas para implementar Strategy en Python?

## La idea
Los patrones del libro clásico están escritos para lenguajes sin funciones de primera clase. En Python, muchos colapsan a algo más simple:

- **Strategy**: un `dict` de funciones. `ESTRATEGIAS[''precio''](items)`. Sin interfaz, sin clase por variante.
- **Factory**: un `dict` de clases. `TIPOS[tipo](**kwargs)`. Las clases son objetos.
- **Decorator**: el decorador del lenguaje. `@con_cache`, `@lru_cache`, `@retry`: añaden comportamiento sin tocar la función.
- **Adapter**: cualquier objeto con el método esperado (duck typing) que envuelve la API ajena.
- **Singleton**: un módulo ya lo es; y casi siempre es mejor una instancia inyectada que un global oculto.

## Ejemplo
```python
ESTRATEGIAS = {''precio'': por_precio, ''nombre'': por_nombre}
def ordenar(items, criterio):
    return ESTRATEGIAS[criterio](items)
```

## El error típico
Traer la versión Java: `class OrdenadorPorPrecio(EstrategiaOrdenacion)` con una clase abstracta y un método `ejecutar`. Correcto, pero triplica el código sin ganar nada.

## Lo que te preguntan en entrevista
"¿Qué patrones has usado?" — nombrar el patrón **y** la versión idiomática demuestra que entiendes el problema, no solo el nombre.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;
insert into lessons (id, node_id, title, position, content_md) values
  ('s4-l2', 's4-design-patterns', 'Patrones aplicados a sistemas de IA', 2, '**Antes de leer, predice:** si mañana cambias de Gemini a otro proveedor, ¿cuántos ficheros tocas?

## La idea
Un sistema de IA tiene piezas que cambian a menudo (proveedor de LLM, modelo de embeddings, estrategia de chunking, retriever) y piezas estables (el pipeline). Los patrones sirven para que lo que cambia no arrastre a lo estable:

- **Adapter** para cada proveedor de LLM detrás de un método común `completar(prompt)`. Cambiar de proveedor es un fichero.
- **Factory** que construye el cliente adecuado desde la configuración (`LLM_PROVIDER=gemini`).
- **Strategy** para chunking y retrieval: `chunkers[''por_parrafos'']`, `retrievers[''hibrido'']`. Comparar estrategias en `eval.py` es un bucle.
- **Decorator** para reintentos con backoff, cache de embeddings, logging de latencia por llamada.
- **Observer** para que cada paso del agente notifique a métricas, logs y UI sin que el agente sepa quiénes escuchan.

## Ejemplo
```python
@retry(intentos=3, backoff=0.5)
@con_cache
def embed(texto): ...
```

## El error típico
Llamar al SDK del proveedor desde diez sitios. El día que cambias de proveedor (o te suben el precio), lo pagas.

## Lo que te preguntan en entrevista
"¿Cómo diseñarías el sistema para poder cambiar de modelo?" — adapter + factory + configuración, y la evaluación para comparar.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;

-- ===== s5 =====
insert into lessons (id, node_id, title, position, content_md) values
  ('s5-l1', 's5-architecture', 'PyQuest como caso de estudio: por qué está montado así', 1, '**Antes de leer, predice:** ¿por qué el progreso del alumno no pasa por FastAPI?

## La idea
PyQuest tiene tres piezas y cada una existe por una razón concreta:

- **Next.js en Vercel**: interfaz. Escribe el progreso **directamente en Supabase**, protegido por **RLS** (`user_id = auth.uid()`). Menos latencia, menos código, sin cold start por acción.
- **Supabase**: datos + identidad. El **JWT** que emite es la única credencial: lo verifica la BD (RLS) y lo verifica FastAPI.
- **FastAPI en Render**: **solo el tutor**. Llama al LLM con rate limit por usuario. Es un servicio aparte porque es Python y porque es la única pieza con coste por llamada.
- **Pyodide**: el código del alumno corre en el navegador. Sin sandbox en servidor, sin coste, funciona offline.

## Dos decisiones que no se relitigan
1. El estado de un nodo (`available`) **se calcula**, nunca se guarda: se deriva de los intentos. Añadir contenido no corrompe progreso.
2. `exercise_attempts` es un **log de eventos**, no estado: permite reconstruir cualquier vista después (repaso de errores, estadísticas nuevas).

## El riesgo asumido
Confiar en el cliente para el progreso. Vale porque el progreso no tiene valor externo. Si hubiera ranking público o certificados, la validación pasaría al backend.

## Lo que te preguntan en entrevista
"Cuéntame la arquitectura de un proyecto tuyo y una decisión que tomarías distinta." Esta lección es la respuesta.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;
insert into lessons (id, node_id, title, position, content_md) values
  ('s5-l2', 's5-architecture', 'Arquitectura pragmática: monolito modular, 12 factores, ADRs', 2, '**Antes de leer, predice:** ¿PyQuest son microservicios?

## La idea
No. Son dos servicios porque tienen requisitos distintos (Next+Pyodide vs. Python con LLM), no por diseño. Un **monolito modular** (una aplicación, módulos bien separados dentro) es el mejor punto de partida casi siempre: evita la complejidad de red, despliegues múltiples y datos distribuidos hasta que haya una razón real (equipos, escala).

**12-factor app**: las prácticas que Vercel y Render asumen: configuración en variables de entorno, dependencias declaradas, procesos sin estado, logs como flujo, paridad dev/prod. Si tu app las sigue, se despliega en cualquier sitio.

**ADR** (Architecture Decision Record): un documento corto por decisión: contexto, opciones, decisión, consecuencias. Vive en el repo. Tu `status.md` ya tiene ADRs implícitos ("reglas de diseño, no relitigar"); formalizarlos cuesta diez minutos y es oro en entrevistas.

## Ejemplo de ADR
> **Contexto**: el cliente necesita leer/escribir progreso. **Opciones**: pasar por FastAPI / RLS directo. **Decisión**: RLS directo. **Consecuencias**: menos latencia; reglas de negocio en SQL; revisar si el progreso adquiere valor externo.

## El error típico
Diseñar para la escala que no tienes. Diez usuarios no necesitan colas, cachés distribuidas ni Kubernetes.

## Lo que te preguntan en entrevista
"¿Monolito o microservicios?" — depende, y saber de qué depende (equipos, escala, límites de dominio) es la respuesta.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;

-- ===== s6 =====
insert into lessons (id, node_id, title, position, content_md) values
  ('s6-l1', 's6-docker', 'Imágenes, contenedores y el Dockerfile', 1, '**Antes de leer, predice:** si borras un contenedor, ¿qué pasa con los ficheros que escribió?

## La idea
Una **imagen** es una plantilla inmutable (como una clase); un **contenedor** es una instancia en ejecución con su propia capa de escritura (como un objeto). Lo escrito en esa capa muere con el contenedor: para persistir, **volúmenes** o servicios externos (la BD de PyQuest vive en Supabase, no en un contenedor).

El **Dockerfile** describe la imagen capa a capa:
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```
`FROM` base; `COPY` mete ficheros al construir; `EXPOSE` documenta el puerto (no lo publica: eso es `-p` al ejecutar); `CMD` es el comando por defecto.

## El error típico
`COPY . .` antes de instalar dependencias: cada cambio de una línea de código invalida la caché y reinstala todo. Las dependencias van **antes** que el código.

## Lo que te preguntan en entrevista
"¿Diferencia entre imagen y contenedor?" y "¿por qué `slim`?" — más pequeña, más rápida, menos superficie de ataque.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;
insert into lessons (id, node_id, title, position, content_md) values
  ('s6-l2', 's6-docker', 'Caché de capas, secretos y compose', 2, '**Antes de leer, predice:** si metes `.env` en la imagen y luego lo borras en otra capa, ¿sigue ahí?

## La idea
Cada instrucción del Dockerfile es una **capa** cacheada. Una capa se reconstruye si cambia su contenido **o si cambió cualquier capa anterior**. Por eso el orden va de lo que menos cambia (base, dependencias) a lo que más (código).

**Secretos**: nunca en la imagen. Todo lo que entra en una capa queda en el historial aunque lo borres después. Van por variables de entorno en tiempo de ejecución (`-e`, `env_file`, el gestor de la plataforma). `.dockerignore` excluye `.git`, `venv`, `.env` del contexto de build.

**Multi-stage**: una etapa instala y compila; la final copia solo el resultado. Imagen más pequeña, sin compiladores en producción.

**docker compose**: varios servicios declarados en YAML:
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

## El error típico
`COPY .env .` "para que funcione en local". Y `latest` como tag: hoy funciona, mañana la imagen base cambió.

## Lo que te preguntan en entrevista
"¿Cómo pasas secretos a un contenedor?" y "¿para qué sirve multi-stage?" — las dos son de filtro en cualquier puesto con despliegue.')
  on conflict (id) do update set node_id=excluded.node_id, title=excluded.title, position=excluded.position, content_md=excluded.content_md;
