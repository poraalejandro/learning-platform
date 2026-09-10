# Learning Platform 2.0 — Documento de Arquitectura

## 1. Stack validado (con cambios respecto a la propuesta original)

| Capa | Propuesta original | Decisión final | Por qué |
|---|---|---|---|
| Frontend | Next.js + Tailwind | ✅ Igual | Vercel lo despliega gratis; React ya lo conoces de la app actual |
| Backend | FastAPI | ✅ Igual | Coincide con el stack del Proyecto 3 de tu plan — doble aprovechamiento |
| BD relacional + Auth | Supabase | ✅ Igual | Auth + Postgres + RLS en un solo servicio gratuito |
| BD vectorial | Pinecone | ❌ **Eliminada del MVP** | El contexto del tutor se conoce siempre (lección + código actual): no hay retrieval. Si algún día hace falta → pgvector dentro de Supabase |
| Ejecución de código | (sin definir) | **Pyodide (navegador)** | Python en WebAssembly: sin sandboxing en servidor, gratis, funciona offline |
| Tutor LLM | (sin definir) | Endpoint FastAPI → Gemini/Claude API | Única pieza con coste variable → rate limit por usuario desde el día 1 |

**Despliegue:** Frontend → Vercel (gratis). Backend → Render free tier (ojo: cold starts de ~30s tras inactividad — aceptable para uso personal; si molesta, Railway ~5$/mes). Supabase → free tier.

**Flujo de auth/sync:** Supabase Auth (email o Google) emite JWT → el cliente lee/escribe su progreso directamente contra Supabase (protegido por Row Level Security) → FastAPI verifica el mismo JWT solo para el endpoint del tutor. El estado vive en la nube; empezar en el móvil y seguir en el PC es automático.

---

## 2. Esquema de base de datos (Supabase / PostgreSQL)

```sql
-- Perfil (extiende auth.users de Supabase)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

-- Stats de gamificación
create table user_stats (
  user_id uuid primary key references profiles(id) on delete cascade,
  xp int not null default 0,
  streak_count int not null default 0,
  streak_last_date date
);

-- CONTENIDO: nodos del skill tree (main quest + side quests)
create table skill_nodes (
  id text primary key,                -- 'py-oop', 'solid-principles'
  title text not null,
  description text,
  track text not null check (track in ('main','side')),
  position int not null               -- orden visual dentro de su rama
);

-- Prerequisitos many-to-many (permite ramas, no solo secuencia)
create table skill_prerequisites (
  node_id text references skill_nodes(id) on delete cascade,
  requires_node_id text references skill_nodes(id) on delete cascade,
  primary key (node_id, requires_node_id)
);

-- Ejercicios de cada nodo. El contenido va en JSONB:
-- el motor soporta tipos nuevos sin migrar el esquema
create table exercises (
  id text primary key,
  node_id text not null references skill_nodes(id),
  type text not null check (type in
    ('code','flashcard','match','fix_bug','parsons','predict_output','recall')),
  position int not null,
  content jsonb not null   -- {prompt, starter_code, tests[], pairs[], hints[], solution}
);

-- PROGRESO: log de intentos (event log, no estado)
create table exercise_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  exercise_id text not null references exercises(id),
  status text not null check (status in ('passed','failed','revealed')),
  submitted_code text,
  hints_used int default 0,
  created_at timestamptz default now()
);

-- Estado del skill tree por usuario (tabla puente)
create table user_node_progress (
  user_id uuid references profiles(id) on delete cascade,
  node_id text references skill_nodes(id) on delete cascade,
  status text not null default 'locked'
    check (status in ('locked','available','in_progress','completed')),
  completed_at timestamptz,
  primary key (user_id, node_id)
);

-- Repetición espaciada (algoritmo SM-2 simplificado, como Anki)
create table srs_cards (
  user_id uuid references profiles(id) on delete cascade,
  exercise_id text references exercises(id) on delete cascade,
  interval_days int not null default 0,
  ease numeric not null default 2.5,
  due_date date not null default current_date,
  reps int not null default 0,
  lapses int not null default 0,
  primary key (user_id, exercise_id)
);
```

**Reglas de diseño clave:**
- **RLS activado en todas las tablas de progreso**: `user_id = auth.uid()` — cada usuario solo ve lo suyo. Las tablas de contenido (`skill_nodes`, `exercises`) son de lectura pública.
- **El desbloqueo se calcula, no se guarda**: un nodo pasa a `available` cuando todos sus `skill_prerequisites` están `completed`. Añadir contenido nuevo nunca corrompe progreso existente.
- **`exercise_attempts` es oro**: al ser un log, alimenta la feature "repasa TUS errores" (ver §4) y te dice qué ejercicios generan más atascos.

---

## 3. Pantalla clave: Resolución de Ejercicios (estructura de componentes)

```
<ExercisePage>
├── <TopBar>                      ── XP · racha · nodo actual del árbol
├── <ExercisePanel>               ── columna principal (70%)
│   ├── <PromptCard/>             ── enunciado del reto
│   ├── <CodeEditor/>             ── CodeMirror + Pyodide (ejecuta en navegador)
│   ├── <TestResults/>            ── tests en verde/rojo tras "Ejecutar"
│   └── <ActionBar>               ── [▶ Ejecutar] [💡 Pista] [🏳 Ver solución]
└── <TutorDock>                   ── columna lateral (30%), colapsable
    ├── <HintLadder/>             ── escalera de pistas progresivas (ver §4)
    └── <TutorChat/>              ── chat libre; el backend le inyecta:
                                     enunciado + tu código actual + tests fallidos
                                     + nº de intentos. Responde en streaming.
```

Mockup en texto de la escalera de pistas (la pieza anti-"dame la respuesta"):

```
┌─ 💡 Pistas ────────────────────────────────┐
│ [1] Conceptual  → "Recuerda que un dict    │   ← desbloqueada
│     no garantiza orden de claves..."        │
│ [2] Estrategia  → "Recorre los items y     │   ← bloqueada (cuesta -5 XP)
│     acumula en una variable..."             │
│ [3] Casi-código → "for k, v in d.items():" │   ← bloqueada (cuesta -10 XP)
│ [🏳] Solución completa                      │   ← marca el ejercicio para
│                                              │     reaparecer en 3 días (SRS)
└─────────────────────────────────────────────┘
```

---

## 4. Motor de ejercicios — tipos y base en neuroeducación

| Tipo | Qué es | Por qué funciona |
|---|---|---|
| `code` | Reto de escribir código con tests | Active recall + feedback inmediato (el bucle de flow) |
| `flashcard` | SRS estilo Anki (SM-2) | Repetición espaciada — retención a largo plazo |
| `match` | Unir concepto ↔ definición | Reconocimiento; bueno para arquitectura/patrones |
| `fix_bug` | Código roto que debes arreglar | Transferencia: leer código ajeno es el 80% del trabajo real |
| `parsons` ✚ | Líneas de código desordenadas que debes reordenar | El tipo con MÁS evidencia en investigación: enseña estructura sin la carga de sintaxis; ideal como paso intermedio antes de `code` |
| `predict_output` ✚ | "¿Qué imprime este código?" sin ejecutarlo | Entrena el modelo mental del intérprete (trace tables) — lo que separa a quien entiende de quien copia |
| `recall` ✚ | Explicar un concepto con tus palabras, luego comparar con respuesta modelo | Self-explanation effect; ya lo usas en la app actual y funciona |

**Mecánicas de flow (Csíkszentmihályi: reto ≈ habilidad):**
- 2 fallos seguidos en un ejercicio → el tutor ofrece bajar a la variante `parsons` del mismo problema (baja el reto, no la dignidad)
- Ejercicio resuelto rápido y sin pistas → la app propone saltar al siguiente nodo (sube el reto)
- **"Repasa tus errores"**: los ejercicios donde usaste `revealed` o fallaste 2+ veces se convierten automáticamente en `srs_cards` con prioridad — repasas *tu* debilidad real, no contenido genérico.
- XP descuenta por pista usada (dificultad deseable preservada), nunca castiga el fallo en sí.

**Referencias de apps de éxito aplicadas:** de Duolingo, la racha y el mapa visual (pero NO sus lecciones pasivas); de Anki, SM-2 puro; de Brilliant, el "problema primero, teoría después"; de LeetCode, los tests visibles como definición de éxito.

---

## 5. Skill Tree (temario) — estructura inicial

```
🌳 MAIN QUEST                          🌿 SIDE QUESTS (se desbloquean desde main)
─────────────────────                  ─────────────────────
M1 Python básico (ya lo tienes ✓)
M2 Estructuras de datos a fondo   ───→ S1 Clean Code & refactoring
M3 OOP en Python                  ───→ S2 Principios SOLID
M4 Errores, testing básico        ───→ S3 Unit vs Integration testing
M5 Asincronía (async/await)
M6 Embeddings, RAG, Vector DBs (✓ parcial)
M7 Prompting dinámico + tool calling ─→ S4 Patrones: Factory, Strategy, Observer
M8 Agentes con LangGraph + memoria ──→ S5 Monolito vs microservicios, Clean Arch
M9 Proyecto integrador             ──→ S6 Docker para developers
```

Cada nodo main termina construyendo una pieza de un proyecto real. Nota sobre "LCEL": es sintaxis específica de LangChain — se incluye dentro de M7/M8 como contenido, pero el árbol enseña el concepto (composición de cadenas) antes que la sintaxis de un framework concreto.

---

## 6. Roadmap del MVP (fases cerradas, cada una usable por sí misma)

- **Fase 0 — Cimientos**: monorepo, Supabase con auth funcionando, Next.js "hola mundo" en Vercel, FastAPI "hola mundo" en Render. *Hecho: login desde el móvil y el PC con la misma cuenta.* ✅ Completada.
- **Fase 1 — Contenido y árbol**: esquema SQL migrado, skill tree visual (solo lectura), una unidad de contenido real migrada de la app actual. *Hecho: ves el árbol con tu progreso.*
- **Fase 2 — Motor mínimo**: ejercicios `code` (Pyodide + tests) y `flashcard` (SM-2), progreso sincronizado. *Hecho: resuelves un ejercicio en el bus y aparece completado en casa.*
- **Fase 3 — Tutor**: endpoint LLM con la escalera de pistas y el chat contextual, rate limit. *Hecho: te atascas y las pistas te desatascan sin darte la solución.*
- **Fase 4 — Resto del motor y pulido**: `parsons`, `fix_bug`, `match`, `predict_output`, "repasa tus errores", side quests, animaciones del árbol.

Regla de oro: **no se empieza una fase sin desplegar la anterior.**
