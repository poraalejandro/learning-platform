# PyQuest — Resumen completo del proyecto (desde el inicio hasta 2026-09-17)

Documento de contexto para pedir contenido nuevo (preguntas, ejercicios, módulos). Consolida `status-2026-09-11.md`, `status-2026-09-17.md`, `backlog.md` y `architecture.md` en una sola narrativa, más un apéndice técnico con el formato exacto de cada tipo de ejercicio.

## 1. Qué es y para quién

Plataforma de aprendizaje gamificada para dominar Python e ingeniería de IA mediante *active recall* y resolución de problemas, no lecciones pasivas. Es el proyecto de portafolio #3 del propietario en su transición a AI engineering — su función es demostrar entrega full-stack (auth, base de datos real, backend y frontend desplegados, sync entre dispositivos), algo que sus proyectos #1 (RAG) y #2 (agente de trading) no cubren.

Skill tree con una ruta principal (main quest) y ramas opcionales (side quests), varios tipos de ejercicio, un tutor con IA que da pistas progresivas en vez de la respuesta, repetición espaciada, y progreso sincronizado entre dispositivos vía la nube (nunca localStorage).

## 2. Stack y despliegue

- **Frontend**: Next.js 16 (App Router, TypeScript, Tailwind) → [learning-platform-pora-inc.vercel.app](https://learning-platform-pora-inc.vercel.app)
- **Backend**: FastAPI (Python) → [learning-platform-backend-jw80.onrender.com](https://learning-platform-backend-jw80.onrender.com) (free tier, cold starts ~30s aceptados)
- **BD + Auth**: Supabase (Postgres + Auth + Row Level Security), proyecto `vgkhatnywzjtzdevcnsk`, 12 migraciones aplicadas (`0001`–`0012`)
- **Ejecución de código del alumno**: Pyodide (Python compilado a WASM, corre en el navegador — sin sandboxing en servidor, funciona offline)
- **Tutor**: endpoint FastAPI que llama a un LLM, con rate limit por usuario desde el día 1
- Sin Pinecone/vector DB: el contexto del tutor siempre se conoce (lección + código actual), no hace falta retrieval. Si algún día hiciera falta, pgvector dentro de Supabase.
- Repo: [github.com/poraalejandro/learning-platform](https://github.com/poraalejandro/learning-platform)

**Auth/sync**: Supabase Auth emite un JWT → el cliente lee/escribe su progreso directamente contra Supabase protegido por RLS (`user_id = auth.uid()`) → FastAPI verifica el mismo JWT solo para el endpoint del tutor. El estado vive en la nube; empezar en el móvil y seguir en el PC es automático, verificado en real.

## 3. Roadmap — las 5 fases, todas cerradas y desplegadas

- **Fase 0 — Cimientos** ✅: monorepo, login funcionando en Supabase, verificado desde dos dispositivos con la misma cuenta.
- **Fase 1 — Contenido y árbol** ✅: esquema SQL de 8 tablas + RLS, árbol sembrado (9 nodos main + 6 side), estado de nodo **calculado siempre, nunca guardado** (`available` se deriva de si los prerrequisitos están `completed`). El contenido real de M1 llegó más tarde (ver más abajo); al principio era placeholder.
- **Fase 2 — Motor mínimo** ✅: ejercicios `code` (Pyodide + tests) y `flashcard` (SM-2), progreso sincronizado.
- **Fase 3 — Tutor** ✅: endpoint LLM con escalera de pistas progresivas + chat contextual, rate-limited. (Bug de producción resuelto: 401 por CORS mal configurado + PyJWT rechazando el claim `aud` sin pasar `audience` explícito.)
- **Fase 4 — Resto del motor y pulido** ✅: 4 tipos de ejercicio nuevos (`fix_bug`, `predict_output`, `match`, `parsons`), "repasa tus errores" (reutiliza el sistema SM-2 de flashcards, no una tabla paralela), rediseño visual v1.

Regla de oro seguida en todo el proyecto: **no se empieza una fase sin desplegar la anterior.**

## 4. Fallos reales encontrados y corregidos (post-Fase 4)

- El estado del árbol no se recalculaba dinámicamente — se guardaba una vez y quedaba obsoleto si se añadía contenido nuevo a un nodo ya `completed`. Corregido: `computeNodeStatuses` deriva todo de los intentos reales del usuario en cada carga.
- Hacer solo flashcards en un nodo no lo marcaba "en curso" — corregido.
- `predict_output` no dejaba reintentar tras fallar — corregido.
- CodeMirror ilegible en modo oscuro (mantenía su tema claro por defecto) — corregido con `useSyncExternalStore` sobre `prefers-color-scheme`.

## 5. Trabajo pedido fuera del roadmap original (semana del 15–17 sep)

- **Secciones del árbol**: columna `skill_nodes.section` con clave en inglés (`python`/`genai`/`project`/`engineering`). Fondo con degradado por sección.
- **Índice lateral** (`TreeIndex`) con enlaces de ancla a cada sección, visible a partir de `lg:` (1024px).
- **Conectores del árbol** borde-a-borde (no centro-a-centro) con animación de pulso continuo en los completados.
- **Navbar compartido** en las 4 páginas autenticadas.
- **Sistema de lecciones**: tabla `lessons` (Markdown puro, sin gating — material de consulta, no obligatorio para progresar). `/lessons` como índice agrupado por nodo, `/lessons/[id]` renderiza con `react-markdown` + `rehype-highlight`.
- **Renombre a PyQuest** (encaja con "quest"/"side quest", ya usado en el esquema desde el principio).
- Botón "Siguiente ejercicio" tras resolver cualquier tipo no-flashcard.
- Degradado de fondo hecho *full-bleed* (edge-to-edge real, no capado a `max-w-5xl`) — el ajuste más reciente, 17 sep.

## 6. Estado actual del contenido — **esto es lo importante para pedir ejercicios/módulos nuevos**

15 nodos totales (9 main quest + 6 side quests), pero el contenido real solo cubre los tres primeros:

| Nodo | Track | Sección | Ejercicios reales | Lección |
|---|---|---|---|---|
| M1 Python básico | main | python | 7 (flashcard×5, recall×1, code×1) | 1 |
| M2 Estructuras de datos | main | python | 11 (7 original + 4 tipos nuevos reales: fix_bug/predict_output/match/parsons) | 2 |
| M3 OOP | main | python | 6 | 2 |
| M4 Testing/errores | main | python | 17 | 3 |
| M5 Async | main | python | 15 | 3 |
| M6 RAG/vectores | main | genai | 15 | 3 |
| M7 Prompting/tools | main | genai | 14 | 3 |
| M8 Agentes LangGraph | main | genai | 13 | 3 |
| M9 Proyecto integrador | main | project | 8 | 2 |
| S1–S6 (cada side quest) | side | engineering | 8 cada una (48 en total) | 2 cada una (12 en total) |

**Total: 154 ejercicios, 34 lecciones, sobre 15 nodos — ninguno vacío ya** (actualizado 2026-09-22; las cifras de la tabla de arriba sustituyen la versión anterior de este documento, que reflejaba el estado a 17 sep con 12 nodos sin contenido). Los ejercicios `code`/`fix_bug`/`predict_output` traen un campo `meta` (`difficulty`, `interview`, `concepts`, a veces `recuerda_de`) que el motor aún ignora — pensado para un futuro "modo entrevista" y estadísticas por concepto.

**Backlog de contenido restante**: enriquecer `docs/backlog.md` si aparece contenido nuevo; el "hueco" de la sección anterior de este documento (M4–M9 y S1–S6 vacíos) ya está cerrado.

## 7. Esquema de base de datos

```sql
profiles (id uuid PK → auth.users, display_name, created_at)
user_stats (user_id PK, xp, streak_count, streak_last_date)
skill_nodes (id text PK, title, description, track 'main'|'side', position, section)
skill_prerequisites (node_id, requires_node_id)  -- M2M, permite ramas
exercises (id text PK, node_id, type, position, content jsonb)
exercise_attempts (id, user_id, exercise_id, status 'passed'|'failed'|'revealed', submitted_code, hints_used, created_at)  -- event log
user_node_progress (user_id, node_id, status, completed_at)
srs_cards (user_id, exercise_id, interval_days, ease, due_date, reps, lapses)  -- SM-2
lessons (id text PK, node_id, title, position, content_md)  -- solo lectura, sin progreso
```

**Reglas de diseño (no relitigar):**
- RLS en toda tabla de progreso (`user_id = auth.uid()`); contenido (`skill_nodes`, `exercises`, `lessons`) es de lectura pública.
- El desbloqueo se **calcula**, nunca se guarda — añadir contenido nuevo nunca corrompe progreso existente.
- `exercise_attempts` es un log de eventos, no estado — alimenta "repasa tus errores".
- El contenido de cada ejercicio vive en JSONB para no migrar esquema al añadir tipos.

## 8. Los 7 tipos de ejercicio — formato JSON exacto de cada uno

Útil para generar contenido nuevo con el shape correcto de primeras.

**`flashcard`** (SRS estilo Anki):
```json
{"prompt": "...", "answer": "...", "explanation": "..."}
```

**`recall`** (self-explanation — puede pedir código o texto):
```json
{"prompt": "...", "isCode": true, "modelAnswer": "..."}
```

**`code`** (Pyodide + tests):
```json
{
  "prompt": "...",
  "starter_code": "def f(x):\n    pass",
  "tests": [{"call": "f(1)", "expected": "2"}],
  "hints": ["pista conceptual", "pista de estrategia", "casi-código"],
  "solution": "def f(x):\n    return x + 1"
}
```

**`fix_bug`** (mismo shape que `code` — código roto en `starter_code`, el alumno lo arregla):
```json
{"prompt": "...", "starter_code": "...(con el bug)...", "tests": [...], "hints": [...], "solution": "..."}
```

**`predict_output`** (razonar sin ejecutar):
```json
{"prompt": "...", "code": "x = [1,2,3]\n...", "expected_output": "...", "explanation": "..."}
```

**`match`** (unir concepto↔definición, clic-clic, sin drag-and-drop):
```json
{"prompt": "...", "pairs": [{"term": "list", "definition": "..."}]}
```

**`parsons`** (reordenar líneas con botones subir/bajar):
```json
{"prompt": "...", "lines": ["def f(x):", "    return x + 1"]}
```

Nota: se propuso un 8º tipo (preguntas tipo test / multiple choice) y se descartó por decisión explícita del usuario — es redundante con `match`. No proponerlo de nuevo salvo que cambie el contexto.

**Escalera de pistas** (regla de diseño, no solo para `code`): 3 niveles — conceptual → estrategia → casi-código —, cada uno más caro en XP, antes de revelar la solución completa (que manda el ejercicio a repaso SRS en 3 días).

## 9. Convenciones a respetar al generar contenido

- **Idioma: inglés**, tanto interfaz como contenido (migrado el 22 sep; ya no queda español en la app ni en la base de datos).
- IDs de ejercicio siguen el patrón `{node-id}-{tipo abreviado}{n}` (p.ej. `m2-fixbug1`, `m3-e4`) o `{node}-e{n}` genérico — mantener consistencia con lo ya sembrado.
- Los identificadores dentro del código Python de los ejercicios (nombres de función, variables) están en inglés — nuevo contenido debe seguir esa convención, no mezclar español.
- Los ejercicios `code`/`fix_bug` deben poder ejecutarse en Pyodide (Python puro estándar, sin librerías externas no soportadas en WASM).
- Las side quests (S1–S6) son de ingeniería de software (Clean Code, SOLID, testing, patrones, arquitectura, Docker) — más conceptuales, probablemente con más peso en `flashcard`/`match`/`recall` que en `code`.
- M6–M9 (sección `genai`) son sobre RAG, embeddings, prompting, tool calling y agentes con LangGraph — contenido más avanzado que M1–M5.

## 10. Backlog pendiente (fuera del alcance de "generar contenido")

Ninguno bloqueado por contenido — ver `docs/backlog.md` para lo que queda (prerrequisitos de side quests sin decidir, aprovechar el campo `meta`).

## 11. Siguiente paso natural

Ninguna fase del roadmap original queda pendiente, y el hueco de contenido (M4–M9 y S1–S6 vacíos) ya se cerró el 22 sep con 154 ejercicios y 34 lecciones en total. Lo que queda es el backlog de la sección 10 (buscador de conceptos, migración a inglés), aprovechar el campo `meta` en el motor (modo entrevista, estadísticas por concepto), y contenido nuevo puntual si se detectan huecos al usar la app.
