/**
 * Service-worker registration + update lifecycle (spec doc 16 §3, §app update).
 * Exposes a tiny event surface the UI can subscribe to for "update ready".
 */

type UpdateListener = (waiting: ServiceWorker) => void

let updateListener: UpdateListener | null = null

export function onUpdateReady(fn: UpdateListener) {
  updateListener = fn
}

export function registerServiceWorker() {
  if (typeof window === 'undefined') return
  if (!('serviceWorker' in navigator)) return
  // Do NOT register during dev (Vite) — a caching SW inside the preview iframe
  // causes stale content. The SW is a production/offline concern only.
  if (import.meta.env && import.meta.env.DEV) return
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        // If there's already a waiting worker, surface it.
        if (reg.waiting && navigator.serviceWorker.controller) {
          updateListener?.(reg.waiting)
        }
        reg.addEventListener('updatefound', () => {
          const installing = reg.installing
          if (!installing) return
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              // A new version is ready and waiting.
              if (reg.waiting) updateListener?.(reg.waiting)
            }
          })
        })

        // Look for a new build on focus and hourly. Without this an installed
        // app can sit on an old version until the user force-closes it.
        const check = () => void reg.update().catch(() => undefined)
        window.addEventListener('focus', check)
        window.setInterval(check, 60 * 60 * 1000)
      })
      .catch(() => {
        /* registration failure is non-fatal; app still works online */
      })

    // When the new SW takes control, reload once to get fresh assets.
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      // Never yank the page out from under a running quiz attempt — the
      // student would lose their place. The next navigation picks it up.
      if (/^\/quiz\/[^/]+\/attempt\//.test(window.location.pathname)) return
      refreshing = true
      window.location.reload()
    })
  })
}

export function applyUpdate(waiting: ServiceWorker) {
  waiting.postMessage('SKIP_WAITING')
}
