/**
 * Recently viewed / history (spec §21). Owner-scoped list of the last items a
 * student opened (PYQs, subjects, quizzes, resources). Kept small (most-recent
 * first, de-duplicated by target) so "continue later" is one tap away.
 *
 * Uses stable content IDs; unavailable targets resolve gracefully because each
 * entry stores its own title/url snapshot, so a removed item still renders and
 * can be cleared rather than producing a broken link.
 */
import { store, delay } from '@/services/storage'
import { USE_SUPABASE } from '@/services/backend/config'
import {
  listRecent,
  pushRecent,
  removeRecent,
  clearRecent,
} from '@/services/backend/supabaseUserData'

export type RecentType = 'pyq' | 'subject' | 'quiz' | 'resource'

export interface RecentItem {
  type: RecentType
  target_id: string
  title: string
  subtitle?: string | null
  url: string
  viewed_at: string
}

const KEY = (userId: string) => `recently_viewed:${userId}`
const MAX = 12

function read(userId: string): RecentItem[] {
  return store.get<RecentItem[]>(KEY(userId), [])
}

export const recentlyViewedService = {
  /** Record a view. De-dupes by (type,target_id) and moves it to the front. */
  record(userId: string, item: Omit<RecentItem, 'viewed_at'>): void {
    if (!userId || userId === 'anonymous') return
    const list = read(userId).filter(
      (r) => !(r.type === item.type && r.target_id === item.target_id),
    )
    list.unshift({ ...item, viewed_at: new Date().toISOString() })
    store.set(KEY(userId), list.slice(0, MAX))
    // Fire-and-forget: recording a view must never delay navigation.
    if (USE_SUPABASE) pushRecent(userId, { ...item, target_id: item.target_id })
  },

  async list(userId: string): Promise<RecentItem[]> {
    if (USE_SUPABASE && userId && userId !== 'anonymous') {
      try {
        const rows = await listRecent(userId)
        return rows.map((r) => ({
          type: r.type,
          target_id: r.target_id,
          title: r.title,
          subtitle: r.subtitle ?? undefined,
          url: r.url ?? '',
          viewed_at: r.viewed_at,
        })) as RecentItem[]
      } catch {
        return read(userId)
      }
    }
    await delay(80)
    return read(userId)
  },

  async remove(userId: string, type: RecentType, targetId: string): Promise<void> {
    if (USE_SUPABASE) await removeRecent(userId, type, targetId)
    await delay(60)
    store.set(
      KEY(userId),
      read(userId).filter((r) => !(r.type === type && r.target_id === targetId)),
    )
  },

  async clear(userId: string): Promise<void> {
    if (USE_SUPABASE) await clearRecent(userId)
    await delay(60)
    store.remove(KEY(userId))
  },
}
