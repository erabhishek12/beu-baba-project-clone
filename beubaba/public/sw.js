/* BEU BABA service worker — offline shell + runtime caching + push (spec doc 16).
 *
 * Strategy:
 *  - Precache the app shell (icons, manifest, offline page).
 *  - Navigations: network-first, fall back to cached index, then offline page.
 *  - Static assets (icons/images/webp/css/js): stale-while-revalidate.
 *  - Never cache POST/analytics or cross-origin API calls.
 *  - Push + notificationclick handlers for Web Push where supported.
 *
 * Bump CACHE_VERSION on any shell change so old caches are cleaned (§ app update).
 */
const CACHE_VERSION = 'beubaba-v1'
const SHELL_CACHE = `${CACHE_VERSION}-shell`
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/offline.html',
  '/assets/app-icon-192.png',
  '/assets/app-icon-512.png',
  '/assets/apple-touch-icon.png',
  '/assets/mascot.webp',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS).catch(() => undefined))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(CACHE_VERSION))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

// Allow the page to tell a waiting SW to activate immediately.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting()
})

function isStaticAsset(url) {
  return /\.(?:png|jpg|jpeg|webp|svg|gif|css|js|woff2?|ttf)$/i.test(url.pathname)
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  // Only handle same-origin requests; let cross-origin (APIs/CDN) pass through.
  if (url.origin !== self.location.origin) return

  // App navigations → network-first with offline fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(RUNTIME_CACHE).then((c) => c.put('/', copy)).catch(() => undefined)
          return res
        })
        .catch(async () => {
          const cached = (await caches.match('/')) || (await caches.match('/index.html'))
          return cached || caches.match('/offline.html')
        }),
    )
    return
  }

  // Static assets → stale-while-revalidate.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => {
            const copy = res.clone()
            caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy)).catch(() => undefined)
            return res
          })
          .catch(() => cached)
        return cached || network
      }),
    )
  }
})

// ---- Web Push (works where the browser/OS supports it) -------------------
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { title: 'BEU BABA', body: event.data ? event.data.text() : '' }
  }
  const title = data.title || 'BEU BABA'
  const options = {
    body: data.body || '',
    icon: '/assets/app-icon-192.png',
    badge: '/assets/app-icon-192.png',
    tag: data.tag || 'beubaba',
    data: { url: data.url || '/' },
    vibrate: [80, 40, 80],
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = (event.notification.data && event.notification.data.url) || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate(target).catch(() => undefined)
          return client.focus()
        }
      }
      return self.clients.openWindow(target)
    }),
  )
})
