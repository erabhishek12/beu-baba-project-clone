/**
 * Translation Edge Function (spec §18: "Do not expose provider secrets in
 * frontend code").
 *
 * The browser calls THIS; this calls the provider using a key held in Supabase
 * secrets. The key never reaches the client.
 *
 * Deploy:
 *   supabase secrets set GOOGLE_TRANSLATE_KEY=xxxxx
 *   supabase functions deploy translate
 *
 * Works with Google Cloud Translation v2. To use a different provider, change
 * only `callProvider()` below — the app contract stays the same.
 *
 * Contract
 *   POST { text: string, source?: string, target: string }
 *   200  { translated: string, detected?: string }
 *   4xx/5xx { error: string }
 */

const MAX_CHARS = 2000

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

async function callProvider(
  text: string,
  source: string | undefined,
  target: string,
  key: string,
): Promise<{ translated: string; detected?: string }> {
  const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: text,
      target,
      ...(source && source !== 'auto' ? { source } : {}),
      format: 'text',
    }),
  })
  if (!res.ok) {
    throw new Error(`provider ${res.status}`)
  }
  const data = await res.json()
  const t = data?.data?.translations?.[0]
  if (!t?.translatedText) throw new Error('empty provider response')
  return { translated: t.translatedText, detected: t.detectedSourceLanguage }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405)

  // Only signed-in students may translate: the function is called with the
  // caller's JWT, so an anonymous request has no Authorization header.
  if (!req.headers.get('Authorization')) {
    return json({ error: 'authentication required' }, 401)
  }

  const key = Deno.env.get('GOOGLE_TRANSLATE_KEY')
  if (!key) {
    // Honest failure rather than echoing the input back as a fake translation.
    return json({ error: 'translation provider is not configured' }, 503)
  }

  let body: { text?: string; source?: string; target?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid JSON' }, 400)
  }

  const text = (body.text ?? '').trim()
  const target = (body.target ?? '').trim()
  if (!text) return json({ error: 'text is required' }, 400)
  if (!target) return json({ error: 'target language is required' }, 400)
  if (text.length > MAX_CHARS) {
    return json({ error: `text must be ${MAX_CHARS} characters or fewer` }, 400)
  }

  try {
    const out = await callProvider(text, body.source, target, key)
    return json(out)
  } catch (e) {
    console.error('translate failed:', e instanceof Error ? e.message : e)
    return json({ error: 'translation failed' }, 502)
  }
})
