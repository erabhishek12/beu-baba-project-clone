import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, CheckCircle2, XCircle, MinusCircle, Flag } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useUserId } from '@/features/quiz/hooks'
import { quizService } from '@/services/quizService'
import type { QuestionReviewItem } from '@/types/domain'
import { cn } from '@/lib/cn'

type FilterKey = 'all' | 'incorrect' | 'unanswered'

export function ReviewPage() {
  const { quizId = '', attemptId = '' } = useParams()
  const navigate = useNavigate()
  const userId = useUserId()
  const [filter, setFilter] = useState<FilterKey>('all')

  const { data: result, isLoading } = useQuery({
    queryKey: ['result', userId, attemptId],
    queryFn: () => quizService.getResult(userId, attemptId),
  })

  if (isLoading) {
    return (
      <div className="page-x pb-8 pt-6">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="mt-4 h-40 rounded-2xl" />
      </div>
    )
  }
  if (!result) {
    return (
      <div className="page-x pb-8 pt-6">
        <Card className="py-10 text-center">
          <p className="text-body font-semibold text-ink">Nothing to review</p>
          <button onClick={() => navigate('/quiz')} className="mt-4 text-body-sm font-semibold text-accent">
            Back to quizzes
          </button>
        </Card>
      </div>
    )
  }

  const items = result.review.filter((r) => {
    if (filter === 'incorrect') return !r.is_correct && r.selected.length > 0
    if (filter === 'unanswered') return r.selected.length === 0
    return true
  })

  return (
    <div className="page-x pb-10 pt-6">
      <button
        onClick={() => navigate(`/quiz/${quizId}/result/${attemptId}`)}
        className="mb-3 flex items-center gap-1 text-body-sm font-semibold text-ink-secondary"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Result
      </button>
      <h1 className="text-h1 text-ink">Review</h1>
      <p className="mt-1 text-body-sm text-ink-secondary">{result.quiz_title}</p>

      <div className="mt-3 flex gap-2">
        {(['all', 'incorrect', 'unanswered'] as FilterKey[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-pill border px-3.5 py-1.5 text-body-sm font-medium capitalize transition-colors',
              filter === f
                ? 'border-accent bg-accent text-white'
                : 'border-line/70 bg-surface-secondary/60 text-ink-secondary',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item, i) => (
          <ReviewCard key={item.id} item={item} number={i + 1} />
        ))}
        {items.length === 0 && (
          <Card className="py-8 text-center text-body-sm text-ink-secondary">
            No questions in this filter.
          </Card>
        )}
      </div>
    </div>
  )
}

function ReviewCard({ item, number }: { item: QuestionReviewItem; number: number }) {
  const unanswered = item.selected.length === 0
  const statusIcon = unanswered ? (
    <MinusCircle className="size-5 text-ink-tertiary" aria-hidden />
  ) : item.is_correct ? (
    <CheckCircle2 className="size-5 text-success" aria-hidden />
  ) : (
    <XCircle className="size-5 text-danger" aria-hidden />
  )

  return (
    <Card>
      <div className="flex items-start gap-2.5">
        {statusIcon}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-caption font-semibold text-ink-tertiary">Q{number}</span>
            <Pill tone="neutral" className="text-caption">
              {item.topic}
            </Pill>
          </div>
          <p className="mt-1.5 text-body font-medium text-ink">{item.stem}</p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {item.options.map((opt, i) => {
          const isCorrect = item.correct.includes(i)
          const isSelected = item.selected.includes(i)
          return (
            <div
              key={i}
              className={cn(
                'flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-body-sm',
                isCorrect
                  ? 'border-success/50 bg-success-soft text-ink'
                  : isSelected
                    ? 'border-danger/50 bg-danger-soft text-ink'
                    : 'border-line/60 bg-surface-secondary/40 text-ink-secondary',
              )}
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-caption font-bold text-ink-tertiary">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt}</span>
              {isCorrect && <CheckCircle2 className="size-4 text-success" aria-hidden />}
              {isSelected && !isCorrect && <XCircle className="size-4 text-danger" aria-hidden />}
            </div>
          )
        })}
      </div>

      {unanswered && (
        <p className="mt-2 flex items-center gap-1.5 text-caption font-medium text-ink-tertiary">
          <Flag className="size-3.5" aria-hidden /> You did not answer this question.
        </p>
      )}

      <div className="mt-3 rounded-lg bg-accent-soft/60 px-3 py-2.5">
        <p className="text-caption font-semibold uppercase tracking-wide text-accent">Explanation</p>
        <p className="mt-1 text-body-sm text-ink-secondary">{item.explanation}</p>
      </div>
    </Card>
  )
}
