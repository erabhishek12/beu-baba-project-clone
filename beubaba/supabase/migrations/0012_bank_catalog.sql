-- ============================================================================
-- 0012 — Bank catalogue (Phase 3A-2 completion)
--
-- PROBLEM THIS FIXES
-- ------------------
-- quizService built its quiz list ONLY from /assets/data/mech_bank.json (5.4 MB,
-- Mechanical-only). Because no `bank-<code>` quiz existed in the catalogue for
-- any other subject, `shouldUseBank()` never matched and the Supabase adapter
-- was unreachable — /quiz/bank-101401 rendered "Quiz unavailable".
--
-- Students cannot (and must not) read public.question_bank directly: RLS denies
-- it outright, so the browser has no way to discover which subjects have
-- published questions. This SECURITY DEFINER function exposes ONLY aggregate
-- counts of PUBLISHED + HUMAN-VERIFIED questions. It returns no stems, no
-- options and no answer keys.
--
-- Idempotent: safe to re-run.
-- ============================================================================

create or replace function public.bank_subject_catalog()
returns table (
  subject_code   text,
  subject_name   text,
  question_count bigint,
  units          int
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select q.subject_code,
         max(q.subject_name)                        as subject_name,
         count(*)                                   as question_count,
         count(distinct coalesce(q.unit_index, 0))::int as units
  from public.question_bank q
  where q.published = true
    and q.human_verified = true
  group by q.subject_code
  having count(*) > 0
  order by max(q.subject_name);
$$;

comment on function public.bank_subject_catalog() is
  'Aggregate counts of published+verified bank questions per subject. No stems, no options, no answer keys. Safe for students.';

revoke all on function public.bank_subject_catalog() from public;
grant execute on function public.bank_subject_catalog() to anon, authenticated;

select 'MIGRATION 0012 COMPLETE' as status,
       (select count(*) from public.bank_subject_catalog()) as subjects_with_published_questions;
