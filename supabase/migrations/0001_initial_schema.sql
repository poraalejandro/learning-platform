-- Phase 1 schema. See docs/architecture.md §2 for the design rationale.

-- ============================================================
-- TABLES
-- ============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

create table user_stats (
  user_id uuid primary key references profiles(id) on delete cascade,
  xp int not null default 0,
  streak_count int not null default 0,
  streak_last_date date
);

create table skill_nodes (
  id text primary key,
  title text not null,
  description text,
  track text not null check (track in ('main','side')),
  position int not null
);

create table skill_prerequisites (
  node_id text references skill_nodes(id) on delete cascade,
  requires_node_id text references skill_nodes(id) on delete cascade,
  primary key (node_id, requires_node_id)
);

create table exercises (
  id text primary key,
  node_id text not null references skill_nodes(id),
  type text not null check (type in
    ('code','flashcard','match','fix_bug','parsons','predict_output','recall')),
  position int not null,
  content jsonb not null
);

create table exercise_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  exercise_id text not null references exercises(id),
  status text not null check (status in ('passed','failed','revealed')),
  submitted_code text,
  hints_used int default 0,
  created_at timestamptz default now()
);

create table user_node_progress (
  user_id uuid references profiles(id) on delete cascade,
  node_id text references skill_nodes(id) on delete cascade,
  status text not null default 'locked'
    check (status in ('locked','available','in_progress','completed')),
  completed_at timestamptz,
  primary key (user_id, node_id)
);

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

-- ============================================================
-- AUTO-PROVISION profiles/user_stats on signup
-- Every other progress table FKs into profiles(id), so a user must have a
-- profiles row before they can have any progress at all. Doing this with a
-- trigger (instead of client-side inserts after signup) means it happens
-- exactly once, server-side, no matter which device/flow the user signed
-- up through.
-- ============================================================

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.email);

  insert into public.user_stats (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- Progress tables: a user may only read/write their own rows.
-- Content tables (skill_nodes, exercises, skill_prerequisites): readable by
-- anyone, writable by no one through the API (content is managed directly
-- in the SQL editor / a future admin tool, never through the app's own
-- Supabase credentials).
-- ============================================================

alter table profiles enable row level security;
alter table user_stats enable row level security;
alter table skill_nodes enable row level security;
alter table skill_prerequisites enable row level security;
alter table exercises enable row level security;
alter table exercise_attempts enable row level security;
alter table user_node_progress enable row level security;
alter table srs_cards enable row level security;

create policy "read own profile" on profiles
  for select using (id = auth.uid());
create policy "update own profile" on profiles
  for update using (id = auth.uid());

create policy "read own stats" on user_stats
  for select using (user_id = auth.uid());
create policy "update own stats" on user_stats
  for update using (user_id = auth.uid());

create policy "anyone can read skill_nodes" on skill_nodes
  for select using (true);
create policy "anyone can read skill_prerequisites" on skill_prerequisites
  for select using (true);
create policy "anyone can read exercises" on exercises
  for select using (true);

create policy "read own attempts" on exercise_attempts
  for select using (user_id = auth.uid());
create policy "insert own attempts" on exercise_attempts
  for insert with check (user_id = auth.uid());

create policy "read own node progress" on user_node_progress
  for select using (user_id = auth.uid());
create policy "insert own node progress" on user_node_progress
  for insert with check (user_id = auth.uid());
create policy "update own node progress" on user_node_progress
  for update using (user_id = auth.uid());

create policy "read own srs cards" on srs_cards
  for select using (user_id = auth.uid());
create policy "insert own srs cards" on srs_cards
  for insert with check (user_id = auth.uid());
create policy "update own srs cards" on srs_cards
  for update using (user_id = auth.uid());
