/**
 * Revision Center (spec §20).
 *
 * The flow the spec asks for:
 *   Study → Practice → Identify Weak Area → Add to Revision → Revise →
 *   Practice Again → Track Improvement
 *
 * Wrong quiz answers arrive here automatically after a quiz is graded. Each
 * item moves through five spaced-repetition boxes: answer it right and it comes
 * back later, get it wrong and it returns immediately. Box 5 answered right =
 * mastered.
 *
 * Weak topics come from real per-topic accuracy, not a guess.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Check, X, Sparkles, Target, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/feedback/Skeleton'
import { revisionService } from '@/services/revisionService'

const BOX_LABEL = ['', 'New', 'Learning', 'Familiar', 'Strong', 'Almost mastered']

export function RevisionPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [busy, setBusy] = useState<string | null>(null)

  const { data: overview, isLoading } = useQuery({
    queryKey: ['revision-overview'],
    queryFn: () => revisionService.overview(),
  })
  const { data: due } = useQuery({
    queryKey: ['revision-due'],
    queryFn: () => revisionService.due(20),
  })

  async function mark(id: string, correct: boolean) {
    setBusy(id)
    try {
      await revisionService.mark(id, correct)
      await qc.invalidateQueries({ queryKey: ['revision-due'] })
      await qc.invalidateQueries({ queryKey: ['revision-overview'] })
    } finally {
      setBusy(null)
    }
  }

  const items = due ?? []

  return (
    <div className="page-x pb-24 pt-4">
      <button
        onClick={() => navigate('/tools')}
        className="mb-2 flex items-center gap-1 text-label text-ink-secondary"
      >
        <ChevronLeft className="size-4" /> Tools
      </button>
      <h1 className="text-h1 text-ink">Revision</h1>
      <p className="mt-1 text-body-sm text-ink-secondary">
        Questions you got wrong come back here until you know them.
      </p>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          ['Due now', overview?.due ?? 0],
          ['In revision', overview?.total ?? 0],
          ['Mastered', overview?.mastered ?? 0],
        ].map(([label, n]) => (
          <Card key={label as string} className="px-3 py-3">
            <div className="text-h2 text-ink">{Number(n).toLocaleString()}</div>
            <div className="text-label text-ink-secondary">{label as string}</div>
          </Card>
        ))}
      </div>

      {/* Weak topics — the "identify weak area" step of the spec flow. */}
      {!!overview?.weak_topics?.length && (
        <Card className="mt-4 px-4 py-4">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-warning" />
            <span className="text-body font-semibold text-ink">Topics to work on</span>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {overview.weak_topics.map((t) => (
              <div key={`${t.subject_code}-${t.topic}`}>
                <div className="flex items-center justify-between text-body-sm text-ink">
                  <span>{t.topic}</span>
                  <span className="text-ink-secondary">{Math.round(t.accuracy)}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-secondary">
                  <div
                    className="h-full rounded-full bg-warning"
                    style={{ width: `${Math.max(4, Math.round(t.accuracy))}%` }}
                  />
                </div>
                <p className="mt-0.5 text-label text-ink-tertiary">
                  {t.correct} right of {t.attempted}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <Button variant="secondary" onClick={() => navigate('/quiz')}>
              <Sparkles className="size-4" /> Practise these
            </Button>
          </div>
        </Card>
      )}

      <h2 className="mt-6 text-h3 text-ink">Due now</h2>

      {isLoading && (
        <div className="mt-3 flex flex-col gap-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && !items.length && (
        <Card className="mt-3 px-4 py-6 text-center">
          <CheckCircle2 className="mx-auto size-8 text-success" />
          <p className="mt-2 text-body text-ink">Nothing to revise right now.</p>
          <p className="mt-1 text-body-sm text-ink-secondary">
            Take a quiz — anything you get wrong will appear here automatically.
          </p>
          <div className="mt-3">
            <Button onClick={() => navigate('/quiz')}>Go to quizzes</Button>
          </div>
        </Card>
      )}

      <div className="mt-3 flex flex-col gap-3">
        {items.map((it) => (
          <Card key={it.id} className="px-4 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <Pill>{BOX_LABEL[it.box] ?? 'New'}</Pill>
              {it.topic && <Pill>{it.topic}</Pill>}
              {it.times_revised > 0 && (
                <span className="text-label text-ink-tertiary">
                  seen {it.times_revised}×
                </span>
              )}
            </div>
            <p className="mt-1.5 text-body text-ink">{it.title}</p>
            {it.subtitle && (
              <p className="mt-0.5 text-label text-ink-secondary">{it.subtitle}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                loading={busy === it.id}
                onClick={() => mark(it.id, true)}
              >
                <Check className="size-4" /> I know this
              </Button>
              <Button variant="tertiary" loading={busy === it.id} onClick={() => mark(it.id, false)}>
                <X className="size-4" /> Still hard
              </Button>
              {it.url && (
                <Button variant="tertiary" onClick={() => navigate(it.url as string)}>
                  Practise
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
