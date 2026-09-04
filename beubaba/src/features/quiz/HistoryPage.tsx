import { useNavigate } from 'react-router-dom'
import { CircleButton } from '@/components/ui/CircleButton'
import { PageHero } from '@/components/ui/PageHero'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useUserId } from '@/features/quiz/hooks'
import { quizService } from '@/services/quizService'

export function HistoryPage() {
  const navigate = useNavigate()
  const userId = useUserId()

  const { data: history, isLoading } = useQuery({
    queryKey: ['quiz-history', userId],
    queryFn: () => quizService.history(userId),
  })

  return (
    <div className="page-x pb-10 pt-6">
      <CircleButton label="Back to quiz" onClick={() => navigate('/quiz')} className="mb-3">
        <ChevronLeft className="size-5" aria-hidden />
      </CircleButton>
      <PageHero
        tone="lav"
        icon="progress"
        title="Quiz history"
        subtitle="Your past attempts and scores."
        className="mb-4"
      />

      {history && history.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-2.5">
          {[
            { v: history.length, l: 'Attempts' },
            {
              v: Math.round(history.reduce((a, r) => a + r.percentage, 0) / history.length),
              l: 'Avg score %',
            },
            { v: Math.max(...history.map((r) => r.percentage)), l: 'Best %' },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl bg-surface p-3 text-center shadow-neu-sm ring-1 ring-line">
              <p className="tnum font-heading text-h3 font-extrabold text-ink">{s.v}</p>
              <p className="text-caption text-ink-tertiary">{s.l}</p>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : history && history.length > 0 ? (
        <div className="mt-4 space-y-3">
          {history.map((r) => (
            <button
              key={r.attempt_id}
              onClick={() => navigate(`/quiz/${r.quiz_id}/result/${r.attempt_id}`)}
              className="block w-full text-left"
            >
              <Card className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body font-semibold text-ink">{r.quiz_title}</p>
                  <p className="mt-0.5 text-caption text-ink-tertiary">
                    {new Date(r.submitted_at).toLocaleDateString()} · {r.correct}/{r.total} correct
                  </p>
                </div>
                <Pill tone={r.percentage >= 60 ? 'success' : r.percentage >= 40 ? 'warning' : 'danger'}>
                  {r.percentage}%
                </Pill>
                <ChevronRight className="size-5 shrink-0 text-ink-tertiary" aria-hidden />
              </Card>
            </button>
          ))}
        </div>
      ) : (
        <Card className="mt-6 flex flex-col items-center py-10 text-center">
          <ClipboardList className="size-8 text-ink-tertiary" aria-hidden />
          <p className="mt-3 text-body font-semibold text-ink">No attempts yet</p>
          <p className="mt-1 text-body-sm text-ink-secondary">
            Complete a quiz and it will appear here.
          </p>
          <button
            onClick={() => navigate('/quiz')}
            className="mt-4 rounded-xl bg-accent px-5 py-2.5 text-body-sm font-semibold text-white"
          >
            Browse quizzes
          </button>
        </Card>
      )}
    </div>
  )
}
