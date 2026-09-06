/**
 * Android-style back behaviour for the installed app.
 *
 * PROBLEM
 * -------
 * In a browser tab, pressing Back on the very first screen leaves the site.
 * In an installed PWA that means the app CLOSES — which never happens in a real
 * Android app, where Back walks you home and only exits on a second press.
 *
 * WHAT THIS DOES
 * --------------
 *  - Anywhere except Home: Back goes to the previous screen (normal history).
 *  - On Home: the first Back does NOT close the app. It shows a short
 *    "Press back again to exit" hint. A second Back within 2 seconds exits.
 *  - Open sheets/modals are closed by Back first (registered via `pushGuard`),
 *    exactly like a native app.
 *
 * HOW
 * ---
 * A sentinel history entry is kept behind the app. When the user pops it we
 * immediately push it back, so there is always something to pop and the app is
 * never unloaded by accident. This is the standard PWA technique — no hacks
 * that break the browser's own Back button when running in a normal tab.
 *
 * Only active in standalone/installed mode: in a browser tab the user's Back
 * button must keep working normally.
 */
import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const EXIT_WINDOW_MS = 2000
const SENTINEL = '__beubaba_back__'

type Guard = () => boolean

const guards: Guard[] = []

/**
 * Register a handler that Back should run before navigating (e.g. close a
 * modal). Return true if the Back press was consumed. Returns an unsubscribe.
 */
export function registerBackGuard(fn: Guard): () => void {
  guards.push(fn)
  return () => {
    const i = guards.indexOf(fn)
    if (i >= 0) guards.splice(i, 1)
  }
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    // iOS Safari
    (window.navigator as { standalone?: boolean }).standalone === true
  )
}

export function useAppBackButton(onExitHint: () => void) {
  const navigate = useNavigate()
  const location = useLocation()
  const lastBackAt = useRef(0)
  const pathRef = useRef(location.pathname)
  // Keep the latest path in a ref so the popstate listener (registered once)
  // always sees the current route without being re-bound on every navigation.
  useEffect(() => {
    pathRef.current = location.pathname
  }, [location.pathname])

  useEffect(() => {
    if (!isStandalone()) return

    // Keep one spare entry behind us so Back always has something to pop.
    if (!window.history.state?.[SENTINEL]) {
      window.history.replaceState({ ...window.history.state, [SENTINEL]: true }, '')
      window.history.pushState({ ...window.history.state, [SENTINEL]: 'top' }, '')
    }

    function onPopState() {
      // 1. Let an open sheet/modal consume the press.
      for (let i = guards.length - 1; i >= 0; i--) {
        if (guards[i]()) {
          window.history.pushState({ [SENTINEL]: 'top' }, '')
          return
        }
      }

      const atHome = pathRef.current === '/'

      if (!atHome) {
        // Normal in-app back. Re-arm the sentinel afterwards.
        window.history.pushState({ [SENTINEL]: 'top' }, '')
        navigate(-1)
        return
      }

      // 2. On Home — require a second press to exit.
      const now = Date.now()
      if (now - lastBackAt.current < EXIT_WINDOW_MS) {
        // Let this one through: popping past the sentinel closes the app.
        window.history.back()
        return
      }
      lastBackAt.current = now
      window.history.pushState({ [SENTINEL]: 'top' }, '')
      onExitHint()
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [navigate, onExitHint])
}
