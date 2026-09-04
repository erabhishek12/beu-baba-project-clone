-- ============================================================================
-- BEU BABA — Migration 0004: Community, moderation, support, notifications
-- Source of truth: specs 05 §24-32, spec 01 §16-19, spec 12/14/23 (moderation),
-- spec 16 (notifications), spec 17 (audit).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- RESOURCES (student contributions, moderated before publish)  spec 05 §24-26
-- ---------------------------------------------------------------------------
create table if not exists public.resources (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid not null references public.profiles(id) on delete cascade,
  owner_name     text not null,
  title          text not null,
  type           text not null
                   check (type in ('notes','pdf','link','question_paper','image','other')),
  subject_id     uuid references public.subjects(id) on delete set null,
  subject_code   text,
  subject_name   text,
  branch_id      uuid references public.branches(id) on delete set null,
  semester       integer,
  description    text not null default '',
  tags           text[] not null default '{}',
  -- external link OR a private file (see resource_files / storage path)
  url            text,
  file_path      text,               -- storage path in the private 'resources' bucket
  file_name      text,
  file_size      bigint,
  mime_type      text,
  status         text not null default 'pending'
                   check (status in ('pending','approved','rejected','changes_requested','archived')),
  moderation_note text,
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists idx_resources_owner  on public.resources(owner_id);
create index if not exists idx_resources_status on public.resources(status);

-- Moderation audit trail for resources (spec 14).
create table if not exists public.resource_moderation_actions (
  id           uuid primary key default gen_random_uuid(),
  resource_id  uuid not null references public.resources(id) on delete cascade,
  moderator_id uuid references public.profiles(id),
  action       text not null,          -- approved / rejected / changes_requested / archived
  note         text,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- REPORTS (content + bug reports)   spec 01 §17, §21
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references public.profiles(id) on delete cascade,
  target_type  text not null,          -- pyq/subject/syllabus/quiz/quiz_question/resource/notice/calendar/app
  target_id    text,
  target_label text not null,
  reason       text not null,
  details      text not null default '',
  context_path text,
  attachment_path text,
  status       text not null default 'open'
                 check (status in ('open','investigating','resolved','dismissed')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_reports_status on public.reports(status);

-- ---------------------------------------------------------------------------
-- SUPPORT (private student ↔ developer threads)   spec 01 §18, spec 05 §7
-- ---------------------------------------------------------------------------
create table if not exists public.support_conversations (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  subject      text not null,
  category     text not null,
  status       text not null default 'awaiting_developer'
                 check (status in ('open','awaiting_student','awaiting_developer','resolved','archived')),
  priority     text not null default 'normal',
  assigned_to  uuid references public.profiles(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);
create index if not exists idx_support_conv_user on public.support_conversations(user_id);

create table if not exists public.support_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id),
  sender_role     text not null check (sender_role in ('student','developer')),
  body            text not null,
  attachment_path text,
  read_at         timestamptz,
  created_at      timestamptz not null default now(),
  edited_at       timestamptz,
  deleted_at      timestamptz
);
create index if not exists idx_support_msg_conv on public.support_messages(conversation_id);

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS (per-user)   spec 16
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  category   text not null
               check (category in ('academic','quiz','result','resource','support','system')),
  title      text not null,
  body       text not null,
  url        text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_notif_user on public.notifications(user_id, read);

create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  endpoint   text not null,
  p256dh     text,
  auth       text,
  created_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

-- ---------------------------------------------------------------------------
-- PRODUCT DATA: toolbox, gov exams, portals, colleges, bookmarks, recents
-- (public read; managed by admins). spec 01 §15, §22
-- ---------------------------------------------------------------------------
create table if not exists public.toolbox_tools (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  category      text,
  description   text,
  is_active     boolean not null default true,
  display_order integer not null default 0
);

create table if not exists public.gov_exams (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,          -- UPSC / BPSC / SSC / UPPSC
  name        text not null,
  summary     text,
  content     jsonb not null default '[]'::jsonb,
  links       jsonb not null default '[]'::jsonb,
  display_order integer not null default 0
);

create table if not exists public.portals (
  id          uuid primary key default gen_random_uuid(),
  group_key   text not null,
  group_title text not null,
  name        text not null,
  url         text not null,
  description text,
  semester    integer,
  display_order integer not null default 0
);

create table if not exists public.colleges (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  code        text,
  location    text,
  type        text,
  url         text,
  display_order integer not null default 0
);

create table if not exists public.bookmarks (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null,          -- pyq/subject/quiz/resource/notice...
  target_id  text not null,
  title      text not null,
  subtitle   text,
  url        text,
  created_at timestamptz not null default now(),
  primary key (user_id, type, target_id)
);

create table if not exists public.recently_viewed (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null,
  target_id  text not null,
  title      text not null,
  subtitle   text,
  url        text,
  viewed_at  timestamptz not null default now(),
  primary key (user_id, type, target_id)
);

create table if not exists public.user_settings (
  user_id       uuid primary key references public.profiles(id) on delete cascade,
  reduce_motion boolean not null default false,
  notif_academic boolean not null default true,
  notif_quiz     boolean not null default true,
  notif_result   boolean not null default true,
  notif_resource boolean not null default true,
  notif_support  boolean not null default true,
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- AUDIT LOG (append-only)   spec 17
-- ---------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles(id),
  action      text not null,
  entity_type text not null,
  entity_id   text,
  before_data jsonb,
  after_data  jsonb,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists idx_audit_entity on public.audit_logs(entity_type, entity_id);

-- updated_at triggers
create trigger trg_resources_updated  before update on public.resources for each row execute function public.set_updated_at();
create trigger trg_reports_updated     before update on public.reports   for each row execute function public.set_updated_at();
create trigger trg_support_conv_updated before update on public.support_conversations for each row execute function public.set_updated_at();

-- ============================================================================
-- SERVER-AUTHORITATIVE MODERATION (spec 14/17) — writes the audit trail + notifies.
-- ============================================================================
create or replace function public.moderate_resource(
  p_resource uuid, p_status text, p_note text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_owner uuid; v_title text;
begin
  if not public.has_permission('approve_resources') and not public.is_super_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_status not in ('approved','rejected','changes_requested','archived') then
    raise exception 'invalid status %', p_status;
  end if;

  update public.resources
     set status = p_status,
         moderation_note = p_note,
         published_at = case when p_status = 'approved' then now() else published_at end,
         updated_at = now()
   where id = p_resource
   returning owner_id, title into v_owner, v_title;

  insert into public.resource_moderation_actions (resource_id, moderator_id, action, note)
  values (p_resource, auth.uid(), p_status, p_note);

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, after_data)
  values (auth.uid(), 'moderate_resource', 'resource', p_resource::text,
          jsonb_build_object('status', p_status, 'note', p_note));

  -- Notify the owner.
  insert into public.notifications (user_id, category, title, body, url)
  values (v_owner, 'resource',
          case p_status when 'approved' then 'Resource approved'
                        when 'rejected' then 'Resource rejected'
                        when 'changes_requested' then 'Changes requested'
                        else 'Resource archived' end,
          '“' || coalesce(v_title,'Your resource') || '” — ' || p_status ||
            coalesce(': ' || p_note, ''),
          '/resources/mine');
end;
$$;

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.resources                    enable row level security;
alter table public.resource_moderation_actions  enable row level security;
alter table public.reports                       enable row level security;
alter table public.support_conversations         enable row level security;
alter table public.support_messages              enable row level security;
alter table public.notifications                 enable row level security;
alter table public.push_subscriptions            enable row level security;
alter table public.toolbox_tools                 enable row level security;
alter table public.gov_exams                     enable row level security;
alter table public.portals                       enable row level security;
alter table public.colleges                      enable row level security;
alter table public.bookmarks                     enable row level security;
alter table public.recently_viewed               enable row level security;
alter table public.user_settings                 enable row level security;
alter table public.audit_logs                    enable row level security;

-- RESOURCES: everyone sees APPROVED; owner sees their own; moderators see all.
create policy resources_read_public on public.resources for select
  using (status = 'approved' or owner_id = auth.uid() or public.is_admin());
create policy resources_insert_own on public.resources for insert
  with check (owner_id = auth.uid());
-- Owner may edit only their own, and only while not archived. Editing re-enters
-- moderation via the app (status reset). Moderators use moderate_resource().
create policy resources_update_own on public.resources for update
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy resources_delete_own on public.resources for delete
  using (owner_id = auth.uid() or public.is_super_admin());
create policy resources_admin_all on public.resources for select
  using (public.is_admin());

-- moderation actions: moderators read; inserts happen via the function.
create policy resmod_read on public.resource_moderation_actions for select
  using (public.is_admin());

-- REPORTS: reporter sees own; moderators see all; anyone authenticated files one.
create policy reports_read_own on public.reports for select
  using (reporter_id = auth.uid() or public.is_admin());
create policy reports_insert on public.reports for insert
  with check (reporter_id = auth.uid());
create policy reports_moderate on public.reports for update
  using (public.is_admin()) with check (public.is_admin());

-- SUPPORT: PRIVATE. A student reads ONLY their own conversations (spec 05 §7).
create policy support_conv_owner on public.support_conversations for select
  using (user_id = auth.uid() or public.has_permission('message_developer') and public.is_admin() or public.is_admin());
create policy support_conv_insert on public.support_conversations for insert
  with check (user_id = auth.uid());
create policy support_conv_update on public.support_conversations for update
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy support_msg_read on public.support_messages for select
  using (exists (select 1 from public.support_conversations c
                 where c.id = conversation_id
                   and (c.user_id = auth.uid() or public.is_admin())));
create policy support_msg_insert on public.support_messages for insert
  with check (
    exists (select 1 from public.support_conversations c
            where c.id = conversation_id
              and (c.user_id = auth.uid() or public.is_admin()))
    and sender_id = auth.uid()
  );
create policy support_msg_update on public.support_messages for update
  using (sender_id = auth.uid() or public.is_admin());

-- NOTIFICATIONS: owner-scoped.
create policy notif_owner on public.notifications for select using (user_id = auth.uid());
create policy notif_update_own on public.notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notif_delete_own on public.notifications for delete using (user_id = auth.uid());
-- Inserts: system creates notifications through SECURITY DEFINER functions;
-- also allow a user to receive admin-created ones (handled server-side). No
-- broad client insert policy is granted.

create policy push_owner on public.push_subscriptions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- PRODUCT DATA: public read; admin manage.
create policy toolbox_read on public.toolbox_tools for select using (is_active or public.is_admin());
create policy toolbox_write on public.toolbox_tools for all
  using (public.has_permission('manage_settings')) with check (public.has_permission('manage_settings'));
create policy govexams_read on public.gov_exams for select using (true);
create policy govexams_write on public.gov_exams for all
  using (public.has_permission('manage_settings')) with check (public.has_permission('manage_settings'));
create policy portals_read on public.portals for select using (true);
create policy portals_write on public.portals for all
  using (public.has_permission('manage_settings')) with check (public.has_permission('manage_settings'));
create policy colleges_read on public.colleges for select using (true);
create policy colleges_write on public.colleges for all
  using (public.has_permission('manage_settings')) with check (public.has_permission('manage_settings'));

-- BOOKMARKS / RECENTS / SETTINGS: strictly owner-scoped.
create policy bookmarks_owner on public.bookmarks for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy recents_owner on public.recently_viewed for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy settings_owner on public.user_settings for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- AUDIT LOGS: readable only by users with view_audit_logs; never client-writable.
create policy audit_read on public.audit_logs for select
  using (public.has_permission('view_audit_logs'));
