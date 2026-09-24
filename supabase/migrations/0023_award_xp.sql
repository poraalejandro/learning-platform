-- XP + daily streak. user_stats has existed since 0001 but nothing ever
-- wrote to it; this is the one way it changes from now on.
--
-- Why a function instead of letting the client UPDATE its own row:
--   * the streak rule (same day / consecutive day / broken) lives in one
--     place instead of being re-implemented by every caller;
--   * each call is clamped, and the direct UPDATE policy is dropped, so a
--     modified client can't just write xp = 1000000 in one request.
-- It's still trust-the-client in the sense the rest of the app already
-- accepts (see s5 lessons: progress has no external value) -- this only
-- removes the trivial abuse, it isn't anti-cheat.
--
-- `local_day` comes from the client because "today" for a streak has to
-- be the user's calendar day, not the database's UTC one. Values more than
-- a day away from the server's date are ignored (fall back to current_date)
-- so a wrong clock can't be used to fast-forward a streak.

create or replace function public.award_xp(amount int, local_day date)
returns table (xp int, streak_count int, streak_last_date date)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  clamped int := greatest(0, least(coalesce(amount, 0), 25));
  day date := local_day;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if day is null or day < current_date - 1 or day > current_date + 1 then
    day := current_date;
  end if;

  return query
  update user_stats us set
    xp = us.xp + clamped,
    streak_count = case
      when us.streak_last_date is not null and us.streak_last_date >= day then us.streak_count
      when us.streak_last_date = day - 1 then us.streak_count + 1
      else 1
    end,
    streak_last_date = case
      when us.streak_last_date is not null and us.streak_last_date >= day then us.streak_last_date
      else day
    end
  where us.user_id = auth.uid()
  returning us.xp, us.streak_count, us.streak_last_date;
end;
$$;

revoke all on function public.award_xp(int, date) from public;
grant execute on function public.award_xp(int, date) to authenticated;

drop policy if exists "update own stats" on user_stats;
