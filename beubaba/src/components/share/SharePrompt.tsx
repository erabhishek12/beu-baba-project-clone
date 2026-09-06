/**
 * "Share with your friends" prompt.
 *
 * Appears at most ONCE PER WEEK, on a random day, and only for a student who
 * has actually used the app (so it never greets a brand-new user who has seen
 * nothing yet). Dismissing it with X is honoured for the full week — a nag
 * that reappears every session would be worse than no prompt at all.
 *
 * State lives in localStorage rather than the database on purpose: this is a
 * per-device nudge, not account data, and it must work offline.
 */
import { useEffect, useState } from 'react'
import { X, Share2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/feedback/Toast'
import { useAuth } from '@/app/providers/AuthProvider'
import { SITE_LABEL } from '@/lib/brand'

const KEY = 'beubaba:share-prompt'
const WEEK = 7 * 24 * 60 * 60 * 1000

interface State {
  /** When we may next consider showing it. */
  nextAt: number
  /** The day we randomly picked inside this window. */
  showOn: number
}

function read(): State | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as State) : null
  } catch {
    return null
  }
}

function write(s: State) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* private mode — the prompt simply will not persist */
  }
}

/** Schedule the next window, choosing a random day inside it. */
function schedule(): State {
  const now = Date.now()
  const randomDay = Math.floor(Math.random() * 7) // 0–6 days into the week
  return { nextAt: now + WEEK, showOn: now + randomDay * 24 * 60 * 60 * 1000 }
}

export function SharePrompt() {
  const { user } = useAuth()
  const toast = useToast()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    const s = read()
    if (!s) {
      // First run: start the clock, do not interrupt them immediately.
      write(schedule())
      return
    }
    const now = Date.now()
    if (now >= s.showOn && now < s.nextAt) setOpen(true)
    else if (now >= s.nextAt) write(schedule())
  }, [user])

  function close() {
    // Dismissed — do not ask again until the next weekly window.
    write(schedule())
    setOpen(false)
  }

  const name = user?.profile.full_name?.split(' ')[0] || 'I'
  const message =
    `Hey! ${name === 'I' ? 'I am' : `${name} here — I'm`} studying with BEU BABA: ` +
    `previous year papers, syllabus, notes and 22,000+ practice questions for BEU students. ` +
    `It's completely free and has no ads. Try it: https://${SITE_LABEL}`

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'BEU BABA — free study app for BEU students',
          text: message,
          url: `https://${SITE_LABEL}`,
        })
        close()
        return
      }
      await navigator.clipboard.writeText(message)
      toast.success('Message copied — paste it to your friends.')
      close()
    } catch {
      // The user cancelling the share sheet is not an error worth shouting about.
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(message)
      toast.success('Copied.')
      close()
    } catch {
      toast.error('Could not copy. Select the text manually.')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-x-3 bottom-[calc(var(--nav-height)+18px+env(safe-area-inset-bottom,0px))] z-nav mx-auto max-w-md md:bottom-6">
      <div className="glass-elevated relative rounded-2xl p-4 shadow-neu ring-1 ring-line">
        <button
          onClick={close}
          aria-label="Dismiss"
          className="absolute right-2 top-2 rounded-full p-1.5 text-ink-tertiary hover:text-ink"
        >
          <X className="size-4" />
        </button>

        <p className="pr-6 text-body font-semibold text-ink">Enjoying BEU BABA?</p>
        <p className="mt-1 text-body-sm text-ink-secondary">
          Share it with a friend — it&apos;s free, ad-free, and it helps other BEU students find it.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={share}>
            <Share2 className="size-4" /> Share
          </Button>
          <Button variant="secondary" onClick={copy}>
            <Copy className="size-4" /> Copy link
          </Button>
        </div>
      </div>
    </div>
  )
}
