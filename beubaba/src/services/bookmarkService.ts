/**
 * Bookmark / saved-content service (spec §23). Owner-scoped: a student saves
 * PYQs, subjects, quizzes, resources, notices and calendar events. A unique
 * (owner, target_type, target_id) constraint prevents duplicate bookmarks
 * (mirrored by a DB unique index in the Supabase adapter).
 */
import { store, delay } from '@/services/storage'
import type { Bookmark, BookmarkType } from '@/types/domain'

const KEY = (userId: string) => `bookmarks:${userId}`

function list(userId: string): Bookmark[] {
  return store.get<Bookmark[]>(KEY(userId), [])
}

export interface ToggleBookmarkInput {
  target_type: BookmarkType
  target_id: string
  title: string
  subtitle?: string | null
  url: string
}

export const bookmarkService = {
  async list(userId: string): Promise<Bookmark[]> {
    await delay(100)
    return list(userId).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
  },

  async isSaved(userId: string, type: BookmarkType, targetId: string): Promise<boolean> {
    return list(userId).some((b) => b.target_type === type && b.target_id === targetId)
  },

  /** Idempotent toggle — returns the new saved state. */
  async toggle(userId: string, input: ToggleBookmarkInput): Promise<boolean> {
    await delay(80)
    const current = list(userId)
    const idx = current.findIndex(
      (b) => b.target_type === input.target_type && b.target_id === input.target_id,
    )
    if (idx >= 0) {
      current.splice(idx, 1)
      store.set(KEY(userId), current)
      return false
    }
    const bookmark: Bookmark = {
      id: `bm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      owner_id: userId,
      target_type: input.target_type,
      target_id: input.target_id,
      title: input.title,
      subtitle: input.subtitle ?? null,
      url: input.url,
      created_at: new Date().toISOString(),
    }
    store.set(KEY(userId), [bookmark, ...current])
    return true
  },

  async remove(userId: string, bookmarkId: string): Promise<void> {
    await delay(60)
    store.set(
      KEY(userId),
      list(userId).filter((b) => b.id !== bookmarkId),
    )
  },
}
