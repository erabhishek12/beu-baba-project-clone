/**
 * Supabase adapters for notifications + support (Phase 5).
 *
 * WHY
 * ---
 * Both services wrote only to localStorage, so alerts and support messages did
 * not survive a browser clear and did not follow a user to another device.
 *
 * Notifications are deliberately NOT insertable from the browser — RLS refuses
 * it, because a student must not be able to fabricate an alert or send one to
 * someone else. Reads, "mark read" and staff-only sends go through the
 * functions added in migration 0014.
 *
 * COLUMN MAPPING: the domain calls it `student_id`, the table calls it
 * `user_id`. Converted here so callers are unchanged.
 */
import type {
  SupportConversation,
  SupportMessage,
  SupportThread,
} from '@/types/domain'
import type { AppNotification } from '@/services/notificationService'
import { getSupabase } from './supabaseClient'

/* ----------------------------- notifications ----------------------------- */

export async function listNotifications(userId: string): Promise<AppNotification[]> {
  const { data, error } = await getSupabase()
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as AppNotification[]
}

export async function unreadNotificationCount(userId: string): Promise<number> {
  const { count, error } = await getSupabase()
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)
  if (error) throw new Error(error.message)
  return count ?? 0
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await getSupabase().rpc('mark_notification_read', { p_id: id })
  if (error) throw new Error(error.message)
}

export async function markAllNotificationsRead(): Promise<void> {
  const { error } = await getSupabase().rpc('mark_all_notifications_read')
  if (error) throw new Error(error.message)
}

export async function deleteNotification(userId: string, id: string): Promise<void> {
  const { error } = await getSupabase()
    .from('notifications')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
}

export async function clearNotifications(userId: string): Promise<void> {
  const { error } = await getSupabase().from('notifications').delete().eq('user_id', userId)
  if (error) throw new Error(error.message)
}

/* -------------------------------- support -------------------------------- */

interface ConvRow {
  id: string
  user_id: string
  subject: string
  category: string
  status: string
  created_at: string
  updated_at: string
}

function toConv(r: ConvRow): SupportConversation {
  return {
    id: r.id,
    student_id: r.user_id, // domain name differs from the column name
    subject: r.subject,
    category: r.category as SupportConversation['category'],
    status: r.status as SupportConversation['status'],
    created_at: r.created_at,
    updated_at: r.updated_at,
  }
}

export async function listConversations(userId: string): Promise<SupportConversation[]> {
  const { data, error } = await getSupabase()
    .from('support_conversations')
    .select('*')
    .eq('user_id', userId)
    .order('last_message_at', { ascending: false })
  if (error) throw new Error(error.message)
  return ((data ?? []) as ConvRow[]).map(toConv)
}

export async function getThread(convId: string): Promise<SupportThread | undefined> {
  const sb = getSupabase()
  const [{ data: conv, error: e1 }, { data: msgs, error: e2 }] = await Promise.all([
    sb.from('support_conversations').select('*').eq('id', convId).maybeSingle(),
    sb
      .from('support_messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true }),
  ])
  if (e1) throw new Error(e1.message)
  if (e2) throw new Error(e2.message)
  if (!conv) return undefined
  return {
    ...toConv(conv as ConvRow),
    messages: (msgs ?? []) as unknown as SupportMessage[],
  }
}

export async function unreadForUser(userId: string): Promise<number> {
  const convs = await listConversations(userId)
  if (!convs.length) return 0
  const { count, error } = await getSupabase()
    .from('support_messages')
    .select('id', { count: 'exact', head: true })
    .in(
      'conversation_id',
      convs.map((c) => c.id),
    )
    .neq('sender_id', userId)
    .is('read_at', null)
  if (error) throw new Error(error.message)
  return count ?? 0
}

export async function startThread(
  subject: string,
  category: string,
  body: string,
): Promise<string> {
  const { data, error } = await getSupabase().rpc('start_support_thread', {
    p_subject: subject,
    p_category: category,
    p_body: body,
  })
  if (error) throw new Error(error.message)
  return data as string
}

export async function postMessage(convId: string, body: string): Promise<void> {
  const { error } = await getSupabase().rpc('post_support_message', {
    p_conversation: convId,
    p_body: body,
  })
  if (error) throw new Error(error.message)
}

export async function markThreadRead(convId: string): Promise<void> {
  const { error } = await getSupabase().rpc('mark_support_read', { p_conversation: convId })
  if (error) throw new Error(error.message)
}
