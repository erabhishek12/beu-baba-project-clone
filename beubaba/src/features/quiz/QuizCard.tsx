import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { AppIcon } from '@/components/ui/AppIcon'
import { Pill } from '@/components/ui/Pill'
import { staggerChild } from '@/lib/motion'
import { difficultyTone } from '@/features/quiz/hooks'
import type { QuizSummary } from '@/types/domain'

/** Reference-matched quiz row: pastel tile + 3D icon, title, meta, round arrow. */
export function QuizCard({ quiz }: { quiz: QuizSummary }) {
  const navigate = useNavigate()
  const minutes = Math.round(quiz.duration_sec / 60)
  return (
    <motion.button
      variants={staggerChild}
      onClick={() => navigate(`/quiz/${quiz.id}`)}
      className="w-full text-left"
    >
      <div className="flex items-center gap-3.5 rounded-2xl bg-surface p-4 shadow-neu-sm ring-1 ring-line transition-shadow hover:shadow-neu">
        <span className="bb-tile-peach flex size-14 shrink-0 items-center justify-center rounded-2xl">
          <AppIcon name="quiz" className="size-11" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-semibold text-ink">{quiz.title}</p>
          <p className="mt-0.5 truncate text-caption text-ink-tertiary">{quiz.subject_name}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption font-semibold text-ink-secondary">
            <span className="flex items-center gap-1">
              <AppIcon name="list" className="size-4" />
              {quiz.question_count} Qs
            </span>
            <span className="flex items-center gap-1">
              <AppIcon name="timer" className="size-4" />
              {minutes} min
            </span>
            <span className="flex items-center gap-1">
              <AppIcon name={quiz.official ? 'verified' : 'warning'} className="size-4" />
              {quiz.official ? 'Verified' : 'Community'}
            </span>
            <Pill tone={difficultyTone(quiz.difficulty)} className="capitalize">
              {quiz.difficulty}
            </Pill>
          </div>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent shadow-[0_8px_18px_rgba(91,110,240,0.35)]">
          <ChevronRight className="size-4 text-white" aria-hidden />
        </span>
      </div>
    </motion.button>
  )
}
