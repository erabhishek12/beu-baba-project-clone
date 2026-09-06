import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, X, ListChecks, Trophy, Target, CheckCircle2, ChevronRight, FolderOpen } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { PageHero } from '@/components/ui/PageHero'
import { Skeleton } from '@/components/feedback/Skeleton'
import { QuizCard } from '@/features/quiz/QuizCard'
import { useAuth } from '@/app/providers/AuthProvider'
import { useUserId } from '@/features/quiz/hooks'
import { quizService } from '@/services/quizService'
import { staggerParent } from '@/lib/motion'
import { cn } from '@/lib/cn'

const TYPES = [
  { value: 'all', label: 'All' },
  { value: 'practice', label: 'Practice' },
  { value: 'mixed', label: 'Revision' },
  { value: 'pyq', label: 'PYQ' },
]

export function QuizHomePage() {
  const navigate = useNavigate()
  const userId = useUserId()
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [subject, setSubject] = useState<string | null>(null)
  // Default to the student's own branch — otherwise every branch's papers show
  // up and the list is meaningless. They can still switch to "All branches".
  const { user } = useAuth()
  const myBranch = user?.student?.branch_id ?? null
  const [branchOnly, setBranchOnly] = useState(true)
  const branchId = branchOnly && myBranch ? myBranch : undefined

  const { data: subjects } = useQuery({
    queryKey: ['quiz-subjects', branchId ?? 'all'],
    queryFn: () => quizService.listSubjects(branchId),
  })

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['quizzes', query.trim(), type, subject, branchId ?? 'all'],
    queryFn: () =>
      quizService.listQuizzes({
        query: query.trim() || undefined,
        type,
        subjectCode: subject || undefined,
        branchId,
      }),
    placeholderData: keepPreviousData,
  })

  const { data: progress } = useQuery({
    queryKey: ['quiz-progress', userId],
    queryFn: () => quizService.progressSnapshot(userId),
  })

  const { data: history } = useQuery({
    queryKey: ['quiz-history', userId],
    queryFn: () => quizService.history(userId),
  })

  const featured = useMemo(() => quizzes?.[0], [quizzes])
  const rest = useMemo(() => quizzes?.slice(1) ?? [], [quizzes])

  // With the full bank this list is ~750 quizzes. Rendering every card at once
  // blocked the main thread for most of a second whenever the Quiz tab opened,
  // which read as a freeze. Show a page at a time instead.
  const PAGE = 20
  const [shown, setShown] = useState(PAGE)
  useEffect(() => { setShown(PAGE) }, [query, type, subject, branchId])
  const visible = useMemo(() => rest.slice(0, shown), [rest, shown])

  return (
    <div className="page-x pb-8 pt-6">
      <PageHero
        tone="peach"
        icon="quiz"
        title="Quiz"
        subtitle="Practice university-level MCQs, unit by unit. Verified answers with explanations."
        className="mb-4"
      >
        <button
          onClick={() => navigate('/resources')}
          className="mt-4 flex items-center gap-2 rounded-pill bg-canvas px-4 py-2 text-caption font-bold text-ink shadow-[0_10px_22px_rgba(20,16,60,0.25)]"
        >
          <FolderOpen className="size-4 text-accent" aria-hidden />
          Resources
        </button>
      </PageHero>

      {/* Progress snapshot */}
      {progress && progress.completed > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-2.5">
          <StatTile icon={<CheckCircle2 className="size-4" />} label="Completed" value={String(progress.completed)} />
          <StatTile icon={<Trophy className="size-4" />} label="Best" value={`${progress.bestPercentage}%`} />
          <StatTile icon={<Target className="size-4" />} label="Average" value={`${progress.avgPercentage}%`} />
        </div>
      )}

      {/* Search */}
      <div className="glass-standard glass-highlight flex items-center gap-3 rounded-xl px-4 py-3">
        <Search className="size-5 text-ink-tertiary" aria-hidden />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search quiz or subject…"
          aria-label="Search quizzes"
          className="w-full bg-transparent text-body text-ink outline-none placeholder:text-ink-tertiary"
        />
        {query && (
          <button aria-label="Clear" onClick={() => setQuery('')}>
            <X className="size-4 text-ink-tertiary" />
          </button>
        )}
      </div>

      {/* Type chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <Chip key={t.value} active={type === t.value} onClick={() => setType(t.value)}>
            {t.label}
          </Chip>
        ))}
      </div>

      {/* Branch scope — only worth showing when we know the student's branch */}
      {myBranch && (
        <div className="mt-2 flex gap-2">
          <Chip active={branchOnly} onClick={() => { setBranchOnly(true); setSubject(null) }}>
            My branch
          </Chip>
          <Chip active={!branchOnly} onClick={() => { setBranchOnly(false); setSubject(null) }}>
            All branches
          </Chip>
        </div>
      )}

      {/* Subject chips */}
      {!!subjects?.length && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Chip active={!subject} onClick={() => setSubject(null)}>
            All subjects
          </Chip>
          {subjects.map((s) => (
            <Chip key={s.code} active={subject === s.code} onClick={() => setSubject(s.code)}>
              {s.name}
            </Chip>
          ))}
        </div>
      )}

      {isLoading && !quizzes ? (
        <div className="mt-4 space-y-3">
          {/* featured card is taller than the rest — match the real layout */}
          <Skeleton className="h-40 rounded-2xl" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : quizzes && quizzes.length > 0 ? (
        <>
          {featured && (
            <button
              onClick={() => navigate(`/quiz/${featured.id}`)}
              className="mt-4 block w-full text-left"
            >
              <Card as="strong" className="glass-sheen">
                <div className="flex items-center justify-between">
                  <Pill tone="accent">Featured</Pill>
                  <span className="text-caption text-ink-tertiary capitalize">{featured.type}</span>
                </div>
                <p className="mt-2 text-h3 text-ink">{featured.title}</p>
                <p className="mt-0.5 text-body-sm text-ink-secondary">{featured.subject_name}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Pill tone="neutral">{featured.question_count} questions</Pill>
                  <Pill tone="neutral">{Math.round(featured.duration_sec / 60)} min</Pill>
                  <span className="ml-auto flex items-center gap-1 text-body-sm font-semibold text-accent">
                    Start <ChevronRight className="size-4" aria-hidden />
                  </span>
                </div>
              </Card>
            </button>
          )}

          <motion.div
            variants={staggerParent}
            initial="hidden"
            animate="visible"
            className="mt-3 space-y-3"
          >
            {visible.map((q) => (
              <QuizCard key={q.id} quiz={q} />
            ))}
          </motion.div>

          {rest.length > shown && (
            <button
              onClick={() => setShown((n) => n + PAGE)}
              className="mt-3 w-full rounded-2xl bg-surface px-4 py-3 text-body-sm font-semibold text-ink-secondary ring-1 ring-line"
            >
              Show more ({rest.length - shown} left)
            </button>
          )}
        </>
      ) : (
        <Card className="mt-6 flex flex-col items-center py-10 text-center">
          <ListChecks className="size-8 text-ink-tertiary" aria-hidden />
          <p className="mt-3 text-body font-semibold text-ink">No quizzes found</p>
          <p className="mt-1 text-body-sm text-ink-secondary">Try a different subject or filter.</p>
        </Card>
      )}

      {/* Recent history link */}
      {!!history?.length && (
        <button
          onClick={() => navigate('/quiz/history')}
          className="mt-5 flex w-full items-center justify-between rounded-xl border border-line/70 bg-surface-secondary/60 px-4 py-3 text-left transition-colors hover:bg-surface-secondary"
        >
          <span>
            <span className="block text-body-sm font-semibold text-ink">Your quiz history</span>
            <span className="text-caption text-ink-tertiary">
              {history.length} attempt{history.length === 1 ? '' : 's'} completed
            </span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-ink-tertiary" aria-hidden />
        </button>
      )}
    </div>
  )
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="flex flex-col items-center gap-1 py-3 text-center">
      <span className="text-accent">{icon}</span>
      <span className="text-h3 text-ink">{value}</span>
      <span className="text-caption text-ink-tertiary">{label}</span>
    </Card>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn('bb-chip', active && 'bb-chip-active')}
    >
      {children}
    </button>
  )
}
