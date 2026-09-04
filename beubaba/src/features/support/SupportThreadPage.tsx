import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Send, FileText, Paperclip, X } from 'lucide-react'
import { Pill } from '@/components/ui/Pill'
import { Skeleton } from '@/components/feedback/Skeleton'
import { AttachmentPicker } from '@/components/forms/AttachmentPicker'
import { supportService, SUPPORT_STATUS_LABEL } from '@/services/supportService'
import type { SupportMessage, SupportStatus } from '@/types/domain'
import type { Attachment } from '@/lib/media'
import { useUserId } from '@/features/quiz/hooks'
import { cn } from '@/lib/cn'

const STATUS_TONE: Record<SupportStatus, 'accent' | 'warning' | 'success' | 'neutral'> = {
  open: 'accent',
  awaiting_developer: 'warning',
  awaiting_student: 'accent',
  resolved: 'success',
  archived: 'neutral',
}

export function SupportThreadPage() {
  const { convId = '' } = useParams()
  const userId = useUserId()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [body, setBody] = useState('')
  const [attachment, setAttachment] = useState<Attachment | null>(null)
  const [showAttach, setShowAttach] = useState(false)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: thread, isLoading } = useQuery({
    queryKey: ['support-thread', userId, convId],
    queryFn: () => supportService.getThread(userId, convId),
    refetchInterval: 4000,
  })

  // Mark developer messages read whenever the thread loads/updates.
  useEffect(() => {
    if (!thread) return
    void supportService.markThreadRead(userId, convId).then(() => {
      qc.invalidateQueries({ queryKey: ['support-unread', userId] })
    })
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread, userId, convId, qc])

  async function send() {
    if (body.trim().length === 0 && !attachment) return
    setSending(true)
    try {
      await supportService.reply(userId, convId, { body: body || '(attachment)', attachment })
      setBody('')
      setAttachment(null)
      setShowAttach(false)
      qc.invalidateQueries({ queryKey: ['support-thread', userId, convId] })
      qc.invalidateQueries({ queryKey: ['support-conversations', userId] })
    } finally {
      setSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="page-x pb-8 pt-6">
        <Skeleton className="h-8 w-40" />
        <div className="mt-6 flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-3/4" />
          ))}
        </div>
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="page-x pb-8 pt-6">
        <button
          onClick={() => navigate('/support')}
          className="mb-3 flex items-center gap-1 text-body-sm font-semibold text-ink-secondary"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Support
        </button>
        <p className="mt-10 text-center text-body-sm text-ink-secondary">
          This conversation could not be found.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100dvh-var(--nav-height))] flex-col">
      <div className="page-x pt-6">
        <button
          onClick={() => navigate('/support')}
          className="mb-3 flex items-center gap-1 text-body-sm font-semibold text-ink-secondary"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Support
        </button>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-h2 text-ink">{thread.subject}</h1>
          <Pill tone={STATUS_TONE[thread.status]}>{SUPPORT_STATUS_LABEL[thread.status]}</Pill>
        </div>
      </div>

      {/* Messages */}
      <div className="page-x flex-1 space-y-3 py-5">
        {thread.messages.map((m) => (
          <MessageBubble key={m.id} message={m} mine={m.sender_role === 'student'} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="sticky bottom-[var(--nav-height)] border-t border-line/60 bg-surface/80 p-3 backdrop-blur-md">
        {showAttach && (
          <div className="mb-2">
            <AttachmentPicker value={attachment} onChange={setAttachment} label="Attach a file" />
          </div>
        )}
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => setShowAttach((s) => !s)}
            aria-label="Toggle attachment"
            className={cn(
              'flex size-11 shrink-0 items-center justify-center rounded-full transition-colors',
              showAttach ? 'bg-accent-soft text-accent' : 'text-ink-tertiary hover:bg-surface-secondary',
            )}
          >
            {showAttach ? <X className="size-5" /> : <Paperclip className="size-5" />}
          </button>
          <textarea
            rows={1}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void send()
              }
            }}
            placeholder="Write a reply…"
            className="max-h-32 flex-1 resize-none rounded-2xl border border-line bg-surface px-4 py-2.5 text-body text-ink outline-none placeholder:text-ink-tertiary focus:border-accent"
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={sending || (body.trim().length === 0 && !attachment)}
            aria-label="Send"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-soft transition-colors hover:bg-accent-strong disabled:opacity-50"
          >
            <Send className="size-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message, mine }: { message: SupportMessage; mine: boolean }) {
  return (
    <div className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[82%] rounded-2xl px-4 py-2.5',
          mine
            ? 'rounded-br-md bg-accent text-white'
            : 'glass-standard glass-highlight rounded-bl-md text-ink',
        )}
      >
        {!mine && (
          <p className="mb-0.5 text-caption font-semibold text-accent">Developer</p>
        )}
        {message.attachment &&
          (message.attachment.kind === 'image' ? (
            <img
              src={message.attachment.dataUrl}
              alt={message.attachment.name}
              className="mb-2 max-h-56 rounded-lg object-cover"
            />
          ) : (
            <a
              href={message.attachment.dataUrl}
              download={message.attachment.name}
              className={cn(
                'mb-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-body-sm',
                mine ? 'bg-accent-soft' : 'bg-surface-secondary',
              )}
            >
              <FileText className="size-4" />
              <span className="truncate">{message.attachment.name}</span>
            </a>
          ))}
        {message.body && <p className="whitespace-pre-wrap text-body-sm">{message.body}</p>}
      </div>
    </div>
  )
}
