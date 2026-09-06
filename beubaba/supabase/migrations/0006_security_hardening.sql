-- ============================================================================
-- BEU BABA — Migration 0006: RLS SECURITY HARDENING
--
-- Fixes four privilege-escalation defects found by live RLS probing against a
-- PostgreSQL 17 cluster with migrations 0001–0005 applied (Phase 3B audit).
-- The existing tests/01–03 did not cover these paths, so they passed while the
-- holes were open.
--
--   V1 CRITICAL  resources_update_own let an OWNER set status='approved',
--                published_at — self-publishing unmoderated content, bypassing
--                moderate_resource() entirely. (probe A: UPDATE 1 → 'approved')
--   V2 CRITICAL  support_msg_insert checked only sender_id = auth.uid(); it did
--                NOT constrain sender_role, so a student could post a message
--                labelled sender_role='developer' — impersonating official
--                support. (probe B: INSERT 0 1)
--   V3 HIGH      support_conv_update let the owning student set priority,
--                status and assigned_to — self-escalating triage state and
--                assigning staff. (probe C: priority='urgent', status='resolved')
--   V4 MEDIUM    profiles_update_own let a user write is_active (self/again
--                re-activate after an admin deactivation) and email (drifting
--                out of sync with auth.users). (probe J2: is_active=f)
--
-- Approach: column-level immutability is not expressible in an RLS USING/CHECK
-- clause for the *old* row, so each fix uses a BEFORE UPDATE/INSERT trigger that
-- restores or rejects privileged columns unless the caller is authorised.
-- Triggers run for every path (PostgREST, SQL, RPC) — they cannot be bypassed
-- by the client. RLS is kept as the outer ownership gate.
--
-- Idempotent: safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- V1 — resources: only a moderator may change moderation state.
-- Owners keep full control of their own CONTENT (title, description, file …);
-- any edit by a non-moderator forces the row back into review.
-- ---------------------------------------------------------------------------
create or replace function public.guard_resource_moderation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Moderators (and the SECURITY DEFINER moderate_resource path, which runs as
  -- the definer with is_admin() true for the acting admin) may set anything.
  if public.has_permission('approve_resources') or public.is_super_admin() then
    return new;
  end if;

  -- Non-moderator (i.e. the owner editing their own submission):
  -- moderation-controlled columns are NOT writable.
  new.status          := old.status;
  new.moderation_note := old.moderation_note;
  new.published_at    := old.published_at;

  -- A content edit on an already-decided resource re-enters moderation, so
  -- approved content can never be silently swapped for something else.
  if old.status in ('approved','rejected','changes_requested')
     and (new.title       is distinct from old.title
       or new.description is distinct from old.description
       or new.url         is distinct from old.url
       or new.file_path   is distinct from old.file_path
       or new.type        is distinct from old.type
       or new.subject_id  is distinct from old.subject_id) then
    new.status       := 'pending';
    new.published_at := null;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_resource_moderation on public.resources;
create trigger trg_guard_resource_moderation
  before update on public.resources
  for each row execute function public.guard_resource_moderation();

-- Owners must also not be able to forge ownership on insert, nor pre-approve.
create or replace function public.guard_resource_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (public.has_permission('approve_resources') or public.is_super_admin()) then
    new.status       := 'pending';
    new.published_at := null;
    new.moderation_note := null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_resource_insert on public.resources;
create trigger trg_guard_resource_insert
  before insert on public.resources
  for each row execute function public.guard_resource_insert();

-- ---------------------------------------------------------------------------
-- V2 — support_messages: sender_role must match the caller's real authority.
-- A student can only ever speak as 'student'. Only support staff/admins may
-- post as 'developer'. Prevents forged official replies.
-- ---------------------------------------------------------------------------
create or replace function public.guard_support_sender_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.sender_id is distinct from auth.uid() then
    raise exception 'sender_id must be the authenticated user' using errcode = '42501';
  end if;

  if public.is_admin() then
    -- Staff default to speaking as the developer, but may reply as a student
    -- only on their own thread (they are also users of the app).
    new.sender_role := coalesce(nullif(new.sender_role,''), 'developer');
  else
    if new.sender_role is distinct from 'student' then
      raise exception 'not authorized to post as %', new.sender_role
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_support_sender_role on public.support_messages;
create trigger trg_guard_support_sender_role
  before insert on public.support_messages
  for each row execute function public.guard_support_sender_role();

-- A message body is a record of what was said: only the author may edit it,
-- and only content — never who said it or which thread it belongs to.
create or replace function public.guard_support_message_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.conversation_id := old.conversation_id;
  new.sender_id       := old.sender_id;
  new.sender_role     := old.sender_role;
  new.created_at      := old.created_at;
  if new.body is distinct from old.body then
    new.edited_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_support_message_update on public.support_messages;
create trigger trg_guard_support_message_update
  before update on public.support_messages
  for each row execute function public.guard_support_message_update();

-- ---------------------------------------------------------------------------
-- V3 — support_conversations: triage fields are staff-only.
-- A student may still close/reopen their own ticket (status), but may not set
-- priority or assign staff, and may not move a ticket to another user.
-- ---------------------------------------------------------------------------
create or replace function public.guard_support_conversation_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.user_id := old.user_id;              -- ownership is immutable, always

  if public.is_admin() then
    return new;
  end if;

  new.priority    := old.priority;
  new.assigned_to := old.assigned_to;

  -- Students may only move their own ticket between these states.
  if new.status is distinct from old.status
     and new.status not in ('open','awaiting_developer','resolved') then
    raise exception 'not authorized to set status %', new.status
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_support_conversation_update on public.support_conversations;
create trigger trg_guard_support_conversation_update
  before update on public.support_conversations
  for each row execute function public.guard_support_conversation_update();

-- Students must not be able to open a ticket that is pre-assigned or urgent.
create or replace function public.guard_support_conversation_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.priority    := 'normal';
    new.assigned_to := null;
    new.status      := 'awaiting_developer';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_support_conversation_insert on public.support_conversations;
create trigger trg_guard_support_conversation_insert
  before insert on public.support_conversations
  for each row execute function public.guard_support_conversation_insert();

-- Keep last_message_at truthful (used for inbox ordering) without trusting the
-- client to maintain it.
create or replace function public.touch_support_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.support_conversations
     set last_message_at = now(),
         status = case
                    when new.sender_role = 'student'   then 'awaiting_developer'
                    when new.sender_role = 'developer' then 'awaiting_student'
                    else status
                  end,
         updated_at = now()
   where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists trg_touch_support_conversation on public.support_messages;
create trigger trg_touch_support_conversation
  after insert on public.support_messages
  for each row execute function public.touch_support_conversation();

-- ---------------------------------------------------------------------------
-- V4 — profiles: account-state and identity columns are not self-writable.
-- ---------------------------------------------------------------------------
create or replace function public.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_super_admin() then
    return new;
  end if;
  -- is_active is an ADMIN control (suspension). email mirrors auth.users and is
  -- changed through Supabase Auth, not by writing this row.
  new.is_active := old.is_active;
  new.email     := old.email;
  new.id        := old.id;
  return new;
end;
$$;

drop trigger if exists trg_guard_profile_update on public.profiles;
create trigger trg_guard_profile_update
  before update on public.profiles
  for each row execute function public.guard_profile_update();

-- ---------------------------------------------------------------------------
-- V5 — support_conversations SELECT policy simplification.
-- The original predicate was:
--   user_id = auth.uid() or has_permission('message_developer') and is_admin() or is_admin()
-- `and` binds tighter than `or`, so the middle clause was dead weight and the
-- effective rule was "owner or admin". Restate it explicitly so the intent is
-- readable and cannot be misread during future edits. Behaviour is unchanged.
-- ---------------------------------------------------------------------------
drop policy if exists support_conv_owner on public.support_conversations;
create policy support_conv_owner on public.support_conversations for select
  using (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- V6 — student_profiles: ownership is immutable.
-- ---------------------------------------------------------------------------
create or replace function public.guard_student_profile_update()
returns trigger
language plpgsql
as $$
begin
  new.user_id := old.user_id;
  return new;
end;
$$;

drop trigger if exists trg_guard_student_profile_update on public.student_profiles;
create trigger trg_guard_student_profile_update
  before update on public.student_profiles
  for each row execute function public.guard_student_profile_update();

-- ---------------------------------------------------------------------------
-- V7 — audit_logs / quiz_results are append-only records: never client-mutable.
-- There is no UPDATE/DELETE policy on either table, so RLS already blocks it;
-- these explicit revokes protect against a future permissive policy being added
-- by mistake (defence in depth).
-- ---------------------------------------------------------------------------
revoke update, delete on public.audit_logs   from anon, authenticated;
revoke update, delete on public.quiz_results from anon, authenticated;
revoke insert          on public.quiz_results from anon, authenticated;
revoke update, delete on public.resource_moderation_actions from anon, authenticated;
