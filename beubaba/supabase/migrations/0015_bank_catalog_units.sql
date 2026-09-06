-- ============================================================================
-- 0015 — RICHER BANK CATALOGUE: branch, semester, units (paper-wise selection)
--
-- PROBLEM
-- -------
-- Every bank quiz was hardcoded to 10 questions with no way to choose a unit,
-- and the catalogue exposed no branch/semester, so a student could not find
-- "my branch → my semester → my paper → this unit".
--
-- WHAT THIS ADDS
--   1. bank_subject_catalog_v2()  — per subject: branch(es), semester, total
--                                   published count, and the unit breakdown
--   2. bank_subject_units()       — units of one subject with counts
--
-- Both return COUNTS AND TITLES ONLY. No stems, no options, no answer keys, so
-- they are safe for students. Only published + human-verified rows are counted.
--
-- The old bank_subject_catalog() is left in place so nothing breaks.
-- Idempotent: safe to re-run.
-- ============================================================================

create or replace function public.bank_subject_catalog_v2()
returns table (
  subject_code    text,
  subject_name    text,
  question_count  bigint,
  unit_count      int,
  branch_ids      uuid[],
  branch_names    text[],
  semester_number int,
  units           jsonb
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with pub as (
    select q.id, q.subject_code, q.subject_name,
           coalesce(q.unit_index, 0)                              as unit_index,
           coalesce(nullif(btrim(q.unit_title), ''), 'General')    as unit_title
    from public.question_bank q
    where q.published = true and q.human_verified = true
  ),
  units as (
    select subject_code, unit_index, max(unit_title) as unit_title, count(*) as n
    from pub group by subject_code, unit_index
  ),
  place as (
    -- A subject can legitimately belong to more than one branch (shared
    -- first-year papers), so collect them rather than picking one.
    select s.subject_code,
           array_agg(distinct s.branch_id) filter (where s.branch_id is not null) as branch_ids,
           min(s.semester_number)                                                 as semester_number
    from public.question_bank_subjects s
    join pub p on p.id = s.question_id
    group by s.subject_code
  )
  ,names as (
    select subject_code, max(subject_name) as subject_name from pub group by subject_code
  ),
  agg as (
    -- Aggregate units ONCE per subject. Joining `pub` here would multiply every
    -- unit row by the number of questions (the bug this replaces).
    select u.subject_code,
           sum(u.n)      as question_count,
           count(*)::int as unit_count,
           jsonb_agg(
             jsonb_build_object('unit_index', u.unit_index,
                                'unit_title', u.unit_title,
                                'count', u.n)
             order by u.unit_index
           ) as units
    from units u
    group by u.subject_code
  )
  select a.subject_code,
         n.subject_name,
         a.question_count,
         a.unit_count,
         coalesce(pl.branch_ids, '{}') as branch_ids,
         coalesce(
           (select array_agg(b.name order by b.name)
              from public.branches b
             where b.id = any(coalesce(pl.branch_ids, '{}'))),
           '{}') as branch_names,
         pl.semester_number,
         a.units
  from agg a
  join names n on n.subject_code = a.subject_code
  left join place pl on pl.subject_code = a.subject_code
  order by n.subject_name;
$$;

comment on function public.bank_subject_catalog_v2() is
  'Per-subject catalogue with branch, semester and unit breakdown. Counts and titles only — no stems, options or answer keys.';

revoke all on function public.bank_subject_catalog_v2() from public;
grant execute on function public.bank_subject_catalog_v2() to anon, authenticated;

-- Units of a single subject (used when a student expands a paper).
create or replace function public.bank_subject_units(p_subject_code text)
returns table (unit_index int, unit_title text, question_count bigint)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(q.unit_index, 0)                           as unit_index,
         max(coalesce(nullif(btrim(q.unit_title), ''), 'General')) as unit_title,
         count(*)                                            as question_count
  from public.question_bank q
  where q.published = true
    and q.human_verified = true
    and q.subject_code = p_subject_code
  group by coalesce(q.unit_index, 0)
  order by 1;
$$;

revoke all on function public.bank_subject_units(text) from public;
grant execute on function public.bank_subject_units(text) to anon, authenticated;

select 'MIGRATION 0015 COMPLETE' as status,
       (select count(*) from public.bank_subject_catalog_v2()) as subjects;
