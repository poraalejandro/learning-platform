-- Per docs/architecture.md §5, M1 (Python básico) is already known going in.
-- Hardcodes the one account that exists right now (created during Phase 0
-- login testing) — fine for a single-user Phase 1 milestone; this stops
-- being appropriate once there's more than one real user.

insert into public.user_node_progress (user_id, node_id, status, completed_at)
select id, 'm1-python-basics', 'completed', now()
from auth.users
where email = 'poraalejandro@gmail.com'
on conflict (user_id, node_id) do update set status = 'completed', completed_at = now();
