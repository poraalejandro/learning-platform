# Backlog

Ideas y pulido pendiente, sin fase asignada todavía — no implementar hasta que se pida explícitamente.

- ~~**Color del cuadro de pistas**~~ — resuelto: ahora usa el color de acento nuevo en vez de ámbar.
- ~~**Título de la app**~~ — resuelto: renombrada a **PyQuest** (tab, navbar, portada).
- ~~**Rediseño visual general**~~ — resuelto: paleta inspirada en Python (azul/amarillo suavizados), animaciones (línea del árbol dibujándose, confeti al acertar, pop-in), hover/click en botones y nodos.
- ~~**Nuevo tipo de ejercicio: preguntas tipo test**~~ — descartado. Confirmado con el usuario que sería redundante con `match` (unir concepto↔definición ya cubre el caso de uso).
- **Buscador/índice de conceptos**: una lupa donde buscas p.ej. "dict" y te lleva directo al nodo/lección donde se enseña. Sigue pendiente hasta que haya más contenido (con 15 nodos, 20 ejercicios y 1 lección aporta poco todavía).
- ~~**Sistema de lecciones**~~ — resuelto: `lessons` en Supabase (Markdown), `/lessons` como índice agrupado por nodo, `/lessons/[id]` con `react-markdown` + resaltado de sintaxis. Enlazado desde la página del nodo también. Una lección real sembrada (M1); el resto de nodos siguen sin contenido.
- **Migración completa a inglés** (interfaz + contenido): decidido "con el tiempo", no ahora — el usuario quiere borrar el contenido en español existente en vez de mantener ambos idiomas, así que antes de tocarlo hay que confirmar el alcance exacto (¿se borra de verdad los 20+ ejercicios y la lección migrados, o se traducen?). Las claves de sección (`python`/`genai`/`project`/`engineering`) ya están preparadas para esto — cambiar la etiqueta es solo tocar `lib/sections.ts`, no las filas de la base de datos.
