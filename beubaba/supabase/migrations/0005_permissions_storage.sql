-- ============================================================================
-- BEU BABA — Migration 0005: Permission catalog, role mapping & storage
-- Source of truth: spec 05 §10, spec 13 (storage), spec 11.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- PERMISSION CATALOG  (spec 05 §10)
-- ---------------------------------------------------------------------------
insert into public.permissions (key, description) values
  ('view_public_content',  'View public academic content'),
  ('view_student_profile', 'View own student profile'),
  ('edit_own_profile',     'Edit own profile'),
  ('submit_resource',      'Submit a resource for moderation'),
  ('create_quiz_attempt',  'Attempt quizzes'),
  ('message_developer',    'Open private support threads'),
  ('view_own_messages',    'Read own support messages'),
  ('review_resource',      'Review submitted resources'),
  ('approve_resources',    'Approve/reject resources'),
  ('manage_resources',     'Full resource management'),
  ('manage_quizzes',       'Create/edit/publish quizzes'),
  ('manage_syllabus',      'Manage syllabus + versions'),
  ('manage_calendar',      'Manage academic calendar'),
  ('manage_notices',       'Manage notices/announcements'),
  ('manage_courses',       'Manage courses/branches/subjects/PYQs'),
  ('manage_students',      'Manage student accounts'),
  ('manage_settings',      'Manage app config / toolbox / product data'),
  ('manage_users',         'Manage users'),
  ('manage_roles',         'Grant/revoke roles'),
  ('view_audit_logs',      'Read the audit log')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- ROLE → PERMISSION MAPPING  (spec 05 §10)
-- ---------------------------------------------------------------------------
-- student
insert into public.role_permissions (role, permission_key)
select 'student', k from unnest(array[
  'view_public_content','view_student_profile','edit_own_profile',
  'submit_resource','create_quiz_attempt','message_developer','view_own_messages'
]) k
on conflict do nothing;

-- moderator = student + resource review/approve
insert into public.role_permissions (role, permission_key)
select 'moderator', k from unnest(array[
  'view_public_content','view_student_profile','edit_own_profile',
  'submit_resource','create_quiz_attempt','message_developer','view_own_messages',
  'review_resource','approve_resources','manage_resources'
]) k
on conflict do nothing;

-- content_manager = academic content management
insert into public.role_permissions (role, permission_key)
select 'content_manager', k from unnest(array[
  'view_public_content','view_student_profile','edit_own_profile',
  'submit_resource','create_quiz_attempt','message_developer','view_own_messages',
  'manage_quizzes','manage_syllabus','manage_calendar','manage_notices',
  'manage_courses','manage_settings'
]) k
on conflict do nothing;

-- support_manager = support + resource review
insert into public.role_permissions (role, permission_key)
select 'support_manager', k from unnest(array[
  'view_public_content','edit_own_profile','message_developer','view_own_messages',
  'review_resource','approve_resources'
]) k
on conflict do nothing;

-- admin = everything except role management is reserved to super_admin
insert into public.role_permissions (role, permission_key)
select 'admin', key from public.permissions
where key <> 'manage_roles'
on conflict do nothing;

-- super_admin = ALL permissions
insert into public.role_permissions (role, permission_key)
select 'super_admin', key from public.permissions
on conflict do nothing;

-- ============================================================================
-- STORAGE BUCKETS  (spec 05 §29, spec 13)
--   avatars              — public (profile images)
--   resources            — PRIVATE (student documents; signed-URL access only)
--   quiz-cards           — public (shareable result cards)
--   support-attachments  — PRIVATE
--   admin-assets         — PRIVATE
-- ============================================================================
insert into storage.buckets (id, name, public)
values
  ('avatars','avatars', true),
  ('resources','resources', false),
  ('quiz-cards','quiz-cards', true),
  ('support-attachments','support-attachments', false),
  ('admin-assets','admin-assets', false)
on conflict (id) do nothing;

-- ---- avatars: public read; a user may write only within their own folder ----
-- Convention: object path = "{auth.uid()}/filename".
drop policy if exists "avatars read" on storage.objects;
drop policy if exists "avatars write own" on storage.objects;
drop policy if exists "avatars update own" on storage.objects;
drop policy if exists "avatars delete own" on storage.objects;
drop policy if exists "resources write own" on storage.objects;
drop policy if exists "resources read own or admin" on storage.objects;
drop policy if exists "resources delete own or admin" on storage.objects;
drop policy if exists "quizcards read" on storage.objects;
drop policy if exists "quizcards write own" on storage.objects;
drop policy if exists "support att write own" on storage.objects;
drop policy if exists "support att read own or admin" on storage.objects;
drop policy if exists "admin assets all" on storage.objects;

create policy "avatars read" on storage.objects for select
  using (bucket_id = 'avatars');
create policy "avatars write own" on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars update own" on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars delete own" on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---- resources: PRIVATE. Owner can write own folder; read is owner OR admin
--      (public consumption of APPROVED files is via server-issued signed URLs,
--      generated only after the DB confirms the resource is approved). ----
create policy "resources write own" on storage.objects for insert
  with check (bucket_id = 'resources' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "resources read own or admin" on storage.objects for select
  using (bucket_id = 'resources'
         and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
create policy "resources delete own or admin" on storage.objects for delete
  using (bucket_id = 'resources'
         and ((storage.foldername(name))[1] = auth.uid()::text or public.is_super_admin()));

-- ---- quiz-cards: public read; owner writes own folder ----
create policy "quizcards read" on storage.objects for select
  using (bucket_id = 'quiz-cards');
create policy "quizcards write own" on storage.objects for insert
  with check (bucket_id = 'quiz-cards' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---- support-attachments: PRIVATE, participant-or-admin ----
create policy "support att write own" on storage.objects for insert
  with check (bucket_id = 'support-attachments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "support att read own or admin" on storage.objects for select
  using (bucket_id = 'support-attachments'
         and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- ---- admin-assets: admins only ----
create policy "admin assets all" on storage.objects for all
  using (bucket_id = 'admin-assets' and public.is_admin())
  with check (bucket_id = 'admin-assets' and public.is_admin());
