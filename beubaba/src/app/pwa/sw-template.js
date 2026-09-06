/* eslint-disable no-restricted-globals */
/**
 * BEU BABA service worker.
 *
 * BUILD_ID and PRECACHE_URLS are prepended by scripts/build-sw.mjs from the
 * real build output, so hashed filenames (index-U97ZbW9m.js) are always cached.
 *
 * Caching rules
 * -------------
 *  navigations   cache-first on the app shell, then network. An installed app
 *                must open instantly even on a dead connection; the shell is a
 *                single HTML file and React Router draws the rest.
 *  hashed assets cache-first, forever (the hash changes when content changes)
 *  other statics stale-while-revalidate
 *  API / Supabase NEVER cached — quiz answers and auth must not be replayed
 *  non-GET       never touched
 *
 * Anything not explicitly handled falls through to the network.
 */

const SHELL_CACHE = `beubaba-shell-${BUILD_ID}`
const RUNTIME_CACHE = `beubaba-runtime-${BUILD_ID}`
const SHELL_URL = '/index.html'
const OFFLINE_URL = '/offline.html'

// ---------------------------------------------------------------- install --
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE)
      // addAll() rejects atomically if ANY url 404s, which silently disabled
      // the old precache. Add individually so one bad entry cannot kill it.
      await Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => undefined),
        ),
      )
      // Do NOT skipWaiting here: a running quiz should not have its code
      // swapped mid-attempt. The page asks us to activate when it is safe.
    })(),
  )
})

// --------------------------------------------------------------- activate --
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable()
      }
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((k) => k.startsWith('beubaba-') && !k.endsWith(BUILD_ID))
          .map((k) => caches.delete(k)),
      )
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('message', (event) => {
  const data = event.data
  if (data === 'SKIP_WAITING' || (data && data.type === 'SKIP_WAITING')) {
    self.skipWaiting()
  }
  if (data && data.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ buildId: BUILD_ID })
  }
})

// ----------------------------------------------------------------- helpers --
const HASHED = /-[A-Za-z0-9_]{8,}\.(?:js|css)$/
const STATIC_EXT = /\.(?:png|jpe?g|webp|avif|svg|gif|ico|css|js|woff2?|ttf|json)$/i

/** Requests that must always hit the network and never be stored. */
function isNeverCache(url) {
  return (
    url.pathname.startsWith('/rest/v1') ||
    url.pathname.startsWith('/auth/v1') ||
    url.pathname.startsWith('/functions/v1') ||
    url.pathname.startsWith('/realtime') ||
    url.hostname.endsWith('.supabase.co')
  )
}

async function putSafe(cacheName, request, response) {
  // Opaque/partial responses poison a cache; only store clean 200s.
  if (!response || response.status !== 200 || response.type === 'opaque') return
  const cache = await caches.open(cacheName)
  await cache.put(request, response.clone()).catch(() => undefined)
}

// ------------------------------------------------------------------ fetch --
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  let url
  try {
    url = new URL(request.url)
  } catch {
    return
  }

  if (isNeverCache(url)) return
  if (url.origin !== self.location.origin) return

  // --- navigations: shell first, so the app opens instantly and offline ---
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const shell = await caches.match(SHELL_URL, { ignoreSearch: true })
        if (shell) {
          // Refresh the shell in the background for next time.
          event.waitUntil(
            (async () => {
              try {
                const fresh = await fetch(SHELL_URL, { cache: 'reload' })
                await putSafe(SHELL_CACHE, new Request(SHELL_URL), fresh)
              } catch {
                /* offline — keep the cached shell */
              }
            })(),
          )
          return shell
        }
        try {
          const preload = await event.preloadResponse
          if (preload) return preload
          const net = await fetch(request)
          await putSafe(SHELL_CACHE, new Request(SHELL_URL), net)
          return net
        } catch {
          return (await caches.match(OFFLINE_URL)) || Response.error()
        }
      })(),
    )
    return
  }

  // --- content-hashed build assets: immutable, cache-first forever ---
  if (HASHED.test(url.pathname)) {
    event.respondWith(
      (async () => {
        const hit = await caches.match(request)
        if (hit) return hit
        const net = await fetch(request)
        await putSafe(SHELL_CACHE, request, net)
        return net
      })(),
    )
    return
  }

  // --- other same-origin statics: stale-while-revalidate ---
  if (STATIC_EXT.test(url.pathname)) {
    event.respondWith(
      (async () => {
        const hit = await caches.match(request)
        const network = fetch(request)
          .then(async (res) => {
            await putSafe(RUNTIME_CACHE, request, res)
            return res
          })
          .catch(() => null)
        return hit || (await network) || Response.error()
      })(),
    )
  }
})

// ------------------------------------------------------------------- push --
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { title: 'BEU BABA', body: event.data ? event.data.text() : '' }
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'BEU BABA', {
      body: data.body || '',
      icon: '/assets/app-icon-192.png',
      badge: '/assets/app-icon-192.png',
      tag: data.tag || 'beubaba',
      data: { url: data.url || '/' },
      vibrate: [80, 40, 80],
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = (event.notification.data && event.notification.data.url) || '/'
  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate(target).catch(() => undefined)
          return client.focus()
        }
      }
      return self.clients.openWindow(target)
    })(),
  )
})
