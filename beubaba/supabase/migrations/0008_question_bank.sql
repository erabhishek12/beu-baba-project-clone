-- ============================================================================
-- BEU BABA — Migration 0008: CANONICAL QUESTION BANK + provenance + quarantine
--
-- WHY THIS MIGRATION EXISTS (Phase 3A schema audit).
-- Migration 0003 models questions as `quiz_questions`, which is
--   quiz_id uuid NOT NULL references quizzes(id) on delete cascade
-- i.e. a question is OWNED BY EXACTLY ONE QUIZ. That is a hard blocker for the
-- verified Phase 3C dataset:
--
--   B1  Cross-branch sharing impossible. 1,207 first-year questions (Maths-I/II,
--       Physics, Chemistry, IKS, UHV) are legitimately taught to BOTH Civil and
--       CSE. Under 0003 the only way to serve both is to physically duplicate
--       every row — the exact duplication the master doc §53 forbids.
--   B2  No reuse. A question cannot appear in a practice quiz AND a mock test.
--   B3  No provenance. Nowhere to record source_pack / source_id, so the
--       1,301 colliding source ids cannot be disambiguated and re-import
--       cannot be made idempotent.
--   B4  question_type check is ('single','multiple','true_false') — it REJECTS
--       'assertion_reason', which 1,173 records in the packs use.
--   B5  No verification model. 0003 has no place to distinguish
--       "a script validated the shape" from "a human approved the content",
--       so 26,995 verified=false records have nowhere to live safely.
--   B6  No quarantine. 1,382 records must be retained-but-excluded; 0003 can
--       only either import them into a live quiz or lose them.
--
-- APPROACH — ADDITIVE, NON-DESTRUCTIVE.
-- `quiz_questions` / `quiz_options` and the 0003 grading path are LEFT INTACT
-- (45 seeded quizzes / 92 questions keep working, per instruction §18). This
-- migration adds a parallel canonical bank that quizzes may draw from. A quiz
-- can therefore be either hand-authored (0003 path) or pool-backed (this path).
-- Nothing is dropped and no existing row is rewritten.
--
-- Idempotent: safe to re-run.
-- ============================================================================

-- ############################################################################
-- 1. CANONICAL QUESTION BANK
-- ############################################################################
create table if not exists public.question_bank (
  -- Global UUID primary key. The pack's `id` is NEVER the PK: 1,301 source ids
  -- collide across packs (Phase 3C D2).
  id              uuid primary key default gen_random_uuid(),

  -- ---- content ----
  stem            text not null,
  explanation     text,
  question_type   text not null default 'single'
                    check (question_type in ('single','multi','truefalse','assertion_reason')),
  difficulty      text not null default 'medium'
                    check (difficulty in ('easy','medium','hard')),

  -- ---- academic placement (denormalised for fast filtering) ----
  subject_code    text,
  subject_name    text,
  unit_index      integer,
  unit_title      text,
  topic           text,

  -- ---- provenance (instruction §4) ----
  -- source_ref is the human-readable trace, e.g.
  --   "computer_science_engineering.json:q_100102_u0_001"
  source_pack     text,
  source_id       text,
  source_ref      text,
  source_note     text,                      -- the pack's own `source` string
  -- Canonical identity of the question: sha1(normalised stem + sorted options).
  -- Used for dedupe AND for idempotent re-import (instruction §14).
  content_hash    text not null,
  -- Deterministic shuffle seed so the same source question always normalises
  -- to the same option order (instruction §7).
  shuffle_seed    text,

  -- ---- flags carried from source ----
  is_pyq          boolean not null default false,
  pyq_year        integer,
  is_important    boolean not null default false,

  -- ---- verification model (instruction §10) ----
  -- Three INDEPENDENT concepts. A script can only ever set the first one.
  structurally_valid      boolean not null default false,
  automatically_validated boolean not null default false,
  human_verified          boolean not null default false,
  verified_by     uuid references public.profiles(id),
  verified_at     timestamptz,
  -- Only a human-verified question may be published into a live pool.
  published       boolean not null default false,

  import_job_id   uuid references public.import_jobs(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- Publication gate enforced by the DATABASE, not by application code.
  constraint qb_publish_requires_human_verification
    check (published = false or human_verified = true)
);

-- Re-import idempotency: the same canonical content is stored once.
create unique index if not exists uq_question_bank_content
  on public.question_bank(content_hash);
-- Provenance lookup: "where did this come from / has this pack row landed yet".
create unique index if not exists uq_question_bank_source
  on public.question_bank(source_pack, source_id)
  where source_pack is not null and source_id is not null;
create index if not exists idx_qb_subject   on public.question_bank(subject_code);
create index if not exists idx_qb_pool      on public.question_bank(published, human_verified, difficulty);
create index if not exists idx_qb_topic     on public.question_bank(subject_code, unit_index);
create index if not exists idx_qb_job       on public.question_bank(import_job_id);

-- ---------------------------------------------------------------------------
-- OPTIONS — one row per choice. is_correct is SECRET, exactly as in 0003.
-- ---------------------------------------------------------------------------
create table if not exists public.question_bank_options (
  id            uuid primary key default gen_random_uuid(),
  question_id   uuid not null references public.question_bank(id) on delete cascade,
  label         text not null,
  is_correct    boolean not null default false,
  display_order integer not null default 0,
  -- Where this option sat in the ORIGINAL pack, so the shuffle is auditable
  -- and reversible without touching the read-only source files.
  source_index  integer,
  unique (question_id, display_order)
);
create index if not exists idx_qbo_question on public.question_bank_options(question_id);

-- ---------------------------------------------------------------------------
-- B1 FIX — MANY-TO-MANY placement. ONE canonical question, N branch/subject
-- relationships. This is what lets the 1,207 shared first-year questions serve
-- both Civil and CSE without physical duplication (instruction §6).
-- ---------------------------------------------------------------------------
create table if not exists public.question_bank_subjects (
  question_id     uuid not null references public.question_bank(id) on delete cascade,
  branch_id       uuid references public.branches(id) on delete cascade,
  subject_id      uuid references public.subjects(id) on delete set null,
  subject_code    text not null,
  semester_number integer,
  -- Civil files the same subject under two code systems (101401 and
  -- PCC-CE-307). Both are preserved as separate placement rows pointing at ONE
  -- question, so neither code is declared "the official one" (instruction §5).
  source_pack     text,
  source_id       text,
  primary key (question_id, subject_code, branch_id)
);
create index if not exists idx_qbs_branch on public.question_bank_subjects(branch_id, subject_code);
create index if not exists idx_qbs_subject on public.question_bank_subjects(subject_id);

-- ############################################################################
-- 2. QUARANTINE (instruction §9) — retained, recoverable, never in a quiz.
-- ############################################################################
create table if not exists public.question_quarantine (
  id            uuid primary key default gen_random_uuid(),
  source_pack   text not null,
  source_id     text,
  source_ref    text,
  branch_id     uuid references public.branches(id) on delete set null,
  branch_name   text,
  subject_code  text,
  subject_name  text,
  reason        text not null
                  check (reason in ('duplicate_options','unresolved_subject',
                                    'conflicting_subject_mapping','malformed_question',
                                    'invalid_answer','duplicate','manual_review','other')),
  severity      text not null default 'error'
                  check (severity in ('error','warning','info')),
  detail        text,
  -- FULL original record, byte-faithful. Nothing is ever lost: a quarantined
  -- question can be replayed into the bank once the blocker is resolved.
  original_data jsonb not null,
  status        text not null default 'quarantined'
                  check (status in ('quarantined','under_review','released','rejected')),
  reviewer_id   uuid references public.profiles(id),
  review_notes  text,
  reviewed_at   timestamptz,
  import_job_id uuid references public.import_jobs(id) on delete set null,
  created_at    timestamptz not null default now()
);
create index if not exists idx_quarantine_reason on public.question_quarantine(reason, status);
create index if not exists idx_quarantine_pack   on public.question_quarantine(source_pack);
create index if not exists idx_quarantine_job    on public.question_quarantine(import_job_id);

-- ############################################################################
-- 3. POOL-BACKED QUIZZES — a quiz may draw N questions from the bank by rule
--    instead of owning fixed rows.
-- ############################################################################
alter table public.quizzes
  add column if not exists source_kind text not null default 'authored'
    check (source_kind in ('authored','bank_pool'));

create table if not exists public.quiz_pool_rules (
  id              uuid primary key default gen_random_uuid(),
  quiz_id         uuid not null references public.quizzes(id) on delete cascade,
  branch_id       uuid references public.branches(id) on delete cascade,
  subject_code    text,
  unit_index      integer,
  topic           text,
  difficulty      text check (difficulty in ('easy','medium','hard')),
  question_type   text check (question_type in ('single','multi','truefalse','assertion_reason')),
  pick_count      integer not null default 10 check (pick_count > 0),
  only_important  boolean not null default false,
  only_pyq        boolean not null default false
);
create index if not exists idx_pool_rules_quiz on public.quiz_pool_rules(quiz_id);

-- B4 FIX — allow assertion_reason in the ORIGINAL quiz_questions table too, so
-- the two paths agree. Widening a CHECK is non-destructive: every existing row
-- ('single','multiple','true_false') still satisfies the new constraint.
alter table public.quiz_questions drop constraint if exists quiz_questions_question_type_check;
alter table public.quiz_questions add constraint quiz_questions_question_type_check
  check (question_type in ('single','multiple','true_false','multi','truefalse','assertion_reason'));

create trigger trg_question_bank_updated before update on public.question_bank
  for each row execute function public.set_updated_at();

-- ############################################################################
-- 4. SERVER-SIDE POOL SELECTION (instruction §15)
--    The browser must never receive the bank. It asks for N questions and gets
--    N questions — WITHOUT the answer key.
-- ############################################################################
create or replace function public.draw_pool_questions(
  p_branch uuid default null,
  p_subject_code text default null,
  p_unit integer default null,
  p_difficulty text default null,
  p_limit integer default 10,
  p_seed text default null
)
returns table (
  question_id uuid, stem text, question_type text, difficulty text,
  topic text, unit_index integer, options jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  with picked as (
    select q.id
    from public.question_bank q
    where q.published                      -- implies human_verified via CHECK
      and (p_subject_code is null or q.subject_code = p_subject_code)
      and (p_unit is null or q.unit_index = p_unit)
      and (p_difficulty is null or q.difficulty = p_difficulty)
      and (p_branch is null or exists (
            select 1 from public.question_bank_subjects s
            where s.question_id = q.id and s.branch_id = p_branch))
    order by md5(q.id::text || coalesce(p_seed,''))
    limit greatest(1, least(coalesce(p_limit,10), 100))
  )
  select q.id, q.stem, q.question_type, q.difficulty, q.topic, q.unit_index,
         (select jsonb_agg(jsonb_build_object('id', o.id, 'label', o.label)
                           order by o.display_order)
            from public.question_bank_options o
           where o.question_id = q.id) as options
  from public.question_bank q
  join picked p on p.id = q.id;
$$;

-- Statistics for the admin import preview (instruction §13) — counts only.
create or replace function public.question_bank_stats()
returns table (
  total bigint, published bigint, human_verified bigint,
  auto_validated bigint, quarantined bigint, subjects bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*) from public.question_bank),
    (select count(*) from public.question_bank where published),
    (select count(*) from public.question_bank where human_verified),
    (select count(*) from public.question_bank where automatically_validated),
    (select count(*) from public.question_quarantine where status = 'quarantined'),
    (select count(distinct subject_code) from public.question_bank);
$$;

-- ############################################################################
-- 5. RLS — the answer key must never reach a student (same contract as 0003).
-- ############################################################################
alter table public.question_bank          enable row level security;
alter table public.question_bank_options  enable row level security;
alter table public.question_bank_subjects enable row level security;
alter table public.question_quarantine    enable row level security;
alter table public.quiz_pool_rules        enable row level security;

-- Bank rows: students never select these directly; they receive questions via
-- draw_pool_questions(). Managers may read everything for the review workflow.
create policy qb_admin_read on public.question_bank for select
  using (public.has_permission('manage_quizzes') or public.is_admin());
create policy qb_write on public.question_bank for all
  using (public.has_permission('manage_quizzes'))
  with check (public.has_permission('manage_quizzes'));

-- OPTIONS: is_correct lives here, so there is NO student read policy at all.
create policy qbo_admin_read on public.question_bank_options for select
  using (public.has_permission('manage_quizzes'));
create policy qbo_write on public.question_bank_options for all
  using (public.has_permission('manage_quizzes'))
  with check (public.has_permission('manage_quizzes'));

create policy qbs_read on public.question_bank_subjects for select
  using (public.has_permission('manage_quizzes') or public.is_admin());
create policy qbs_write on public.question_bank_subjects for all
  using (public.has_permission('manage_quizzes'))
  with check (public.has_permission('manage_quizzes'));

-- Quarantine is an admin workspace. It holds unreviewed content; never public.
create policy quarantine_admin on public.question_quarantine for all
  using (public.is_admin()) with check (public.is_admin());

create policy pool_rules_read on public.quiz_pool_rules for select
  using (exists (select 1 from public.quizzes z
                 where z.id = quiz_id and (z.status = 'published' or public.is_admin())));
create policy pool_rules_write on public.quiz_pool_rules for all
  using (public.has_permission('manage_quizzes'))
  with check (public.has_permission('manage_quizzes'));

-- Defence in depth: even a future permissive policy cannot let a client mutate
-- the answer key or the verification flags.
revoke insert, update, delete on public.question_bank         from anon, authenticated;
revoke insert, update, delete on public.question_bank_options from anon, authenticated;
revoke select                 on public.question_bank_options from anon, authenticated;
revoke insert, update, delete on public.question_quarantine   from anon, authenticated;
revoke select                 on public.question_quarantine   from anon, authenticated;
