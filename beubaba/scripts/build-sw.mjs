/**
 * Generate the service worker's precache manifest AFTER the Vite build.
 *
 * WHY THIS EXISTS
 * ---------------
 * The old sw.js precached a hand-written list. Vite emits hashed filenames
 * (index-U97ZbW9m.js), which can never appear in a hand-written list, so the
 * app shell was NOT actually cached: opening the installed app offline showed
 * the offline page instead of the app. It also listed /assets/mascot.webp,
 * which does not exist — one missing entry makes cache.addAll() reject and
 * silently abandons the whole precache.
 *
 * This script reads the real build output and writes:
 *   dist/sw.js  =  sw-template.js  +  a generated PRECACHE list + build id
 *
 * Run automatically via the `build` npm script.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { createHash } from 'node:crypto'

const DIST = 'dist'
const TEMPLATE = 'src/app/pwa/sw-template.js'

/** Files worth precaching: the shell. Big lazy chunks stay runtime-cached. */
const PRECACHE_EXT = /\.(?:html|css|js|webmanifest|woff2?|svg)$/i
const ICON_EXT = /\.(?:png|webp|ico)$/i

/** Never precache these — they are huge and only needed in mock mode. */
const SKIP = [/seed_/i, /mech_bank/i, /screenshot-/i]

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const s = statSync(p)
    if (s.isDirectory()) walk(p, out)
    else out.push({ path: p, size: s.size })
  }
  return out
}

const all = walk(DIST)
const precache = []
let bytes = 0

for (const f of all) {
  const url = '/' + relative(DIST, f.path).split(sep).join('/')
  if (url === '/sw.js') continue
  if (SKIP.some((re) => re.test(url))) continue

  const isShell = PRECACHE_EXT.test(url)
  // Icons are small and needed for the installed app to look right offline.
  const isIcon = ICON_EXT.test(url) && f.size < 400 * 1024
  if (!isShell && !isIcon) continue
  // A single oversized file would blow the install budget.
  if (f.size > 2 * 1024 * 1024) continue

  precache.push(url)
  bytes += f.size
}

// Build id changes whenever any precached file changes, so the SW updates.
const hash = createHash('sha1')
for (const url of precache.sort()) {
  hash.update(url)
  hash.update(readFileSync(join(DIST, url.slice(1))))
}
const buildId = hash.digest('hex').slice(0, 12)

const template = readFileSync(TEMPLATE, 'utf8')
const header =
  `// GENERATED FILE — edit src/app/pwa/sw-template.js instead.\n` +
  `const BUILD_ID = ${JSON.stringify(buildId)};\n` +
  `const PRECACHE_URLS = ${JSON.stringify(precache.sort(), null, 2)};\n\n`

writeFileSync(join(DIST, 'sw.js'), header + template)

console.log(
  `[build-sw] ${precache.length} files precached (${(bytes / 1024).toFixed(0)} KB), build ${buildId}`,
)
