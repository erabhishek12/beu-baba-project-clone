/**
 * Notification service (spec doc 16). Two layers:
 *  1. In-app notification center — persisted per user, read/unread state.
 *  2. OS notification permission + local display (Web Push wiring is ready in
 *     the service worker; a real VAPID/push subscription is added with Supabase).
 *
 * Categories are purposeful (§2.5): every notification maps to a real destination.
 * Nothing is shown as an ad. Data is scoped by user id for privacy.
 */
import { store, delay } from '@/services/storage'
import { USE_SUPABASE } from '@/services/backend/config'
import * as sbn from '@/services/backend/supabaseSupport'
import { settingsService } from '@/services/settingsService'

export type NotificationCategory =
  | 'academic'
  | 'quiz'
  | 'result'
  | 'resource'
  | 'support'
  | 'system'

export interface AppNotification {
  id: string
  category: NotificationCategory
  title: string
  body: string
  /** in-app deep link */
  url?: string
  created_at: string
  read: boolean
}

function key(userId: string) {
  return `notifications:${userId}`
}

function seedFor(userId: string): AppNotification[] {
  const now = Date.now()
  const mk = (
    i: number,
    category: NotificationCategory,
    title: string,
    body: string,
    url: string,
    minsAgo: number,
  ): AppNotification => ({
    id: `seed_${userId}_${i}`,
    category,
    title,
    body,
    url,
    created_at: new Date(now - minsAgo * 60000).toISOString(),
    read: false,
  })
  // OWNER POLICY: never seed fabricated content claims (e.g. "calendar
  // updated", "quizzes added") as notifications. Only the genuine product
  // onboarding message is seeded; everything else arrives from real events
  // (quiz submissions, moderation updates, admin announcements).
  return [
    mk(3, 'system', 'Welcome to BEU BABA', 'Your syllabus, PYQs, quizzes and tools — all in one place.', '/', 60 * 48),
  ]
}

export const notificationService = {
  async list(userId: string): Promise<AppNotification[]> {
    if (USE_SUPABASE) return sbn.listNotifications(userId)
    await delay(60)
    let items = store.get<AppNotification[] | null>(key(userId), null)
    if (items == null) {
      items = seedFor(userId)
      store.set(key(userId), items)
    }
    return [...items].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
  },

  async unreadCount(userId: string): Promise<number> {
    if (USE_SUPABASE) return sbn.unreadNotificationCount(userId)
    const items = await notificationService.list(userId)
    return items.filter((n) => !n.read).length
  },

  async markRead(userId: string, id: string): Promise<void> {
    if (USE_SUPABASE) return sbn.markNotificationRead(id)
    const items = store.get<AppNotification[]>(key(userId), [])
    store.set(
      key(userId),
      items.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  },

  async markAllRead(userId: string): Promise<void> {
    if (USE_SUPABASE) return sbn.markAllNotificationsRead()
    const items = store.get<AppNotification[]>(key(userId), [])
    store.set(
      key(userId),
      items.map((n) => ({ ...n, read: true })),
    )
  },

  async remove(userId: string, id: string): Promise<void> {
    if (USE_SUPABASE) return sbn.deleteNotification(userId, id)
    const items = store.get<AppNotification[]>(key(userId), [])
    store.set(
      key(userId),
      items.filter((n) => n.id !== id),
    )
  },

  async clearAll(userId: string): Promise<void> {
    if (USE_SUPABASE) return sbn.clearNotifications(userId)
    store.set(key(userId), [])
  },

  async push(userId: string, n: Omit<AppNotification, 'id' | 'created_at' | 'read'>): Promise<void> {
    // Honor the user's per-category notification preferences (Settings). The
    // 'system' category is always delivered (account/security-level messages).
    // With the real backend a student may NOT create notifications: the
    // database refuses it on purpose. Server-side events (e.g. a support reply)
    // insert them instead, so this becomes a no-op rather than an error.
    if (USE_SUPABASE) return
    if (n.category !== 'system') {
      const prefs = settingsService.get(userId).notifications
      if (n.category in prefs && !prefs[n.category as keyof typeof prefs]) return
    }
    const items = store.get<AppNotification[]>(key(userId), [])
    items.push({
      ...n,
      id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      created_at: new Date().toISOString(),
      read: false,
    })
    store.set(key(userId), items)
  },
}

// ---- OS notification permission (spec §permission UX) --------------------
export function notificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function notificationPermission(): NotificationPermission {
  if (!notificationSupported()) return 'denied'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationSupported()) return 'denied'
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

/** Show a local OS notification via the SW registration when possible. */
export async function showLocalNotification(title: string, body: string, url = '/') {
  if (!notificationSupported() || Notification.permission !== 'granted') return
  try {
    const reg = await navigator.serviceWorker?.ready
    if (reg) {
      await reg.showNotification(title, {
        body,
        icon: '/assets/app-icon-192.png',
        badge: '/assets/app-icon-192.png',
        data: { url },
      })
    } else {
      new Notification(title, { body, icon: '/assets/app-icon-192.png' })
    }
  } catch {
    /* ignore */
  }
}
