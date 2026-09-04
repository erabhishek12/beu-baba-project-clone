import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

/**
 * Dev-only middleware: force no-store on HTML/JS/CSS so the Arena preview iframe
 * never serves stale app code — BUT let static media (icons, images, fonts,
 * audio) be cached hard by the browser. Icons have stable filenames, so caching
 * them means they load from disk after the first paint instead of re-fetching on
 * every navigation (fixes the "icons reload every time" flicker).
 */
function noCacheInDev() {
  const CACHEABLE = /\.(png|jpe?g|webp|gif|svg|ico|avif|woff2?|ttf|otf|mp3|wav|webm|mp4)(\?|$)/i
  return {
    name: 'beubaba-no-cache-dev',
    configureServer(server: { middlewares: { use: (fn: (req: { url?: string }, res: { setHeader: (k: string, v: string) => void }, next: () => void) => void) => void } }) {
      server.middlewares.use((req, res, next) => {
        if (req.url && CACHEABLE.test(req.url)) {
          // Immutable-ish caching for static media within the dev session.
          res.setHeader('Cache-Control', 'public, max-age=31536000')
        } else {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
          res.setHeader('Pragma', 'no-cache')
          res.setHeader('Expires', '0')
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), noCacheInDev()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // The Arena preview proxies through a *.e2b.app host; allow it.
    allowedHosts: true,
    strictPort: false,
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
})
