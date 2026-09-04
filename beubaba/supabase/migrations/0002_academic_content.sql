-- ============================================================================
-- BEU BABA — Migration 0002: Academic content
-- Courses, branches, semesters, subjects, syllabus (+versions), calendar,
-- notices and PYQs. Source of truth: specs 05 §12-24, spec 10, spec 22.
--
-- Read model: published academic content is world-readable (even to guests) so
-- the app is useful without login where the spec allows. WRITES are gated to
-- content managers/admins via has_permission()/is_admin().
-- ============================================================================

-- ---------------------------------------------------------------------------
-- COURSES / BRANCHES / SEMESTERS
-- ---------------------------------------------------------------------------
create table if not exists public.courses (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  short_name     text,
  slug           text unique,
  description    text,
  duration_years numeric,
  is_active      boolean not null default true,
  display_order  integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.branches (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references public.courses(id) on delete cascade,
  name          text not null,
  short_name    text,
  code          text,
  slug          text,
  description   text,
  is_active     boolean not null default true,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_branches_course on public.branches(course_id);

create table if not exists public.semesters (
  id     uuid primary key default gen_random_uuid(),
  number integer not null,
  label  text not null
);

-- ---------------------------------------------------------------------------
-- SUBJECTS   — unique per (branch, semester, code)  (spec 05 §17)
-- ---------------------------------------------------------------------------
create table if not exists public.subjects (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid references public.courses(id) on delete cascade,
  branch_id     uuid references public.branches(id) on delete cascade,
  semester_id   uuid references public.semesters(id),
  semester_number integer,
  code          text,
  name          text not null,
  short_name    text,
  credits       numeric,
  description   text,
  is_active     boolean not null default true,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_subjects_branch_sem on public.subjects(branch_id, semester_id);
create unique index if not exists uq_subjects_identity
  on public.subjects(branch_id, semester_number, code)
  where code is not null;

-- ---------------------------------------------------------------------------
-- SYLLABUS  + versioning   (spec 05 §19-21)
-- Detailed unit-wise content is stored as structured JSON so admins can update
-- content without touching screen components (spec 01 §12 acceptance).
-- ---------------------------------------------------------------------------
create table if not exists public.syllabus (
  id             uuid primary key default gen_random_uuid(),
  subject_id     uuid not null references public.subjects(id) on delete cascade,
  current_version integer not null default 1,
  is_published   boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.syllabus_versions (
  id          uuid primary key default gen_random_uuid(),
  syllabus_id uuid not null references public.syllabus(id) on delete cascade,
  version     integer not null,
  -- units: [{ title, topics[], raw_text? }, ...]
  units       jsonb not null default '[]'::jsonb,
  notes       text,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now(),
  unique (syllabus_id, version)
);

-- ---------------------------------------------------------------------------
-- ACADEMIC CALENDAR   (spec 05 §22)
-- ---------------------------------------------------------------------------
create table if not exists public.academic_calendar_events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  category    text,                 -- exam / holiday / admission / result / event
  starts_on   date not null,
  ends_on     date,
  branch_id   uuid references public.branches(id) on delete cascade,
  semester_number integer,
  is_published boolean not null default true,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- NOTICES / ANNOUNCEMENTS   (spec 05 §23)
-- ---------------------------------------------------------------------------
create table if not exists public.notices (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  body         text not null,
  category     text not null default 'general'
                 check (category in ('exam','result','general','academic')),
  is_published boolean not null default true,
  published_at timestamptz not null default now(),
  created_by   uuid references public.profiles(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- PYQs   (spec 05, spec 01 §11)
-- ---------------------------------------------------------------------------
create table if not exists public.pyqs (
  id             uuid primary key default gen_random_uuid(),
  subject_id     uuid references public.subjects(id) on delete set null,
  subject_code   text,
  subject_name   text,
  branch_id      uuid references public.branches(id) on delete set null,
  semester_number integer,
  exam_year      integer,
  exam_session   text,               -- e.g. "End Sem", "2023"
  title          text not null,
  -- structured question blocks (kept as JSON, mirrors the mock seed shape)
  blocks         jsonb not null default '[]'::jsonb,
  source_url     text,
  is_published   boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists idx_pyqs_subject on public.pyqs(subject_id);
create index if not exists idx_pyqs_branch_sem on public.pyqs(branch_id, semester_number);

-- updated_at triggers
create trigger trg_courses_updated  before update on public.courses  for each row execute function public.set_updated_at();
create trigger trg_branches_updated before update on public.branches for each row execute function public.set_updated_at();
create trigger trg_subjects_updated before update on public.subjects for each row execute function public.set_updated_at();
create trigger trg_syllabus_updated before update on public.syllabus for each row execute function public.set_updated_at();
create trigger trg_calendar_updated before update on public.academic_calendar_events for each row execute function public.set_updated_at();
create trigger trg_notices_updated  before update on public.notices  for each row execute function public.set_updated_at();
create trigger trg_pyqs_updated     before update on public.pyqs     for each row execute function public.set_updated_at();

-- ============================================================================
-- RLS  — public read of published content; writes require content permission.
-- ============================================================================
alter table public.courses                   enable row level security;
alter table public.branches                  enable row level security;
alter table public.semesters                 enable row level security;
alter table public.subjects                  enable row level security;
alter table public.syllabus                  enable row level security;
alter table public.syllabus_versions         enable row level security;
alter table public.academic_calendar_events  enable row level security;
alter table public.notices                   enable row level security;
alter table public.pyqs                      enable row level security;

-- Public (anon + authenticated) read of active/published content.
create policy courses_read   on public.courses   for select using (is_active or public.is_admin());
create policy branches_read  on public.branches  for select using (is_active or public.is_admin());
create policy semesters_read on public.semesters for select using (true);
create policy subjects_read  on public.subjects  for select using (is_active or public.is_admin());
create policy syllabus_read  on public.syllabus  for select using (is_published or public.is_admin());
create policy syllabus_versions_read on public.syllabus_versions for select using (true);
create policy calendar_read  on public.academic_calendar_events for select using (is_published or public.is_admin());
create policy notices_read   on public.notices   for select using (is_published or public.is_admin());
create policy pyqs_read      on public.pyqs      for select using (is_published or public.is_admin());

-- Writes: content managers / admins only. One helper macro repeated per table.
-- courses/branches/semesters/subjects -> manage_courses
create policy courses_write  on public.courses  for all
  using (public.has_permission('manage_courses')) with check (public.has_permission('manage_courses'));
create policy branches_write on public.branches for all
  using (public.has_permission('manage_courses')) with check (public.has_permission('manage_courses'));
create policy semesters_write on public.semesters for all
  using (public.has_permission('manage_courses')) with check (public.has_permission('manage_courses'));
create policy subjects_write on public.subjects for all
  using (public.has_permission('manage_courses')) with check (public.has_permission('manage_courses'));

-- syllabus -> manage_syllabus
create policy syllabus_write on public.syllabus for all
  using (public.has_permission('manage_syllabus')) with check (public.has_permission('manage_syllabus'));
create policy syllabus_versions_write on public.syllabus_versions for all
  using (public.has_permission('manage_syllabus')) with check (public.has_permission('manage_syllabus'));

-- calendar -> manage_calendar
create policy calendar_write on public.academic_calendar_events for all
  using (public.has_permission('manage_calendar')) with check (public.has_permission('manage_calendar'));

-- notices -> manage_notices
create policy notices_write on public.notices for all
  using (public.has_permission('manage_notices')) with check (public.has_permission('manage_notices'));

-- pyqs -> manage_courses (academic content)
create policy pyqs_write on public.pyqs for all
  using (public.has_permission('manage_courses')) with check (public.has_permission('manage_courses'));
