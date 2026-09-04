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
  },

  async list(userId: string): Promise<RecentItem[]> {
    await delay(80)
    return read(userId)
  },

  async remove(userId: string, type: RecentType, targetId: string): Promise<void> {
    await delay(60)
    store.set(
      KEY(userId),
      read(userId).filter((r) => !(r.type === type && r.target_id === targetId)),
    )
  },

  async clear(userId: string): Promise<void> {
    await delay(60)
    store.remove(KEY(userId))
  },
}
