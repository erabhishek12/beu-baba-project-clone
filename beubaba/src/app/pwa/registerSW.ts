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
      })
      .catch(() => {
        /* registration failure is non-fatal; app still works online */
      })

    // When the new SW takes control, reload once to get fresh assets.
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    })
  })
}

export function applyUpdate(waiting: ServiceWorker) {
  waiting.postMessage('SKIP_WAITING')
}
