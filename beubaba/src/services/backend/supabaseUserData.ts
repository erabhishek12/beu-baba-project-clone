/**
 * Supabase adapters for per-user data (final backend pass).
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * bookmarks, settings and recently-viewed were written ONLY to localStorage.
 * They therefore did not follow a user to another device and vanished when the
 * browser was cleared. The tables and RLS already existed and were verified
 * live: the owner may insert/update/delete their own rows, and nobody else's.
 *
 * COLUMN MAPPING (the domain model and the database differ):
 *   domain owner_id     -> column user_id
 *   domain target_type  -> column type
 * Everything here converts between the two so callers are unchanged.
 *
 * Settings stay SYNCHRONOUS for reads (the UI calls them during render) — the
 * local copy remains the source of truth for reads and is written through to
 * Supabase in the background, so a slow network can never block the interface.
 */
import type { Bookmark, BookmarkType } from '@/types/domain'
import type { UserSettings } from '@/services/settingsService'
import { getSupabase } from './supabaseClient'

/* ------------------------------- bookmarks ------------------------------- */

interface BookmarkRow {
  user_id: string
  type: string
  target_id: string
  title: string
  subtitle: string | null
  url: string | null
  created_at: string
}

function rowToBookmark(r: BookmarkRow): Bookmark {
  return {
    // The table's identity is (user_id, type, target_id); synthesise a stable id.
    id: `${r.type}:${r.target_id}`,
    owner_id: r.user_id,
    target_type: r.type as BookmarkType,
    target_id: r.target_id,
    title: r.title,
    subtitle: r.subtitle,
    url: r.url ?? '',
    created_at: r.created_at,
  }
}

export async function listBookmarks(userId: string): Promise<Bookmark[]> {
  const { data, error } = await getSupabase()
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return ((data ?? []) as BookmarkRow[]).map(rowToBookmark)
}

export async function addBookmark(
  userId: string,
  b: { target_type: string; target_id: string; title: string; subtitle?: string | null; url: string },
): Promise<void> {
  const { error } = await getSupabase().from('bookmarks').upsert(
    {
      user_id: userId,
      type: b.target_type,
      target_id: b.target_id,
      title: b.title,
      subtitle: b.subtitle ?? null,
      url: b.url,
    },
    { onConflict: 'user_id,type,target_id' },
  )
  if (error) throw new Error(error.message)
}

export async function removeBookmark(
  userId: string,
  targetType: string,
  targetId: string,
): Promise<void> {
  const { error } = await getSupabase()
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('type', targetType)
    .eq('target_id', targetId)
  if (error) throw new Error(error.message)
}

/* -------------------------------- settings -------------------------------- */

export interface SettingsRow {
  reduce_motion: boolean
  notif_academic: boolean
  notif_quiz: boolean
  notif_result: boolean
  notif_resource: boolean
  notif_support: boolean
}

/** DB row (flat columns) -> domain settings (nested object). */
export function rowToSettings(r: SettingsRow): UserSettings {
  return {
    reduceMotion: r.reduce_motion,
    notifications: {
      academic: r.notif_academic,
      quiz: r.notif_quiz,
      result: r.notif_result,
      resource: r.notif_resource,
      support: r.notif_support,
    },
  }
}

export async function fetchSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await getSupabase()
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data ? rowToSettings(data as SettingsRow) : null
}

/** Fire-and-forget write-through; never blocks or breaks the UI. */
export function pushSettings(userId: string, s: UserSettings): void {
  void getSupabase()
    .from('user_settings')
    .upsert(
      {
        user_id: userId,
        reduce_motion: s.reduceMotion,
        notif_academic: s.notifications.academic,
        notif_quiz: s.notifications.quiz,
        notif_result: s.notifications.result,
        notif_resource: s.notifications.resource,
        notif_support: s.notifications.support,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .then(({ error }) => {
      if (error) console.warn('[settings] sync failed:', error.message)
    })
}

/* ----------------------------- recently viewed ----------------------------- */

export interface RecentRow {
  type: string
  target_id: string
  title: string
  subtitle: string | null
  url: string | null
  viewed_at: string
}

export async function listRecent(userId: string): Promise<RecentRow[]> {
  const { data, error } = await getSupabase()
    .from('recently_viewed')
    .select('*')
    .eq('user_id', userId)
    .order('viewed_at', { ascending: false })
    .limit(20)
  if (error) throw new Error(error.message)
  return (data ?? []) as RecentRow[]
}

/** Fire-and-forget: recording a view must never delay navigation. */
export function pushRecent(
  userId: string,
  item: { type: string; target_id: string; title: string; subtitle?: string | null; url?: string | null },
): void {
  void getSupabase()
    .from('recently_viewed')
    .upsert(
      {
        user_id: userId,
        type: item.type,
        target_id: item.target_id,
        title: item.title,
        subtitle: item.subtitle ?? null,
        url: item.url ?? null,
        viewed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,type,target_id' },
    )
    .then(({ error }) => {
      if (error) console.warn('[recent] sync failed:', error.message)
    })
}

export async function removeRecent(userId: string, type: string, targetId: string): Promise<void> {
  const { error } = await getSupabase()
    .from('recently_viewed')
    .delete()
    .eq('user_id', userId)
    .eq('type', type)
    .eq('target_id', targetId)
  if (error) throw new Error(error.message)
}

export async function clearRecent(userId: string): Promise<void> {
  const { error } = await getSupabase().from('recently_viewed').delete().eq('user_id', userId)
  if (error) throw new Error(error.message)
}
