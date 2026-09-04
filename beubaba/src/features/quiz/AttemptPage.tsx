import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Clock,
  Flag,
  Grid3x3,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertTriangle,
  X,
} from 'lucide-react'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useUserId, formatClock } from '@/features/quiz/hooks'
import { quizService } from '@/services/quizService'
import type { AttemptAnswer, PublicQuestion, QuizAttempt } from '@/types/domain'
import { cn } from '@/lib/cn'

export function AttemptPage() {
  const { quizId = '', attemptId = '' } = useParams()
  const navigate = useNavigate()
  const userId = useUserId()

  const { data: attempt, isLoading: la } = useQuery({
    queryKey: ['attempt', userId, attemptId],
    queryFn: () => quizService.getAttempt(userId, attemptId),
  })
  const { data: questions, isLoading: lq } = useQuery({
    queryKey: ['attempt-questions', userId, attemptId],
    queryFn: () => quizService.getAttemptQuestions(userId, attemptId),
    enabled: !!attempt,
  })

  if (la || lq || !attempt || !questions) {
    return (
      <div className="page-x pb-8 pt-6">
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="mt-4 h-40 rounded-2xl" />
        <Skeleton className="mt-3 h-14 rounded-xl" />
        <Skeleton className="mt-2 h-14 rounded-xl" />
      </div>
    )
  }

  if (attempt.state === 'submitted' || attempt.state === 'auto_submitted') {
    navigate(`/quiz/${quizId}/result/${attemptId}`, { replace: true })
    return null
  }

  return <AttemptRunner attempt={attempt} questions={questions} userId={userId} quizId={quizId} />
}

function AttemptRunner({
  attempt,
  questions,
  userId,
  quizId,
}: {
  attempt: QuizAttempt
  questions: PublicQuestion[]
  userId: string
  quizId: string
}) {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AttemptAnswer>>(attempt.answers ?? {})
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [dir, setDir] = useState(1)

  const expiresAt = useMemo(() => new Date(attempt.expires_at).getTime(), [attempt.expires_at])
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.round((expiresAt - Date.now()) / 1000)),
  )

  const q = questions[index]
  const selected = answers[q.id]?.selected ?? []

  const doSubmit = useCallback(
    async (auto: boolean) => {
      if (submitting) return
      setSubmitting(true)
      try {
        await quizService.submitAttempt(userId, attempt.id, auto)
        navigate(`/quiz/${quizId}/result/${attempt.id}`, { replace: true })
      } finally {
        setSubmitting(false)
      }
    },
    [attempt.id, navigate, quizId, submitting, userId],
  )

  // Timer — recomputed from server expiry, ticked locally (§16).
  const submitRef = useRef(doSubmit)
  submitRef.current = doSubmit
  useEffect(() => {
    const t = setInterval(() => {
      const rem = Math.max(0, Math.round((expiresAt - Date.now()) / 1000))
      setRemaining(rem)
      if (rem <= 0) {
        clearInterval(t)
        void submitRef.current(true)
      }
    }, 1000)
    return () => clearInterval(t)
  }, [expiresAt])

  function persist(next: AttemptAnswer) {
    setAnswers((prev) => ({ ...prev, [next.question_id]: next }))
    void quizService.saveAnswer(userId, attempt.id, next)
  }

  function toggleOption(optIdx: number) {
    const current = answers[q.id]?.selected ?? []
    let nextSel: number[]
    if (q.type === 'multi') {
      nextSel = current.includes(optIdx)
        ? current.filter((i) => i !== optIdx)
        : [...current, optIdx]
    } else {
      nextSel = current[0] === optIdx ? [] : [optIdx]
    }
    persist({
      question_id: q.id,
      selected: nextSel,
      marked_for_review: answers[q.id]?.marked_for_review ?? false,
    })
  }

  function toggleReview() {
    persist({
      question_id: q.id,
      selected: answers[q.id]?.selected ?? [],
      marked_for_review: !(answers[q.id]?.marked_for_review ?? false),
    })
  }

  function go(to: number) {
    if (to < 0 || to >= questions.length) return
    setDir(to > index ? 1 : -1)
    setIndex(to)
  }

  const answeredCount = questions.filter((qq) => (answers[qq.id]?.selected ?? []).length > 0).length
  const unanswered = questions.length - answeredCount
  const lowTime = remaining <= 60
  const criticalTime = remaining <= 15

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Top bar */}
      <div className="glass-standard sticky top-0 z-20 flex items-center gap-3 px-4 py-3">
        <span className="text-body-sm font-semibold text-ink">
          Question {index + 1}
          <span className="text-ink-tertiary"> / {questions.length}</span>
        </span>
        <div
          className={cn(
            'ml-auto flex items-center gap-1.5 rounded-pill px-3 py-1 text-body-sm font-bold tabular-nums transition-colors',
            criticalTime
              ? 'bg-danger/15 text-danger'
              : lowTime
                ? 'bg-warning/15 text-warning'
                : 'bg-surface-secondary text-ink-secondary',
          )}
          aria-live="polite"
        >
          <Clock className="size-4" aria-hidden />
          {formatClock(remaining)}
        </div>
        <button
          onClick={() => setPaletteOpen(true)}
          aria-label="Question palette"
          className="flex size-9 items-center justify-center rounded-lg bg-surface-secondary text-ink-secondary"
        >
          <Grid3x3 className="size-5" aria-hidden />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-surface-secondary">
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question body */}
      <div className="page-x flex-1 pb-40 pt-5">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={q.id}
            custom={dir}
            initial={{ opacity: 0, x: dir * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -24 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-2">
              <span className="rounded-pill bg-accent-soft px-2.5 py-0.5 text-caption font-semibold text-accent">
                {q.topic}
              </span>
              {q.type === 'multi' && (
                <span className="rounded-pill bg-surface-secondary px-2.5 py-0.5 text-caption font-medium text-ink-tertiary">
                  Select all that apply
                </span>
              )}
            </div>

            <p className="mt-3 text-h3 leading-snug text-ink">{q.stem}</p>

            <div className="mt-5 space-y-2.5">
              {q.options.map((opt, i) => {
                const isSel = selected.includes(i)
                return (
                  <button
                    key={i}
                    onClick={() => toggleOption(i)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-150',
                      isSel
                        ? 'border-accent bg-accent-soft shadow-[0_0_0_3px_var(--color-accent-soft)]'
                        : 'border-line/70 bg-surface-secondary/50 hover:bg-surface-secondary',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-7 shrink-0 items-center justify-center rounded-lg border text-caption font-bold transition-colors',
                        q.type === 'multi' && 'rounded-md',
                        isSel
                          ? 'border-accent bg-accent text-white'
                          : 'border-line bg-surface text-ink-tertiary',
                      )}
                    >
                      {isSel ? <Check className="size-4" aria-hidden /> : String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-body text-ink">{opt}</span>
                  </button>
                )
              })}
            </div>

            <button
              onClick={toggleReview}
              className={cn(
                'mt-4 flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-body-sm font-semibold transition-colors',
                answers[q.id]?.marked_for_review
                  ? 'bg-gold-soft text-gold-ink'
                  : 'bg-surface-secondary text-ink-secondary',
              )}
            >
              <Flag className="size-4" aria-hidden />
              {answers[q.id]?.marked_for_review ? 'Marked for review' : 'Mark for review'}
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer nav */}
      <div className="glass-elevated fixed inset-x-0 bottom-0 z-20 px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <button
            onClick={() => go(index - 1)}
            disabled={index === 0}
            className="flex size-11 items-center justify-center rounded-xl border border-line/70 bg-surface text-ink-secondary disabled:opacity-40"
            aria-label="Previous question"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          {index < questions.length - 1 ? (
            <button
              onClick={() => go(index + 1)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-3 text-body font-semibold text-white transition-colors hover:bg-accent-strong"
            >
              Next
              <ChevronRight className="size-5" aria-hidden />
            </button>
          ) : (
            <button
              onClick={() => setConfirmOpen(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-3 text-body font-semibold text-white transition-colors hover:bg-accent-strong"
            >
              Submit quiz
            </button>
          )}
          <button
            onClick={() => setConfirmOpen(true)}
            className="rounded-xl border border-line/70 bg-surface px-3 py-3 text-body-sm font-semibold text-ink-secondary"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Palette sheet */}
      <AnimatePresence>
        {paletteOpen && (
          <PaletteSheet
            questions={questions}
            answers={answers}
            current={index}
            onPick={(i) => {
              go(i)
              setPaletteOpen(false)
            }}
            onClose={() => setPaletteOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Submit confirmation */}
      <AnimatePresence>
        {confirmOpen && (
          <ConfirmSheet
            unanswered={unanswered}
            submitting={submitting}
            onCancel={() => setConfirmOpen(false)}
            onSubmit={() => doSubmit(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function PaletteSheet({
  questions,
  answers,
  current,
  onPick,
  onClose,
}: {
  questions: PublicQuestion[]
  answers: Record<string, AttemptAnswer>
  current: number
  onPick: (i: number) => void
  onClose: () => void
}) {
  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-ink/20 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="glass-modal relative w-full rounded-t-3xl px-5 pb-8 pt-4"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
        <div className="mb-3 flex items-center justify-between">
          <p className="text-h3 text-ink">Questions</p>
          <button onClick={onClose} aria-label="Close" className="text-ink-tertiary">
            <X className="size-5" />
          </button>
        </div>
        <div className="mb-4 flex flex-wrap gap-3 text-caption text-ink-secondary">
          <Legend className="bg-accent" label="Answered" />
          <Legend className="bg-gold" label="Marked" />
          <Legend className="border border-line bg-surface" label="Unanswered" />
        </div>
        <div className="grid grid-cols-6 gap-2.5">
          {questions.map((qq, i) => {
            const a = answers[qq.id]
            const answered = (a?.selected ?? []).length > 0
            const marked = a?.marked_for_review
            return (
              <button
                key={qq.id}
                onClick={() => onPick(i)}
                className={cn(
                  'flex aspect-square items-center justify-center rounded-xl text-body-sm font-bold transition-transform active:scale-95',
                  i === current && 'ring-2 ring-accent ring-offset-2',
                  marked
                    ? 'bg-gold text-white'
                    : answered
                      ? 'bg-accent text-white'
                      : 'border border-line bg-surface text-ink-secondary',
                )}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn('size-3.5 rounded-md', className)} />
      {label}
    </span>
  )
}

function ConfirmSheet({
  unanswered,
  submitting,
  onCancel,
  onSubmit,
}: {
  unanswered: number
  submitting: boolean
  onCancel: () => void
  onSubmit: () => void
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-ink/20 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        className="glass-modal relative w-full rounded-t-3xl px-5 pb-8 pt-4"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
        {unanswered > 0 ? (
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-6 shrink-0 text-warning" aria-hidden />
            <div>
              <p className="text-h3 text-ink">Submit with {unanswered} unanswered?</p>
              <p className="mt-1 text-body-sm text-ink-secondary">
                You still have {unanswered} question{unanswered === 1 ? '' : 's'} without an answer.
                Unanswered questions score zero.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-h3 text-ink">Submit your quiz?</p>
            <p className="mt-1 text-body-sm text-ink-secondary">
              All questions are answered. You can review your result and explanations next.
            </p>
          </div>
        )}
        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-line/70 bg-surface py-3 text-body font-semibold text-ink-secondary"
          >
            Continue quiz
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="flex-1 rounded-xl bg-accent py-3 text-body font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit test'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
