-- ============================================================================
-- 0014 — NOTIFICATIONS + SUPPORT, SERVER SIDE (Phase 5)
--
-- PROBLEM
-- -------
-- notificationService and supportService wrote only to localStorage, so
-- messages and alerts did not survive a browser clear and did not follow a
-- user to another device.
--
-- notifications: RLS correctly REFUSES direct inserts from the browser
-- (a student must not be able to fabricate a notification, nor send one to
-- someone else). The fix is not to loosen RLS — it is to provide controlled
-- SECURITY DEFINER functions.
--
-- support: a student may open a conversation and post messages in their OWN
-- thread only; staff may reply to any. Enforced in SQL, not in the frontend.
--
-- Idempotent: safe to re-run.
-- ============================================================================

-- ------------------------------------------------------------ notifications --

/** Mark one of the caller's own notifications read. */
create or replace function public.mark_notification_read(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  update public.notifications
     set read = true
   where id = p_id and user_id = auth.uid();
end $$;

/** Mark every notification of the caller read. Returns how many changed. */
create or replace function public.mark_all_notifications_read()
returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_n bigint;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  update public.notifications
     set read = true
   where user_id = auth.uid() and read = false;
  get diagnostics v_n = row_count;
  return v_n;
end $$;

/**
 * Create a notification FOR SOMEONE ELSE — staff only.
 * A student cannot call this; assert_can_review() gates it to reviewer roles.
 */
create or replace function public.push_notification(
  p_user uuid, p_category text, p_title text,
  p_body text default null, p_url text default null)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_id uuid;
begin
  perform public.assert_can_review();
  insert into public.notifications (user_id, category, title, body, url)
  values (p_user, p_category, p_title, p_body, p_url)
  returning id into v_id;
  return v_id;
end $$;

revoke all on function public.mark_notification_read(uuid) from public, anon;
revoke all on function public.mark_all_notifications_read() from public, anon;
revoke all on function public.push_notification(uuid,text,text,text,text) from public, anon;
grant execute on function public.mark_notification_read(uuid) to authenticated;
grant execute on function public.mark_all_notifications_read() to authenticated;
grant execute on function public.push_notification(uuid,text,text,text,text) to authenticated;

-- ---------------------------------------------------------------- support --

/**
 * Open a support conversation and post its first message atomically.
 * The conversation always belongs to the caller — the user id is taken from
 * the token, never from an argument, so a student cannot open a thread as
 * somebody else.
 */
create or replace function public.start_support_thread(
  p_subject text, p_category text, p_body text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_conv uuid; v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if coalesce(btrim(p_body), '') = '' then
    raise exception 'message cannot be empty' using errcode = 'P0001';
  end if;

  insert into public.support_conversations (user_id, subject, category, status, last_message_at)
  values (v_user, p_subject, p_category, 'open', now())
  returning id into v_conv;

  insert into public.support_messages (conversation_id, sender_id, sender_role, body)
  values (v_conv, v_user, 'student', btrim(p_body));

  return v_conv;
end $$;

/** Post a reply. Students may only post into their own thread; staff into any. */
create or replace function public.post_support_message(
  p_conversation uuid, p_body text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user  uuid := auth.uid();
  v_owner uuid;
  v_staff boolean := false;
  v_role  text;
  v_id    uuid;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if coalesce(btrim(p_body), '') = '' then
    raise exception 'message cannot be empty' using errcode = 'P0001';
  end if;

  select user_id into v_owner from public.support_conversations where id = p_conversation;
  if v_owner is null then
    raise exception 'conversation not found' using errcode = 'P0002';
  end if;

  begin
    perform public.assert_can_review();
    v_staff := true;
  exception when others then
    v_staff := false;
  end;

  if v_owner <> v_user and not v_staff then
    -- Same message whether it is missing or not yours: do not leak existence.
    raise exception 'conversation not found' using errcode = 'P0002';
  end if;

  v_role := case when v_staff and v_owner <> v_user then 'developer' else 'student' end;

  insert into public.support_messages (conversation_id, sender_id, sender_role, body)
  values (p_conversation, v_user, v_role, btrim(p_body))
  returning id into v_id;

  update public.support_conversations
     set last_message_at = now(), updated_at = now(),
         status = case when v_role = 'developer' then 'awaiting_student' else 'awaiting_developer' end
   where id = p_conversation;

  -- Tell the student when staff replies.
  if v_role = 'developer' then
    insert into public.notifications (user_id, category, title, body, url)
    values (v_owner, 'support', 'Reply from the team',
            left(btrim(p_body), 140), '/support');
  end if;

  return v_id;
end $$;

/** Mark every message in a thread the caller can see as read. */
create or replace function public.mark_support_read(p_conversation uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_user uuid := auth.uid(); v_owner uuid;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  select user_id into v_owner from public.support_conversations where id = p_conversation;
  if v_owner is null or v_owner <> v_user then
    return;
  end if;
  update public.support_messages
     set read_at = now()
   where conversation_id = p_conversation
     and sender_id <> v_user
     and read_at is null;
end $$;

revoke all on function public.start_support_thread(text,text,text) from public, anon;
revoke all on function public.post_support_message(uuid,text) from public, anon;
revoke all on function public.mark_support_read(uuid) from public, anon;
grant execute on function public.start_support_thread(text,text,text) to authenticated;
grant execute on function public.post_support_message(uuid,text) to authenticated;
grant execute on function public.mark_support_read(uuid) to authenticated;

select 'MIGRATION 0014 COMPLETE' as status;
