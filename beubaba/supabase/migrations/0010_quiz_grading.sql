-- =====================================================================
-- 0010_quiz_grading.sql — server-side grading for question-bank quizzes
-- Phase 3A-2, instruction PART D / PART F / PART G.
--
-- WHY
-- ---
-- 0009 lets students DRAW published questions without the answer key
-- (`draw_pool_questions` deliberately omits `is_correct`). That closes the
-- leak, but it also means the browser can no longer mark its own paper —
-- which is exactly what we want: scoring must be server-authoritative
-- (spec 15 §22). This migration adds the grading half.
--
-- Design notes:
--   * The key is read INSIDE the function, under SECURITY DEFINER. It is
--     never selected into anything the client can observe before submit.
--   * Grading is idempotent: re-submitting an attempt returns the stored
--     result instead of re-scoring (spec §21).
--   * A student may only grade THEIR OWN attempt — enforced by comparing
--     auth.uid() to the attempt row, not by trusting a parameter.
--   * Negative marking and marks-per-question come from the attempt row,
--     so a tampered client cannot inflate its score.
-- Idempotent: safe to re-run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Bank-backed attempts. Legacy quizzes (the 45 curated ones) keep using
-- their own tables untouched; this table only serves pool draws.
-- ---------------------------------------------------------------------
create table if not exists public.bank_attempts (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles (id) on delete cascade,
  subject_code        text,
  branch_id           uuid,
  unit_index          int,
  difficulty          text,
  -- Immutable snapshot of the drawn questions, in presentation order (§52).
  question_ids        uuid[] not null,
  state               text not null default 'in_progress'
                        check (state in ('in_progress', 'submitted', 'expired')),
  marks_per_question  numeric not null default 1,
  negative_marking    numeric not null default 0,
  duration_sec        int not null default 600,
  started_at          timestamptz not null default now(),
  expires_at          timestamptz,
  submitted_at        timestamptz,
  score               numeric,
  max_score           numeric,
  correct_count       int,
  wrong_count         int,
  unanswered_count    int,
  result              jsonb,
  created_at          timestamptz not null default now()
);

create index if not exists idx_bank_attempts_user
  on public.bank_attempts (user_id, started_at desc);

alter table public.bank_attempts enable row level security;

-- A student sees ONLY their own attempts. This is the barrier that stops
-- "read another student's attempt" (PART G).
drop policy if exists bank_attempts_own_select on public.bank_attempts;
create policy bank_attempts_own_select on public.bank_attempts
  for select to authenticated
  using (user_id = auth.uid());

-- No direct INSERT/UPDATE/DELETE policy on purpose: attempts are created and
-- mutated exclusively through the SECURITY DEFINER functions below, so a
-- student cannot hand-write a row with a fabricated score.

-- ---------------------------------------------------------------------
-- start_bank_attempt — draw questions and freeze them into an attempt.
-- Returns the attempt id + the keyless questions in one round trip.
-- ---------------------------------------------------------------------
create or replace function public.start_bank_attempt(
  p_subject_code text default null,
  p_branch       uuid default null,
  p_unit         int  default null,
  p_difficulty   text default null,
  p_count        int  default 10,
  p_duration_sec int  default 600,
  p_negative     numeric default 0,
  p_marks        numeric default 1
)
returns table (
  attempt_id  uuid,
  expires_at  timestamptz,
  questions   jsonb
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_ids  uuid[];
  v_att  uuid;
  v_exp  timestamptz;
  v_n    int := greatest(1, least(coalesce(p_count, 10), 100));
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  -- Draw only PUBLISHED + human-verified questions. Same gate as
  -- draw_pool_questions; unreviewed content can never enter an attempt.
  select array_agg(q.id order by q.ord)
    into v_ids
  from (
    select qb.id,
           row_number() over (order by md5(qb.id::text || v_user::text || clock_timestamp()::text)) as ord
    from public.question_bank qb
    where qb.published = true
      and qb.human_verified = true
      and (p_subject_code is null or qb.subject_code = p_subject_code)
      and (p_unit is null or qb.unit_index = p_unit)
      and (p_difficulty is null or qb.difficulty = p_difficulty)
      and (
        p_branch is null
        or exists (
          select 1 from public.question_bank_subjects s
          where s.question_id = qb.id and s.branch_id = p_branch
        )
      )
    limit v_n
  ) q;

  if v_ids is null or array_length(v_ids, 1) is null then
    raise exception 'no published questions match this selection'
      using errcode = 'P0002';
  end if;

  v_exp := now() + make_interval(secs => greatest(30, coalesce(p_duration_sec, 600)));

  insert into public.bank_attempts (
    user_id, subject_code, branch_id, unit_index, difficulty,
    question_ids, marks_per_question, negative_marking,
    duration_sec, expires_at
  )
  values (
    v_user, p_subject_code, p_branch, p_unit, p_difficulty,
    v_ids, coalesce(p_marks, 1), coalesce(p_negative, 0),
    coalesce(p_duration_sec, 600), v_exp
  )
  returning id into v_att;

  return query
  select
    v_att,
    v_exp,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'question_id', qb.id,
          'stem',        qb.stem,
          'question_type', qb.question_type,
          'difficulty',  qb.difficulty,
          'topic',       qb.topic,
          'unit_index',  qb.unit_index,
          -- NOTE: is_correct is deliberately absent.
          'options', (
            select jsonb_agg(
                     jsonb_build_object('id', o.id, 'label', o.label)
                     order by o.display_order
                   )
            from public.question_bank_options o
            where o.question_id = qb.id
          )
        )
        order by array_position(v_ids, qb.id)
      ),
      '[]'::jsonb
    )
  from public.question_bank qb
  where qb.id = any (v_ids);
end;
$$;

-- ---------------------------------------------------------------------
-- submit_bank_attempt — grade against the key held in the database.
-- p_answers: { "<question_id>": ["<option_id>", ...], ... }
-- ---------------------------------------------------------------------
create or replace function public.submit_bank_attempt(
  p_attempt uuid,
  p_answers jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user     uuid := auth.uid();
  v_att      public.bank_attempts%rowtype;
  v_qid      uuid;
  v_picked   uuid[];
  v_correct  uuid[];
  v_is_right boolean;
  v_score    numeric := 0;
  v_ok       int := 0;
  v_bad      int := 0;
  v_skip     int := 0;
  v_items    jsonb := '[]'::jsonb;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  select * into v_att from public.bank_attempts where id = p_attempt;
  if not found then
    raise exception 'attempt not found' using errcode = 'P0002';
  end if;
  -- Ownership check: you cannot submit or re-score someone else's attempt.
  if v_att.user_id <> v_user then
    raise exception 'not your attempt' using errcode = '42501';
  end if;

  -- Idempotent submit: return the stored result unchanged.
  if v_att.state = 'submitted' then
    return v_att.result;
  end if;

  foreach v_qid in array v_att.question_ids loop
    select array_agg(value::uuid)
      into v_picked
    from jsonb_array_elements_text(coalesce(p_answers -> v_qid::text, '[]'::jsonb));

    select array_agg(o.id order by o.id)
      into v_correct
    from public.question_bank_options o
    where o.question_id = v_qid and o.is_correct = true;

    if v_picked is null or array_length(v_picked, 1) is null then
      v_skip := v_skip + 1;
      v_is_right := null;
    else
      -- Exact-set match: handles single, true/false, assertion-reason and
      -- multi-answer identically. Partial credit is not awarded.
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

    -- The key and explanation are revealed only now, at submit time.
    v_items := v_items || jsonb_build_object(
      'question_id', v_qid,
      'picked',      coalesce(to_jsonb(v_picked), '[]'::jsonb),
      'correct',     coalesce(to_jsonb(v_correct), '[]'::jsonb),
      'is_correct',  v_is_right,
      'explanation', (select qb.explanation from public.question_bank qb where qb.id = v_qid)
    );
  end loop;

  v_score := greatest(v_score, 0);

  update public.bank_attempts
     set state            = 'submitted',
         submitted_at     = now(),
         score            = v_score,
         max_score        = array_length(question_ids, 1) * marks_per_question,
         correct_count    = v_ok,
         wrong_count      = v_bad,
         unanswered_count = v_skip,
         result = jsonb_build_object(
           'attempt_id',       p_attempt,
           'score',            v_score,
           'max_score',        array_length(question_ids, 1) * marks_per_question,
           'correct_count',    v_ok,
           'wrong_count',      v_bad,
           'unanswered_count', v_skip,
           'submitted_at',     now(),
           'items',            v_items
         )
   where id = p_attempt
   returning result into v_att.result;

  return v_att.result;
end;
$$;

-- ---------------------------------------------------------------------
-- Read back a graded attempt (results screen + history).
-- ---------------------------------------------------------------------
create or replace function public.get_bank_attempt(p_attempt uuid)
returns jsonb
language sql
security definer
set search_path = public, pg_temp
as $$
  select a.result
  from public.bank_attempts a
  where a.id = p_attempt
    and a.user_id = auth.uid()
    and a.state = 'submitted';
$$;

create or replace function public.bank_attempt_history(p_limit int default 30)
returns table (
  attempt_id   uuid,
  subject_code text,
  score        numeric,
  max_score    numeric,
  correct_count int,
  wrong_count   int,
  submitted_at timestamptz
)
language sql
security definer
set search_path = public, pg_temp
as $$
  select a.id, a.subject_code, a.score, a.max_score,
         a.correct_count, a.wrong_count, a.submitted_at
  from public.bank_attempts a
  where a.user_id = auth.uid()
    and a.state = 'submitted'
  order by a.submitted_at desc
  limit greatest(1, least(coalesce(p_limit, 30), 100));
$$;

-- Aggregate counters for the admin dashboard (no question content).
create or replace function public.question_bank_stats()
returns table (
  total          bigint,
  published      bigint,
  human_verified bigint,
  auto_validated bigint,
  quarantined    bigint,
  subjects       bigint
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    (select count(*) from public.question_bank),
    (select count(*) from public.question_bank where published),
    (select count(*) from public.question_bank where human_verified),
    (select count(*) from public.question_bank where automatically_validated),
    (select count(*) from public.question_quarantine),
    (select count(distinct subject_code) from public.question_bank);
$$;

-- Lock down execution: anonymous visitors get nothing.
revoke all on function public.start_bank_attempt(text, uuid, int, text, int, int, numeric, numeric) from public, anon;
revoke all on function public.submit_bank_attempt(uuid, jsonb) from public, anon;
revoke all on function public.get_bank_attempt(uuid) from public, anon;
revoke all on function public.bank_attempt_history(int) from public, anon;
revoke all on function public.question_bank_stats() from public, anon;

grant execute on function public.start_bank_attempt(text, uuid, int, text, int, int, numeric, numeric) to authenticated;
grant execute on function public.submit_bank_attempt(uuid, jsonb) to authenticated;
grant execute on function public.get_bank_attempt(uuid) to authenticated;
grant execute on function public.bank_attempt_history(int) to authenticated;
grant execute on function public.question_bank_stats() to authenticated;
