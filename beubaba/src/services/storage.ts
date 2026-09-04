/**
 * Namespaced persistent key/value store for the mock backend.
 * Uses localStorage. The keys are namespaced so a future real backend
 * (Supabase) can coexist / be swapped without collisions.
 *
 * IMPORTANT (privacy): per-account data (e.g. support threads) must be
 * scoped by user id so one student's cached data is never served to another
 * account on the same device. Services enforce this at read time.
 */
const NS = 'beubaba:v1:'

export const store = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(NS + key)
      if (raw == null) return fallback
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  },
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(NS + key, JSON.stringify(value))
    } catch {
      /* quota / private-mode: ignore, treat as ephemeral */
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(NS + key)
    } catch {
      /* ignore */
    }
  },
}

/** Small helper to simulate realistic-but-fast async latency. */
export function delay(ms = 220): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
