import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LifeBuoy, Plus, ChevronRight, Flag, Inbox } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Pill } from '@/components/ui/Pill'
import { Skeleton } from '@/components/feedback/Skeleton'
import { ToolHeader } from '@/features/tools/ToolHeader'
import { useSearchParams } from 'react-router-dom'
import { NewSupportModal } from './NewSupportModal'
import { supportService, SUPPORT_STATUS_LABEL } from '@/services/supportService'
import type { SupportStatus } from '@/types/domain'
import { useUserId } from '@/features/quiz/hooks'

const STATUS_TONE: Record<SupportStatus, 'accent' | 'warning' | 'success' | 'neutral'> = {
  open: 'accent',
  awaiting_developer: 'warning',
  awaiting_student: 'accent',
  resolved: 'success',
  archived: 'neutral',
}

function timeAgo(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function SupportHomePage() {
  const userId = useUserId()
  const navigate = useNavigate()
  const [newOpen, setNewOpen] = useState(false)

  // The assistant sends unanswered questions here as ?q=... (spec §28).
  const [params, setParams] = useSearchParams()
  const askedQuestion = params.get('q') ?? ''
  useEffect(() => {
    if (askedQuestion) {
      setNewOpen(true)
      // Clear it so a refresh does not reopen the composer.
      const next = new URLSearchParams(params)
      next.delete('q')
      setParams(next, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [askedQuestion])

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['support-conversations', userId],
    queryFn: () => supportService.listConversations(userId),
  })

  return (
    <div className="page-x pb-8 pt-6">
      <ToolHeader
        title="Developer Support" icon="assistant" tone="mint"
        subtitle="A private line to the developer team — report bugs, request content or share feedback. Only you and the team can see your conversations."
      />

      <div className="mt-2 grid grid-cols-2 gap-3">
        <Button iconLeft={<Plus className="size-5" />} onClick={() => setNewOpen(true)}>
          New message
        </Button>
        <Button
          variant="secondary"
          iconLeft={<Flag className="size-5" />}
          onClick={() => navigate('/support/reports')}
        >
          My reports
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}

        {!isLoading && (conversations?.length ?? 0) === 0 && (
          <Card className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Inbox className="size-7" />
            </span>
            <div>
              <p className="text-body font-semibold text-ink">No conversations yet</p>
              <p className="mt-1 text-body-sm text-ink-secondary">
                Start a private conversation with the developer team.
              </p>
            </div>
            <Button size="sm" iconLeft={<Plus className="size-4" />} onClick={() => setNewOpen(true)}>
              New message
            </Button>
          </Card>
        )}

        {conversations?.map((c) => (
          <Card
            key={c.id}
            as="glass"
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/support/${c.id}`)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(`/support/${c.id}`)}
            className="flex cursor-pointer items-center gap-3 transition-transform active:scale-[0.99]"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <LifeBuoy className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-body font-semibold text-ink">{c.subject}</p>
              <p className="mt-1 flex items-center gap-2 text-caption text-ink-tertiary">
                <Pill tone={STATUS_TONE[c.status]}>{SUPPORT_STATUS_LABEL[c.status]}</Pill>
                <span>{timeAgo(c.updated_at)}</span>
              </p>
            </div>
            <ChevronRight className="size-5 shrink-0 text-ink-tertiary" aria-hidden />
          </Card>
        ))}
      </div>

      <NewSupportModal open={newOpen} onClose={() => setNewOpen(false)} prefill={askedQuestion} />
    </div>
  )
}
