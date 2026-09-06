/**
 * Translator (spec §18).
 *
 * "Do not expose provider secrets in frontend code." So this NEVER calls a
 * translation provider directly with a key. It calls a Supabase Edge Function
 * (`translate`) which holds the key server-side.
 *
 * If that function is not deployed yet, the tool says so plainly and offers a
 * retry — it does not silently return the input text pretending to translate,
 * which would be worse than an honest error.
 *
 * Covers the spec list: source language, target language, input, translate,
 * copy, clear, loading, error, retry.
 */
import { useState } from 'react'
import { Copy, X, ArrowLeftRight, Languages, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/feedback/Toast'
import { USE_SUPABASE } from '@/services/backend/config'
import { getSupabase } from '@/services/backend/supabaseClient'

/** Languages a BEU student realistically needs. */
const LANGS: { code: string; label: string }[] = [
  { code: 'auto', label: 'Detect language' },
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'bn', label: 'Bengali' },
  { code: 'ur', label: 'Urdu' },
  { code: 'mr', label: 'Marathi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'or', label: 'Odia' },
  { code: 'as', label: 'Assamese' },
]

const MAX = 2000

export function TranslatorTool() {
  const toast = useToast()
  const [from, setFrom] = useState('auto')
  const [to, setTo] = useState('hi')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function translate() {
    const text = input.trim()
    if (!text) return
    if (!USE_SUPABASE) {
      setError('Translation needs the online backend. It is off in demo mode.')
      return
    }
    setBusy(true)
    setError('')
    setOutput('')
    try {
      // The key lives in the Edge Function, never here.
      const { data, error: fnErr } = await getSupabase().functions.invoke('translate', {
        body: { text, source: from, target: to },
      })
      if (fnErr) throw fnErr
      const translated = (data as { translated?: string } | null)?.translated
      if (!translated) throw new Error('empty')
      setOutput(translated)
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      setError(
        /not found|404|Failed to send/i.test(msg)
          ? 'The translation service is not set up yet. Ask the developer to deploy the "translate" function.'
          : 'Translation failed. Please try again.',
      )
    }
    setBusy(false)
  }

  function swap() {
    // "Detect" cannot become a target, so fall back to English.
    const newFrom = to
    const newTo = from === 'auto' ? 'en' : from
    setFrom(newFrom)
    setTo(newTo)
    setInput(output || input)
    setOutput('')
  }

  function clear() {
    setInput('')
    setOutput('')
    setError('')
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(output)
      toast.success('Translation copied.')
    } catch {
      toast.error('Could not copy.')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-body-sm text-ink-secondary">
        Translate notes or a question between English and Indian languages.
      </p>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label htmlFor="tfrom" className="mb-1.5 block text-label text-ink-secondary">
            From
          </label>
          <select
            id="tfrom"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full rounded-xl bg-surface-secondary px-3 py-2.5 text-body text-ink ring-1 ring-line focus:ring-accent"
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={swap}
          aria-label="Swap languages"
          className="mb-1 rounded-xl bg-surface p-2.5 text-ink-secondary ring-1 ring-line"
        >
          <ArrowLeftRight className="size-4" />
        </button>
        <div className="flex-1">
          <label htmlFor="tto" className="mb-1.5 block text-label text-ink-secondary">
            To
          </label>
          <select
            id="tto"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full rounded-xl bg-surface-secondary px-3 py-2.5 text-body text-ink ring-1 ring-line focus:ring-accent"
          >
            {LANGS.filter((l) => l.code !== 'auto').map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, MAX))}
          rows={5}
          placeholder="Type or paste text…"
          aria-label="Text to translate"
          className="selectable w-full rounded-2xl bg-surface-secondary px-3 py-3 text-body text-ink outline-none ring-1 ring-line focus:ring-accent"
        />
        <p className="mt-1 text-right text-label text-ink-tertiary">
          {input.length} / {MAX}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button loading={busy} disabled={!input.trim()} onClick={translate}>
          <Languages className="size-4" /> Translate
        </Button>
        {(input || output) && (
          <Button variant="tertiary" onClick={clear}>
            <X className="size-4" /> Clear
          </Button>
        )}
      </div>

      {busy && (
        <div className="flex items-center gap-2 text-body-sm text-ink-secondary">
          <Loader2 className="size-4 animate-spin text-accent" /> Translating…
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-2xl bg-surface-secondary px-4 py-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
          <div>
            <p className="text-body-sm text-ink">{error}</p>
            <div className="mt-2">
              <Button variant="secondary" onClick={translate}>
                Retry
              </Button>
            </div>
          </div>
        </div>
      )}

      {output && (
        <div>
          <div className="flex items-center justify-between">
            <span className="text-label text-ink-secondary">Translation</span>
            <Button variant="secondary" onClick={copy}>
              <Copy className="size-4" /> Copy
            </Button>
          </div>
          <p className="selectable mt-2 whitespace-pre-wrap rounded-2xl bg-surface-secondary px-3 py-3 text-body text-ink">
            {output}
          </p>
        </div>
      )}
    </div>
  )
}
