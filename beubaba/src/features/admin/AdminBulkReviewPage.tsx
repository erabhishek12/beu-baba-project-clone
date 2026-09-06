/**
 * Bulk review desk (Phase 4).
 *
 * WHY THIS EXISTS
 * ---------------
 * 22,826 questions were waiting for review. One-at-a-time review would take
 * months, so students effectively saw a single subject. This screen shows
 * progress per subject and lets a reviewer publish, in one action, every
 * question in a subject that passes STRICT automated checks.
 *
 * SAFETY
 * ------
 * Nothing publishes without a preview first: the "Check" button runs a dry run
 * and reports exactly how many would go live and why the rest are refused.
 * Only then does "Publish" appear. Every publish is stamped with a batch id
 * and can be undone with one click.
 *
 * The gate itself lives in PostgreSQL (bulk_publish_safe), so tampering with
 * this page cannot publish an unsafe question.
 *
 * Uses the existing BEU BABA visual system only — no new design language.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ShieldCheck, Undo2, Layers, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useToast } from '@/components/feedback/Toast'
import { reviewService, type BulkPublishResult } from '@/services/reviewService'

const REASON_LABELS: Record<string, string> = {
  quarantined: 'Quarantined source',
  too_few_options: 'Fewer than 2 options',
  not_exactly_one_correct: 'Not exactly one correct answer',
  duplicate_options: 'Duplicate option text',
  stem_too_short: 'Question text too short',
}

export function AdminBulkReviewPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const qc = useQueryClient()
  const [busy, setBusy] = useState<string | null>(null)
  const [preview, setPreview] = useState<Record<string, BulkPublishResult>>({})
  const [lastBatch, setLastBatch] = useState<{ id: string; n: number } | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['review-progress'],
    queryFn: () => reviewService.progress(),
  })

  async function check(subject: string) {
    setBusy(subject)
    try {
      const r = await reviewService.bulkPublishSafe(subject, 5000, true)
      setPreview((p) => ({ ...p, [subject]: r }))
      if (r.would_publish === 0) toast.error('Nothing in this subject passes the safety checks.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not check this subject.')
    } finally {
      setBusy(null)
    }
  }

  async function publish(subject: string) {
    setBusy(subject)
    try {
      const r = await reviewService.bulkPublishSafe(subject, 5000, false)
      setLastBatch({ id: r.batch_id, n: r.published })
      setPreview((p) => {
        const next = { ...p }
        delete next[subject]
        return next
      })
      toast.success(`Published ${r.published.toLocaleString()} questions.`)
      await qc.invalidateQueries({ queryKey: ['review-progress'] })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not publish.')
    } finally {
      setBusy(null)
    }
  }

  async function undo() {
    if (!lastBatch) return
    setBusy('undo')
    try {
      const n = await reviewService.undoBatch(lastBatch.id)
      toast.success(`Reverted ${n.toLocaleString()} questions back to pending.`)
      setLastBatch(null)
      await qc.invalidateQueries({ queryKey: ['review-progress'] })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not undo.')
    } finally {
      setBusy(null)
    }
  }

  const rows = data ?? []
  const totals = rows.reduce(
    (a, r) => ({
      total: a.total + Number(r.total),
      pending: a.pending + Number(r.pending),
      published: a.published + Number(r.published),
      eligible: a.eligible + Number(r.eligible),
    }),
    { total: 0, pending: 0, published: 0, eligible: 0 },
  )

  return (
    <div className="page-x pb-24 pt-4">
      <button
        onClick={() => navigate('/admin')}
        className="mb-2 flex items-center gap-1 text-label text-ink-secondary"
      >
        <ChevronLeft className="size-4" /> Admin
      </button>

      <h1 className="text-h1 text-ink">Bulk review</h1>
      <p className="mt-1 text-body-sm text-ink-secondary">
        Publish a whole subject at once. Only questions that pass strict automatic checks are
        published — anything doubtful stays pending for a human.
      </p>

      {/* Totals */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total', value: totals.total },
          { label: 'Pending', value: totals.pending },
          { label: 'Published', value: totals.published },
          { label: 'Ready to publish', value: totals.eligible },
        ].map((s) => (
          <Card key={s.label} className="px-4 py-3">
            <div className="text-h2 text-ink">{s.value.toLocaleString()}</div>
            <div className="text-label text-ink-secondary">{s.label}</div>
          </Card>
        ))}
      </div>

      {lastBatch && (
        <Card className="mt-4 flex items-center justify-between px-4 py-3">
          <div className="text-body-sm text-ink">
            Published {lastBatch.n.toLocaleString()} questions in the last action.
          </div>
          <Button variant="secondary" loading={busy === 'undo'} onClick={undo}>
            <Undo2 className="size-4" /> Undo
          </Button>
        </Card>
      )}

      {error && (
        <Card className="mt-4 px-4 py-3 text-body-sm text-ink">
          <AlertTriangle className="mb-1 size-5 text-warning" />
          {error instanceof Error ? error.message : 'Could not load progress.'}
        </Card>
      )}

      {isLoading && (
        <div className="mt-4 flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {rows.map((r) => {
          const p = preview[r.subject_code]
          const done = Number(r.total) > 0 ? Number(r.published) / Number(r.total) : 0
          return (
            <Card key={r.subject_code} className="px-4 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <Layers className="size-4 text-accent" />
                <span className="text-body font-semibold text-ink">{r.subject_name}</span>
                <Pill>{r.subject_code}</Pill>
                {Number(r.eligible) > 0 && <Pill>{Number(r.eligible).toLocaleString()} ready</Pill>}
              </div>

              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-secondary">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${Math.round(done * 100)}%` }}
                />
              </div>
              <div className="mt-1.5 text-label text-ink-secondary">
                {Number(r.published).toLocaleString()} published ·{' '}
                {Number(r.pending).toLocaleString()} pending ·{' '}
                {Number(r.quarantined).toLocaleString()} quarantined
              </div>

              {p && (
                <div className="mt-3 rounded-xl bg-surface-secondary px-3 py-2">
                  <div className="text-body-sm text-ink">
                    {p.would_publish.toLocaleString()} would be published,{' '}
                    {p.skipped.toLocaleString()} refused.
                  </div>
                  <ul className="mt-1 flex flex-wrap gap-x-3 text-label text-ink-secondary">
                    {Object.entries(p.reason_counts)
                      .filter(([, v]) => Number(v) > 0)
                      .map(([k, v]) => (
                        <li key={k}>
                          {REASON_LABELS[k] ?? k}: {Number(v).toLocaleString()}
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  loading={busy === r.subject_code && !p}
                  disabled={Number(r.pending) === 0}
                  onClick={() => check(r.subject_code)}
                >
                  Check
                </Button>
                {p && p.would_publish > 0 && (
                  <Button loading={busy === r.subject_code} onClick={() => publish(r.subject_code)}>
                    <ShieldCheck className="size-4" />
                    Publish {p.would_publish.toLocaleString()}
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
