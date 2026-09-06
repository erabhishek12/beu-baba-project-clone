/**
 * Offline saves for study content.
 *
 * The service worker caches the app shell, but PYQ papers and syllabus text are
 * fetched from the database, so they were unavailable without a connection —
 * exactly when a student on a bus or in a low-signal hostel wants them.
 *
 * This stores the already-fetched content in IndexedDB. It is deliberately not
 * part of the service-worker precache: caching all 363 papers for everyone
 * would be wasteful. The student chooses what to keep.
 *
 * IndexedDB (not localStorage) because papers are large and localStorage has a
 * ~5 MB cap shared with everything else.
 */
const DB_NAME = 'beubaba-offline'
const STORE = 'items'
const VERSION = 1

export type OfflineKind = 'pyq' | 'syllabus'

export interface OfflineItem<T = unknown> {
  key: string
  kind: OfflineKind
  title: string
  subtitle?: string
  savedAt: number
  data: T
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'key' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await openDb()
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(STORE, mode)
    const req = fn(t.objectStore(STORE))
    req.onsuccess = () => resolve(req.result as T)
    req.onerror = () => reject(req.error)
    t.oncomplete = () => db.close()
  })
}

/** Is IndexedDB usable? (Private mode in some browsers blocks it.) */
export function offlineSupported(): boolean {
  return typeof indexedDB !== 'undefined'
}

export const offlineService = {
  async save<T>(item: Omit<OfflineItem<T>, 'savedAt'>): Promise<void> {
    if (!offlineSupported()) throw new Error('Offline saving is not available in this browser.')
    await tx('readwrite', (s) => s.put({ ...item, savedAt: Date.now() }))
  },

  async get<T>(key: string): Promise<OfflineItem<T> | null> {
    if (!offlineSupported()) return null
    try {
      const r = await tx<OfflineItem<T> | undefined>('readonly', (s) => s.get(key))
      return r ?? null
    } catch {
      return null
    }
  },

  async has(key: string): Promise<boolean> {
    return (await offlineService.get(key)) !== null
  },

  async list(): Promise<OfflineItem[]> {
    if (!offlineSupported()) return []
    try {
      const all = await tx<OfflineItem[]>('readonly', (s) => s.getAll())
      return (all ?? []).sort((a, b) => b.savedAt - a.savedAt)
    } catch {
      return []
    }
  },

  async remove(key: string): Promise<void> {
    if (!offlineSupported()) return
    await tx('readwrite', (s) => s.delete(key))
  },

  async clear(): Promise<void> {
    if (!offlineSupported()) return
    await tx('readwrite', (s) => s.clear())
  },
}
