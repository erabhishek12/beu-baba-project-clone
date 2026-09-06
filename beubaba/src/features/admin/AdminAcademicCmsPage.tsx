/**
 * Academic CMS (admin spec §6) + PYQ management (§7) + Calendar (§19).
 *
 * Three closely-related datasets in one screen with tabs, rather than three
 * near-identical pages. Everything reads and writes through the existing RLS —
 * a student sees none of this.
 *
 * Bulk content changes still belong in the Import Center (JSON sync), which
 * handles add/update/delete transactionally with a dry run. This screen is for
 * looking things up and making one-off changes.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Search, Plus, Trash2, CalendarDays, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useToast } from '@/components/feedback/Toast'
import { TextField } from '@/components/forms/TextField'
import { adminService } from '@/services/adminService'

type Tab = 'subjects' | 'pyqs' | 'calendar'

const CATEGORIES = ['holiday', 'exam', 'result', 'admission', 'event', 'other']

export function AdminAcademicCmsPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('subjects')
  const [search, setSearch] = useState('')
  const [term, setTerm] = useState('')
  const [branch, setBranch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [busy, setBusy] = useState(false)

  // new calendar event
  const [evTitle, setEvTitle] = useState('')
  const [evStart, setEvStart] = useState('')
  const [evEnd, setEvEnd] = useState('')
  const [evCat, setEvCat] = useState('holiday')

  const { data: branches } = useQuery({
    queryKey: ['admin-branches'],
    queryFn: () => adminService.branches(),
  })
  const { data: subjects, isLoading: ls } = useQuery({
    queryKey: ['admin-subjects', branch, term],
    queryFn: () => adminService.subjects(branch || undefined, term),
    enabled: tab === 'subjects',
  })
  const { data: pyqs, isLoading: lp } = useQuery({
    queryKey: ['admin-pyqs', term],
    queryFn: () => adminService.pyqs(term),
    enabled: tab === 'pyqs',
  })
  const { data: events, isLoading: lc } = useQuery({
    queryKey: ['admin-calendar'],
    queryFn: () => adminService.calendarEvents(),
    enabled: tab === 'calendar',
  })

  const chip = (a: boolean) =>
    `rounded-pill px-3 py-1.5 text-caption font-bold ${
      a ? 'bg-accent text-white' : 'bg-surface text-ink-secondary ring-1 ring-line'
    }`

  async function act(fn: () => Promise<void>, msg: string, key: string) {
    try {
      await fn()
      toast.success(msg)
      await qc.invalidateQueries({ queryKey: [key] })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed.')
    }
  }

  async function addEvent() {
    if (!evTitle.trim() || !evStart) {
      toast.error('A title and start date are required.')
      return
    }
    setBusy(true)
    try {
      await adminService.createCalendarEvent({
        title: evTitle.trim(),
        starts_on: evStart,
        ends_on: evEnd || null,
        category: evCat,
      })
      toast.success('Event added.')
      setEvTitle('')
      setEvStart('')
      setEvEnd('')
      setShowForm(false)
      await qc.invalidateQueries({ queryKey: ['admin-calendar'] })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not add the event.')
    }
    setBusy(false)
  }

  return (
    <div className="page-x pb-24 pt-4">
      <button
        onClick={() => navigate('/admin')}
        className="mb-2 flex items-center gap-1 text-label text-ink-secondary"
      >
        <ChevronLeft className="size-4" /> Admin
      </button>
      <h1 className="text-h1 text-ink">Academic content</h1>
      <p className="mt-1 text-body-sm text-ink-secondary">
        Subjects, previous year papers and the academic calendar. For bulk
        changes use the Import Center.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {(['subjects', 'pyqs', 'calendar'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={chip(tab === t)}>
            {t === 'pyqs' ? 'PYQs' : t}
          </button>
        ))}
      </div>

      {/* -------------------------------- subjects ------------------------ */}
      {tab === 'subjects' && (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setTerm(search)
            }}
            className="mt-3 flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-tertiary" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Subject name or code…"
                aria-label="Search subjects"
                className="w-full rounded-xl bg-surface-secondary py-2.5 pl-9 pr-3 text-body text-ink outline-none ring-1 ring-line focus:ring-accent"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            aria-label="Filter by branch"
            className="mt-2 w-full rounded-xl bg-surface-secondary px-3 py-2.5 text-body text-ink ring-1 ring-line focus:ring-accent"
          >
            <option value="">All branches</option>
            {(branches ?? []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {ls && <Skeleton className="mt-3 h-24 w-full rounded-2xl" />}
          <p className="mt-3 text-label text-ink-secondary">
            {(subjects ?? []).length} subject{(subjects ?? []).length === 1 ? '' : 's'}
          </p>
          <div className="mt-2 flex flex-col gap-2">
            {(subjects ?? []).map((s) => (
              <Card key={String(s.id)} className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-body font-semibold text-ink">{String(s.name)}</span>
                  <Pill>{String(s.code)}</Pill>
                  {s.semester_number ? <Pill>Sem {String(s.semester_number)}</Pill> : null}
                  {s.credits ? <Pill>{String(s.credits)} cr</Pill> : null}
                  {!s.is_active && <Pill>inactive</Pill>}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* ---------------------------------- PYQs -------------------------- */}
      {tab === 'pyqs' && (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setTerm(search)
            }}
            className="mt-3 flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-tertiary" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Paper title or subject…"
                aria-label="Search papers"
                className="w-full rounded-xl bg-surface-secondary py-2.5 pl-9 pr-3 text-body text-ink outline-none ring-1 ring-line focus:ring-accent"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          {lp && <Skeleton className="mt-3 h-24 w-full rounded-2xl" />}
          <p className="mt-3 text-label text-ink-secondary">
            {(pyqs ?? []).length} paper{(pyqs ?? []).length === 1 ? '' : 's'}
          </p>
          <div className="mt-2 flex flex-col gap-2">
            {(pyqs ?? []).map((r) => {
              const id = String(r.id)
              const pub = Boolean(r.is_published)
              return (
                <Card key={id} className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-body font-semibold text-ink">
                      {String(r.title || r.subject_name || 'Paper')}
                    </span>
                    <Pill>{String(r.exam_year)}</Pill>
                    {r.exam_session ? <Pill>{String(r.exam_session)}</Pill> : null}
                    {!pub && <Pill>hidden</Pill>}
                  </div>
                  <p className="mt-0.5 text-label text-ink-secondary">
                    {String(r.subject_name ?? r.subject_code)}
                    {r.semester_number ? ` · Semester ${String(r.semester_number)}` : ''}
                  </p>
                  <div className="mt-2">
                    <Button
                      variant="secondary"
                      onClick={() =>
                        act(
                          () => adminService.setPyqPublished(id, !pub),
                          pub ? 'Paper hidden.' : 'Paper published.',
                          'admin-pyqs',
                        )
                      }
                    >
                      {pub ? 'Hide' : 'Publish'}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {/* -------------------------------- calendar ------------------------ */}
      {tab === 'calendar' && (
        <>
          <div className="mt-3">
            <Button onClick={() => setShowForm((v) => !v)}>
              {showForm ? <X className="size-4" /> : <Plus className="size-4" />}
              {showForm ? 'Cancel' : 'New event'}
            </Button>
          </div>

          {showForm && (
            <Card className="mt-3 flex flex-col gap-3 p-4">
              <TextField label="Title" value={evTitle} onChange={(e) => setEvTitle(e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Starts"
                  type="date"
                  value={evStart}
                  onChange={(e) => setEvStart(e.target.value)}
                />
                <TextField
                  label="Ends (optional)"
                  type="date"
                  value={evEnd}
                  onChange={(e) => setEvEnd(e.target.value)}
                />
              </div>
              <div>
                <p className="mb-1.5 text-label text-ink-secondary">Category</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button key={c} onClick={() => setEvCat(c)} className={chip(evCat === c)}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <Button loading={busy} onClick={addEvent}>
                <CalendarDays className="size-4" /> Add event
              </Button>
            </Card>
          )}

          {lc && <Skeleton className="mt-3 h-24 w-full rounded-2xl" />}
          <div className="mt-3 flex flex-col gap-2">
            {(events ?? []).map((e) => {
              const id = String(e.id)
              return (
                <Card key={id} className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-body font-semibold text-ink">{String(e.title)}</span>
                    <Pill>{String(e.category)}</Pill>
                  </div>
                  <p className="mt-0.5 text-label text-ink-secondary">
                    {new Date(String(e.starts_on)).toLocaleDateString()}
                    {e.ends_on ? ` → ${new Date(String(e.ends_on)).toLocaleDateString()}` : ''}
                  </p>
                  <div className="mt-2">
                    <Button
                      variant="danger"
                      onClick={() =>
                        act(
                          () => adminService.deleteCalendarEvent(id),
                          'Event deleted.',
                          'admin-calendar',
                        )
                      }
                    >
                      <Trash2 className="size-4" /> Delete
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
