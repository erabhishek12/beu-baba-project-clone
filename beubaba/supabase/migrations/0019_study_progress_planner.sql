-- ============================================================================
-- 0019 — SYLLABUS PROGRESS + EXAM PLANNER
--
-- WHY
-- ---
-- A student can read the syllabus but has no way to record what they have
-- actually studied. There was no table, no column, nothing — so the app could
-- never answer the one question that matters before an exam:
-- "how much of this subject is left?"
--
-- This adds:
--   study_progress   one row per (user, subject, unit) marked studied
--   exam_dates       the student's own exam date per subject
--   study_progress_summary()  % done per subject + days to exam
--   toggle_unit_studied()     mark / unmark a unit
--   set_exam_date()           save or clear an exam date
--   study_plan()              day-by-day plan over the units still left
--
-- The plan is computed in SQL from real data (units remaining, days left), not
-- guessed in the browser, so it stays correct across devices.
--
-- Idempotent: safe to re-run.
-- ============================================================================

-- ------------------------------------------------------------- progress ----
create table if not exists public.study_progress (
  user_id      uuid not null references public.profiles(id) on delete cascade,
  subject_code text not null,
  unit_index   int  not null,
  unit_title   text,
  studied_at   timestamptz not null default now(),
  primary key (user_id, subject_code, unit_index)
);

alter table public.study_progress enable row level security;

drop policy if exists study_progress_own on public.study_progress;
create policy study_progress_own on public.study_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ------------------------------------------------------------ exam dates ---
create table if not exists public.exam_dates (
  user_id      uuid not null references public.profiles(id) on delete cascade,
  subject_code text not null,
  subject_name text,
  exam_on      date not null,
  updated_at   timestamptz not null default now(),
  primary key (user_id, subject_code)
);

alter table public.exam_dates enable row level security;

drop policy if exists exam_dates_own on public.exam_dates;
create policy exam_dates_own on public.exam_dates
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- --------------------------------------------------------------- toggle ----
/** Mark a unit studied, or unmark it. Returns the new state. */
create or replace function public.toggle_unit_studied(
  p_subject_code text, p_unit_index int, p_unit_title text default null)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_exists boolean;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  select true into v_exists from public.study_progress
   where user_id = auth.uid() and subject_code = p_subject_code
     and unit_index = p_unit_index;

  if v_exists then
    delete from public.study_progress
     where user_id = auth.uid() and subject_code = p_subject_code
       and unit_index = p_unit_index;
    return false;
  end if;

  insert into public.study_progress (user_id, subject_code, unit_index, unit_title)
  values (auth.uid(), p_subject_code, p_unit_index, p_unit_title)
  on conflict do nothing;
  return true;
end $$;

/** Save an exam date, or clear it by passing null. */
create or replace function public.set_exam_date(
  p_subject_code text, p_exam_on date, p_subject_name text default null)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if p_exam_on is null then
    delete from public.exam_dates
     where user_id = auth.uid() and subject_code = p_subject_code;
    return;
  end if;

  insert into public.exam_dates (user_id, subject_code, subject_name, exam_on)
  values (auth.uid(), p_subject_code, p_subject_name, p_exam_on)
  on conflict (user_id, subject_code) do update
    set exam_on = excluded.exam_on,
        subject_name = coalesce(excluded.subject_name, public.exam_dates.subject_name),
        updated_at = now();
end $$;

-- -------------------------------------------------------------- summary ----
/**
 * Progress per subject, for every subject that has published questions
 * (that is the set the app can actually teach), plus the student's exam date.
 *
 * `total_units` comes from the question bank's unit breakdown rather than the
 * syllabus JSON, because that is what the quizzes are keyed to — so the
 * percentage always lines up with what a student can practise.
 */
create or replace function public.study_progress_summary()
returns table (
  subject_code   text,
  subject_name   text,
  total_units    int,
  studied_units  int,
  percent        int,
  exam_on        date,
  days_left      int
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with pub as (
    select q.subject_code,
           max(q.subject_name) as subject_name,
           count(distinct coalesce(q.unit_index, 0)) as total_units
    from public.question_bank q
    where q.published = true and q.human_verified = true
    group by q.subject_code
  ),
  done as (
    select p.subject_code, count(*)::int as studied_units
    from public.study_progress p
    where p.user_id = auth.uid()
    group by p.subject_code
  )
  select pub.subject_code,
         pub.subject_name,
         pub.total_units::int,
         coalesce(done.studied_units, 0),
         case when pub.total_units > 0
              then least(100, round(100.0 * coalesce(done.studied_units, 0) / pub.total_units))::int
              else 0 end,
         e.exam_on,
         case when e.exam_on is null then null
              else (e.exam_on - current_date)::int end
  from pub
  left join done on done.subject_code = pub.subject_code
  left join public.exam_dates e
         on e.subject_code = pub.subject_code and e.user_id = auth.uid()
  where coalesce(done.studied_units, 0) > 0 or e.exam_on is not null
  order by (e.exam_on is null), e.exam_on, pub.subject_name;
$$;

-- ----------------------------------------------------------------- plan ----
/**
 * A day-by-day plan for one subject: spread the units still unstudied across
 * the days remaining before the exam.
 *
 * Honest about the hard cases:
 *   - no exam date  -> empty plan (nothing to schedule against)
 *   - exam passed   -> empty plan
 *   - fewer days than units -> more than one unit per day, evenly
 *   - already done  -> empty plan
 */
create or replace function public.study_plan(p_subject_code text)
returns table (
  day_number  int,
  plan_date   date,
  unit_index  int,
  unit_title  text
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  -- One query, no temp table: a STABLE function may not CREATE TABLE AS.
  with exam as (
    select exam_on
    from public.exam_dates
    where user_id = auth.uid()
      and subject_code = p_subject_code
      and exam_on >= current_date        -- a passed exam yields no plan
  ),
  remaining as (
    -- Units of this subject the student has NOT ticked off yet.
    select coalesce(q.unit_index, 0) as unit_index,
           max(coalesce(nullif(btrim(q.unit_title), ''),
                        'Unit ' || coalesce(q.unit_index, 0))) as unit_title
    from public.question_bank q
    where q.published = true
      and q.human_verified = true
      and q.subject_code = p_subject_code
      and not exists (
        select 1 from public.study_progress sp
        where sp.user_id = auth.uid()
          and sp.subject_code = p_subject_code
          and sp.unit_index = coalesce(q.unit_index, 0)
      )
    group by coalesce(q.unit_index, 0)
  ),
  sized as (
    select (select exam_on from exam) as exam_on,
           (select count(*) from remaining) as n_left,
           -- include today, so a same-day exam still gives one study day
           greatest(1, ((select exam_on from exam) - current_date)::int) as n_days
  ),
  per as (
    -- units per day; when days < units this is > 1, spread evenly
    select exam_on, n_left,
           greatest(1, ceil(n_left::numeric / n_days))::int as per_day
    from sized
    where exam_on is not null and n_left > 0
  ),
  ordered as (
    select r.unit_index, r.unit_title,
           (row_number() over (order by r.unit_index) - 1) as idx
    from remaining r
  )
  select (1 + o.idx / p.per_day)::int              as day_number,
         (current_date + (o.idx / p.per_day)::int) as plan_date,
         o.unit_index,
         o.unit_title
  from ordered o cross join per p
  order by o.unit_index;
$$;

revoke all on function public.toggle_unit_studied(text,int,text) from public, anon;
revoke all on function public.set_exam_date(text,date,text) from public, anon;
revoke all on function public.study_progress_summary() from public, anon;
revoke all on function public.study_plan(text) from public, anon;
grant execute on function public.toggle_unit_studied(text,int,text) to authenticated;
grant execute on function public.set_exam_date(text,date,text) to authenticated;
grant execute on function public.study_progress_summary() to authenticated;
grant execute on function public.study_plan(text) to authenticated;

select 'MIGRATION 0019 COMPLETE' as status;
