-- ============================================================================
-- BEU BABA — Migration 0003: Quiz & assessment engine
-- Source of truth: spec 15, spec 01 §13-14.
--
-- NON-NEGOTIABLE: scoring is SERVER-AUTHORITATIVE (spec 15 §"server must be the
-- final authority for scoring"). The correct-answer flag lives on quiz_options
-- and is NEVER selectable by students under RLS. Students submit answers; a
-- SECURITY DEFINER function grades and writes the immutable result.
--
-- Version integrity: an attempt references the exact question VERSION shown, so
-- historical attempts stay reproducible even after admins edit questions
-- (spec 15 §320-353).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- QUIZZES + versions
-- ---------------------------------------------------------------------------
create table if not exists public.quizzes (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  subject_id     uuid references public.subjects(id) on delete set null,
  subject_code   text,
  subject_name   text,
  branch_id      uuid references public.branches(id) on delete set null,
  semester_number integer,
  unit_label     text,
  difficulty     text not null default 'medium'
                   check (difficulty in ('easy','medium','hard')),
  description    text,
  duration_seconds integer not null default 600,
  -- scoring policy is explicit (spec 15 §263): points per correct, negative marking.
  points_per_question numeric not null default 1,
  negative_marking    numeric not null default 0,
  pass_percentage     numeric not null default 0,
  status         text not null default 'draft'
                   check (status in ('draft','published','archived')),
  current_version integer not null default 1,
  created_by     uuid references public.profiles(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists idx_quizzes_subject on public.quizzes(subject_id);
create index if not exists idx_quizzes_status on public.quizzes(status);

create table if not exists public.quiz_questions (
  id            uuid primary key default gen_random_uuid(),
  quiz_id       uuid not null references public.quizzes(id) on delete cascade,
  version       integer not null default 1,
  prompt        text not null,
  explanation   text,                 -- 1-line explanation (spec: every MCQ)
  question_type text not null default 'single'
                  check (question_type in ('single','multiple','true_false')),
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists idx_quiz_questions_quiz on public.quiz_questions(quiz_id, version);

create table if not exists public.quiz_options (
  id            uuid primary key default gen_random_uuid(),
  question_id   uuid not null references public.quiz_questions(id) on delete cascade,
  label         text not null,
  is_correct    boolean not null default false,   -- SECRET: never exposed to students
  display_order integer not null default 0
);
create index if not exists idx_quiz_options_question on public.quiz_options(question_id);

-- ---------------------------------------------------------------------------
-- ATTEMPTS + answers + results
-- ---------------------------------------------------------------------------
create table if not exists public.quiz_attempts (
  id             uuid primary key default gen_random_uuid(),
  quiz_id        uuid not null references public.quizzes(id) on delete cascade,
  user_id        uuid not null references public.profiles(id) on delete cascade,
  quiz_version   integer not null,
  status         text not null default 'in_progress'
                   check (status in ('in_progress','submitted','expired')),
  started_at     timestamptz not null default now(),
  expires_at     timestamptz not null,
  submitted_at   timestamptz
);
create index if not exists idx_attempts_user on public.quiz_attempts(user_id);
-- Only one active attempt per (user, quiz) — recoverable, not duplicated.
create unique index if not exists uq_attempt_active
  on public.quiz_attempts(user_id, quiz_id)
  where status = 'in_progress';

create table if not exists public.quiz_answers (
  attempt_id     uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id    uuid not null references public.quiz_questions(id) on delete cascade,
  -- selected option ids (array supports single & multiple choice)
  selected_option_ids uuid[] not null default '{}',
  marked_for_review boolean not null default false,
  answered_at    timestamptz not null default now(),
  primary key (attempt_id, question_id)
);

create table if not exists public.quiz_results (
  attempt_id     uuid primary key references public.quiz_attempts(id) on delete cascade,
  quiz_id        uuid not null references public.quizzes(id) on delete cascade,
  user_id        uuid not null references public.profiles(id) on delete cascade,
  total_questions integer not null,
  correct_count  integer not null,
  incorrect_count integer not null,
  unanswered_count integer not null,
  raw_score      numeric not null,       -- both raw + percentage stored (spec 15 §731)
  max_score      numeric not null,
  percentage     numeric not null,
  passed         boolean not null,
  created_at     timestamptz not null default now()
);
create index if not exists idx_results_user on public.quiz_results(user_id);

create trigger trg_quizzes_updated before update on public.quizzes for each row execute function public.set_updated_at();

-- ============================================================================
-- SERVER-AUTHORITATIVE OPERATIONS
-- ============================================================================

-- Start (or resume) an attempt. Returns the attempt id. Enforces published
-- status and the single-active-attempt rule.
create or replace function public.start_quiz_attempt(p_quiz uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quiz   public.quizzes%rowtype;
  v_attempt uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  select * into v_quiz from public.quizzes where id = p_quiz;
  if not found or v_quiz.status <> 'published' then
    raise exception 'quiz not available' using errcode = 'P0002';
  end if;

  -- resume an existing in-progress attempt if present
  select id into v_attempt
  from public.quiz_attempts
  where user_id = auth.uid() and quiz_id = p_quiz and status = 'in_progress'
  limit 1;
  if found then
    return v_attempt;
  end if;

  insert into public.quiz_attempts (quiz_id, user_id, quiz_version, expires_at)
  values (p_quiz, auth.uid(), v_quiz.current_version,
          now() + make_interval(secs => v_quiz.duration_seconds))
  returning id into v_attempt;

  return v_attempt;
end;
$$;

-- Save/replace a single answer while the attempt is active (idempotent upsert).
create or replace function public.save_quiz_answer(
  p_attempt uuid, p_question uuid, p_options uuid[], p_review boolean default false)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  v_status text;
  v_expires timestamptz;
begin
  select user_id, status, expires_at into v_owner, v_status, v_expires
  from public.quiz_attempts where id = p_attempt;

  if v_owner is null or v_owner <> auth.uid() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if v_status <> 'in_progress' or now() > v_expires then
    raise exception 'attempt not active' using errcode = 'P0003';
  end if;

  insert into public.quiz_answers (attempt_id, question_id, selected_option_ids, marked_for_review)
  values (p_attempt, p_question, coalesce(p_options,'{}'), p_review)
  on conflict (attempt_id, question_id)
  do update set selected_option_ids = excluded.selected_option_ids,
                marked_for_review = excluded.marked_for_review,
                answered_at = now();
end;
$$;

-- Submit & GRADE. This is the sole scoring authority. A student cannot compute
-- or influence the score; correctness is read from quiz_options server-side.
create or replace function public.submit_quiz_attempt(p_attempt uuid, p_auto boolean default false)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_att     public.quiz_attempts%rowtype;
  v_quiz    public.quizzes%rowtype;
  v_total   integer := 0;
  v_correct integer := 0;
  v_wrong   integer := 0;
  v_blank   integer := 0;
  v_raw     numeric := 0;
  v_max     numeric := 0;
  r         record;
  v_sel     uuid[];
  v_correct_ids uuid[];
  v_is_correct boolean;
begin
  select * into v_att from public.quiz_attempts where id = p_attempt;
  if v_att.user_id is null or v_att.user_id <> auth.uid() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  -- Idempotent: if already submitted, just return existing result.
  if v_att.status <> 'in_progress' then
    return p_attempt;
  end if;

  select * into v_quiz from public.quizzes where id = v_att.quiz_id;

  -- Grade every question in the attempt's version snapshot.
  for r in
    select q.id as qid
    from public.quiz_questions q
    where q.quiz_id = v_att.quiz_id and q.version = v_att.quiz_version
  loop
    v_total := v_total + 1;
    v_max := v_max + v_quiz.points_per_question;

    select coalesce(selected_option_ids,'{}') into v_sel
    from public.quiz_answers where attempt_id = p_attempt and question_id = r.qid;

    select array_agg(id) into v_correct_ids
    from public.quiz_options where question_id = r.qid and is_correct;

    if v_sel is null or array_length(v_sel,1) is null then
      v_blank := v_blank + 1;
      continue;
    end if;

    -- Correct iff selected set == correct set (order-independent).
    v_is_correct := (
      v_sel <@ v_correct_ids and v_correct_ids <@ v_sel
    );

    if v_is_correct then
      v_correct := v_correct + 1;
      v_raw := v_raw + v_quiz.points_per_question;
    else
      v_wrong := v_wrong + 1;
      v_raw := v_raw - v_quiz.negative_marking;
    end if;
  end loop;

  if v_raw < 0 then v_raw := 0; end if;

  update public.quiz_attempts
    set status = case when p_auto then 'expired' else 'submitted' end,
        submitted_at = now()
    where id = p_attempt;

  insert into public.quiz_results (
    attempt_id, quiz_id, user_id, total_questions, correct_count,
    incorrect_count, unanswered_count, raw_score, max_score, percentage, passed)
  values (
    p_attempt, v_att.quiz_id, v_att.user_id, v_total, v_correct, v_wrong, v_blank,
    v_raw, v_max,
    case when v_max > 0 then round((v_raw / v_max) * 100, 2) else 0 end,
    case when v_max > 0 then (v_raw / v_max) * 100 >= v_quiz.pass_percentage else false end)
  on conflict (attempt_id) do nothing;

  return p_attempt;
end;
$$;

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.quizzes        enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_options   enable row level security;
alter table public.quiz_attempts  enable row level security;
alter table public.quiz_answers   enable row level security;
alter table public.quiz_results   enable row level security;

-- Quizzes: published are world-readable; managers manage.
create policy quizzes_read on public.quizzes for select
  using (status = 'published' or public.is_admin());
create policy quizzes_write on public.quizzes for all
  using (public.has_permission('manage_quizzes')) with check (public.has_permission('manage_quizzes'));

-- Questions: readable when their quiz is published (prompts only; see options).
create policy quiz_questions_read on public.quiz_questions for select
  using (exists (select 1 from public.quizzes z
                 where z.id = quiz_id and (z.status='published' or public.is_admin())));
create policy quiz_questions_write on public.quiz_questions for all
  using (public.has_permission('manage_quizzes')) with check (public.has_permission('manage_quizzes'));

-- OPTIONS: students may read option id + label + order, but the is_correct flag
-- must never leak. RLS can't hide a column, so the app reads options through the
-- public_quiz_options VIEW (below) which omits is_correct. Direct table SELECT is
-- restricted to managers; grading uses SECURITY DEFINER functions.
create policy quiz_options_admin_read on public.quiz_options for select
  using (public.has_permission('manage_quizzes'));
create policy quiz_options_write on public.quiz_options for all
  using (public.has_permission('manage_quizzes')) with check (public.has_permission('manage_quizzes'));

-- Attempts: strictly owner-scoped (a moderator may read for support if needed).
create policy attempts_owner on public.quiz_attempts for select
  using (user_id = auth.uid() or public.is_admin());
-- No direct insert/update from client — start/submit go through functions.

-- Answers: owner may read their own; writes go through save_quiz_answer().
create policy answers_owner_read on public.quiz_answers for select
  using (exists (select 1 from public.quiz_attempts a
                 where a.id = attempt_id and a.user_id = auth.uid()));

-- Results: owner reads own; admins read all. Inserts happen in submit function.
create policy results_owner_read on public.quiz_results for select
  using (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- SAFE PUBLIC VIEW of options (no is_correct). Students read from here.
-- Runs with the view owner's privileges (security_invoker = false, the default)
-- so it can project ONLY the non-secret columns from quiz_options past that
-- table's restrictive RLS. The is_correct flag is never selected here, so it can
-- never reach the client (spec 15: correctness stays server-side).
-- ---------------------------------------------------------------------------
create or replace view public.public_quiz_options
with (security_invoker = false) as
  select o.id, o.question_id, o.label, o.display_order
  from public.quiz_options o
  join public.quiz_questions q on q.id = o.question_id
  join public.quizzes z on z.id = q.quiz_id
  where z.status = 'published';

grant select on public.public_quiz_options to anon, authenticated;
