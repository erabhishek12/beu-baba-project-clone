-- ============================================================================
-- BEU BABA — Migration 0009: QUESTION REVIEW WORKFLOW
--
-- Phase 3A imported 22,868 questions as
--   automatically_validated = true, human_verified = false, published = false
-- and migration 0008 added a CHECK that makes publishing unverified content
-- impossible. This migration adds the ONLY sanctioned way to move a question
-- through that gate, plus the audit trail and the admin queue reader.
--
-- Design rules honoured:
--   * Authorization is enforced in the DATABASE (SECURITY DEFINER + permission
--     checks), never by the frontend (instruction PART B / PART G).
--   * The existing CHECK constraint from 0008 is kept, not relaxed.
--   * Audit rows go to the EXISTING public.audit_logs — no second audit system
--     (instruction PART C).
--   * Editing academic content of an approved question DEMOTES it back to
--     unreviewed and unpublished (instruction PART B).
--   * Rejection routes to the EXISTING question_quarantine with the full
--     original payload, so nothing is ever destroyed.
--
-- Idempotent: safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Permission for the review desk. Distinct from manage_quizzes so a content
-- manager can build quizzes without being able to bless question content.
-- ---------------------------------------------------------------------------
insert into public.permissions (key, description)
values ('review_questions', 'Review, verify, publish and reject bank questions')
on conflict (key) do nothing;

insert into public.role_permissions (role, permission_key)
select r, 'review_questions'
from unnest(array['content_manager','admin','super_admin']) r
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Review bookkeeping columns.
-- ---------------------------------------------------------------------------
alter table public.question_bank
  add column if not exists review_status text not null default 'pending'
    check (review_status in ('pending','verified','published','rejected','skipped')),
  add column if not exists review_note   text,
  add column if not exists reviewed_by   uuid references public.profiles(id),
  add column if not exists reviewed_at   timestamptz,
  add column if not exists edited_after_review boolean not null default false;

create index if not exists idx_qb_review_queue
  on public.question_bank(review_status, subject_code, difficulty)
  where review_status = 'pending';

-- ---------------------------------------------------------------------------
-- Internal guard: caller must hold review_questions (or be super admin).
-- ---------------------------------------------------------------------------
create or replace function public.assert_can_review()
returns void
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if not (public.has_permission('review_questions') or public.is_super_admin()) then
    raise exception 'not authorized to review questions' using errcode = '42501';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Shared audit writer — uses the EXISTING audit_logs table (PART C).
-- ---------------------------------------------------------------------------
create or replace function public.log_review_action(
  p_question uuid, p_action text, p_before jsonb, p_after jsonb, p_note text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.audit_logs
    (actor_id, action, entity_type, entity_id, before_data, after_data, metadata)
  values
    (auth.uid(), p_action, 'question_bank', p_question::text, p_before, p_after,
     case when p_note is null then '{}'::jsonb
          else jsonb_build_object('note', p_note) end);
$$;

-- ============================================================================
-- ACTION 1 — VERIFY ONLY  (human_verified = true, still not live)
-- ============================================================================
create or replace function public.review_verify_question(
  p_question uuid, p_note text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_before jsonb;
begin
  perform public.assert_can_review();

  select to_jsonb(q) - 'stem' - 'explanation' into v_before
  from public.question_bank q where q.id = p_question;
  if v_before is null then
    raise exception 'question not found' using errcode = 'P0002';
  end if;

  update public.question_bank
     set human_verified = true,
         review_status  = 'verified',
         reviewed_by    = auth.uid(),
         reviewed_at    = now(),
         review_note    = coalesce(p_note, review_note),
         verified_by    = auth.uid(),
         verified_at    = now(),
         edited_after_review = false
   where id = p_question;

  perform public.log_review_action(
    p_question, 'question_verify', v_before,
    jsonb_build_object('human_verified', true, 'published', false,
                       'review_status', 'verified'), p_note);
end;
$$;

-- ============================================================================
-- ACTION 2 — VERIFY & PUBLISH  (the only path to a live question)
-- ============================================================================
create or replace function public.review_publish_question(
  p_question uuid, p_note text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_before jsonb; v_opts int; v_correct int;
begin
  perform public.assert_can_review();

  select to_jsonb(q) - 'stem' - 'explanation' into v_before
  from public.question_bank q where q.id = p_question;
  if v_before is null then
    raise exception 'question not found' using errcode = 'P0002';
  end if;

  -- Content sanity gate: never publish an unanswerable question, even if a
  -- reviewer clicks the button by mistake.
  select count(*), count(*) filter (where is_correct)
    into v_opts, v_correct
  from public.question_bank_options where question_id = p_question;

  if v_opts < 2 then
    raise exception 'cannot publish: question has % option(s)', v_opts
      using errcode = 'P0001';
  end if;
  if v_correct < 1 then
    raise exception 'cannot publish: question has no correct option'
      using errcode = 'P0001';
  end if;
  if v_correct = v_opts then
    raise exception 'cannot publish: every option is marked correct'
      using errcode = 'P0001';
  end if;

  -- human_verified is set in the SAME statement as published, so the 0008
  -- CHECK (published = false or human_verified = true) is always satisfied.
  update public.question_bank
     set human_verified = true,
         published      = true,
         review_status  = 'published',
         reviewed_by    = auth.uid(),
         reviewed_at    = now(),
         review_note    = coalesce(p_note, review_note),
         verified_by    = auth.uid(),
         verified_at    = now(),
         edited_after_review = false
   where id = p_question;

  perform public.log_review_action(
    p_question, 'question_publish', v_before,
    jsonb_build_object('human_verified', true, 'published', true,
                       'review_status', 'published'), p_note);
end;
$$;

-- ============================================================================
-- ACTION 3 — REJECT  → unpublish + copy into the EXISTING quarantine table.
-- Nothing is deleted; the row stays in the bank marked 'rejected' and a full
-- recoverable snapshot lands in question_quarantine.
-- ============================================================================
create or replace function public.review_reject_question(
  p_question uuid, p_reason text default 'manual_review', p_note text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_before jsonb; q public.question_bank%rowtype; v_payload jsonb;
begin
  perform public.assert_can_review();

  select * into q from public.question_bank where id = p_question;
  if q.id is null then
    raise exception 'question not found' using errcode = 'P0002';
  end if;
  v_before := to_jsonb(q) - 'stem' - 'explanation';

  if p_reason not in ('duplicate_options','unresolved_subject',
                      'conflicting_subject_mapping','malformed_question',
                      'invalid_answer','duplicate','manual_review','other') then
    raise exception 'invalid quarantine reason %', p_reason;
  end if;

  -- Full recoverable snapshot, including the options and the answer key.
  v_payload := to_jsonb(q) || jsonb_build_object(
    'options', (select coalesce(jsonb_agg(jsonb_build_object(
                         'label', o.label, 'is_correct', o.is_correct,
                         'display_order', o.display_order,
                         'source_index', o.source_index)
                       order by o.display_order), '[]'::jsonb)
                from public.question_bank_options o where o.question_id = q.id));

  update public.question_bank
     set published      = false,
         human_verified = false,
         review_status  = 'rejected',
         reviewed_by    = auth.uid(),
         reviewed_at    = now(),
         review_note    = coalesce(p_note, review_note)
   where id = p_question;

  insert into public.question_quarantine
    (source_pack, source_id, source_ref, subject_code, subject_name,
     reason, severity, detail, original_data, status, reviewer_id,
     review_notes, reviewed_at)
  values
    (coalesce(q.source_pack,'review'), q.source_id, q.source_ref,
     q.subject_code, q.subject_name, p_reason, 'error',
     coalesce(p_note, 'Rejected during human review'), v_payload,
     'quarantined', auth.uid(), p_note, now());

  perform public.log_review_action(
    p_question, 'question_reject', v_before,
    jsonb_build_object('published', false, 'human_verified', false,
                       'review_status', 'rejected', 'reason', p_reason), p_note);
end;
$$;

-- ============================================================================
-- ACTION 4 — SKIP (defer, keeps it out of the default queue view)
-- ============================================================================
create or replace function public.review_skip_question(
  p_question uuid, p_note text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_can_review();
  update public.question_bank
     set review_status = 'skipped',
         reviewed_by = auth.uid(), reviewed_at = now(),
         review_note = coalesce(p_note, review_note)
   where id = p_question and review_status = 'pending';
  perform public.log_review_action(p_question, 'question_skip', null,
    jsonb_build_object('review_status','skipped'), p_note);
end;
$$;

-- ============================================================================
-- ACTION 5 — EDIT.  Any change to ACADEMIC CONTENT demotes the question back
-- to unreviewed + unpublished and forces re-review (instruction PART B).
-- Metadata-only edits (topic, difficulty) do not demote.
-- ============================================================================
create or replace function public.review_edit_question(
  p_question uuid,
  p_stem text default null,
  p_explanation text default null,
  p_difficulty text default null,
  p_topic text default null,
  p_options jsonb default null,     -- [{"label":"...","is_correct":true}, ...]
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_before jsonb;
  v_content_changed boolean := false;
  v_n int; v_c int;
begin
  perform public.assert_can_review();

  select to_jsonb(q) into v_before from public.question_bank q where q.id = p_question;
  if v_before is null then
    raise exception 'question not found' using errcode = 'P0002';
  end if;

  if p_stem is not null and p_stem is distinct from (v_before->>'stem') then
    v_content_changed := true;
  end if;

  -- ---- options replacement -------------------------------------------------
  if p_options is not null then
    v_n := jsonb_array_length(p_options);
    if v_n < 2 then
      raise exception 'a question needs at least 2 options' using errcode = 'P0001';
    end if;
    select count(*) into v_c
    from jsonb_array_elements(p_options) e
    where (e->>'is_correct')::boolean;
    if v_c < 1 then
      raise exception 'at least one option must be correct' using errcode = 'P0001';
    end if;
    if v_c = v_n then
      raise exception 'every option cannot be correct' using errcode = 'P0001';
    end if;
    -- duplicate labels are what put 945 records in quarantine; never re-create them
    if (select count(distinct lower(trim(e->>'label')))
          from jsonb_array_elements(p_options) e) <> v_n then
      raise exception 'options must be distinct' using errcode = 'P0001';
    end if;

    delete from public.question_bank_options where question_id = p_question;
    insert into public.question_bank_options
      (question_id, label, is_correct, display_order, source_index)
    select p_question, e->>'label', coalesce((e->>'is_correct')::boolean,false),
           (ord - 1)::int, null
    from jsonb_array_elements(p_options) with ordinality as t(e, ord);

    v_content_changed := true;
  end if;

  update public.question_bank
     set stem        = coalesce(p_stem, stem),
         explanation = coalesce(p_explanation, explanation),
         difficulty  = coalesce(p_difficulty, difficulty),
         topic       = coalesce(p_topic, topic),
         review_note = coalesce(p_note, review_note),
         -- content edit => back to square one
         human_verified = case when v_content_changed then false else human_verified end,
         published      = case when v_content_changed then false else published end,
         review_status  = case when v_content_changed then 'pending' else review_status end,
         edited_after_review = case when v_content_changed then true else edited_after_review end,
         updated_at = now()
   where id = p_question;

  perform public.log_review_action(
    p_question,
    case when v_content_changed then 'question_edit_content' else 'question_edit_meta' end,
    v_before - 'stem' - 'explanation',
    jsonb_build_object('content_changed', v_content_changed,
                       'demoted_to_pending', v_content_changed), p_note);
end;
$$;

-- ============================================================================
-- BULK PUBLISH — same gate, applied to an explicit list. Returns the count.
-- ============================================================================
create or replace function public.review_publish_many(p_questions uuid[])
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare v_id uuid; n integer := 0;
begin
  perform public.assert_can_review();
  foreach v_id in array coalesce(p_questions, '{}') loop
    begin
      perform public.review_publish_question(v_id, 'bulk publish');
      n := n + 1;
    exception when others then
      continue;      -- skip unpublishable rows, keep going
    end;
  end loop;
  return n;
end;
$$;

-- ============================================================================
-- THE REVIEW QUEUE READER (instruction PART A)
-- Returns the answer key ONLY to an authorised reviewer — the check is inside
-- the function, so a student calling it gets an exception, not data.
-- ============================================================================
create or replace function public.review_queue(
  p_status text default 'pending',
  p_branch uuid default null,
  p_subject_code text default null,
  p_semester integer default null,
  p_topic text default null,
  p_difficulty text default null,
  p_question_type text default null,
  p_source_pack text default null,
  p_search text default null,
  p_limit integer default 25,
  p_offset integer default 0
)
returns table (
  id uuid, stem text, explanation text, question_type text, difficulty text,
  subject_code text, subject_name text, unit_index integer, unit_title text,
  topic text, source_pack text, source_ref text,
  automatically_validated boolean, human_verified boolean, published boolean,
  review_status text, review_note text, reviewed_at timestamptz,
  edited_after_review boolean,
  branches jsonb, options jsonb, total_count bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.assert_can_review();

  return query
  with filtered as (
    select q.*
    from public.question_bank q
    where (p_status is null or p_status = 'all' or q.review_status = p_status)
      and (p_subject_code is null or q.subject_code = p_subject_code)
      and (p_topic is null or q.topic ilike '%' || p_topic || '%')
      and (p_difficulty is null or q.difficulty = p_difficulty)
      and (p_question_type is null or q.question_type = p_question_type)
      and (p_source_pack is null or q.source_pack = p_source_pack)
      and (p_search is null or q.stem ilike '%' || p_search || '%')
      and (p_branch is null or exists (
            select 1 from public.question_bank_subjects s
            where s.question_id = q.id and s.branch_id = p_branch))
      and (p_semester is null or exists (
            select 1 from public.question_bank_subjects s
            where s.question_id = q.id and s.semester_number = p_semester))
  ), counted as (select count(*) as n from filtered)
  select f.id, f.stem, f.explanation, f.question_type, f.difficulty,
         f.subject_code, f.subject_name, f.unit_index, f.unit_title,
         f.topic, f.source_pack, f.source_ref,
         f.automatically_validated, f.human_verified, f.published,
         f.review_status, f.review_note, f.reviewed_at, f.edited_after_review,
         (select coalesce(jsonb_agg(distinct jsonb_build_object(
                    'branch_id', s.branch_id, 'branch_name', b.name,
                    'subject_code', s.subject_code, 'semester', s.semester_number)), '[]'::jsonb)
            from public.question_bank_subjects s
            left join public.branches b on b.id = s.branch_id
           where s.question_id = f.id),
         -- the ANSWER KEY: authorised reviewers only (assert_can_review above)
         (select coalesce(jsonb_agg(jsonb_build_object(
                    'id', o.id, 'label', o.label, 'is_correct', o.is_correct,
                    'display_order', o.display_order) order by o.display_order), '[]'::jsonb)
            from public.question_bank_options o where o.question_id = f.id),
         (select n from counted)
  from filtered f
  order by f.subject_code, f.unit_index nulls last, f.created_at
  limit greatest(1, least(coalesce(p_limit, 25), 100))
  offset greatest(0, coalesce(p_offset, 0));
end;
$$;

-- Queue facets for the filter UI (counts only, no content).
create or replace function public.review_queue_facets()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare v jsonb;
begin
  perform public.assert_can_review();
  select jsonb_build_object(
    'by_status', (select coalesce(jsonb_object_agg(review_status, n), '{}'::jsonb)
                    from (select review_status, count(*) n from public.question_bank
                          group by 1) t),
    'by_pack', (select coalesce(jsonb_object_agg(source_pack, n), '{}'::jsonb)
                  from (select source_pack, count(*) n from public.question_bank
                        where review_status='pending' group by 1) t),
    'by_difficulty', (select coalesce(jsonb_object_agg(difficulty, n), '{}'::jsonb)
                  from (select difficulty, count(*) n from public.question_bank
                        where review_status='pending' group by 1) t),
    'by_type', (select coalesce(jsonb_object_agg(question_type, n), '{}'::jsonb)
                  from (select question_type, count(*) n from public.question_bank
                        where review_status='pending' group by 1) t),
    'subjects', (select coalesce(jsonb_agg(jsonb_build_object(
                          'subject_code', subject_code, 'subject_name', subject_name,
                          'pending', n) order by n desc), '[]'::jsonb)
                   from (select subject_code, min(subject_name) subject_name, count(*) n
                         from public.question_bank where review_status='pending'
                         group by subject_code) t),
    'quarantined', (select count(*) from public.question_quarantine
                     where status='quarantined')
  ) into v;
  return v;
end;
$$;

-- ---------------------------------------------------------------------------
-- Execution grants. The functions self-check authorisation, so granting
-- EXECUTE to authenticated is safe: an unauthorised caller gets 42501.
-- anon gets nothing.
-- ---------------------------------------------------------------------------
revoke all on function public.review_queue(text,uuid,text,integer,text,text,text,text,text,integer,integer) from public, anon;
revoke all on function public.review_queue_facets() from public, anon;
revoke all on function public.review_verify_question(uuid,text) from public, anon;
revoke all on function public.review_publish_question(uuid,text) from public, anon;
revoke all on function public.review_reject_question(uuid,text,text) from public, anon;
revoke all on function public.review_skip_question(uuid,text) from public, anon;
revoke all on function public.review_edit_question(uuid,text,text,text,text,jsonb,text) from public, anon;
revoke all on function public.review_publish_many(uuid[]) from public, anon;

grant execute on function public.review_queue(text,uuid,text,integer,text,text,text,text,text,integer,integer) to authenticated;
grant execute on function public.review_queue_facets() to authenticated;
grant execute on function public.review_verify_question(uuid,text) to authenticated;
grant execute on function public.review_publish_question(uuid,text) to authenticated;
grant execute on function public.review_reject_question(uuid,text,text) to authenticated;
grant execute on function public.review_skip_question(uuid,text) to authenticated;
grant execute on function public.review_edit_question(uuid,text,text,text,text,jsonb,text) to authenticated;
grant execute on function public.review_publish_many(uuid[]) to authenticated;

-- draw_pool_questions stays open to students: it returns published questions
-- WITHOUT the key (verified in Phase 3A).
grant execute on function public.draw_pool_questions(uuid,text,integer,text,integer,text) to authenticated;
