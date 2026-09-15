-- Groups the tree into labelled stretches ("Python", "IA generativa"...)
-- so the path reads as chapters rather than one long ladder.
--
-- Stores a *key*, not a display label: the UI maps the key to a name, so
-- translating the app later doesn't mean rewriting rows (see the pending
-- ES/EN work).

alter table skill_nodes add column section text;

update skill_nodes set section = 'python' where id in (
  'm1-python-basics', 'm2-data-structures', 'm3-oop',
  'm4-testing-errors', 'm5-async'
);

update skill_nodes set section = 'genai' where id in (
  'm6-rag-vectors', 'm7-prompting-tools', 'm8-agents-langgraph'
);

update skill_nodes set section = 'project' where id = 'm9-capstone';

update skill_nodes set section = 'engineering' where track = 'side';

alter table skill_nodes alter column section set not null;
