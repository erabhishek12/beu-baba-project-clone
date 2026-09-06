/**
 * Math Mind (spec §19).
 *
 * Five levels of genuinely different mathematics (see generator.ts), with a
 * worked solution shown after every answer, live score and accuracy, and
 * adaptive progression: a level unlocks once the one below is cleared at 80%.
 *
 * Rounds are saved to the database so progress survives a reinstall.
 * Uses the existing Card / Pill / Button primitives only.
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Check, X, Lock, RotateCcw, Brain } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Button } from '@/components/ui/Button'
import { mathMindService } from '@/services/revisionService'
import { generateRound, LEVEL_NAMES, type MathQuestion } from './generator'
import { cn } from '@/lib/cn'

const ROUND_SIZE = 10

export function MathMindPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: progress } = useQuery({
    queryKey: ['mathmind-progress'],
    queryFn: () => mathMindService.progress(),
  })

  const [level, setLevel] = useState(1)
  const [round, setRound] = useState<MathQuestion[] | null>(null)
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [startedAt, setStartedAt] = useState(0)
  const [done, setDone] = useState(false)

  const unlocked = progress?.unlocked_level ?? 1

  // If the student's unlocked level rises, follow it — but never force them
  // down from a level they are already playing.
  useEffect(() => {
    setLevel((l) => (l > unlocked ? unlocked : l))
  }, [unlocked])

  function start(lv: number) {
    setLevel(lv)
    setRound(generateRound(lv, ROUND_SIZE))
    setIndex(0)
    setPicked(null)
    setCorrect(0)
    setDone(false)
    setStartedAt(Date.now())
  }

  const q = round?.[index]
  const accuracy = useMemo(
    () => (index > 0 ? Math.round((correct / index) * 100) : 0),
    [correct, index],
  )

  function choose(i: number) {
    if (picked !== null || !q) return
    setPicked(i)
    if (i === q.correct) setCorrect((c) => c + 1)
  }

  async function next() {
    if (!round) return
    if (index + 1 >= round.length) {
      setDone(true)
      await mathMindService
        .saveRound({
          level,
          total: round.length,
          correct,
          topic: round[index]?.topic ?? null,
          durationMs: Date.now() - startedAt,
        })
        .catch(() => undefined)
      await qc.invalidateQueries({ queryKey: ['mathmind-progress'] })
      return
    }
    setIndex((i) => i + 1)
    setPicked(null)
  }

  /* ------------------------------------------------------------- results -- */
  if (done && round) {
    const pct = Math.round((correct / round.length) * 100)
    const cleared = pct >= 80
    return (
      <div className="page-x pb-24 pt-4">
        <h1 className="text-h1 text-ink">Round complete</h1>
        <Card className="mt-4 px-4 py-5 text-center">
          <div className="text-h1 text-ink">{pct}%</div>
          <p className="mt-1 text-body text-ink-secondary">
            {correct} of {round.length} correct · {LEVEL_NAMES[level - 1]}
          </p>
          <p className="mt-2 text-body-sm text-ink-secondary">
            {cleared
              ? level < 5
                ? `Level cleared. ${LEVEL_NAMES[level]} is now unlocked.`
                : 'You have cleared the hardest level.'
              : 'Score 80% or more to unlock the next level.'}
          </p>
        </Card>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => start(level)}>
            <RotateCcw className="size-4" /> Play again
          </Button>
          {cleared && level < 5 && (
            <Button variant="secondary" onClick={() => start(level + 1)}>
              Try {LEVEL_NAMES[level]}
            </Button>
          )}
          <Button variant="tertiary" onClick={() => setRound(null)}>
            Back to levels
          </Button>
        </div>
      </div>
    )
  }

  /* ---------------------------------------------------------- in a round -- */
  if (round && q) {
    return (
      <div className="page-x pb-24 pt-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setRound(null)}
            className="flex items-center gap-1 text-label text-ink-secondary"
          >
            <ChevronLeft className="size-4" /> Levels
          </button>
          <div className="flex items-center gap-2">
            <Pill>{LEVEL_NAMES[level - 1]}</Pill>
            <Pill>
              {index + 1} / {round.length}
            </Pill>
          </div>
        </div>

        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-secondary">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${((index + (picked !== null ? 1 : 0)) / round.length) * 100}%` }}
          />
        </div>
        <p className="mt-1.5 text-label text-ink-secondary">
          Score {correct} · Accuracy {accuracy}%
        </p>

        <Card className="mt-4 px-4 py-5">
          <p className="text-label text-accent">{q.topic}</p>
          <p className="mt-1.5 text-h3 leading-snug text-ink">{q.prompt}</p>

          <div className="mt-4 flex flex-col gap-2">
            {q.options.map((opt, i) => {
              const isRight = i === q.correct
              const chosen = picked === i
              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  disabled={picked !== null}
                  className={cn(
                    'flex items-center justify-between rounded-2xl px-4 py-3 text-left text-body ring-1 transition-colors',
                    picked === null && 'bg-surface text-ink ring-line',
                    picked !== null && isRight && 'bg-success/10 text-ink ring-success',
                    picked !== null && chosen && !isRight && 'bg-danger/10 text-ink ring-danger',
                    picked !== null && !chosen && !isRight && 'bg-surface text-ink-tertiary ring-line',
                  )}
                >
                  <span>{opt}</span>
                  {picked !== null && isRight && <Check className="size-4 text-success" />}
                  {picked !== null && chosen && !isRight && <X className="size-4 text-danger" />}
                </button>
              )
            })}
          </div>

          {/* §19 requires step-by-step solutions, not just the answer. */}
          {picked !== null && (
            <div className="mt-4 rounded-xl bg-surface-secondary px-3 py-3">
              <p className="text-label text-ink-secondary">How to solve it</p>
              <ol className="mt-1 list-inside list-decimal text-body-sm text-ink">
                {q.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          )}
        </Card>

        {picked !== null && (
          <div className="mt-4">
            <Button onClick={next}>
              {index + 1 >= round.length ? 'Finish' : 'Next question'}
            </Button>
          </div>
        )}
      </div>
    )
  }

  /* ------------------------------------------------------------- levels --- */
  return (
    <div className="page-x pb-24 pt-4">
      <button
        onClick={() => navigate('/tools')}
        className="mb-2 flex items-center gap-1 text-label text-ink-secondary"
      >
        <ChevronLeft className="size-4" /> Tools
      </button>
      <h1 className="text-h1 text-ink">Math Mind</h1>
      <p className="mt-1 text-body-sm text-ink-secondary">
        Five levels, each with different mathematics. Clear a level at 80% to unlock the next.
      </p>

      {!!progress?.rounds && (
        <Card className="mt-4 flex items-center gap-4 px-4 py-3">
          <Brain className="size-5 text-accent" />
          <div>
            <p className="text-body font-semibold text-ink">
              {progress.rounds} round{progress.rounds === 1 ? '' : 's'} played
            </p>
            <p className="text-label text-ink-secondary">Overall accuracy {progress.accuracy}%</p>
          </div>
        </Card>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {LEVEL_NAMES.map((name, i) => {
          const lv = i + 1
          const open = lv <= unlocked
          const stat = progress?.levels?.find((l) => Number(l.level) === lv)
          return (
            <Card key={name} className="px-4 py-4">
              <div className="flex items-center gap-2">
                <span className="text-body font-semibold text-ink">
                  {lv}. {name}
                </span>
                {!open && <Lock className="size-4 text-ink-tertiary" />}
                {stat && <Pill>Best {stat.best_pct}%</Pill>}
              </div>
              <p className="mt-1 text-label text-ink-secondary">
                {[
                  'Single-step arithmetic',
                  'Two steps, BODMAS and fractions',
                  'Percentages, ratios, averages, equations',
                  'Quadratics, indices, series, simultaneous',
                  'Logarithms, trigonometry, calculus, permutations',
                ][i]}
              </p>
              <div className="mt-3">
                <Button variant={open ? 'primary' : 'tertiary'} disabled={!open} onClick={() => start(lv)}>
                  {open ? 'Start' : `Clear ${LEVEL_NAMES[i - 1]} first`}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
