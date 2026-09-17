-- Reference lessons (docs.python.org-style reading material), tied to a
-- node so they can be surfaced "while you're working on this node" rather
-- than living in an unrelated flat list. Pure reference content: no
-- completion tracking, no gating — reading one is never required to
-- progress, so there's no user_lesson_progress table.

create table lessons (
  id text primary key,
  node_id text not null references skill_nodes(id),
  title text not null,
  position int not null,
  content_md text not null
);

alter table lessons enable row level security;

-- Content table, same as skill_nodes/exercises: public read, no client-side
-- writes (content is managed directly via migrations/SQL editor).
create policy "anyone can read lessons" on lessons
  for select using (true);
