import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Flag, ExternalLink, Inbox } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useToast } from '@/components/feedback/Toast'
import { reportService } from '@/services/reportService'
import type { Report, ReportStatus } from '@/types/domain'
import {
  REPORT_REASON_LABEL,
  REPORT_STATUS_LABEL,
  REPORT_STATUS_TONE,
  REPORT_TARGET_LABEL,
} from './adminMeta'
import { cn } from '@/lib/cn'

const FILTERS: { key: ReportStatus | 'all'; label: string }[] = [
  { key: 'open', label: 'Open' },
  { key: 'investigating', label: 'Investigating' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'dismissed', label: 'Dismissed' },
  { key: 'all', label: 'All' },
]

const NEXT: { value: ReportStatus; label: string }[] = [
  { value: 'investigating', label: 'Investigate' },
  { value: 'resolved', label: 'Resolve' },
  { value: 'dismissed', label: 'Dismiss' },
  { value: 'open', label: 'Reopen' },
]

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

export function AdminReportsPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const toast = useToast()
  const [filter, setFilter] = useState<ReportStatus | 'all'>('open')

  const { data: all, isLoading } = useQuery({
    queryKey: ['admin', 'reports', 'all'],
    queryFn: () => reportService.listAll(),
  })

  const shown = useMemo(() => {
    if (!all) return []
    const list = filter === 'all' ? all : all.filter((r) => r.status === filter)
    return [...list].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
  }, [all, filter])

  async function setStatus(report: Report, status: ReportStatus) {
    await reportService.setStatus(report.id, status)
    qc.invalidateQueries({ queryKey: ['admin', 'reports'] })
    toast.success(`Marked ${REPORT_STATUS_LABEL[status].toLowerCase()}`)
  }

  return (
    <div className="page-x pb-8 pt-6">
      <header className="mb-4">
        <button
          onClick={() => navigate('/admin')}
          className="mb-3 flex items-center gap-1 text-body-sm font-semibold text-ink-secondary"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Admin
        </button>
        <h1 className="text-h1 text-ink">Reports</h1>
        <p className="mt-1 text-body-sm text-ink-secondary">
          Content and bug reports raised by students. Triage each and update its status.
        </p>
      </header>

      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((f) => {
          const n = f.key === 'all' ? all?.length : all?.filter((r) => r.status === f.key).length
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'shrink-0 rounded-pill px-3.5 py-1.5 text-caption font-semibold transition-colors',
                filter === f.key
                  ? 'bg-accent text-white shadow-soft'
                  : 'bg-chip text-ink-secondary ring-1 ring-[var(--glass-border)] hover:text-ink',
              )}
            >
              {f.label}
              {n ? ` (${n})` : ''}
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      ) : shown.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {shown.map((r) => (
            <li key={r.id}>
              <Card as="glass" className="glass-highlight flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-danger-soft text-danger">
                    <Flag className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-body font-semibold text-ink">{r.target_label}</p>
                      <Pill tone={REPORT_STATUS_TONE[r.status]}>
                        {REPORT_STATUS_LABEL[r.status]}
                      </Pill>
                    </div>
                    <p className="mt-0.5 text-caption text-ink-tertiary">
                      {REPORT_TARGET_LABEL[r.target_type]} · {REPORT_REASON_LABEL[r.reason]} ·{' '}
                      {timeAgo(r.created_at)}
                    </p>
                  </div>
                </div>

                {r.details && <p className="text-body-sm text-ink-secondary">{r.details}</p>}

                <div className="flex flex-wrap items-center gap-2">
                  {r.context_path && (
                    <Pill tone="neutral">at {r.context_path}</Pill>
                  )}
                  {r.attachment?.dataUrl && (
                    <a
                      href={r.attachment.dataUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-caption font-semibold text-accent"
                    >
                      View screenshot
                      <ExternalLink className="size-3.5" aria-hidden />
                    </a>
                  )}
                </div>

                {/* Status actions */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {NEXT.filter((n) => n.value !== r.status).map((n) => (
                    <button
                      key={n.value}
                      onClick={() => setStatus(r, n.value)}
                      className="press-tile rounded-pill bg-chip px-3 py-1.5 text-caption font-semibold text-accent-ink ring-1 ring-[var(--glass-border)] hover:text-accent"
                    >
                      {n.label}
                    </button>
                  ))}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Card className="flex flex-col items-center gap-3 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Inbox className="size-7" aria-hidden />
          </span>
          <div>
            <p className="text-body font-semibold text-ink">No reports</p>
            <p className="mt-1 text-body-sm text-ink-secondary">
              Nothing matches this filter right now.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
