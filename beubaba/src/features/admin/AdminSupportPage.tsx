/**
 * Support inbox (admin spec §13).
 *
 * Read student conversations and reply. The reply goes through
 * `post_support_message`, which stamps the developer role and automatically
 * creates a notification for the student — so replying here really reaches
 * them, rather than only writing a row.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Send, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useToast } from '@/components/feedback/Toast'
import { adminService } from '@/services/adminService'

const STATUSES = ['open', 'awaiting_developer', 'awaiting_student', 'resolved']

export function AdminSupportPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const qc = useQueryClient()
  const [status, setStatus] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)

  const { data: threads, isLoading } = useQuery({
    queryKey: ['admin-support', status],
    queryFn: () => adminService.supportThreads(status || undefined),
  })
  const { data: messages } = useQuery({
    queryKey: ['admin-support-msgs', openId],
    queryFn: () => adminService.supportMessages(openId as string),
    enabled: !!openId,
  })

  async function send() {
    if (!openId || !reply.trim()) return
    setBusy(true)
    try {
      await adminService.supportReply(openId, reply.trim())
      setReply('')
      toast.success('Reply sent — the student has been notified.')
      await qc.invalidateQueries({ queryKey: ['admin-support-msgs', openId] })
      await qc.invalidateQueries({ queryKey: ['admin-support'] })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not send the reply.')
    }
    setBusy(false)
  }

  async function resolve(id: string) {
    try {
      await adminService.setSupportStatus(id, 'resolved')
      toast.success('Marked resolved.')
      await qc.invalidateQueries({ queryKey: ['admin-support'] })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not update.')
    }
  }

  return (
    <div className="page-x pb-24 pt-4">
      <button
        onClick={() => navigate('/admin')}
        className="mb-2 flex items-center gap-1 text-label text-ink-secondary"
      >
        <ChevronLeft className="size-4" /> Admin
      </button>
      <h1 className="text-h1 text-ink">Support</h1>
      <p className="mt-1 text-body-sm text-ink-secondary">
        Student conversations. Replying notifies them automatically.
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <button
          onClick={() => setStatus('')}
          className={`rounded-pill px-3 py-1.5 text-caption font-bold ${
            !status ? 'bg-accent text-white' : 'bg-surface text-ink-secondary ring-1 ring-line'
          }`}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(status === s ? '' : s)}
            className={`rounded-pill px-3 py-1.5 text-caption font-bold ${
              status === s ? 'bg-accent text-white' : 'bg-surface text-ink-secondary ring-1 ring-line'
            }`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {isLoading && <Skeleton className="mt-4 h-24 w-full rounded-2xl" />}

      {!isLoading && !threads?.length && (
        <Card className="mt-4 px-4 py-6 text-center text-body-sm text-ink-secondary">
          No conversations yet.
        </Card>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {(threads ?? []).map((t) => {
          const id = String(t.id)
          const isOpen = openId === id
          return (
            <Card key={id} className="px-4 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-body font-semibold text-ink">
                  {String(t.subject || '(no subject)')}
                </span>
                <Pill>{String(t.status).replace(/_/g, ' ')}</Pill>
                {t.category ? <Pill>{String(t.category)}</Pill> : null}
              </div>
              <p className="mt-0.5 text-label text-ink-tertiary">
                {t.last_message_at
                  ? new Date(String(t.last_message_at)).toLocaleString()
                  : ''}
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setOpenId(isOpen ? null : id)}>
                  {isOpen ? 'Hide' : 'Open'}
                </Button>
                {String(t.status) !== 'resolved' && (
                  <Button variant="tertiary" onClick={() => resolve(id)}>
                    <CheckCircle2 className="size-4" /> Resolve
                  </Button>
                )}
              </div>

              {isOpen && (
                <div className="mt-3 rounded-xl bg-surface-secondary px-3 py-3">
                  <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                    {(messages ?? []).map((m) => (
                      <div
                        key={String(m.id)}
                        className={
                          String(m.sender_role) === 'developer'
                            ? 'self-end rounded-xl bg-accent px-3 py-2 text-body-sm text-white'
                            : 'self-start rounded-xl bg-surface px-3 py-2 text-body-sm text-ink ring-1 ring-line'
                        }
                      >
                        {String(m.body)}
                      </div>
                    ))}
                    {!messages?.length && (
                      <p className="text-label text-ink-tertiary">No messages.</p>
                    )}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Write a reply…"
                      aria-label="Reply to student"
                      className="flex-1 rounded-xl bg-surface px-3 py-2 text-body-sm text-ink outline-none ring-1 ring-line focus:ring-accent"
                    />
                    <Button loading={busy} disabled={!reply.trim()} onClick={send}>
                      <Send className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
