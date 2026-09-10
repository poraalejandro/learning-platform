-- Backfills profiles/user_stats for any auth.users row that predates the
-- on_auth_user_created trigger from 0001 (e.g. the account used to test
-- Phase 0 login, created before this trigger existed). Safe to re-run.

insert into public.profiles (id, display_name)
select id, email from auth.users
on conflict (id) do nothing;

insert into public.user_stats (user_id)
select id from auth.users
on conflict (user_id) do nothing;
