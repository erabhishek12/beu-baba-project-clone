-- =====================================================================
-- 0011_attempt_resume_and_expiry.sql — Phase 3A-3
--
-- Closes three gaps left open by 0010:
--
--   A. RESUME. 0010 froze `question_ids` into `bank_attempts`, but there was
--      no way to read them back, so a hard refresh mid-quiz lost the drawn
--      questions (the browser kept them in memory only). `resume_bank_attempt`
--      returns that exact frozen set — same questions, same order, still with
--      no answer key.
--
--   B. IN-PROGRESS ANSWERS. 0010 had nowhere to put answers before submit, so
--      a refresh on a different browser/device lost them. An `answers` column
--      plus `save_bank_answer` makes autosave server-side, which also means the
--      submit payload is no longer the only record of what a student chose.
--
--   C. SERVER-SIDE EXPIRY. 0010 stored `expires_at` but never enforced it: a
--      late submission was graded normally. Now the SERVER clock decides.
--      The browser countdown is decoration.
--
-- Idempotent: safe to re-run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- A. In-progress answer storage.
--   Shape: { "<question_id>": ["<option_id>", ...], ... }
--   Same shape submit_bank_attempt already accepts, so nothing has to be
--   translated between autosave and grading.
-- ---------------------------------------------------------------------
alter table public.bank_attempts
  add column if not exists answers jsonb not null default '{}'::jsonb;

alter table public.bank_attempts
  add column if not exists last_seen_index int not null default 0;

-- ---------------------------------------------------------------------
-- Helper: is this attempt past its deadline according to the SERVER?
-- Kept in one place so submit and resume cannot disagree.
-- ---------------------------------------------------------------------
create or replace function public.bank_attempt_is_expired(p_attempt public.bank_attempts)
returns boolean
language sql
immutable
as $$
  select p_attempt.expires_at is not null and now() > p_attempt.expires_at;
$$;

-- ---------------------------------------------------------------------
-- B. resume_bank_attempt — rebuild an in-progress attempt after a refresh.
--
-- Deliberately does NOT redraw. It returns the frozen question_ids in their
-- original order, so a resumed quiz is the same paper the student started.
-- Returns the stored result instead when the attempt is already finished, so
-- the UI can send the student to their result rather than a dead quiz.
-- ---------------------------------------------------------------------
create or replace function public.resume_bank_attempt(p_attempt uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user    uuid := auth.uid();
  v_att     public.bank_attempts%rowtype;
  v_expired boolean;
  v_qs      jsonb;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  select * into v_att from public.bank_attempts where id = p_attempt;
  if not found then
    -- Same error for "does not exist" and "not yours": a probe must not be
    -- able to tell the difference and enumerate attempt ids.
    raise exception 'attempt not found' using errcode = 'P0002';
  end if;
  if v_att.user_id <> v_user then
    raise exception 'attempt not found' using errcode = 'P0002';
  end if;

  -- Already finished: hand back the final state. Never reopen it.
  if v_att.state = 'submitted' then
    return jsonb_build_object(
      'attempt_id', v_att.id,
      'state',      'submitted',
      'resumable',  false,
      'result',     v_att.result
    );
  end if;

  -- Deadline passed while the tab was closed: expire it now, do not reopen.
  v_expired := public.bank_attempt_is_expired(v_att);
  if v_att.state = 'expired' or v_expired then
    update public.bank_attempts
       set state = 'expired'
     where id = p_attempt and state <> 'submitted';
    return jsonb_build_object(
      'attempt_id', v_att.id,
      'state',      'expired',
      'resumable',  false,
      'result',     v_att.result
    );
  end if;

  -- Live attempt: return the frozen paper, keyless.
  select coalesce(
           jsonb_agg(
             jsonb_build_object(
               'question_id',   qb.id,
               'stem',          qb.stem,
               'question_type', qb.question_type,
               'difficulty',    qb.difficulty,
               'topic',         qb.topic,
               'unit_index',    qb.unit_index,
               -- is_correct is deliberately absent.
               'options', (
                 select jsonb_agg(
                          jsonb_build_object('id', o.id, 'label', o.label)
                          order by o.display_order
                        )
                 from public.question_bank_options o
                 where o.question_id = qb.id
               )
             )
             order by array_position(v_att.question_ids, qb.id)
           ),
           '[]'::jsonb
         )
    into v_qs
  from public.question_bank qb
  where qb.id = any (v_att.question_ids);

  return jsonb_build_object(
    'attempt_id',         v_att.id,
    'state',              'in_progress',
    'resumable',          true,
    'subject_code',       v_att.subject_code,
    'started_at',         v_att.started_at,
    'expires_at',         v_att.expires_at,
    -- Authoritative remaining time, computed from the SERVER clock.
    'remaining_sec',      greatest(0, floor(extract(epoch from (v_att.expires_at - now())))::int),
    'duration_sec',       v_att.duration_sec,
    'marks_per_question', v_att.marks_per_question,
    'negative_marking',   v_att.negative_marking,
    'last_seen_index',    v_att.last_seen_index,
    'answers',            v_att.answers,
    'questions',          v_qs
  );
end;
$$;

-- ---------------------------------------------------------------------
-- C. save_bank_answer — autosave one question's selection.
--
-- Refuses to write to a submitted or expired attempt, so a student cannot
-- keep "answering" after time is up and then replay the answers.
-- ---------------------------------------------------------------------
create or replace function public.save_bank_answer(
  p_attempt  uuid,
  p_question uuid,
  p_options  uuid[] default '{}',
  p_index    int    default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_att  public.bank_attempts%rowtype;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  select * into v_att from public.bank_attempts where id = p_attempt;
  if not found or v_att.user_id <> v_user then
    raise exception 'attempt not found' using errcode = 'P0002';
  end if;

  if v_att.state = 'submitted' then
    raise exception 'attempt already submitted' using errcode = '42501';
  end if;

  if public.bank_attempt_is_expired(v_att) then
    update public.bank_attempts set state = 'expired' where id = p_attempt;
    raise exception 'attempt expired' using errcode = '42501';
  end if;

  -- Only questions that belong to this attempt may be answered.
  if not (p_question = any (v_att.question_ids)) then
    raise exception 'question not part of this attempt' using errcode = '42501';
  end if;

  update public.bank_attempts
     set answers = case
                     when p_options is null or array_length(p_options, 1) is null
                       then answers - p_question::text      -- cleared selection
                     else answers || jsonb_build_object(p_question::text, to_jsonb(p_options))
                   end,
         last_seen_index = coalesce(p_index, last_seen_index)
   where id = p_attempt;

  return jsonb_build_object(
    'saved', true,
    'remaining_sec', greatest(0, floor(extract(epoch from (v_att.expires_at - now())))::int)
  );
end;
$$;

-- ---------------------------------------------------------------------
-- D. Server-authoritative expiry on submit.
--
-- Replaces the 0010 version. Differences:
--   * refuses to grade once now() > expires_at,
--   * falls back to the answers stored on the row when the client sends none,
--   * still idempotent for an already-graded attempt.
-- ---------------------------------------------------------------------
create or replace function public.submit_bank_attempt(
  p_attempt uuid,
  p_answers jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user     uuid := auth.uid();
  v_att      public.bank_attempts%rowtype;
  v_answers  jsonb;
  v_qid      uuid;
  v_picked   uuid[];
  v_correct  uuid[];
  v_is_right boolean;
  v_score    numeric := 0;
  v_ok       int := 0;
  v_bad      int := 0;
  v_skip     int := 0;
  v_items    jsonb := '[]'::jsonb;
  v_result   jsonb;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  select * into v_att from public.bank_attempts where id = p_attempt;
  if not found then
    raise exception 'attempt not found' using errcode = 'P0002';
  end if;
  if v_att.user_id <> v_user then
    raise exception 'not your attempt' using errcode = '42501';
  end if;

  -- Idempotent: a graded paper is never re-marked.
  if v_att.state = 'submitted' then
    return v_att.result;
  end if;

  -- SERVER-SIDE DEADLINE. The client clock is irrelevant.
  if public.bank_attempt_is_expired(v_att) then
    update public.bank_attempts
       set state = 'expired', submitted_at = coalesce(submitted_at, now())
     where id = p_attempt and state <> 'submitted';
    return jsonb_build_object(
      'attempt_id', p_attempt,
      'state',      'expired',
      'expired',    true,
      'graded',     false,
      'message',    'Time is up. This attempt expired before it was submitted.'
    );
  end if;

  -- Prefer the autosaved answers; accept a client payload only as a fallback
  -- (or when it is the richer of the two, e.g. offline-then-submit).
  v_answers := case
                 when p_answers is null or p_answers = '{}'::jsonb then v_att.answers
                 else v_att.answers || p_answers
               end;

  foreach v_qid in array v_att.question_ids loop
    select array_agg(value::uuid)
      into v_picked
    from jsonb_array_elements_text(coalesce(v_answers -> v_qid::text, '[]'::jsonb));

    select array_agg(o.id order by o.id)
      into v_correct
    from public.question_bank_options o
    where o.question_id = v_qid and o.is_correct = true;

    if v_picked is null or array_length(v_picked, 1) is null then
      v_skip := v_skip + 1;
      v_is_right := null;
    else
      -- Exact-set match: single, true/false, assertion_reason and multi all
      -- behave the same. No partial credit.
      v_is_right := (
        select coalesce(array_agg(x order by x), '{}') from unnest(v_picked) x
      ) = coalesce(v_correct, '{}'::uuid[]);

      if v_is_right then
        v_ok := v_ok + 1;
        v_score := v_score + v_att.marks_per_question;
      else
        v_bad := v_bad + 1;
        v_score := v_score - v_att.negative_marking;
      end if;
    end if;

    v_items := v_items || jsonb_build_object(
      'question_id', v_qid,
      'picked',      coalesce(to_jsonb(v_picked), '[]'::jsonb),
      'correct',     coalesce(to_jsonb(v_correct), '[]'::jsonb),
      'is_correct',  v_is_right,
      'explanation', (select qb.explanation from public.question_bank qb where qb.id = v_qid)
    );
  end loop;

  v_score := greatest(v_score, 0);

  v_result := jsonb_build_object(
    'attempt_id',       p_attempt,
    'state',            'submitted',
    'expired',          false,
    'graded',           true,
    'score',            v_score,
    'max_score',        array_length(v_att.question_ids, 1) * v_att.marks_per_question,
    'correct_count',    v_ok,
    'wrong_count',      v_bad,
    'unanswered_count', v_skip,
    'submitted_at',     now(),
    'items',            v_items
  );

  update public.bank_attempts
     set state            = 'submitted',
         submitted_at     = now(),
         answers          = v_answers,
         score            = v_score,
         max_score        = array_length(question_ids, 1) * marks_per_question,
         correct_count    = v_ok,
         wrong_count      = v_bad,
         unanswered_count = v_skip,
         result           = v_result
   where id = p_attempt;

  return v_result;
end;
$$;

-- ---------------------------------------------------------------------
-- E. Bulk review with HONEST partial-failure reporting.
--
-- 0009's review_publish_many returns only a count and silently swallows the
-- reason a row failed. This returns per-question outcomes so the UI can say
-- "8 updated, 2 could not be published" and show why.
--
-- Each question is handled in its own sub-transaction: one bad row does not
-- roll back the good ones.
-- ---------------------------------------------------------------------
create or replace function public.review_bulk_action(
  p_questions uuid[],
  p_action    text,               -- 'verify' | 'publish'
  p_note      text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id      uuid;
  v_ok      int := 0;
  v_fail    int := 0;
  v_errors  jsonb := '[]'::jsonb;
  v_msg     text;
begin
  perform public.assert_can_review();

  if p_action not in ('verify', 'publish') then
    raise exception 'unsupported bulk action: %', p_action using errcode = '22023';
  end if;

  if p_questions is null or array_length(p_questions, 1) is null then
    return jsonb_build_object('succeeded', 0, 'failed', 0, 'errors', '[]'::jsonb);
  end if;

  -- Guard rail: bulk is for a page of work, not the whole 22k bank.
  if array_length(p_questions, 1) > 200 then
    raise exception 'bulk action limited to 200 questions at a time'
      using errcode = '22023';
  end if;

  foreach v_id in array p_questions loop
    begin
      if p_action = 'verify' then
        perform public.review_verify_question(v_id, coalesce(p_note, 'bulk verify'));
      else
        perform public.review_publish_question(v_id, coalesce(p_note, 'bulk publish'));
      end if;
      v_ok := v_ok + 1;
    exception when others then
      v_fail := v_fail + 1;
      get stacked diagnostics v_msg = message_text;
      v_errors := v_errors || jsonb_build_object('question_id', v_id, 'error', v_msg);
    end;
  end loop;

  return jsonb_build_object(
    'succeeded', v_ok,
    'failed',    v_fail,
    'errors',    v_errors
  );
end;
$$;

-- ---------------------------------------------------------------------
-- Permissions. Anonymous visitors get nothing.
-- ---------------------------------------------------------------------
revoke all on function public.resume_bank_attempt(uuid) from public, anon;
revoke all on function public.save_bank_answer(uuid, uuid, uuid[], int) from public, anon;
revoke all on function public.submit_bank_attempt(uuid, jsonb) from public, anon;
revoke all on function public.review_bulk_action(uuid[], text, text) from public, anon;

grant execute on function public.resume_bank_attempt(uuid) to authenticated;
grant execute on function public.save_bank_answer(uuid, uuid, uuid[], int) to authenticated;
grant execute on function public.submit_bank_attempt(uuid, jsonb) to authenticated;
grant execute on function public.review_bulk_action(uuid[], text, text) to authenticated;
