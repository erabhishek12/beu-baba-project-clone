/**
 * Question bank browser (admin spec §4).
 *
 * Filter and inspect all 22,868 questions. Deliberately paged — an admin
 * screen must never try to hold the whole bank in memory.
 *
 * Answer keys are NOT shown here. Reviewers see them through the MCQ review
 * desk, which the database gates on the `review_questions` permission; this
 * screen is for finding and triaging, so it queries only public columns.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, Search, ChevronRight, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/feedback/Skeleton'
import { adminService } from '@/services/adminService'
import { renderMath } from '@/components/ui/MathText'

const STATUSES = ['pending', 'verified', 'published', 'rejected', 'skipped']
const DIFFS = ['easy', 'medium', 'hard']
const TYPES = ['single', 'multi', 'truefalse', 'assertion_reason']

export function AdminQuestionsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [term, setTerm] = useState('')
  const [status, setStatus] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(0)
  const [tab, setTab] = useState<'bank' | 'quarantine'>('bank')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-questions', term, status, difficulty, type, page],
    queryFn: () => adminService.questions({ search: term, status, difficulty, type, page }),
    enabled: tab === 'bank',
  })
  const { data: quar, isLoading: lq } = useQuery({
    queryKey: ['admin-quarantine'],
    queryFn: () => adminService.quarantine(50),
    enabled: tab === 'quarantine',
  })

  const total = data?.total ?? 0
  const pages = Math.ceil(total / 25)

  function chip(active: boolean) {
    return `rounded-pill px-3 py-1.5 text-caption font-bold ${
      active ? 'bg-accent text-white' : 'bg-surface text-ink-secondary ring-1 ring-line'
    }`
  }

  return (
    <div className="page-x pb-24 pt-4">
      <button
        onClick={() => navigate('/admin')}
        className="mb-2 flex items-center gap-1 text-label text-ink-secondary"
      >
        <ChevronLeft className="size-4" /> Admin
      </button>
      <h1 className="text-h1 text-ink">Question bank</h1>
      <p className="mt-1 text-body-sm text-ink-secondary">
        Search and triage questions. Use MCQ review to verify or publish.
      </p>

      <div className="mt-3 flex gap-2">
        <button onClick={() => setTab('bank')} className={chip(tab === 'bank')}>
          All questions
        </button>
        <button onClick={() => setTab('quarantine')} className={chip(tab === 'quarantine')}>
          Quarantine
        </button>
      </div>

      {tab === 'bank' && (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setPage(0)
              setTerm(search)
            }}
            className="mt-3 flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-tertiary" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search question text…"
                aria-label="Search questions"
                className="w-full rounded-xl bg-surface-secondary py-2.5 pl-9 pr-3 text-body text-ink outline-none ring-1 ring-line focus:ring-accent"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatus(status === s ? '' : s)
                  setPage(0)
                }}
                className={chip(status === s)}
              >
                {s}
              </button>
            ))}
            {DIFFS.map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDifficulty(difficulty === d ? '' : d)
                  setPage(0)
                }}
                className={chip(difficulty === d)}
              >
                {d}
              </button>
            ))}
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(type === t ? '' : t)
                  setPage(0)
                }}
                className={chip(type === t)}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>

          <p className="mt-3 text-label text-ink-secondary">
            {total.toLocaleString()} question{total === 1 ? '' : 's'}
            {pages > 1 ? ` · page ${page + 1} of ${pages}` : ''}
          </p>

          {isLoading && (
            <div className="mt-3 flex flex-col gap-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
              ))}
            </div>
          )}

          <div className="mt-3 flex flex-col gap-2">
            {(data?.rows ?? []).map((q) => (
              <Card key={String(q.id)} className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Pill>{String(q.subject_name ?? q.subject_code)}</Pill>
                  <Pill>{String(q.difficulty)}</Pill>
                  <Pill>{String(q.question_type).replace('_', ' ')}</Pill>
                  <Pill>{String(q.review_status)}</Pill>
                  {q.published ? <Pill>live</Pill> : null}
                </div>
                <p className="mt-1.5 line-clamp-3 text-body-sm text-ink">
                  {renderMath(String(q.stem ?? ''))}
                </p>
                <p className="mt-1 truncate text-label text-ink-tertiary">
                  {String(q.unit_title ?? '')} {q.topic ? `· ${String(q.topic)}` : ''} ·{' '}
                  {String(q.source_pack ?? '')} {q.source_ref ? `· ${String(q.source_ref)}` : ''}
                </p>
              </Card>
            ))}
          </div>

          {pages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <Button variant="secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="size-4" /> Previous
              </Button>
              <Button
                variant="secondary"
                disabled={page + 1 >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {tab === 'quarantine' && (
        <>
          <p className="mt-3 text-body-sm text-ink-secondary">
            Source rows the importer refused. These never reach students.
          </p>
          {lq && <Skeleton className="mt-3 h-24 w-full rounded-2xl" />}
          <div className="mt-3 flex flex-col gap-2">
            {(quar ?? []).map((r) => (
              <Card key={String(r.id)} className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <AlertTriangle className="size-4 text-warning" />
                  <Pill>{String(r.reason)}</Pill>
                  <Pill>{String(r.severity)}</Pill>
                  {r.subject_code ? <Pill>{String(r.subject_code)}</Pill> : null}
                </div>
                {r.detail ? (
                  <p className="mt-1.5 line-clamp-2 text-body-sm text-ink">{String(r.detail)}</p>
                ) : null}
                <p className="mt-1 truncate text-label text-ink-tertiary">
                  {String(r.source_pack ?? '')} · {String(r.source_ref ?? '')}
                </p>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
