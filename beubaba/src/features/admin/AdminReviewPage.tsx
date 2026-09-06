/**
 * MCQ review desk (Phase 3A-2, instruction PART A).
 *
 * Reviews the imported question bank one question at a time. The answer key is
 * shown here BECAUSE the caller is an authorised reviewer — the underlying RPC
 * re-checks `review_questions` permission inside PostgreSQL, so this screen
 * cannot be used to leak keys by tampering with the client.
 *
 * Uses the existing BEU BABA visual system (glass cards, pills, page-x layout,
 * existing Button/Card/Pill primitives). No new design language is introduced.
 */
import { renderMath } from '@/components/ui/MathText'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  CheckCircle2,
  ShieldCheck,
  XCircle,
  SkipForward,
  Database,
  AlertTriangle,
  Pencil,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useToast } from '@/components/feedback/Toast'
import { reviewService, type ReviewStatus, type EditPayload } from '@/services/reviewService'
import { ReviewEditForm } from './ReviewEditForm'
import { cn } from '@/lib/cn'

const STATUS_TABS: { key: ReviewStatus | 'all'; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'verified', label: 'Verified' },
  { key: 'published', label: 'Published' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'skipped', label: 'Skipped' },
  { key: 'all', label: 'All' },
]

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const
const TYPES = ['single', 'multi', 'truefalse', 'assertion_reason'] as const

const TYPE_LABEL: Record<string, string> = {
  single: 'Single answer',
  multi: 'Multiple answers',
  truefalse: 'True / false',
  assertion_reason: 'Assertion–reason',
}

const PAGE = 10

export function AdminReviewPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const toast = useToast()

  const [status, setStatus] = useState<ReviewStatus | 'all'>('pending')
  const [difficulty, setDifficulty] = useState<string | null>(null)
  const [qtype, setQtype] = useState<string | null>(null)
  const [pack, setPack] = useState<string | null>(null)
  const [subject, setSubject] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [busy, setBusy] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  // Bulk selection is per-page on purpose: it must never become "select all
  // 22,834 questions" by accident.
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const available = reviewService.isAvailable()

  const { data: facets } = useQuery({
    queryKey: ['admin', 'review', 'facets'],
    queryFn: () => reviewService.facets(),
    enabled: available,
  })

  const filter = useMemo(
    () => ({
      status,
      difficulty,
      questionType: qtype,
      sourcePack: pack,
      subjectCode: subject,
      search: search.trim() || null,
      limit: PAGE,
      offset: page * PAGE,
    }),
    [status, difficulty, qtype, pack, subject, search, page],
  )

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'review', filter],
    queryFn: () => reviewService.list(filter),
    enabled: available,
  })

  function refresh() {
    qc.invalidateQueries({ queryKey: ['admin', 'review'] })
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function saveEdit(id: string, patch: EditPayload) {
    setBusy(id)
    try {
      await reviewService.edit(id, patch)
      // Re-read from the database so the badge shows the REAL state — an
      // academic edit demotes the question and we must not fake that locally.
      setEditing(null)
      await qc.invalidateQueries({ queryKey: ['admin', 'review'] })
      toast.success('Question saved')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save')
    } finally {
      setBusy(null)
    }
  }

  async function runBulk(action: 'verify' | 'publish') {
    const ids = [...selected]
    if (!ids.length) return
    if (action === 'publish' && !window.confirm(
      `Publish ${ids.length} question${ids.length === 1 ? '' : 's'}? Students will see them immediately.`,
    )) return
    setBusy('bulk')
    try {
      const res = await reviewService.bulkAction(ids, action)
      if (res.failed > 0) {
        // Never pretend a partial failure was a success.
        toast.error(
          `${res.succeeded} question${res.succeeded === 1 ? '' : 's'} updated · ` +
            `${res.failed} could not be ${action === 'publish' ? 'published' : 'verified'}`,
        )
      } else {
        toast.success(`${res.succeeded} question${res.succeeded === 1 ? '' : 's'} updated`)
      }
      setSelected(new Set())
      refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Bulk action failed')
    } finally {
      setBusy(null)
    }
  }

  async function act(id: string, fn: () => Promise<unknown>, ok: string) {
    setBusy(id)
    try {
      await fn()
      toast.success(ok)
      refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed')
    } finally {
      setBusy(null)
    }
  }

  // ---- Supabase-only feature: explain rather than render a dead screen -----
  if (!available) {
    return (
      <div className="page-x pb-8 pt-6">
        <header className="mb-4">
          <button
            onClick={() => navigate('/admin')}
            className="mb-3 flex items-center gap-1 text-body-sm font-semibold text-ink-secondary"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Admin
          </button>
          <h1 className="text-h1 text-ink">MCQ review</h1>
        </header>
        <Card as="glass" className="glass-highlight flex flex-col items-center gap-3 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-chip text-ink-secondary">
            <Database className="size-6" aria-hidden />
          </span>
          <p className="text-body font-semibold text-ink">Review desk needs the database</p>
          <p className="max-w-sm text-body-sm text-ink-secondary">
            The imported question bank lives in Supabase. This app is currently running on the
            local demo backend, so there is nothing to review here. Set{' '}
            <code className="rounded bg-chip px-1 font-mono text-caption">VITE_BACKEND=supabase</code>{' '}
            to enable it.
          </p>
        </Card>
      </div>
    )
  }

  const rows = data?.rows ?? []
  const total = data?.total ?? 0
  const pages = Math.ceil(total / PAGE)

  return (
    <div className="page-x pb-8 pt-6">
      <header className="mb-4">
        <button
          onClick={() => navigate('/admin')}
          className="mb-3 flex items-center gap-1 text-body-sm font-semibold text-ink-secondary"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Admin
        </button>
        <h1 className="text-h1 text-ink">MCQ review</h1>
        <p className="mt-1 text-body-sm text-ink-secondary">
          Imported questions are validated by script but not by a person. Nothing reaches a
          student quiz until it is verified and published here.
        </p>
      </header>

      {/* ---- counters ---- */}
      {facets ? (
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              ['Pending', facets.by_status?.pending ?? 0],
              ['Verified', facets.by_status?.verified ?? 0],
              ['Published', facets.by_status?.published ?? 0],
              ['Quarantined', facets.quarantined ?? 0],
            ] as const
          ).map(([label, n]) => (
            <Card key={label} as="glass" className="py-3 text-center">
              <p className="text-h3 text-ink">{n.toLocaleString()}</p>
              <p className="text-caption text-ink-tertiary">{label}</p>
            </Card>
          ))}
        </div>
      ) : null}

      {/* ---- status tabs ---- */}
      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setStatus(t.key)
              setPage(0)
            }}
            className={cn(
              'shrink-0 rounded-pill px-3.5 py-1.5 text-caption font-semibold transition-colors',
              status === t.key
                ? 'bg-accent text-white shadow-soft'
                : 'bg-chip text-ink-secondary ring-1 ring-[var(--glass-border)] hover:text-ink',
            )}
          >
            {t.label}
            {facets?.by_status?.[t.key] ? ` (${facets.by_status[t.key]})` : ''}
          </button>
        ))}
      </div>

      {/* ---- filters ---- */}
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0)
          }}
          placeholder="Search question text…"
          className="min-w-[12rem] flex-1 rounded-xl bg-chip px-3 py-2 text-body-sm text-ink ring-1 ring-[var(--glass-border)] placeholder:text-ink-tertiary"
        />
        <select
          value={difficulty ?? ''}
          onChange={(e) => {
            setDifficulty(e.target.value || null)
            setPage(0)
          }}
          className="rounded-xl bg-chip px-3 py-2 text-body-sm text-ink ring-1 ring-[var(--glass-border)]"
        >
          <option value="">Any difficulty</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={qtype ?? ''}
          onChange={(e) => {
            setQtype(e.target.value || null)
            setPage(0)
          }}
          className="rounded-xl bg-chip px-3 py-2 text-body-sm text-ink ring-1 ring-[var(--glass-border)]"
        >
          <option value="">Any type</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABEL[t]}
            </option>
          ))}
        </select>
        <select
          value={pack ?? ''}
          onChange={(e) => {
            setPack(e.target.value || null)
            setPage(0)
          }}
          className="max-w-[14rem] rounded-xl bg-chip px-3 py-2 text-body-sm text-ink ring-1 ring-[var(--glass-border)]"
        >
          <option value="">Any source pack</option>
          {Object.keys(facets?.by_pack ?? {}).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={subject ?? ''}
          onChange={(e) => {
            setSubject(e.target.value || null)
            setPage(0)
          }}
          className="max-w-[14rem] rounded-xl bg-chip px-3 py-2 text-body-sm text-ink ring-1 ring-[var(--glass-border)]"
        >
          <option value="">Any subject</option>
          {(facets?.subjects ?? []).slice(0, 60).map((s) => (
            <option key={s.subject_code} value={s.subject_code}>
              {s.subject_name ?? s.subject_code} ({s.pending})
            </option>
          ))}
        </select>
      </div>

      {/* ---- bulk selection toolbar ---- */}
      {rows.length > 0 ? (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-chip px-3 py-2 ring-1 ring-[var(--glass-border)]">
          <label className="flex items-center gap-2 text-caption font-semibold text-ink-secondary">
            <input
              type="checkbox"
              checked={rows.length > 0 && rows.every((r) => selected.has(r.id))}
              onChange={(e) =>
                setSelected(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())
              }
              className="size-4 accent-[var(--color-accent)]"
            />
            Select this page ({rows.length})
          </label>
          <span className="text-caption text-ink-tertiary">{selected.size} selected</span>
          <div className="ml-auto flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={selected.size === 0 || busy === 'bulk'}
              onClick={() => runBulk('verify')}
            >
              Verify
            </Button>
            <Button
              size="sm"
              disabled={selected.size === 0 || busy === 'bulk'}
              loading={busy === 'bulk'}
              onClick={() => runBulk('publish')}
            >
              Verify &amp; publish
            </Button>
          </div>
        </div>
      ) : null}

      {/* ---- queue ---- */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Card as="glass" className="flex flex-col items-center gap-2 py-10 text-center">
          <CheckCircle2 className="size-8 text-success" aria-hidden />
          <p className="text-body font-semibold text-ink">Nothing here</p>
          <p className="text-body-sm text-ink-secondary">
            No questions match these filters.
          </p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((q) => (
            <li key={q.id}>
              <Card as="glass" className="glass-highlight flex flex-col gap-3">
                {/* meta */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={selected.has(q.id)}
                    onChange={() => toggleSelected(q.id)}
                    aria-label="Select question for bulk action"
                    className="mr-1 size-4 accent-[var(--color-accent)]"
                  />
                  <Pill tone="accent">{q.subject_name ?? q.subject_code ?? '—'}</Pill>
                  <Pill>{TYPE_LABEL[q.question_type] ?? q.question_type}</Pill>
                  <Pill>{q.difficulty}</Pill>
                  {q.unit_index != null ? <Pill>Unit {q.unit_index + 1}</Pill> : null}
                  {q.published ? (
                    <Pill tone="success">Published</Pill>
                  ) : q.human_verified ? (
                    <Pill tone="success">Verified</Pill>
                  ) : (
                    <Pill tone="warning">Not reviewed</Pill>
                  )}
                  {q.edited_after_review ? (
                    <Pill tone="warning">Edited — needs re-review</Pill>
                  ) : null}
                </div>

                {editing === q.id ? (
                  <ReviewEditForm
                    question={q}
                    saving={busy === q.id}
                    onCancel={() => setEditing(null)}
                    onSave={(patch) => saveEdit(q.id, patch)}
                  />
                ) : (
                  <>
                <p className="text-body font-semibold text-ink">{renderMath(q.stem)}</p>

                {/* options + answer key (reviewer only) */}
                <ol className="flex flex-col gap-1.5">
                  {q.options.map((o, i) => (
                    <li
                      key={o.id}
                      className={cn(
                        'flex items-start gap-2 rounded-xl px-3 py-2 text-body-sm ring-1',
                        o.is_correct
                          ? 'bg-success-soft text-ink ring-[var(--success)]'
                          : 'bg-chip text-ink-secondary ring-[var(--glass-border)]',
                      )}
                    >
                      <span className="font-mono text-caption text-ink-tertiary">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1">{renderMath(o.label)}</span>
                      {o.is_correct ? (
                        <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />
                      ) : null}
                    </li>
                  ))}
                </ol>

                {q.explanation ? (
                  <p className="rounded-xl bg-chip px-3 py-2 text-body-sm text-ink-secondary">
                    <span className="font-semibold text-ink">Why: </span>
                    {q.explanation}
                  </p>
                ) : null}

                {/* provenance */}
                <p className="font-mono text-caption text-ink-tertiary">
                  {q.source_ref ?? '—'}
                  {q.branches.length > 1
                    ? ` · shared by ${q.branches.length} branches`
                    : q.branches[0]?.branch_name
                      ? ` · ${q.branches[0].branch_name}`
                      : ''}
                </p>

                {/* actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={busy === q.id}
                    onClick={() =>
                      act(q.id, () => reviewService.publish(q.id), 'Verified & published')
                    }
                  >
                    <ShieldCheck className="size-4" aria-hidden />
                    Verify &amp; publish
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy === q.id}
                    onClick={() => act(q.id, () => reviewService.verify(q.id), 'Verified')}
                  >
                    <CheckCircle2 className="size-4" aria-hidden />
                    Verify only
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy === q.id}
                    onClick={() =>
                      act(
                        q.id,
                        () => reviewService.reject(q.id, 'manual_review', 'Rejected in review'),
                        'Moved to quarantine',
                      )
                    }
                  >
                    <XCircle className="size-4" aria-hidden />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy === q.id}
                    onClick={() => setEditing(q.id)}
                  >
                    <Pencil className="size-4" aria-hidden />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="tertiary"
                    disabled={busy === q.id}
                    onClick={() => act(q.id, () => reviewService.skip(q.id), 'Skipped')}
                  >
                    <SkipForward className="size-4" aria-hidden />
                    Skip
                  </Button>
                </div>
                  </>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}

      {/* ---- pagination: never loads the whole bank ---- */}
      {pages > 1 ? (
        <div className="mt-4 flex items-center justify-between">
          <Button
            size="sm"
            variant="secondary"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </Button>
          <p className="text-caption text-ink-tertiary">
            Page {page + 1} of {pages} · {total.toLocaleString()} questions
          </p>
          <Button
            size="sm"
            variant="secondary"
            disabled={page + 1 >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}

      <p className="mt-6 flex items-start gap-2 text-caption text-ink-tertiary">
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        Editing a published question&apos;s wording or options sends it back to Pending and
        removes it from live quizzes until it is reviewed again.
      </p>
    </div>
  )
}
