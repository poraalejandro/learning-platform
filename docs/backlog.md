# Backlog

Ideas y pulido pendiente, sin fase asignada todavía — no implementar hasta que se pida explícitamente.

- ~~**Color del cuadro de pistas**~~ — resuelto: ahora usa el color de acento nuevo en vez de ámbar.
- **Título de la app**: sigue siendo literalmente "learning-platform" en todas partes (`<title>` del navegador todavía dice "Create Next App" por defecto, el `<h1>` de las páginas dice "learning-platform"). Falta un nombre real de producto. Sigue pendiente — no se tocó en el rediseño visual (paleta/animaciones sí, pero el naming es otra decisión).
- ~~**Rediseño visual general**~~ — resuelto: paleta inspirada en Python (azul/amarillo suavizados), animaciones (línea del árbol dibujándose, confeti al acertar, pop-in), hover/click en botones y nodos.
- **Nuevo tipo de ejercicio: preguntas tipo test (elección múltiple)**. No está en el roadmap de fases del CLAUDE.md (que en la Fase 4 lista `parsons`, `fix_bug`, `match`, `predict_output`) — decidir si es un tipo nuevo (`multiple_choice`) o si encaja como variante de `match`/`predict_output` cuando se diseñe esa fase.
- **Buscador/índice de conceptos**: una lupa donde buscas p.ej. "dict" y te lleva directo al nodo/lección donde se enseña, en vez de tener que recordar en qué nodo estaba. Sin coste de LLM (consulta simple sobre `skill_nodes`/`exercises`), pero con solo 15 nodos y 20 ejercicios ahora mismo aporta poco — tiene más sentido cuando la Fase 4 meta bastante más contenido. Priorizado por encima del chat libre del tutor (§ decisión Fase 3) porque es más barato y resuelve una fricción real ya identificada en vez de refinar algo que ya funciona.
