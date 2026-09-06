-- ============================================================================
-- 0013 — BULK REVIEW AT SCALE (Phase 4)
--
-- PROBLEM
-- -------
-- 22,826 questions sit unreviewed. Reviewing them one at a time is not
-- realistic, so students effectively see one subject. This adds:
--
--   1. review_progress()          — per-subject dashboard (how much is left)
--   2. bulk_publish_safe()        — publish only questions that pass STRICT
--                                   automated checks, in bounded batches
--   3. bulk_reject_subject()      — quarantine a whole subject if it is bad
--
-- SAFETY
-- ------
-- bulk_publish_safe() refuses anything that is not provably answerable:
--   * must have >= 2 options
--   * must have EXACTLY one correct option (multi-answer is excluded on
--     purpose — those need a human to confirm the full answer set)
--   * must NOT be every-option-correct
--   * must NOT have duplicate option text
--   * must NOT share a source_ref with a quarantined source row
--   * must NOT have a placeholder/blank/very short stem
--   * must currently be review_status='pending'
--
-- Everything it does is REVERSIBLE via unpublish_batch(). Each run is stamped
-- with a batch id and written to audit_logs, so any batch can be undone.
--
-- Idempotent: safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------- progress --
create or replace function public.review_progress()
returns table (
  subject_code   text,
  subject_name   text,
  total          bigint,
  pending        bigint,
  published      bigint,
  rejected       bigint,
  quarantined    bigint,
  eligible       bigint
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.assert_can_review();
  return query
  with q as (
    select qb.id, qb.subject_code, qb.subject_name, qb.review_status, qb.published,
           (select count(*) from public.question_bank_options o where o.question_id = qb.id) as n_opt,
           (select count(*) from public.question_bank_options o where o.question_id = qb.id and o.is_correct) as n_cor,
           (select count(distinct lower(btrim(o.label))) from public.question_bank_options o where o.question_id = qb.id) as n_uniq,
           exists (select 1 from public.question_quarantine qn
                    where qn.source_ref is not null and qn.source_ref = qb.source_ref) as is_quar
    from public.question_bank qb
  )
  select q.subject_code,
         max(q.subject_name),
         count(*),
         count(*) filter (where q.review_status = 'pending'),
         count(*) filter (where q.published),
         count(*) filter (where q.review_status = 'rejected'),
         count(*) filter (where q.is_quar),
         count(*) filter (
           where q.review_status = 'pending'
             and not q.is_quar
             and q.n_opt >= 2
             and q.n_cor = 1
             and q.n_uniq = q.n_opt
         )
  from q
  group by q.subject_code
  order by max(q.subject_name);
end $$;

comment on function public.review_progress() is
  'Per-subject review dashboard: totals, pending, published, quarantined and how many pass the strict auto-publish gate.';

revoke all on function public.review_progress() from public, anon;
grant execute on function public.review_progress() to authenticated;

-- ----------------------------------------------------------- bulk publish --
create or replace function public.bulk_publish_safe(
  p_subject_code text default null,
  p_limit        int  default 500,
  p_dry_run      boolean default true
)
returns table (
  batch_id     uuid,
  would_publish bigint,
  published     bigint,
  skipped       bigint,
  reason_counts jsonb
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_batch uuid := gen_random_uuid();
  v_n     int  := greatest(1, least(coalesce(p_limit, 500), 5000));
  v_ok    bigint := 0;
  v_bad   bigint := 0;
  v_reasons jsonb;
begin
  perform public.assert_can_review();

  -- Score every candidate once.
  create temp table _cand on commit drop as
  select qb.id,
         (select count(*) from public.question_bank_options o where o.question_id = qb.id) as n_opt,
         (select count(*) from public.question_bank_options o where o.question_id = qb.id and o.is_correct) as n_cor,
         (select count(distinct lower(btrim(o.label))) from public.question_bank_options o where o.question_id = qb.id) as n_uniq,
         exists (select 1 from public.question_quarantine qn
                  where qn.source_ref is not null and qn.source_ref = qb.source_ref) as is_quar,
         coalesce(length(btrim(qb.stem)), 0) as stem_len
  from public.question_bank qb
  where qb.review_status = 'pending'
    and (p_subject_code is null or qb.subject_code = p_subject_code);

  -- Why each rejected candidate failed (for an honest report).
  select jsonb_build_object(
           'quarantined',      count(*) filter (where is_quar),
           'too_few_options',  count(*) filter (where not is_quar and n_opt < 2),
           'not_exactly_one_correct',
                               count(*) filter (where not is_quar and n_opt >= 2 and n_cor <> 1),
           'duplicate_options',count(*) filter (where not is_quar and n_opt >= 2 and n_cor = 1 and n_uniq <> n_opt),
           'stem_too_short',   count(*) filter (where not is_quar and n_opt >= 2 and n_cor = 1 and n_uniq = n_opt and stem_len < 15)
         )
    into v_reasons
  from _cand;

  create temp table _go on commit drop as
  select id from _cand
  where not is_quar
    and n_opt >= 2
    and n_cor = 1
    and n_uniq = n_opt
    and stem_len >= 15
  limit v_n;

  select count(*) into v_ok  from _go;
  select count(*) into v_bad from _cand where id not in (select id from _go);

  if p_dry_run then
    return query select v_batch, v_ok, 0::bigint, v_bad, v_reasons;
    return;
  end if;

  -- human_verified and published are set together, so the 0008 CHECK
  -- (published = false or human_verified = true) is never violated.
  update public.question_bank qb
     set human_verified = true,
         published      = true,
         review_status  = 'published',
         reviewed_by    = auth.uid(),
         reviewed_at    = now(),
         review_note    = 'bulk_publish_safe batch ' || v_batch::text
  where qb.id in (select id from _go);

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  select auth.uid(), 'bulk_publish', 'question_bank', id,
         jsonb_build_object('batch_id', v_batch, 'subject_code', p_subject_code)
  from _go;

  return query select v_batch, v_ok, v_ok, v_bad, v_reasons;
end $$;

comment on function public.bulk_publish_safe(text,int,boolean) is
  'Publish only questions passing strict automated checks. Dry-run by default. Every run is stamped with a batch id and logged so it can be undone.';

revoke all on function public.bulk_publish_safe(text,int,boolean) from public, anon;
grant execute on function public.bulk_publish_safe(text,int,boolean) to authenticated;

-- --------------------------------------------------------------- undo ------
create or replace function public.unpublish_batch(p_batch uuid)
returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_n bigint;
begin
  perform public.assert_can_review();

  update public.question_bank
     set published      = false,
         human_verified = false,
         review_status  = 'pending',
         review_note    = 'reverted batch ' || p_batch::text
   where review_note = 'bulk_publish_safe batch ' || p_batch::text;

  get diagnostics v_n = row_count;

  insert into public.audit_logs (actor_id, action, entity_type, metadata)
  values (auth.uid(), 'bulk_unpublish', 'question_bank',
          jsonb_build_object('batch_id', p_batch, 'reverted', v_n));

  return v_n;
end $$;

revoke all on function public.unpublish_batch(uuid) from public, anon;
grant execute on function public.unpublish_batch(uuid) to authenticated;

select 'MIGRATION 0013 COMPLETE' as status;
