-- ============================================================================
-- BEU BABA — Migration 0007: Banners, per-user impressions, import pipeline,
-- revision/weak-topics, external links, chatbot intent catalog, search index.
--
-- These are the tables the MASTER requirements demand (§10, §20, §33–39, §43,
-- §24–25) and which the Phase 3B audit proved DO NOT EXIST anywhere in
-- migrations 0001–0005. Schema only — the UI for these lands in its own phase.
--
-- No production data is inserted here except the five external destinations
-- explicitly listed by the owner in the master document §43.
-- ============================================================================

-- ############################################################################
-- 1. BANNERS  (master §34–39)
-- ############################################################################
create table if not exists public.banners (
  id            uuid primary key default gen_random_uuid(),
  -- Every content field is individually optional (§34 "Content must be
  -- optional": text only / image only / image+text / image+text+buttons).
  title         text,
  description   text,
  supporting_text text,
  image_path    text,                  -- storage path in 'admin-assets'
  image_alt     text,
  kind          text not null default 'announcement'
                  check (kind in ('festival','course','semester','notice',
                                  'exam','form','event','feature','announcement')),

  -- Scheduling (§35)
  is_active     boolean not null default false,
  starts_at     timestamptz,
  expires_at    timestamptz,
  priority      integer not null default 0,   -- higher wins when several are eligible

  -- Frequency contract (§37). count_limit is only meaningful for 'n_times'.
  frequency     text not null default 'once_ever'
                  check (frequency in ('once_ever','once_per_session','n_times','always')),
  frequency_count integer,

  -- Notification integration (§39)
  send_notification boolean not null default false,
  notification_sent_at timestamptz,

  created_by    uuid references public.profiles(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- A banner with no text AND no image would render as an empty overlay.
  constraint banner_has_content
    check (title is not null or description is not null or image_path is not null),
  -- n_times requires a positive count; other modes must not carry one.
  constraint banner_frequency_count_valid
    check ((frequency = 'n_times' and coalesce(frequency_count,0) > 0)
        or (frequency <> 'n_times')),
  constraint banner_window_valid
    check (expires_at is null or starts_at is null or expires_at > starts_at)
);
create index if not exists idx_banners_live
  on public.banners(is_active, priority desc, starts_at, expires_at);

-- Buttons are 0..n per banner (§35 "multiple buttons where appropriate").
create table if not exists public.banner_buttons (
  id            uuid primary key default gen_random_uuid(),
  banner_id     uuid not null references public.banners(id) on delete cascade,
  label         text not null,
  -- Either an in-app route ('/study/syllabus') or an external URL.
  target        text not null,
  is_external   boolean not null default false,
  style         text not null default 'primary' check (style in ('primary','secondary','ghost')),
  display_order integer not null default 0
);
create index if not exists idx_banner_buttons_banner on public.banner_buttons(banner_id);

-- Targeting (§38). NO rows for a banner  ==  "all users".
create table if not exists public.banner_targets (
  id            uuid primary key default gen_random_uuid(),
  banner_id     uuid not null references public.banners(id) on delete cascade,
  branch_id     uuid references public.branches(id) on delete cascade,
  semester_number integer,
  academic_year integer,
  role          text,
  unique nulls not distinct (banner_id, branch_id, semester_number, academic_year, role)
);
create index if not exists idx_banner_targets_banner on public.banner_targets(banner_id);

-- PER-USER, PER-BANNER impression state (§37 "not only globally").
-- One row per (banner, user). seen_count is the lifetime total; last_session_id
-- lets 'once_per_session' work without a server session table.
create table if not exists public.banner_impressions (
  banner_id       uuid not null references public.banners(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  seen_count      integer not null default 0 check (seen_count >= 0),
  first_seen_at   timestamptz not null default now(),
  last_seen_at    timestamptz not null default now(),
  last_session_id text,
  dismissed_at    timestamptz,
  primary key (banner_id, user_id)
);
create index if not exists idx_banner_impr_user on public.banner_impressions(user_id);

-- ---------------------------------------------------------------------------
-- Eligibility is decided SERVER-SIDE. The client cannot be trusted to honour a
-- frequency cap (§37) — it would just clear localStorage. This function is the
-- single source of truth for "which banner, if any, should this user see now".
-- ---------------------------------------------------------------------------
create or replace function public.next_eligible_banner(p_session_id text default null)
returns table (
  id uuid, title text, description text, supporting_text text,
  image_path text, image_alt text, kind text, priority integer
)
language sql
stable
security definer
set search_path = public
as $$
  select b.id, b.title, b.description, b.supporting_text,
         b.image_path, b.image_alt, b.kind, b.priority
  from public.banners b
  left join public.banner_impressions i
         on i.banner_id = b.id and i.user_id = auth.uid()
  where auth.uid() is not null
    and b.is_active
    and (b.starts_at  is null or b.starts_at  <= now())
    and (b.expires_at is null or b.expires_at >  now())
    -- targeting: no target rows => everyone; otherwise the student must match
    and (
      not exists (select 1 from public.banner_targets t where t.banner_id = b.id)
      or exists (
        select 1
        from public.banner_targets t
        left join public.student_profiles sp on sp.user_id = auth.uid()
        left join public.semesters sem on sem.id = sp.current_semester_id
        where t.banner_id = b.id
          and (t.branch_id       is null or t.branch_id = sp.branch_id)
          and (t.semester_number is null or t.semester_number = sem.number)
          and (t.academic_year   is null or t.academic_year = sp.admission_year)
          and (t.role            is null or public.has_role(t.role))
      )
    )
    -- frequency
    and case b.frequency
          when 'always'           then true
          when 'once_ever'        then coalesce(i.seen_count,0) < 1
          when 'n_times'          then coalesce(i.seen_count,0) < b.frequency_count
          when 'once_per_session' then p_session_id is null
                                       or i.last_session_id is distinct from p_session_id
          else false
        end
  order by b.priority desc, b.starts_at nulls last, b.created_at
  limit 1;
$$;

-- Record a REAL impression. Called only after the overlay actually rendered,
-- so a failed image/network load never burns a view (§37 last rule).
create or replace function public.record_banner_impression(
  p_banner uuid, p_session_id text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if not exists (select 1 from public.banners where id = p_banner and is_active) then
    return;   -- deleted/deactivated between fetch and render: never count it
  end if;

  insert into public.banner_impressions (banner_id, user_id, seen_count, last_session_id)
  values (p_banner, auth.uid(), 1, p_session_id)
  on conflict (banner_id, user_id) do update
    set seen_count      = public.banner_impressions.seen_count + 1,
        last_seen_at    = now(),
        last_session_id = coalesce(excluded.last_session_id,
                                   public.banner_impressions.last_session_id);
end;
$$;

create or replace function public.dismiss_banner(p_banner uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.banner_impressions
     set dismissed_at = now()
   where banner_id = p_banner and user_id = auth.uid();
$$;

-- Banner → notification (§39). Fans the banner out to the targeted audience as
-- real notification rows. Idempotent per banner via notification_sent_at.
create or replace function public.publish_banner_notification(p_banner uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  b public.banners%rowtype;
  n integer := 0;
begin
  if not public.has_permission('manage_notices') and not public.is_super_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  select * into b from public.banners where id = p_banner;
  if not found then raise exception 'banner not found' using errcode = 'P0002'; end if;
  if not b.send_notification then return 0; end if;
  if b.notification_sent_at is not null then return 0; end if;   -- already sent

  with audience as (
    select p.id
    from public.profiles p
    left join public.student_profiles sp on sp.user_id = p.id
    left join public.semesters sem on sem.id = sp.current_semester_id
    where p.is_active
      and (
        not exists (select 1 from public.banner_targets t where t.banner_id = b.id)
        or exists (
          select 1 from public.banner_targets t
          where t.banner_id = b.id
            and (t.branch_id       is null or t.branch_id = sp.branch_id)
            and (t.semester_number is null or t.semester_number = sem.number)
            and (t.academic_year   is null or t.academic_year = sp.admission_year)
        )
      )
  )
  insert into public.notifications (user_id, category, title, body, url)
  select a.id, 'academic',
         coalesce(b.title, 'New announcement'),
         coalesce(b.description, b.supporting_text, ''),
         '/notifications'
  from audience a;
  get diagnostics n = row_count;

  update public.banners set notification_sent_at = now() where id = b.id;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), 'publish_banner_notification', 'banner', b.id::text,
          jsonb_build_object('recipients', n));
  return n;
end;
$$;

-- ############################################################################
-- 2. IMPORT PIPELINE  (master §10, §33)
-- ############################################################################
create table if not exists public.import_jobs (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null
                  check (kind in ('quiz','question_bank','syllabus','calendar','pyq','resource')),
  source_name   text,                  -- original filename
  source_path   text,                  -- storage path in 'admin-assets'
  source_hash   text,                  -- sha256 of the payload: repeat-upload detection
  -- Admin-supplied metadata that the file itself may not carry (§11/§12).
  metadata      jsonb not null default '{}'::jsonb,
  status        text not null default 'uploaded'
                  check (status in ('uploaded','validating','previewed',
                                    'importing','completed','failed','rolled_back')),
  total_rows    integer not null default 0,
  ok_rows       integer not null default 0,
  duplicate_rows integer not null default 0,
  error_rows    integer not null default 0,
  imported_rows integer not null default 0,
  report        jsonb not null default '{}'::jsonb,
  created_by    uuid references public.profiles(id),
  created_at    timestamptz not null default now(),
  completed_at  timestamptz
);
create index if not exists idx_import_jobs_kind on public.import_jobs(kind, status);
create index if not exists idx_import_jobs_hash on public.import_jobs(source_hash);

create table if not exists public.import_rows (
  id          uuid primary key default gen_random_uuid(),
  job_id      uuid not null references public.import_jobs(id) on delete cascade,
  row_index   integer not null,
  status      text not null check (status in ('ok','duplicate','error','skipped','imported')),
  message     text,
  payload     jsonb,                   -- the row as parsed (post-correction)
  entity_type text,
  entity_id   text,                    -- what it became, once imported
  unique (job_id, row_index)
);
create index if not exists idx_import_rows_job on public.import_rows(job_id, status);

-- Generic content versioning (§44) — one archive for every versioned entity.
create table if not exists public.content_versions (
  id          uuid primary key default gen_random_uuid(),
  entity_type text not null,           -- syllabus / calendar / notice / quiz ...
  entity_id   text not null,
  version     integer not null,
  source      text not null default 'admin'
                check (source in ('admin','student','system','import')),
  import_job_id uuid references public.import_jobs(id) on delete set null,
  snapshot    jsonb not null,
  is_current  boolean not null default true,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now(),
  unique (entity_type, entity_id, version)
);
create index if not exists idx_content_versions_entity
  on public.content_versions(entity_type, entity_id, is_current);

-- ############################################################################
-- 3. REVISION + WEAK TOPICS  (master §20)
-- ############################################################################
create table if not exists public.revision_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  source      text not null
                check (source in ('wrong_answer','manual','weak_topic','bookmark')),
  item_type   text not null
                check (item_type in ('question','topic','subject','resource','pyq','note')),
  target_id   text not null,
  title       text not null,
  subtitle    text,
  url         text,
  subject_id  uuid references public.subjects(id) on delete set null,
  topic       text,
  -- lightweight spaced repetition
  box         integer not null default 1 check (box between 1 and 5),
  times_revised integer not null default 0,
  last_revised_at timestamptz,
  due_at      timestamptz not null default now(),
  mastered    boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (user_id, item_type, target_id)
);
create index if not exists idx_revision_due on public.revision_items(user_id, mastered, due_at);

create table if not exists public.weak_topics (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  subject_id  uuid references public.subjects(id) on delete cascade,
  subject_code text,
  topic       text not null,
  attempted   integer not null default 0,
  correct     integer not null default 0,
  accuracy    numeric generated always as
                (case when attempted > 0 then round(correct::numeric * 100 / attempted, 2) else 0 end) stored,
  updated_at  timestamptz not null default now(),
  primary key (user_id, subject_code, topic)
);
create index if not exists idx_weak_topics_user on public.weak_topics(user_id, accuracy);

-- Feed wrong answers into revision + weak topics automatically after grading.
create or replace function public.sync_revision_from_attempt(p_attempt uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
  n integer := 0;
begin
  select user_id into v_user from public.quiz_attempts where id = p_attempt;
  if v_user is null or v_user <> auth.uid() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  insert into public.revision_items (user_id, source, item_type, target_id, title, subtitle, url)
  select v_user, 'wrong_answer', 'question', q.id::text,
         left(q.prompt, 240), z.title, '/quiz/' || z.id || '/review/' || p_attempt
  from public.quiz_answers a
  join public.quiz_questions q on q.id = a.question_id
  join public.quizzes z on z.id = q.quiz_id
  where a.attempt_id = p_attempt
    and not (
      a.selected_option_ids <@ (select coalesce(array_agg(o.id),'{}')
                                from public.quiz_options o
                                where o.question_id = q.id and o.is_correct)
      and (select coalesce(array_agg(o.id),'{}') from public.quiz_options o
           where o.question_id = q.id and o.is_correct) <@ a.selected_option_ids
    )
  on conflict (user_id, item_type, target_id) do update
    set box = 1, due_at = now(), mastered = false;
  get diagnostics n = row_count;
  return n;
end;
$$;

-- ############################################################################
-- 4. EXTERNAL LINKS — central registry (master §22, §42, §43)
-- ############################################################################
create table if not exists public.external_links (
  key         text primary key,
  label       text not null,
  url         text not null,
  description text,
  category    text not null default 'study'
                check (category in ('study','support','portal','social','donate')),
  icon        text,
  is_active   boolean not null default true,
  display_order integer not null default 0,
  updated_at  timestamptz not null default now()
);

-- The five destinations named verbatim in the master document §43.
-- Nothing here is invented.
insert into public.external_links (key, label, url, description, category, icon, display_order) values
  ('doubt_desk',      'Doubt Desk',       'https://doubt-desk.onrender.com',
     'Doubt solving and academic help',                    'study',   'help',      1),
  ('javasourcecode',  'JavaSourceCode',   'http://javasourcecode.in/',
     'B.Tech notes, programming material, PYQs',           'study',   'notes',     2),
  ('study_hub',       'Study Hub',        'https://erabhi.in/studyHub/',
     'Curated study resources',                            'study',   'resources', 3),
  ('buy_me_a_coffee', 'Buy Me a Coffee',  'https://buymeacoffee.com/im_er_abhishek',
     'Support the developer',                              'donate',  'coin',      4),
  ('support_donate',  'Support / Donate', 'https://erabhi.in/support.html',
     'Support the project',                                'donate',  'heart',     5)
on conflict (key) do update
  set label = excluded.label,
      url   = excluded.url,
      description = excluded.description,
      category = excluded.category,
      updated_at = now();

-- ############################################################################
-- 5. CHATBOT INTENT CATALOG  (master §24–26) — storage only, no UI this phase.
-- ############################################################################
create table if not exists public.chatbot_intents (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,          -- 'nav.open_syllabus'
  category    text not null,                 -- navigation / academic / tools / support ...
  title       text not null,
  -- What the bot DOES: navigate | search | answer | external | action | fallback
  action_type text not null
                check (action_type in ('navigate','search','answer','external','action','fallback')),
  action_target text,                        -- route, search query template, or link key
  answer_template text,
  requires_auth boolean not null default true,
  is_active   boolean not null default true,
  priority    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_intents_category on public.chatbot_intents(category, is_active);

create table if not exists public.chatbot_intent_phrases (
  id         uuid primary key default gen_random_uuid(),
  intent_id  uuid not null references public.chatbot_intents(id) on delete cascade,
  phrase     text not null,
  is_primary boolean not null default false,
  unique (intent_id, phrase)
);
create index if not exists idx_intent_phrases_trgm
  on public.chatbot_intent_phrases using gin (phrase gin_trgm_ops);

-- Unanswered questions → developer fallback (master §28). Links the chatbot to
-- the EXISTING support system rather than a parallel inbox.
create table if not exists public.chatbot_unanswered (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete set null,
  question    text not null,
  context     jsonb not null default '{}'::jsonb,
  forwarded_conversation_id uuid references public.support_conversations(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists idx_unanswered_created on public.chatbot_unanswered(created_at desc);

-- ############################################################################
-- 6. SEARCH INDEX  (master §25, §31) — one row per searchable thing, so search
-- and the chatbot read the SAME index instead of duplicate hardcoded arrays.
-- ############################################################################
create table if not exists public.search_index (
  id          uuid primary key default gen_random_uuid(),
  entity_type text not null,     -- subject/unit/topic/syllabus/pyq/quiz/resource/notice/calendar/tool/external
  entity_id   text not null,
  title       text not null,
  subtitle    text,
  body        text,
  url         text not null,
  is_external boolean not null default false,
  branch_id   uuid references public.branches(id) on delete cascade,
  semester_number integer,
  subject_code text,
  is_published boolean not null default true,
  updated_at  timestamptz not null default now(),
  search_tsv  tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title,'')),    'A') ||
    setweight(to_tsvector('simple', coalesce(subtitle,'')), 'B') ||
    setweight(to_tsvector('simple', coalesce(body,'')),     'C')
  ) stored,
  unique (entity_type, entity_id)
);
create index if not exists idx_search_tsv   on public.search_index using gin (search_tsv);
create index if not exists idx_search_trgm  on public.search_index using gin (title gin_trgm_ops);
create index if not exists idx_search_scope on public.search_index(entity_type, is_published);

-- ############################################################################
-- 7. updated_at triggers
-- ############################################################################
create trigger trg_banners_updated  before update on public.banners
  for each row execute function public.set_updated_at();
create trigger trg_extlinks_updated before update on public.external_links
  for each row execute function public.set_updated_at();
create trigger trg_intents_updated  before update on public.chatbot_intents
  for each row execute function public.set_updated_at();
create trigger trg_weaktopics_updated before update on public.weak_topics
  for each row execute function public.set_updated_at();

-- ############################################################################
-- 8. RLS — deny by default, allow by policy (same contract as 0001–0005)
-- ############################################################################
alter table public.banners                enable row level security;
alter table public.banner_buttons         enable row level security;
alter table public.banner_targets         enable row level security;
alter table public.banner_impressions     enable row level security;
alter table public.import_jobs            enable row level security;
alter table public.import_rows            enable row level security;
alter table public.content_versions       enable row level security;
alter table public.revision_items         enable row level security;
alter table public.weak_topics            enable row level security;
alter table public.external_links         enable row level security;
alter table public.chatbot_intents        enable row level security;
alter table public.chatbot_intent_phrases enable row level security;
alter table public.chatbot_unanswered     enable row level security;
alter table public.search_index           enable row level security;

-- BANNERS: students never read the banners table directly — eligibility (and
-- therefore targeting privacy, §38 "do not expose private targeting") is
-- decided by next_eligible_banner(). Only admins may SELECT the raw rows.
create policy banners_admin_read on public.banners for select
  using (public.is_admin());
create policy banners_write on public.banners for all
  using (public.has_permission('manage_notices'))
  with check (public.has_permission('manage_notices'));

create policy banner_buttons_read on public.banner_buttons for select
  using (public.is_admin()
     or exists (select 1 from public.banners b
                where b.id = banner_id and b.is_active
                  and (b.starts_at is null or b.starts_at <= now())
                  and (b.expires_at is null or b.expires_at > now())));
create policy banner_buttons_write on public.banner_buttons for all
  using (public.has_permission('manage_notices'))
  with check (public.has_permission('manage_notices'));

-- Targeting rows are ADMIN-ONLY: they describe the audience, not the content.
create policy banner_targets_admin on public.banner_targets for all
  using (public.has_permission('manage_notices'))
  with check (public.has_permission('manage_notices'));

-- Impressions: a user may read their own; writes go ONLY through
-- record_banner_impression()/dismiss_banner() so a client cannot reset its
-- own counter to keep re-seeing (or under-seeing) a banner.
create policy banner_impr_read_own on public.banner_impressions for select
  using (user_id = auth.uid() or public.is_admin());

-- IMPORTS: admin-only, end to end.
create policy import_jobs_admin on public.import_jobs for all
  using (public.is_admin()) with check (public.is_admin());
create policy import_rows_admin on public.import_rows for all
  using (public.is_admin()) with check (public.is_admin());
create policy content_versions_read on public.content_versions for select
  using (public.is_admin());
create policy content_versions_write on public.content_versions for all
  using (public.has_permission('manage_syllabus') or public.has_permission('manage_calendar')
         or public.has_permission('manage_courses') or public.is_super_admin())
  with check (public.has_permission('manage_syllabus') or public.has_permission('manage_calendar')
         or public.has_permission('manage_courses') or public.is_super_admin());

-- REVISION / WEAK TOPICS: strictly private to the student.
create policy revision_owner on public.revision_items for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy weak_topics_owner on public.weak_topics for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- EXTERNAL LINKS: world-readable when active; admin-managed.
create policy extlinks_read on public.external_links for select
  using (is_active or public.is_admin());
create policy extlinks_write on public.external_links for all
  using (public.has_permission('manage_settings'))
  with check (public.has_permission('manage_settings'));

-- CHATBOT: catalog readable by any authenticated user; admin-managed.
create policy intents_read on public.chatbot_intents for select
  using (is_active or public.is_admin());
create policy intents_write on public.chatbot_intents for all
  using (public.has_permission('manage_settings'))
  with check (public.has_permission('manage_settings'));
create policy phrases_read on public.chatbot_intent_phrases for select
  using (auth.role() = 'authenticated' or public.is_admin());
create policy phrases_write on public.chatbot_intent_phrases for all
  using (public.has_permission('manage_settings'))
  with check (public.has_permission('manage_settings'));

-- Unanswered questions: a user may file their own; only admins read the pile.
create policy unanswered_insert_own on public.chatbot_unanswered for insert
  with check (user_id = auth.uid());
create policy unanswered_read on public.chatbot_unanswered for select
  using (user_id = auth.uid() or public.is_admin());

-- SEARCH INDEX: published rows are world-readable; only the system/admin writes.
create policy search_read on public.search_index for select
  using (is_published or public.is_admin());
create policy search_write on public.search_index for all
  using (public.is_admin()) with check (public.is_admin());

-- ############################################################################
-- 9. New permission for banner management
-- ############################################################################
insert into public.permissions (key, description)
values ('manage_banners', 'Create/schedule/publish banners and announcements')
on conflict (key) do nothing;

insert into public.role_permissions (role, permission_key)
select r, 'manage_banners' from unnest(array['content_manager','admin','super_admin']) r
on conflict do nothing;
