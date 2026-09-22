# Backlog

Ideas y pulido pendiente, sin fase asignada todavía — no implementar hasta que se pida explícitamente.

- ~~**Color del cuadro de pistas**~~ — resuelto: ahora usa el color de acento nuevo en vez de ámbar.
- ~~**Título de la app**~~ — resuelto: renombrada a **PyQuest** (tab, navbar, portada).
- ~~**Rediseño visual general**~~ — resuelto: paleta inspirada en Python (azul/amarillo suavizados), animaciones (línea del árbol dibujándose, confeti al acertar, pop-in), hover/click en botones y nodos.
- ~~**Nuevo tipo de ejercicio: preguntas tipo test**~~ — descartado. Confirmado con el usuario que sería redundante con `match` (unir concepto↔definición ya cubre el caso de uso).
- **Buscador/índice de conceptos**: una lupa donde buscas p.ej. "dict" y te lleva directo al nodo/lección donde se enseña. Estaba aparcado "hasta que haya más contenido" — con 154 ejercicios y 34 lecciones (22 sep) esa condición ya se cumple; cada ejercicio `code`/`fix_bug`/`predict_output` trae además un campo `meta.concepts` pensado justo para esto. Listo para retomar si se pide.
- ~~**Sistema de lecciones**~~ — resuelto: `lessons` en Supabase (Markdown), `/lessons` como índice agrupado por nodo, `/lessons/[id]` con `react-markdown` + resaltado de sintaxis. Enlazado desde la página del nodo también. 34 lecciones sembradas, 2-3 por nodo en M2-S6, 1 en M1.
- **Aprovechar el campo `meta`** (`difficulty`, `interview`, `concepts`, `recuerda_de`) que trae todo el contenido sembrado el 22 sep: el motor lo ignora hoy. Candidatos: "modo entrevista" (filtrar por `interview: true`), estadísticas de aciertos por concepto, intercalar un `recuerda_de` del nodo anterior como repaso al empezar uno nuevo.
- **Prerrequisitos de las side quests**: hay una propuesta (`s1←m1, s2←m3, s3←m4, s4←m3, s5←m7, s6←m4`) para que se desbloqueen antes de lo que están ahora (`s1←m2, s4←m7, s5←m8, s6←m9`, del seed original). No aplicada — pendiente de decidir si de verdad se quiere adelantar el desbloqueo (2, 4 y 5 nodos antes respectivamente) o se deja como está.
- **Migración completa a inglés** (interfaz + contenido): decidido "con el tiempo", no ahora — el usuario quiere borrar el contenido en español existente en vez de mantener ambos idiomas, así que antes de tocarlo hay que confirmar el alcance exacto (¿se borra de verdad los 20+ ejercicios y la lección migrados, o se traducen?). Las claves de sección (`python`/`genai`/`project`/`engineering`) ya están preparadas para esto — cambiar la etiqueta es solo tocar `lib/sections.ts`, no las filas de la base de datos.
