/**
 * BEU BABA assistant (spec §23–§29).
 *
 * Study Assistant + App Navigator + Resource Search + Doubt router.
 * Opens from the floating mascot button and is available on every normal page.
 *
 * When it cannot answer, it does NOT invent one — it shows the developer card
 * from §28 and carries the student's question into the existing support flow.
 *
 * Built from the existing Modal / Card / Button primitives.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Sparkles, ExternalLink, LifeBuoy } from 'lucide-react'
import { Modal } from '@/components/glass/Modal'
import { Button } from '@/components/ui/Button'
import { chatbotService } from '@/services/chatbot/chatbotService'
import type { BotReply } from '@/services/chatbot/types'

interface Msg {
  from: 'user' | 'bot'
  text: string
  reply?: BotReply
}

export function ChatSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [busy, setBusy] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, open])

  async function send(text: string) {
    const q = text.trim()
    if (!q || busy) return
    setInput('')
    setMsgs((m) => [...m, { from: 'user', text: q }])
    setBusy(true)
    try {
      const reply = await chatbotService.ask(q)
      setMsgs((m) => [...m, { from: 'bot', text: reply.text, reply }])
      if (reply.fallback) void chatbotService.logUnanswered(q, window.location.pathname)
    } catch {
      setMsgs((m) => [
        ...m,
        { from: 'bot', text: 'Something went wrong. Please try again.', reply: { text: '', fallback: true } },
      ])
    }
    setBusy(false)
  }

  function go(target: string, external?: boolean) {
    if (external || /^https?:\/\//i.test(target)) {
      window.open(target, '_blank', 'noopener,noreferrer')
      return
    }
    onClose()
    navigate(target)
  }

  /** §28 — hand the unanswered question to the existing developer messaging. */
  function askDeveloper(question: string) {
    onClose()
    navigate(`/support?q=${encodeURIComponent(question)}`)
  }

  const lastUser = [...msgs].reverse().find((m) => m.from === 'user')?.text ?? ''

  return (
    <Modal open={open} onClose={onClose} title="BEU BABA assistant">
      <div className="flex max-h-[65vh] flex-col gap-3 overflow-y-auto pr-1">
        {!msgs.length && (
          <div className="flex flex-col gap-2">
            <p className="text-body-sm text-ink-secondary">
              Ask me to open anything, find notes or papers, or start a quiz.
            </p>
            <div className="flex flex-wrap gap-2">
              {chatbotService.suggestions().map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-pill bg-surface-secondary px-3 py-1.5 text-caption font-semibold text-ink-secondary ring-1 ring-line"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {msgs.map((m, i) => (
          <div key={i} className={m.from === 'user' ? 'self-end' : 'self-start'}>
            <div
              className={
                m.from === 'user'
                  ? 'max-w-[85%] rounded-2xl bg-accent px-3.5 py-2 text-body-sm text-white'
                  : 'max-w-[95%] rounded-2xl bg-surface-secondary px-3.5 py-2 text-body-sm text-ink'
              }
            >
              {m.text}
            </div>

            {!!m.reply?.cards?.length && (
              <div className="mt-2 flex flex-col gap-2">
                {m.reply.cards.map((c, j) => (
                  <button
                    key={j}
                    onClick={() => go(c.target, c.external)}
                    className="flex items-center justify-between rounded-xl bg-surface px-3 py-2.5 text-left ring-1 ring-line"
                  >
                    <span>
                      <span className="block text-body-sm font-semibold text-ink">{c.label}</span>
                      {c.subtitle && (
                        <span className="block text-label text-ink-secondary">{c.subtitle}</span>
                      )}
                    </span>
                    {c.external ? (
                      <ExternalLink className="size-4 shrink-0 text-ink-tertiary" />
                    ) : (
                      <Sparkles className="size-4 shrink-0 text-accent" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* §28 developer fallback card */}
            {m.reply?.fallback && (
              <div className="mt-2 rounded-xl bg-surface px-3 py-3 ring-1 ring-line">
                <p className="text-body-sm font-semibold text-ink">Developer support</p>
                <p className="mt-0.5 text-label text-ink-secondary">
                  You can send this question straight to the developer.
                </p>
                <div className="mt-2">
                  <Button variant="secondary" onClick={() => askDeveloper(lastUser)}>
                    <LifeBuoy className="size-4" /> Message developer
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          void send(input)
        }}
        className="mt-3 flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything…"
          aria-label="Ask the assistant"
          className="flex-1 rounded-xl bg-surface-secondary px-3 py-2.5 text-body text-ink outline-none ring-1 ring-line focus:ring-accent"
        />
        <Button type="submit" loading={busy} disabled={!input.trim()}>
          <Send className="size-4" />
        </Button>
      </form>
    </Modal>
  )
}
