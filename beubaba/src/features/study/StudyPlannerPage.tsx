/**
 * Study progress + exam planner.
 *
 * The gap this fills: a student could read the syllabus but never record what
 * they had actually studied, so the app could not answer "how much is left?".
 *
 * Here they tick off units, set an exam date, and get a day-by-day plan over
 * whatever is still unstudied. The plan is computed in the database from real
 * numbers (units remaining ÷ days left), so it is the same on every device and
 * updates the moment a unit is ticked.
 *
 * Built from the existing Card / Pill / Button primitives.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, CalendarClock, Check, ListChecks, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useToast } from '@/components/feedback/Toast'
import { studyProgressService } from '@/services/studyProgressService'
import { quizService } from '@/services/quizService'

export function StudyPlannerPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const qc = useQueryClient()
  const [open, setOpen] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const { data: summary, isLoading } = useQuery({
    queryKey: ['study-summary'],
    queryFn: () => studyProgressService.summary(),
  })

  // Subjects the student can actually study, to add a new one from.
  const { data: subjects } = useQuery({
    queryKey: ['quiz-subjects', 'all'],
    queryFn: () => quizService.listSubjects(),
  })

  const { data: plan } = useQuery({
    queryKey: ['study-plan', open],
    queryFn: () => studyProgressService.plan(open as string),
    enabled: !!open,
  })

  const { data: studied } = useQuery({
    queryKey: ['studied-units', open],
    queryFn: () => studyProgressService.studiedUnits(open as string),
    enabled: !!open,
  })

  async function setDate(code: string, name: string, value: string) {
    setBusy(true)
    try {
      await studyProgressService.setExamDate(code, value || null, name)
      await qc.invalidateQueries({ queryKey: ['study-summary'] })
      await qc.invalidateQueries({ queryKey: ['study-plan'] })
      toast.success(value ? 'Exam date saved.' : 'Exam date cleared.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save.')
    }
    setBusy(false)
  }

  async function toggle(code: string, unit: number, title: string) {
    setBusy(true)
    try {
      await studyProgressService.toggleUnit(code, unit, title)
      await qc.invalidateQueries({ queryKey: ['study-summary'] })
      await qc.invalidateQueries({ queryKey: ['study-plan', code] })
      await qc.invalidateQueries({ queryKey: ['studied-units', code] })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not update.')
    }
    setBusy(false)
  }

  const rows = summary ?? []
  const tracked = new Set(rows.map((r) => r.subject_code))
  const addable = (subjects ?? []).filter((s) => !tracked.has(s.code)).slice(0, 60)

  return (
    <div className="page-x pb-24 pt-4">
      <button
        onClick={() => navigate('/study')}
        className="mb-2 flex items-center gap-1 text-label text-ink-secondary"
      >
        <ChevronLeft className="size-4" /> Study
      </button>
      <h1 className="text-h1 text-ink">Exam planner</h1>
      <p className="mt-1 text-body-sm text-ink-secondary">
        Tick off what you have studied, set your exam date, and get a day-by-day plan for
        what is left.
      </p>

      {isLoading && (
        <div className="mt-4 flex flex-col gap-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && !rows.length && (
        <Card className="mt-4 px-4 py-5">
          <ListChecks className="size-6 text-accent" />
          <p className="mt-2 text-body text-ink">Nothing tracked yet.</p>
          <p className="mt-1 text-body-sm text-ink-secondary">
            Pick a subject below and set its exam date to start.
          </p>
        </Card>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {rows.map((r) => {
          const isOpen = open === r.subject_code
          const urgent = r.days_left !== null && r.days_left <= 7 && r.percent < 80
          return (
            <Card key={r.subject_code} className="px-4 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-body font-semibold text-ink">{r.subject_name}</span>
                <Pill>{r.percent}% done</Pill>
                {r.days_left !== null && (
                  <Pill>
                    {r.days_left < 0
                      ? 'exam passed'
                      : r.days_left === 0
                        ? 'exam today'
                        : `${r.days_left} day${r.days_left === 1 ? '' : 's'} left`}
                  </Pill>
                )}
              </div>

              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-secondary">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${Math.max(2, r.percent)}%` }}
                />
              </div>
              <p className="mt-1.5 text-label text-ink-secondary">
                {r.studied_units} of {r.total_units} units studied
              </p>

              {/* The honest warning a student needs, not a cheerful one. */}
              {urgent && (
                <div className="mt-2 flex items-start gap-2 rounded-xl bg-surface-secondary px-3 py-2">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                  <p className="text-label text-ink">
                    {r.total_units - r.studied_units} unit
                    {r.total_units - r.studied_units === 1 ? '' : 's'} left in {r.days_left} day
                    {r.days_left === 1 ? '' : 's'}.
                  </p>
                </div>
              )}

              <div className="mt-3 flex flex-col gap-2">
                <div>
                  <label
                    htmlFor={`d-${r.subject_code}`}
                    className="mb-1 block text-label text-ink-secondary"
                  >
                    Exam date
                  </label>
                  <input
                    id={`d-${r.subject_code}`}
                    type="date"
                    value={r.exam_on ?? ''}
                    onChange={(e) => setDate(r.subject_code, r.subject_name, e.target.value)}
                    className="w-full rounded-xl bg-surface-secondary px-3 py-2 text-body-sm text-ink ring-1 ring-line focus:ring-accent"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setOpen(isOpen ? null : r.subject_code)}
                  >
                    {isOpen ? 'Hide plan' : 'Show plan'}
                  </Button>
                  <Button variant="tertiary" onClick={() => navigate(`/quiz/bank-${r.subject_code}`)}>
                    Practise
                  </Button>
                </div>
              </div>

              {isOpen && (
                <div className="mt-3 rounded-xl bg-surface-secondary px-3 py-3">
                  {/* Units, tickable */}
                  <p className="text-label text-ink-secondary">Units — tap to mark as studied</p>
                  <div className="mt-2 flex flex-col gap-1.5">
                    {Array.from({ length: r.total_units }).map((_, u) => {
                      const done = (studied ?? []).includes(u)
                      return (
                        <button
                          key={u}
                          disabled={busy}
                          onClick={() => toggle(r.subject_code, u, `Unit ${u + 1}`)}
                          className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-left text-body-sm text-ink ring-1 ring-line disabled:opacity-60"
                        >
                          <span
                            className={`flex size-5 shrink-0 items-center justify-center rounded-md ring-1 ${
                              done ? 'bg-accent ring-accent' : 'bg-surface-secondary ring-line'
                            }`}
                          >
                            {done && <Check className="size-3.5 text-white" />}
                          </span>
                          <span className={done ? 'line-through opacity-60' : ''}>
                            Unit {u + 1}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Day-by-day plan */}
                  <p className="mt-3 flex items-center gap-1.5 text-label text-ink-secondary">
                    <CalendarClock className="size-4" /> Your plan
                  </p>
                  {!r.exam_on && (
                    <p className="mt-1 text-body-sm text-ink-secondary">
                      Set an exam date to get a plan.
                    </p>
                  )}
                  {r.exam_on && !(plan ?? []).length && (
                    <p className="mt-1 text-body-sm text-ink-secondary">
                      {r.percent === 100
                        ? 'All units done. Revise and practise questions.'
                        : 'No plan — the exam date has passed.'}
                    </p>
                  )}
                  {!!(plan ?? []).length && (
                    <div className="mt-1.5 flex flex-col gap-1">
                      {(plan ?? []).map((d) => (
                        <div
                          key={`${d.day_number}-${d.unit_index}`}
                          className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-body-sm"
                        >
                          <span className="text-ink">{d.unit_title}</span>
                          <span className="text-label text-ink-secondary">
                            {new Date(d.plan_date).toLocaleDateString(undefined, {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Add a subject to track */}
      {!!addable.length && (
        <Card className="mt-5 px-4 py-4">
          <p className="text-body font-semibold text-ink">Track another subject</p>
          <p className="mt-0.5 text-label text-ink-secondary">
            Pick one and set its exam date.
          </p>
          <select
            defaultValue=""
            onChange={(e) => {
              const s = addable.find((x) => x.code === e.target.value)
              if (s) {
                const d = new Date()
                d.setDate(d.getDate() + 14)
                void setDate(s.code, s.name, d.toISOString().slice(0, 10))
              }
              e.currentTarget.value = ''
            }}
            className="mt-2 w-full rounded-xl bg-surface-secondary px-3 py-2.5 text-body text-ink ring-1 ring-line focus:ring-accent"
          >
            <option value="">Choose a subject…</option>
            {addable.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </Card>
      )}
    </div>
  )
}
