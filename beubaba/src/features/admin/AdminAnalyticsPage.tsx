/**
 * Analytics (admin spec §15) + quiz catalogue + external links (§20).
 *
 * Every number here comes from a real query. Where a figure would be
 * misleading (for example an average over zero graded attempts) the screen
 * says so rather than printing 0% as if it were a measurement.
 */
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, BarChart3, ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useToast } from '@/components/feedback/Toast'
import { adminService } from '@/services/adminService'

export function AdminAnalyticsPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const qc = useQueryClient()

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.stats(),
  })
  const { data: qa, isLoading: lqa } = useQuery({
    queryKey: ['admin-quiz-analytics'],
    queryFn: () => adminService.quizAnalytics(),
  })
  const { data: quizzes } = useQuery({
    queryKey: ['admin-quizzes'],
    queryFn: () => adminService.quizzes(),
  })
  const { data: links } = useQuery({
    queryKey: ['admin-links'],
    queryFn: () => adminService.externalLinks(),
  })

  const cards: [string, number | string][] = [
    ['Students', stats?.students ?? 0],
    ['Active', stats?.activeStudents ?? 0],
    ['New this week', stats?.newThisWeek ?? 0],
    ['Questions', stats?.mcqTotal ?? 0],
    ['Published', stats?.mcqPublished ?? 0],
    ['Pending review', stats?.mcqPending ?? 0],
    ['Quarantined', stats?.mcqQuarantined ?? 0],
    ['Quiz attempts', stats?.attempts ?? 0],
    ['Subjects', stats?.subjects ?? 0],
    ['PYQs', stats?.pyqs ?? 0],
    ['Bookmarks', stats?.bookmarks ?? 0],
    ['Open reports', stats?.openReports ?? 0],
  ]

  return (
    <div className="page-x pb-24 pt-4">
      <button
        onClick={() => navigate('/admin')}
        className="mb-2 flex items-center gap-1 text-label text-ink-secondary"
      >
        <ChevronLeft className="size-4" /> Admin
      </button>
      <h1 className="text-h1 text-ink">Analytics</h1>
      <p className="mt-1 text-body-sm text-ink-secondary">
        Live figures from the database — nothing here is estimated.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map(([label, n]) => (
          <Card key={label} className="px-3 py-3">
            <div className="text-h3 text-ink">{Number(n).toLocaleString()}</div>
            <div className="text-label text-ink-secondary">{label}</div>
          </Card>
        ))}
      </div>

      <h2 className="mt-6 flex items-center gap-1.5 text-h3 text-ink">
        <BarChart3 className="size-4 text-accent" /> Quiz performance
      </h2>
      {lqa && <Skeleton className="mt-2 h-28 w-full rounded-2xl" />}
      {!lqa && (
        <Card className="mt-2 px-4 py-4">
          {qa && qa.completed > 0 ? (
            <>
              <p className="text-body-sm text-ink">
                {qa.completed.toLocaleString()} graded attempt
                {qa.completed === 1 ? '' : 's'} · average{' '}
                <span className="font-semibold">{qa.avgPercent}%</span>
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {qa.bySubject.map((s) => (
                  <div key={s.subject}>
                    <div className="flex items-center justify-between text-body-sm text-ink">
                      <span className="truncate">{s.subject}</span>
                      <span className="ml-2 shrink-0 text-ink-secondary">
                        {s.avg}% · {s.attempts}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-secondary">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${Math.max(2, Math.min(100, s.avg))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-body-sm text-ink-secondary">
              No graded attempts yet, so there is no average to report.
            </p>
          )}
        </Card>
      )}

      <h2 className="mt-6 text-h3 text-ink">Quiz catalogue</h2>
      <p className="mt-1 text-label text-ink-secondary">
        {(quizzes ?? []).length} legacy quizzes. Subject banks are generated from the question
        bank and appear automatically.
      </p>
      <div className="mt-2 flex flex-col gap-2">
        {(quizzes ?? []).slice(0, 12).map((q) => (
          <Card key={String(q.id)} className="px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-body-sm font-semibold text-ink">
                {String(q.title)}
              </span>
              <Pill>{String(q.status)}</Pill>
              {q.difficulty ? <Pill>{String(q.difficulty)}</Pill> : null}
            </div>
          </Card>
        ))}
      </div>

      <h2 className="mt-6 flex items-center gap-1.5 text-h3 text-ink">
        <ExternalLink className="size-4 text-accent" /> External links
      </h2>
      <div className="mt-2 flex flex-col gap-2">
        {(links ?? []).map((l) => {
          const key = String(l.key)
          const active = Boolean(l.is_active)
          return (
            <Card key={key} className="px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-body-sm font-semibold text-ink">{String(l.label)}</span>
                <Pill>{String(l.category ?? 'link')}</Pill>
                {!active && <Pill>off</Pill>}
              </div>
              <p className="mt-0.5 truncate text-label text-ink-tertiary">{String(l.url)}</p>
              <div className="mt-2">
                <Button
                  variant="secondary"
                  onClick={async () => {
                    try {
                      await adminService.setLinkActive(key, !active)
                      toast.success(active ? 'Link hidden.' : 'Link shown.')
                      await qc.invalidateQueries({ queryKey: ['admin-links'] })
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : 'Could not update.')
                    }
                  }}
                >
                  {active ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
