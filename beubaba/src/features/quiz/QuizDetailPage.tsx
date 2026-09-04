import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  ChevronLeft,
  Clock,
  ListChecks,
  Award,
  BadgeCheck,
  AlertTriangle,
  PlayCircle,
  RotateCcw,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useUserId, difficultyTone } from '@/features/quiz/hooks'
import { quizService } from '@/services/quizService'
import { useRecordView } from '@/features/saved/useRecordView'

export function QuizDetailPage() {
  const { quizId = '' } = useParams()
  const navigate = useNavigate()
  const userId = useUserId()
  const [starting, setStarting] = useState(false)

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => quizService.getQuiz(quizId),
  })

  // Record in "Recently viewed" once the quiz title is known.
  useRecordView('quiz', quiz?.id, quiz?.title, {
    subtitle: quiz?.subject_name,
    url: quizId ? `/quiz/${quizId}` : undefined,
  })

  const { data: active } = useQuery({
    queryKey: ['quiz-active', userId, quizId],
    queryFn: () => quizService.findActiveAttempt(userId, quizId),
  })

  async function start() {
    if (!quiz) return
    setStarting(true)
    try {
      const attempt = await quizService.startAttempt(userId, quiz.id)
      navigate(`/quiz/${quiz.id}/attempt/${attempt.id}`)
    } finally {
      setStarting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="page-x pb-8 pt-6">
        <Skeleton className="h-8 w-32 rounded-lg" />
        <Skeleton className="mt-4 h-48 rounded-2xl" />
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="page-x pb-8 pt-6">
        <Card className="flex flex-col items-center py-10 text-center">
          <AlertTriangle className="size-8 text-ink-tertiary" aria-hidden />
          <p className="mt-3 text-body font-semibold text-ink">Quiz unavailable</p>
          <button onClick={() => navigate('/quiz')} className="mt-4 text-body-sm font-semibold text-accent">
            Back to quizzes
          </button>
        </Card>
      </div>
    )
  }

  const minutes = Math.round(quiz.duration_sec / 60)

  return (
    <div className="page-x pb-8 pt-6">
      <button
        onClick={() => navigate('/quiz')}
        className="mb-3 flex items-center gap-1 text-body-sm font-semibold text-ink-secondary"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Quiz
      </button>

      <Card as="strong" className="glass-sheen">
        <div className="flex items-center gap-2">
          {quiz.official ? (
            <Pill tone="accent" className="inline-flex items-center gap-1">
              <BadgeCheck className="size-3" aria-hidden /> Verified
            </Pill>
          ) : (
            <Pill tone="warning">Community · Unverified</Pill>
          )}
          <span className="text-caption text-ink-tertiary capitalize">{quiz.type}</span>
        </div>
        <h1 className="mt-2 text-h2 text-ink">{quiz.title}</h1>
        <p className="mt-1 text-body-sm text-ink-secondary">{quiz.subject_name}</p>
      </Card>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        <Stat icon={<ListChecks className="size-4" />} label="Questions" value={String(quiz.pick_count)} />
        <Stat icon={<Clock className="size-4" />} label="Duration" value={`${minutes} min`} />
        <Stat
          icon={<Award className="size-4" />}
          label="Marking"
          value={quiz.negative_marking > 0 ? `−${quiz.negative_marking}` : 'No neg'}
        />
      </div>

      {/* Rules */}
      <Card className="mt-3">
        <p className="text-body-sm font-semibold text-ink">Rules</p>
        <ul className="mt-2 space-y-1.5 text-body-sm text-ink-secondary">
          <li>· {quiz.pick_count} questions, {minutes} minutes. The timer starts when you begin.</li>
          <li>· Each correct answer scores {quiz.marks_per_question} mark.</li>
          <li>
            ·{' '}
            {quiz.negative_marking > 0
              ? `${quiz.negative_marking} mark deducted per wrong answer.`
              : 'No negative marking.'}
          </li>
          <li>· You can mark questions for review and revisit them before submitting.</li>
          <li>· Answers auto-save. When time runs out, the quiz submits automatically.</li>
          <li>· Difficulty:{' '}
            <Pill tone={difficultyTone(quiz.difficulty)} className="capitalize">
              {quiz.difficulty}
            </Pill>
          </li>
        </ul>
      </Card>

      {!quiz.verified && (
        <Card className="mt-3 flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
          <p className="text-body-sm text-ink-secondary">
            This quiz is community-contributed and not yet verified by a moderator. Answers may
            contain errors — you can report any question during review.
          </p>
        </Card>
      )}

      {/* Actions */}
      {active ? (
        <div className="mt-5 space-y-2.5">
          <button
            onClick={() => navigate(`/quiz/${quiz.id}/attempt/${active.id}`)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-body font-semibold text-white transition-colors hover:bg-accent-strong"
          >
            <PlayCircle className="size-5" aria-hidden />
            Continue attempt
          </button>
          <button
            onClick={start}
            disabled={starting}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-line/70 bg-surface-secondary/60 py-3 text-body font-semibold text-ink-secondary transition-colors hover:bg-surface-secondary disabled:opacity-60"
          >
            <RotateCcw className="size-4" aria-hidden />
            Restart from beginning
          </button>
        </div>
      ) : (
        <button
          onClick={start}
          disabled={starting}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-body font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          <PlayCircle className="size-5" aria-hidden />
          {starting ? 'Starting…' : 'Start Quiz'}
        </button>
      )}
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="flex flex-col items-center gap-1 py-3 text-center">
      <span className="text-accent">{icon}</span>
      <span className="text-body font-bold text-ink">{value}</span>
      <span className="text-caption text-ink-tertiary">{label}</span>
    </Card>
  )
}
