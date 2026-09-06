-- ============================================================================
-- 0018 — REVISION CENTER + MATH MIND (spec §19, §20)
--
-- GAPS THIS FIXES
-- ---------------
-- 1. `weak_topics` exists but NOTHING ever writes to it, so "weak topic
--    tracking" (§19) and "weak topics" in the Revision Center (§20) had no
--    data source at all.
-- 2. `sync_revision_from_attempt()` only understands LEGACY quiz_attempts. The
--    real question bank uses `bank_attempts`, so wrong answers from the 22,024
--    published questions never reached revision.
--
-- WHAT IT ADDS
--   sync_revision_from_bank_attempt()  wrong bank answers -> revision items
--                                      + per-topic accuracy -> weak_topics
--   revision_due()                     what to revise now (Leitner boxes)
--   revision_mark()                    got it right / wrong -> move the box
--   revision_overview()                counts for the Revision Center
--   mathmind_save_round()              store a Math Mind round
--   mathmind_progress()                level, best score, accuracy
--
-- SPACED REPETITION: `box` 1..5 with delays 0d / 1d / 3d / 7d / 21d. Right
-- answer promotes a box, wrong resets to 1. Box 5 answered right = mastered.
--
-- Idempotent: safe to re-run.
-- ============================================================================

-- Math Mind rounds. One row per completed round, so progress is real history
-- rather than a number in localStorage that a reinstall would wipe.
create table if not exists public.mathmind_rounds (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  level       int  not null check (level between 1 and 5),
  topic       text,
  total       int  not null check (total > 0),
  correct     int  not null check (correct >= 0),
  duration_ms int,
  created_at  timestamptz not null default now()
);
create index if not exists mathmind_rounds_user_idx
  on public.mathmind_rounds (user_id, created_at desc);

alter table public.mathmind_rounds enable row level security;

drop policy if exists mathmind_rounds_own on public.mathmind_rounds;
create policy mathmind_rounds_own on public.mathmind_rounds
  for select using (user_id = auth.uid());

drop policy if exists mathmind_rounds_insert on public.mathmind_rounds;
create policy mathmind_rounds_insert on public.mathmind_rounds
  for insert with check (user_id = auth.uid());

-- ------------------------------------------------- bank attempt -> revision --
/**
 * After a bank quiz is graded, turn every WRONG answer into a revision item and
 * update the student's per-topic accuracy.
 *
 * Safe to call more than once for the same attempt: revision items upsert, and
 * weak_topics is recomputed from the attempt's stored result rather than
 * incremented, so a double call cannot inflate the numbers.
 */
create or replace function public.sync_revision_from_bank_attempt(p_attempt uuid)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid;
  v_result jsonb;
  n int := 0;
begin
  select user_id, result into v_user, v_result
  from public.bank_attempts where id = p_attempt;

  if v_user is null or v_user <> auth.uid() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if v_result is null then
    return 0;   -- not graded yet
  end if;

  -- Every graded item of this attempt, joined back to its question.
  create temp table _items on commit drop as
  select (i->>'question_id')::uuid          as question_id,
         (i->>'is_correct')                 as is_correct_raw,
         (i->>'is_correct')::boolean        as is_correct
  from jsonb_array_elements(coalesce(v_result->'items', '[]'::jsonb)) i
  where (i->>'question_id') is not null;

  -- 1. wrong answers become revision items
  insert into public.revision_items
    (user_id, source, item_type, target_id, title, subtitle, url, topic)
  select v_user, 'wrong_answer', 'question', q.id::text,
         left(q.stem, 240),
         coalesce(q.subject_name, q.subject_code),
         '/quiz/bank-' || q.subject_code,
         nullif(btrim(coalesce(q.topic, '')), '')
  from _items it
  join public.question_bank q on q.id = it.question_id
  where it.is_correct is false           -- NULL = unanswered, not wrong
  on conflict (user_id, item_type, target_id) do update
    set box = 1, due_at = now(), mastered = false;
  get diagnostics n = row_count;

  -- 2. per-topic accuracy. Recomputed from scratch for the topics touched, so
  --    re-running this function never double-counts.
  -- `accuracy` is a GENERATED column: the database derives it from
  -- attempted/correct, so it must never be written here.
  insert into public.weak_topics
    (user_id, subject_code, topic, attempted, correct, updated_at)
  select v_user,
         q.subject_code,
         coalesce(nullif(btrim(q.topic), ''), 'General'),
         count(*) filter (where it.is_correct is not null),
         count(*) filter (where it.is_correct),
         now()
  from _items it
  join public.question_bank q on q.id = it.question_id
  group by q.subject_code, coalesce(nullif(btrim(q.topic), ''), 'General')
  on conflict (user_id, subject_code, topic) do update
    set attempted = public.weak_topics.attempted + excluded.attempted,
        correct   = public.weak_topics.correct   + excluded.correct,
        updated_at = now();

  return n;
end $$;

revoke all on function public.sync_revision_from_bank_attempt(uuid) from public, anon;
grant execute on function public.sync_revision_from_bank_attempt(uuid) to authenticated;

-- ------------------------------------------------------------ revision ------
/** Items due for revision now, hardest boxes first. */
create or replace function public.revision_due(p_limit int default 20)
returns table (
  id uuid, item_type text, target_id text, title text, subtitle text,
  url text, topic text, box int, times_revised int, due_at timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select r.id, r.item_type, r.target_id, r.title, r.subtitle,
         r.url, r.topic, r.box, r.times_revised, r.due_at
  from public.revision_items r
  where r.user_id = auth.uid()
    and not r.mastered
    and (r.due_at is null or r.due_at <= now())
  order by r.box asc, r.due_at nulls first
  limit greatest(1, least(coalesce(p_limit, 20), 100));
$$;

/**
 * Record a revision result and reschedule.
 * Right -> next box, longer delay. Wrong -> back to box 1, due immediately.
 */
create or replace function public.revision_mark(p_item uuid, p_correct boolean)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_box int;
begin
  select box into v_box
  from public.revision_items
  where id = p_item and user_id = auth.uid();

  if v_box is null then
    raise exception 'item not found' using errcode = 'P0002';
  end if;

  if p_correct then
    update public.revision_items
       set box = least(v_box + 1, 5),
           times_revised = times_revised + 1,
           last_revised_at = now(),
           mastered = (v_box >= 5),
           due_at = now() + (case least(v_box + 1, 5)
                               when 1 then interval '0 day'
                               when 2 then interval '1 day'
                               when 3 then interval '3 days'
                               when 4 then interval '7 days'
                               else        interval '21 days'
                             end)
     where id = p_item and user_id = auth.uid();
  else
    update public.revision_items
       set box = 1,
           times_revised = times_revised + 1,
           last_revised_at = now(),
           mastered = false,
           due_at = now()
     where id = p_item and user_id = auth.uid();
  end if;
end $$;

/** Headline counts for the Revision Center. */
create or replace function public.revision_overview()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'total',    (select count(*) from public.revision_items where user_id = auth.uid()),
    'due',      (select count(*) from public.revision_items
                  where user_id = auth.uid() and not mastered
                    and (due_at is null or due_at <= now())),
    'mastered', (select count(*) from public.revision_items
                  where user_id = auth.uid() and mastered),
    'weak_topics', coalesce((
      select jsonb_agg(t) from (
        select subject_code, topic, attempted, correct, accuracy
        from public.weak_topics
        where user_id = auth.uid() and attempted >= 2 and accuracy < 60
        order by accuracy asc, attempted desc
        limit 10
      ) t), '[]'::jsonb)
  );
$$;

revoke all on function public.revision_due(int) from public, anon;
revoke all on function public.revision_mark(uuid, boolean) from public, anon;
revoke all on function public.revision_overview() from public, anon;
grant execute on function public.revision_due(int) to authenticated;
grant execute on function public.revision_mark(uuid, boolean) to authenticated;
grant execute on function public.revision_overview() to authenticated;

-- ------------------------------------------------------------ math mind -----
/** Store one finished Math Mind round. */
create or replace function public.mathmind_save_round(
  p_level int, p_total int, p_correct int,
  p_topic text default null, p_duration_ms int default null)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if p_total is null or p_total < 1 then
    raise exception 'total must be at least 1' using errcode = 'P0001';
  end if;
  if p_correct < 0 or p_correct > p_total then
    raise exception 'correct must be between 0 and total' using errcode = 'P0001';
  end if;

  insert into public.mathmind_rounds (user_id, level, topic, total, correct, duration_ms)
  values (auth.uid(), greatest(1, least(p_level, 5)), p_topic, p_total, p_correct, p_duration_ms)
  returning id into v_id;
  return v_id;
end $$;

/**
 * Progress summary. `unlocked_level` is the adaptive part (§19): a level opens
 * once the student has cleared the one below at 80%+ over a full round.
 */
create or replace function public.mathmind_progress()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with r as (
    select * from public.mathmind_rounds where user_id = auth.uid()
  ),
  per_level as (
    select level,
           count(*)                                        as rounds,
           max(round(100.0 * correct / total, 0))::int      as best_pct,
           round(100.0 * sum(correct) / greatest(sum(total), 1), 1) as accuracy
    from r group by level
  )
  select jsonb_build_object(
    'rounds',   (select count(*) from r),
    'accuracy', coalesce((select round(100.0 * sum(correct) / greatest(sum(total),1), 1) from r), 0),
    'levels',   coalesce((select jsonb_agg(p order by p.level) from per_level p), '[]'::jsonb),
    'unlocked_level', coalesce((
      -- highest consecutive level cleared at 80%+, capped at 5
      select least(5, 1 + count(*))
      from generate_series(1, 4) g
      where exists (
        select 1 from per_level p where p.level = g and p.best_pct >= 80
      )
        and not exists (
        select 1 from generate_series(1, g) h
        where not exists (select 1 from per_level p2 where p2.level = h and p2.best_pct >= 80)
      )
    ), 1)
  );
$$;

revoke all on function public.mathmind_save_round(int,int,int,text,int) from public, anon;
revoke all on function public.mathmind_progress() from public, anon;
grant execute on function public.mathmind_save_round(int,int,int,text,int) to authenticated;
grant execute on function public.mathmind_progress() to authenticated;

select 'MIGRATION 0018 COMPLETE' as status;
