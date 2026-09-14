-- Phase 3: per-user rate limiting for the tutor endpoint, per CLAUDE.md's
-- hard rule ("not optional - ship it in Phase 3"). Lives in Postgres, not
-- in-memory in the FastAPI process, because Render's free tier spins the
-- backend down after inactivity - an in-memory counter would reset on
-- every cold start and the limit would mean nothing.

create table tutor_rate_limits (
  user_id uuid primary key references profiles(id) on delete cascade,
  window_start timestamptz not null default now(),
  request_count int not null default 0
);

alter table tutor_rate_limits enable row level security;

-- Only the backend (via the service role key, which bypasses RLS) writes
-- this table. Users may read their own row - handy if the UI ever wants to
-- show "N hints left this hour" - but there is deliberately no insert/update
-- policy for them.
create policy "read own tutor rate limit" on tutor_rate_limits
  for select using (user_id = auth.uid());

-- Atomically checks whether a user is under their rate limit and, if so,
-- consumes one request from it - read-check-write done as one statement
-- per branch so two concurrent requests can't both slip through under the
-- same count.
create or replace function check_and_increment_tutor_rate_limit(
  p_user_id uuid,
  p_window_minutes int,
  p_max_requests int
) returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  v_window_start timestamptz;
  v_count int;
begin
  select window_start, request_count into v_window_start, v_count
  from tutor_rate_limits where user_id = p_user_id
  for update;

  if not found then
    insert into tutor_rate_limits (user_id, window_start, request_count)
    values (p_user_id, now(), 1);
    return true;
  end if;

  if now() - v_window_start > make_interval(mins => p_window_minutes) then
    update tutor_rate_limits set window_start = now(), request_count = 1
    where user_id = p_user_id;
    return true;
  end if;

  if v_count >= p_max_requests then
    return false;
  end if;

  update tutor_rate_limits set request_count = request_count + 1
  where user_id = p_user_id;
  return true;
end;
$$;
