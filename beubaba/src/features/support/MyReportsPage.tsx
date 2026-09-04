import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, Flag, FileText } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Skeleton } from '@/components/feedback/Skeleton'
import { reportService, REPORT_REASONS } from '@/services/reportService'
import type { ReportStatus } from '@/types/domain'
import { useUserId } from '@/features/quiz/hooks'

const STATUS_TONE: Record<ReportStatus, 'accent' | 'warning' | 'success' | 'neutral'> = {
  open: 'accent',
  investigating: 'warning',
  resolved: 'success',
  dismissed: 'neutral',
}
const STATUS_LABEL: Record<ReportStatus, string> = {
  open: 'Open',
  investigating: 'Investigating',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
}

function reasonLabel(value: string): string {
  return REPORT_REASONS.find((r) => r.value === value)?.label ?? value
}

export function MyReportsPage() {
  const userId = useUserId()
  const navigate = useNavigate()
  const { data: reports, isLoading } = useQuery({
    queryKey: ['my-reports', userId],
    queryFn: () => reportService.listMine(userId),
  })

  return (
    <div className="page-x pb-8 pt-6">
      <button
        onClick={() => navigate('/support')}
        className="mb-3 flex items-center gap-1 text-body-sm font-semibold text-ink-secondary"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Support
      </button>
      <h1 className="text-h1 text-ink">My reports</h1>
      <p className="mt-1 text-body-sm text-ink-secondary">
        Content corrections and problems you've reported.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}

        {!isLoading && (reports?.length ?? 0) === 0 && (
          <Card className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Flag className="size-7" />
            </span>
            <div>
              <p className="text-body font-semibold text-ink">No reports yet</p>
              <p className="mt-1 text-body-sm text-ink-secondary">
                Use the Report action on any content to flag a problem.
              </p>
            </div>
          </Card>
        )}

        {reports?.map((r) => (
          <Card key={r.id} as="glass" className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-danger-soft text-danger">
              <Flag className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-body font-semibold text-ink">{r.target_label}</p>
                <Pill tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Pill>
              </div>
              <p className="mt-0.5 text-caption font-semibold text-ink-tertiary">
                {reasonLabel(r.reason)}
              </p>
              <p className="mt-1 line-clamp-2 text-body-sm text-ink-secondary">{r.details}</p>
              {r.attachment && (
                <p className="mt-1.5 inline-flex items-center gap-1 text-caption text-ink-tertiary">
                  <FileText className="size-3.5" />
                  {r.attachment.name}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
