/**
 * Notice management (admin spec §10).
 *
 * Notices are the plain announcements students see in their notification
 * centre — separate from banners, which are the full-screen overlay.
 * Writes go through RLS; a student cannot create one.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Plus, Trash2, Megaphone, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useToast } from '@/components/feedback/Toast'
import { TextField } from '@/components/forms/TextField'
import { adminService } from '@/services/adminService'

const CATEGORIES = ['general', 'academic', 'exam', 'result', 'admission', 'event']

export function AdminNoticesPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('general')

  const { data: notices, isLoading } = useQuery({
    queryKey: ['admin-notices'],
    queryFn: () => adminService.listNotices(),
  })

  async function create() {
    if (!title.trim()) {
      toast.error('Give the notice a title.')
      return
    }
    setBusy(true)
    try {
      await adminService.createNotice({ title: title.trim(), body: body.trim() || null, category })
      toast.success('Notice published.')
      setTitle('')
      setBody('')
      setOpen(false)
      await qc.invalidateQueries({ queryKey: ['admin-notices'] })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not create the notice.')
    }
    setBusy(false)
  }

  async function act(fn: () => Promise<void>, msg: string) {
    try {
      await fn()
      toast.success(msg)
      await qc.invalidateQueries({ queryKey: ['admin-notices'] })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed.')
    }
  }

  return (
    <div className="page-x pb-24 pt-4">
      <button
        onClick={() => navigate('/admin')}
        className="mb-2 flex items-center gap-1 text-label text-ink-secondary"
      >
        <ChevronLeft className="size-4" /> Admin
      </button>
      <h1 className="text-h1 text-ink">Notices</h1>
      <p className="mt-1 text-body-sm text-ink-secondary">
        Short announcements for students. For a full-screen message, use Banners.
      </p>

      <div className="mt-4">
        <Button onClick={() => setOpen((v) => !v)}>
          {open ? <X className="size-4" /> : <Plus className="size-4" />}
          {open ? 'Cancel' : 'New notice'}
        </Button>
      </div>

      {open && (
        <Card className="mt-4 flex flex-col gap-3 p-4">
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div>
            <label htmlFor="nbody" className="mb-1.5 block text-label text-ink-secondary">
              Details
            </label>
            <textarea
              id="nbody"
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full rounded-xl bg-surface-secondary px-3 py-2 text-body text-ink outline-none ring-1 ring-line focus:ring-accent"
            />
          </div>
          <div>
            <p className="mb-1.5 text-label text-ink-secondary">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-pill px-3 py-1.5 text-caption font-bold ${
                    category === c
                      ? 'bg-accent text-white'
                      : 'bg-surface text-ink-secondary ring-1 ring-line'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <Button loading={busy} onClick={create}>
            <Megaphone className="size-4" /> Publish notice
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

      {!isLoading && !notices?.length && (
        <Card className="mt-4 px-4 py-6 text-center text-body-sm text-ink-secondary">
          No notices yet.
        </Card>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {(notices ?? []).map((n) => {
          const id = String(n.id)
          const published = Boolean(n.is_published)
          return (
            <Card key={id} className="px-4 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-body font-semibold text-ink">{String(n.title)}</span>
                {n.category ? <Pill>{String(n.category)}</Pill> : null}
                {!published && <Pill>hidden</Pill>}
              </div>
              {n.body ? (
                <p className="mt-1 line-clamp-3 text-body-sm text-ink-secondary">{String(n.body)}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    act(
                      () => adminService.setNoticePublished(id, !published),
                      published ? 'Notice hidden.' : 'Notice published.',
                    )
                  }
                >
                  {published ? 'Hide' : 'Publish'}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => act(() => adminService.deleteNotice(id), 'Notice deleted.')}
                >
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
