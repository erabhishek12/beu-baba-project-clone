import { useCallback, useState } from 'react'
import { store } from '@/services/storage'
import { todayKey } from './quotes'

const SKIP_KEY = 'splash:skip-until'
const SESSION_KEY = 'splash:shown-session'

/**
 * Splash visibility policy:
 *  - shows ONCE per browser session (not on every route change / remount),
 *    so the daily quote doesn't appear to "keep changing" as you navigate;
 *  - unless the user chose "Don't show again today" for the current date.
 * "Skip today" only suppresses the current calendar day; it shows again
 * automatically on later days / new sessions.
 */
export function useSplash() {
  const [visible, setVisible] = useState<boolean>(() => {
    const skipUntil = store.get<string | null>(SKIP_KEY, null)
    if (skipUntil === todayKey()) return false
    // Only once per session — survives remounts, resets on a fresh app open.
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return false
      sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      /* sessionStorage unavailable — fall back to showing it */
    }
    return true
  })

  const close = useCallback(() => setVisible(false), [])

  const skipToday = useCallback(() => {
    store.set(SKIP_KEY, todayKey())
  }, [])

  return { visible, close, skipToday }
}
