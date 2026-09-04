/**
 * User preferences (spec §71). Owner-scoped app settings persisted locally.
 * These are device/account preferences only — no academic data lives here.
 */
import { store } from '@/services/storage'

export interface UserSettings {
  notifications: {
    academic: boolean
    quiz: boolean
    result: boolean
    resource: boolean
    support: boolean
  }
  reduceMotion: boolean
}

export const DEFAULT_SETTINGS: UserSettings = {
  notifications: {
    academic: true,
    quiz: true,
    result: true,
    resource: true,
    support: true,
  },
  reduceMotion: false,
}

const KEY = (userId: string) => `settings:${userId}`

/** Reflect the "reduce motion" preference onto <html> so CSS can honor it. */
export function applyReduceMotion(on: boolean): void {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('reduce-motion', on)
}

export const settingsService = {
  get(userId: string): UserSettings {
    const stored = store.get<Partial<UserSettings>>(KEY(userId), {})
    return {
      ...DEFAULT_SETTINGS,
      ...stored,
      notifications: { ...DEFAULT_SETTINGS.notifications, ...(stored.notifications ?? {}) },
    }
  },
  set(userId: string, next: UserSettings): void {
    store.set(KEY(userId), next)
    applyReduceMotion(next.reduceMotion)
  },
  /** Apply persisted prefs to the document (call once at app boot / login). */
  applyFor(userId: string): void {
    applyReduceMotion(this.get(userId).reduceMotion)
  },
}
