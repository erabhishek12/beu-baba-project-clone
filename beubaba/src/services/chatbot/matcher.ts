/**
 * Chatbot intent matcher (spec §24–§28).
 *
 * Deliberately NOT a language model. It scores the user's message against a
 * catalog of 500 real intents and only acts when it is confident. The spec is
 * explicit twice over — "Never fabricate an answer when reliable information is
 * unavailable" (§27) and "Do not fabricate an answer merely to avoid fallback"
 * (§28) — so a low score returns the developer fallback instead of a guess.
 *
 * Scoring, highest wins:
 *   1000  the message IS a phrase, exactly
 *    900  a phrase is contained in the message (longer phrase = better)
 *    600+ every word of a phrase appears in the message
 *    400+ strong word overlap with the intent title
 * Below MIN_SCORE we do not answer.
 */
import { INTENTS } from './intents.generated'
import type { Intent } from './types'

const MIN_SCORE = 380

/** Words too common to carry meaning on their own. */
const STOP = new Set([
  'the', 'a', 'an', 'of', 'for', 'to', 'in', 'on', 'at', 'is', 'are', 'am',
  'my', 'me', 'i', 'you', 'please', 'plz', 'can', 'could', 'would', 'show',
  'give', 'tell', 'want', 'need', 'get', 'do', 'does', 'how', 'what', 'where',
  'and', 'or', 'it', 'this', 'that', 'with', 'from',
])

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Whole-word containment.
 *
 * Plain `includes()` matched the acronym "at" inside "me-AT-ning", so
 * "what is the meaning of life" resolved to Applied Thermodynamics. A phrase
 * must now sit on word boundaries.
 */
function containsPhrase(haystack: string, phrase: string): boolean {
  const i = haystack.indexOf(phrase)
  if (i < 0) return false
  const before = i === 0 ? ' ' : haystack[i - 1]
  const after = i + phrase.length >= haystack.length ? ' ' : haystack[i + phrase.length]
  return before === ' ' && after === ' '
}

function words(s: string): string[] {
  return norm(s).split(' ').filter((w) => w && !STOP.has(w))
}

export interface Match {
  intent: Intent
  score: number
  /** The rest of the message after the matched phrase — e.g. a subject name. */
  remainder: string
}

export function matchIntent(message: string): Match | null {
  const msg = norm(message)
  if (!msg) return null
  const msgWords = new Set(words(message))

  let best: Match | null = null

  for (const intent of INTENTS) {
    for (const raw of intent.phrases) {
      const phrase = norm(raw)
      if (!phrase) continue

      let score = 0
      let remainder = ''

      if (msg === phrase) {
        score = 1000 + phrase.length
      } else if (containsPhrase(msg, phrase)) {
        // Longer matched phrases are more specific, so score higher.
        score = 900 + phrase.length * 2
        remainder = msg.replace(phrase, ' ').replace(/\s+/g, ' ').trim()
      } else {
        const pw = words(raw)
        if (!pw.length) continue
        const hit = pw.filter((w) => msgWords.has(w)).length
        if (hit === pw.length) {
          score = 600 + pw.length * 10
        } else if (hit > 0 && pw.length > 1) {
          const ratio = hit / pw.length
          if (ratio >= 0.75) score = 400 + hit * 10
        }
      }

      if (score > (best?.score ?? 0)) best = { intent, score, remainder }
    }

    // Title overlap as a weaker signal.
    const tw = words(intent.title)
    if (tw.length) {
      const hit = tw.filter((w) => msgWords.has(w)).length
      if (hit === tw.length) {
        const score = 500 + tw.length * 10
        if (score > (best?.score ?? 0)) best = { intent, score, remainder: '' }
      }
    }
  }

  return best && best.score >= MIN_SCORE ? best : null
}

/** Suggestions for an empty chat, or after a fallback. */
export function starterSuggestions(): string[] {
  return [
    'Start a quiz',
    'Show upcoming holidays',
    'Where are my notes?',
    'Open Study Hub',
    'Show my quiz history',
    'Calculate my CGPA',
  ]
}

export const INTENT_COUNT = INTENTS.length
export const PHRASE_COUNT = INTENTS.reduce((a, i) => a + i.phrases.length, 0)
