/**
 * Chatbot service (spec §23–§29).
 *
 * Roles: Study Assistant + App Navigator + Resource Search Engine + Doubt
 * router. It answers from real app data — never from invented text.
 *
 * When it cannot answer confidently it returns `fallback: true`, and the UI
 * offers the existing "message the developer" flow with the question attached
 * (§28). It also logs the unanswered question so the catalog can be improved.
 */
import { matchIntent, starterSuggestions } from './matcher'
import type { BotCard, BotReply } from './types'
import { quizService } from '@/services/quizService'
import { USE_SUPABASE } from '@/services/backend/config'
import { getSupabase } from '@/services/backend/supabaseClient'

const EXTERNAL: Record<string, { label: string; url: string; blurb: string }> = {
  'external.doubt_desk': {
    label: 'Doubt Desk',
    url: 'https://doubt-desk.onrender.com',
    blurb: 'Ask academic doubts and get help.',
  },
  'external.javasourcecode': {
    label: 'JavaSourceCode',
    url: 'http://javasourcecode.in/',
    blurb: 'B.Tech notes, programming material and previous papers.',
  },
  'external.study_hub': {
    label: 'Study Hub',
    url: 'https://erabhi.in/studyHub/',
    blurb: 'Extra study resources.',
  },
}

/** Find quizzes for a subject name and return them as tappable cards. */
async function quizCards(subject: string, limit = 4): Promise<BotCard[]> {
  const list = await quizService.listQuizzes({ query: subject }).catch(() => [])
  return list.slice(0, limit).map((q) => ({
    label: q.title,
    target: `/quiz/${q.id}`,
    subtitle: `${q.question_count} questions · ${Math.round((q.duration_sec ?? 600) / 60)} min`,
  }))
}

export const chatbotService = {
  suggestions: starterSuggestions,

  /**
   * Decide what to do with one message.
   * Pure enough to unit-test: no navigation happens here, the UI acts on the
   * returned cards.
   */
  async ask(message: string): Promise<BotReply> {
    const m = matchIntent(message)

    if (!m) {
      return {
        text: "I couldn't find a reliable answer for this yet.",
        fallback: true,
      }
    }

    const { intent, remainder } = m
    const subject = remainder || intent.target

    switch (intent.action) {
      case 'answer':
        return { text: intent.answer ?? intent.title, intentKey: intent.key }

      case 'navigate':
        return {
          text: `Opening ${intent.title}.`,
          cards: [{ label: intent.title, target: intent.target }],
          intentKey: intent.key,
        }

      case 'external': {
        const e = EXTERNAL[intent.key]
        const label = e?.label ?? intent.title
        return {
          text: `${label} is an external study site — it opens in a new tab.`,
          cards: [
            {
              label: `Open ${label}`,
              target: e?.url ?? intent.target,
              external: true,
              subtitle: e?.blurb,
            },
          ],
          intentKey: intent.key,
        }
      }

      case 'search_quiz': {
        const cards = await quizCards(intent.target || subject)
        if (!cards.length) {
          return {
            text: `I could not find a published quiz for ${intent.target || subject} yet.`,
            fallback: true,
          }
        }
        return { text: `Here are quizzes for ${intent.target || subject}:`, cards, intentKey: intent.key }
      }

      case 'search_subject':
      case 'search_resource':
      case 'search_syllabus':
      case 'search_pyq': {
        const name = intent.target || subject
        const cards: BotCard[] = []
        const quizzes = await quizCards(name, 2)
        cards.push(...quizzes)
        cards.push({ label: `Search "${name}"`, target: `/search?q=${encodeURIComponent(name)}` })
        if (intent.action === 'search_pyq') {
          cards.push({ label: 'Previous year papers', target: '/study' })
        }
        if (intent.action === 'search_syllabus' || intent.action === 'search_subject') {
          cards.push({ label: 'Syllabus', target: '/study' })
        }
        if (intent.action === 'search_resource') {
          cards.push({ label: 'Notes & resources', target: '/resources' })
        }
        return { text: `Here is what I found for ${name}:`, cards, intentKey: intent.key }
      }

      case 'search_unit':
        return {
          text: `Open a subject and pick Unit ${intent.target}. Unit-wise quizzes are listed under each subject.`,
          cards: [{ label: 'Browse quizzes by unit', target: '/quiz' }],
          intentKey: intent.key,
        }

      case 'search_semester':
        return {
          text: `Semester ${intent.target} material is under Study.`,
          cards: [
            { label: 'Syllabus & papers', target: '/study' },
            { label: 'Quizzes', target: '/quiz' },
          ],
          intentKey: intent.key,
        }

      case 'search_branch':
        return {
          text: `${intent.title} content is under Study, and quizzes are filtered to your branch.`,
          cards: [
            { label: 'Study', target: '/study' },
            { label: 'Quizzes', target: '/quiz' },
          ],
          intentKey: intent.key,
        }

      default:
        return { text: "I couldn't find a reliable answer for this yet.", fallback: true }
    }
  },

  /**
   * Record a question we could not answer, so the intent catalog can grow.
   * Never blocks the UI and never throws.
   */
  async logUnanswered(question: string, context?: string): Promise<void> {
    if (!USE_SUPABASE) return
    try {
      const sb = getSupabase()
      const { data: auth } = await sb.auth.getUser()
      if (!auth?.user) return
      await sb.from('chatbot_unanswered').insert({
        user_id: auth.user.id,
        question: question.slice(0, 500),
        context: context ?? null,
      })
    } catch {
      /* logging is best-effort */
    }
  },
}
