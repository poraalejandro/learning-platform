-- Skill tree structure from docs/architecture.md §5. No exercises yet —
-- that's a separate content migration once real exercise content exists.

insert into public.skill_nodes (id, title, description, track, position) values
  ('m1-python-basics',     'Python básico',                          null, 'main', 1),
  ('m2-data-structures',   'Estructuras de datos a fondo',           null, 'main', 2),
  ('m3-oop',               'OOP en Python',                          null, 'main', 3),
  ('m4-testing-errors',    'Errores y testing básico',               null, 'main', 4),
  ('m5-async',             'Asincronía (async/await)',               null, 'main', 5),
  ('m6-rag-vectors',       'Embeddings, RAG, Vector DBs',             null, 'main', 6),
  ('m7-prompting-tools',   'Prompting dinámico + tool calling',       null, 'main', 7),
  ('m8-agents-langgraph',  'Agentes con LangGraph + memoria',         null, 'main', 8),
  ('m9-capstone',          'Proyecto integrador',                    null, 'main', 9),

  ('s1-clean-code',        'Clean Code & refactoring',               null, 'side', 1),
  ('s2-solid',             'Principios SOLID',                       null, 'side', 2),
  ('s3-testing-types',     'Unit vs Integration testing',            null, 'side', 3),
  ('s4-design-patterns',   'Patrones: Factory, Strategy, Observer',  null, 'side', 4),
  ('s5-architecture',      'Monolito vs microservicios, Clean Arch', null, 'side', 5),
  ('s6-docker',            'Docker para developers',                 null, 'side', 6);

insert into public.skill_prerequisites (node_id, requires_node_id) values
  ('m2-data-structures',  'm1-python-basics'),
  ('m3-oop',              'm2-data-structures'),
  ('m4-testing-errors',   'm3-oop'),
  ('m5-async',            'm4-testing-errors'),
  ('m6-rag-vectors',      'm5-async'),
  ('m7-prompting-tools',  'm6-rag-vectors'),
  ('m8-agents-langgraph', 'm7-prompting-tools'),
  ('m9-capstone',         'm8-agents-langgraph'),

  ('s1-clean-code',       'm2-data-structures'),
  ('s2-solid',            'm3-oop'),
  ('s3-testing-types',    'm4-testing-errors'),
  ('s4-design-patterns',  'm7-prompting-tools'),
  ('s5-architecture',     'm8-agents-langgraph'),
  ('s6-docker',           'm9-capstone');
