/**
 * Admin banners / announcements (spec §34–§39).
 *
 * Create a banner with any combination of image, title, description, supporting
 * text and buttons — every field is optional. Choose how often each student
 * sees it, when it runs, who it targets, and whether it also becomes a
 * notification.
 *
 * The database enforces who may write here; this screen is only the form.
 * Built from the existing Card / Pill / Button primitives.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Megaphone, Trash2, Send, Plus, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useToast } from '@/components/feedback/Toast'
import { TextField } from '@/components/forms/TextField'
import { bannerService, type BannerFrequency } from '@/services/bannerService'
import { academicService } from '@/services/academicService'

const KINDS = ['announcement', 'festival', 'notice', 'exam', 'event', 'feature', 'course']

const FREQ: { value: BannerFrequency; label: string }[] = [
  { value: 'once_ever', label: 'Once ever' },
  { value: 'once_per_session', label: 'Once per app open' },
  { value: 'n_times', label: 'A set number of times' },
  { value: 'always', label: 'Every time' },
]

export function AdminBannersPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const qc = useQueryClient()
  const [busy, setBusy] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [supporting, setSupporting] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [kind, setKind] = useState('announcement')
  const [frequency, setFrequency] = useState<BannerFrequency>('once_ever')
  const [count, setCount] = useState(3)
  const [priority, setPriority] = useState(0)
  const [startsAt, setStartsAt] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [branchId, setBranchId] = useState('')
  const [semester, setSemester] = useState('')
  const [notify, setNotify] = useState(false)
  const [buttons, setButtons] = useState<{ label: string; target: string }[]>([])

  const { data: banners, isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => bannerService.listAll(),
  })
  const { data: stats } = useQuery({
    queryKey: ['admin-banner-stats'],
    queryFn: () => bannerService.stats(),
  })
  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: () => academicService.listBranches(),
  })

  function reset() {
    setTitle(''); setDescription(''); setSupporting(''); setImageUrl('')
    setKind('announcement'); setFrequency('once_ever'); setCount(3); setPriority(0)
    setStartsAt(''); setExpiresAt(''); setBranchId(''); setSemester('')
    setNotify(false); setButtons([])
  }

  async function create() {
    // Every field is optional individually, but a banner with nothing in it
    // would show an empty box to students.
    if (!title.trim() && !description.trim() && !imageUrl.trim()) {
      toast.error('Add at least a title, description or image.')
      return
    }
    setBusy(true)
    try {
      const targets =
        branchId || semester
          ? [{ branch_id: branchId || null, semester_number: semester ? Number(semester) : null }]
          : []
      const id = await bannerService.create({
        title: title.trim(),
        description: description.trim() || null,
        supporting_text: supporting.trim() || null,
        image_path: imageUrl.trim() || null,
        kind,
        frequency,
        frequency_count: count,
        priority,
        is_active: true,
        starts_at: startsAt ? new Date(startsAt).toISOString() : null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        send_notification: notify,
        buttons: buttons.filter((b) => b.label.trim() && b.target.trim()),
        targets,
      })
      if (notify) {
        const n = await bannerService.sendNotification(id).catch(() => 0)
        toast.success(`Banner created. Notified ${n} student(s).`)
      } else {
        toast.success('Banner created.')
      }
      reset()
      setShowForm(false)
      await qc.invalidateQueries({ queryKey: ['admin-banners'] })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not create the banner.')
    }
    setBusy(false)
  }

  async function toggle(id: string, active: boolean) {
    await bannerService.setActive(id, active).catch(() => undefined)
    await qc.invalidateQueries({ queryKey: ['admin-banners'] })
  }

  async function remove(id: string) {
    await bannerService.remove(id).catch(() => undefined)
    await qc.invalidateQueries({ queryKey: ['admin-banners'] })
    toast.success('Banner deleted.')
  }

  return (
    <div className="page-x pb-24 pt-4">
      <button
        onClick={() => navigate('/admin')}
        className="mb-2 flex items-center gap-1 text-label text-ink-secondary"
      >
        <ChevronLeft className="size-4" /> Admin
      </button>
      <h1 className="text-h1 text-ink">Banners</h1>
      <p className="mt-1 text-body-sm text-ink-secondary">
        Announcements shown when a student opens the app. You choose how often each
        student sees one.
      </p>

      <div className="mt-4">
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X className="size-4" /> : <Plus className="size-4" />}
          {showForm ? 'Cancel' : 'New banner'}
        </Button>
      </div>

      {showForm && (
        <Card className="mt-4 flex flex-col gap-3 p-4">
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div>
            <label htmlFor="bdesc" className="mb-1.5 block text-label text-ink-secondary">
              Description
            </label>
            <textarea
              id="bdesc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl bg-surface-secondary px-3 py-2 text-body text-ink outline-none ring-1 ring-line focus:ring-accent"
            />
          </div>
          <TextField
            label="Supporting text (optional)"
            value={supporting}
            onChange={(e) => setSupporting(e.target.value)}
          />
          <TextField
            label="Image URL (optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />

          <div>
            <p className="mb-1.5 text-label text-ink-secondary">Type</p>
            <div className="flex flex-wrap gap-2">
              {KINDS.map((k) => (
                <button
                  key={k}
                  onClick={() => setKind(k)}
                  className={`rounded-pill px-3 py-1.5 text-caption font-bold ${
                    kind === k ? 'bg-accent text-white' : 'bg-surface text-ink-secondary ring-1 ring-line'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-label text-ink-secondary">How often each student sees it</p>
            <div className="flex flex-wrap gap-2">
              {FREQ.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFrequency(f.value)}
                  className={`rounded-pill px-3 py-1.5 text-caption font-bold ${
                    frequency === f.value
                      ? 'bg-accent text-white'
                      : 'bg-surface text-ink-secondary ring-1 ring-line'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {frequency === 'n_times' && (
              <div className="mt-2 w-32">
                <TextField
                  label="How many times"
                  type="number"
                  value={String(count)}
                  onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Starts (optional)"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
            <TextField
              label="Expires (optional)"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="bbranch" className="mb-1.5 block text-label text-ink-secondary">
                Branch (optional)
              </label>
              <select
                id="bbranch"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full rounded-xl bg-surface-secondary px-3 py-2.5 text-body text-ink ring-1 ring-line focus:ring-accent"
              >
                <option value="">Everyone</option>
                {(branches ?? []).map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <TextField
              label="Semester (optional)"
              type="number"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            />
          </div>

          <div className="w-32">
            <TextField
              label="Priority"
              type="number"
              value={String(priority)}
              onChange={(e) => setPriority(Number(e.target.value) || 0)}
            />
          </div>

          <div>
            <p className="mb-1.5 text-label text-ink-secondary">Buttons (optional)</p>
            {buttons.map((b, i) => (
              <div key={i} className="mb-2 flex items-end gap-2">
                <TextField
                  label="Label"
                  value={b.label}
                  onChange={(e) =>
                    setButtons((s) => s.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))
                  }
                />
                <TextField
                  label="Link or /path"
                  value={b.target}
                  onChange={(e) =>
                    setButtons((s) => s.map((x, j) => (j === i ? { ...x, target: e.target.value } : x)))
                  }
                />
                <button
                  onClick={() => setButtons((s) => s.filter((_, j) => j !== i))}
                  className="mb-2 text-ink-tertiary"
                  aria-label="Remove button"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
            {buttons.length < 3 && (
              <Button
                variant="secondary"
                onClick={() => setButtons((s) => [...s, { label: '', target: '' }])}
              >
                <Plus className="size-4" /> Add button
              </Button>
            )}
          </div>

          <label className="flex items-center gap-2 text-body-sm text-ink">
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
            Also send this as a notification
          </label>

          <Button loading={busy} onClick={create}>
            <Megaphone className="size-4" /> Create banner
          </Button>
        </Card>
      )}

      {isLoading && (
        <div className="mt-4 flex flex-col gap-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {(banners ?? []).map((b) => {
          const s = stats?.[b.id]
          return (
            <Card key={b.id} className="px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-body font-semibold text-ink">{b.title || '(no title)'}</span>
                <Pill>{b.kind}</Pill>
                <Pill>{FREQ.find((f) => f.value === b.frequency)?.label ?? b.frequency}</Pill>
                {!b.is_active && <Pill>paused</Pill>}
              </div>
              {b.description && (
                <p className="mt-1 line-clamp-2 text-body-sm text-ink-secondary">{b.description}</p>
              )}
              <p className="mt-1.5 text-label text-ink-secondary">
                Seen by {s?.seen_by ?? 0} student(s) · {s?.total_views ?? 0} views ·{' '}
                {s?.dismissed_by ?? 0} dismissed
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => toggle(b.id, !b.is_active)}>
                  {b.is_active ? 'Pause' : 'Activate'}
                </Button>
                {b.send_notification && !b.notification_sent_at && (
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      const n = await bannerService.sendNotification(b.id).catch(() => 0)
                      toast.success(`Notified ${n} student(s).`)
                      await qc.invalidateQueries({ queryKey: ['admin-banners'] })
                    }}
                  >
                    <Send className="size-4" /> Send notification
                  </Button>
                )}
                <Button variant="danger" onClick={() => remove(b.id)}>
                  <Trash2 className="size-4" /> Delete
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
