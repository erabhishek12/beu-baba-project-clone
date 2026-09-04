import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  FileText,
  LinkIcon,
  FileImage,
  StickyNote,
  File,
  ExternalLink,
  Check,
  X,
  Inbox,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/glass/Modal'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useToast } from '@/components/feedback/Toast'
import { resourceService } from '@/services/resourceService'
import type { Resource, ResourceStatus, ResourceType } from '@/types/domain'
import { RESOURCE_STATUS_LABEL, RESOURCE_STATUS_TONE } from './adminMeta'
import { cn } from '@/lib/cn'

const TYPE_ICON: Record<ResourceType, typeof FileText> = {
  notes: StickyNote,
  pdf: FileText,
  question_paper: File,
  image: FileImage,
  link: LinkIcon,
  other: File,
}

const FILTERS: { key: ResourceStatus | 'all'; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'changes_requested', label: 'Changes' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'archived', label: 'Archived' },
  { key: 'all', label: 'All' },
]

type Decision = 'approved' | 'rejected' | 'changes_requested'

export function AdminResourcesPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const toast = useToast()
  const [filter, setFilter] = useState<ResourceStatus | 'all'>('pending')
  const [acting, setActing] = useState<string | null>(null)
  const [noteFor, setNoteFor] = useState<{ resource: Resource; decision: Decision } | null>(null)
  const [note, setNote] = useState('')

  const { data: all, isLoading } = useQuery({
    queryKey: ['admin', 'resources', 'all'],
    queryFn: () => resourceService.listQueue(),
  })

  const shown = useMemo(() => {
    if (!all) return []
    const list = filter === 'all' ? all : all.filter((r) => r.status === filter)
    return [...list].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
  }, [all, filter])

  function refresh() {
    qc.invalidateQueries({ queryKey: ['admin', 'resources'] })
    qc.invalidateQueries({ queryKey: ['resources'] })
    qc.invalidateQueries({ queryKey: ['notifications-unread'] })
  }

  async function decide(resource: Resource, decision: Decision, noteText?: string) {
    setActing(resource.id)
    try {
      await resourceService.moderate(resource.id, decision, noteText)
      toast.success(
        decision === 'approved'
          ? 'Resource approved'
          : decision === 'rejected'
            ? 'Resource rejected'
            : 'Changes requested',
      )
      refresh()
    } catch {
      toast.error('Could not update', 'Please try again.')
    } finally {
      setActing(null)
    }
  }

  function openNote(resource: Resource, decision: Decision) {
    setNoteFor({ resource, decision })
    setNote('')
  }

  async function submitNote() {
    if (!noteFor) return
    const { resource, decision } = noteFor
    setNoteFor(null)
    await decide(resource, decision, note.trim() || undefined)
  }

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
        <h1 className="text-h1 text-ink">Resource moderation</h1>
        <p className="mt-1 text-body-sm text-ink-secondary">
          Approve, request changes or reject student submissions. The owner is notified of every
          decision.
        </p>
      </header>

      {/* Filters */}
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((f) => {
          const n = f.key === 'all' ? all?.length : all?.filter((r) => r.status === f.key).length
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'shrink-0 rounded-pill px-3.5 py-1.5 text-caption font-semibold transition-colors',
                filter === f.key
                  ? 'bg-accent text-white shadow-soft'
                  : 'bg-chip text-ink-secondary ring-1 ring-[var(--glass-border)] hover:text-ink',
              )}
            >
              {f.label}
              {n ? ` (${n})` : ''}
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : shown.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {shown.map((r) => {
            const Icon = TYPE_ICON[r.type]
            const href = r.url ?? r.attachment?.dataUrl
            const busy = acting === r.id
            return (
              <li key={r.id}>
                <Card as="glass" className="glass-highlight flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-body font-semibold text-ink">{r.title}</p>
                        <Pill tone={RESOURCE_STATUS_TONE[r.status]}>
                          {RESOURCE_STATUS_LABEL[r.status]}
                        </Pill>
                      </div>
                      <p className="mt-0.5 text-caption text-ink-tertiary">
                        {r.subject_name || '—'}
                        {r.semester ? ` · Sem ${r.semester}` : ''} · by {r.owner_name}
                      </p>
                    </div>
                  </div>

                  {r.description && (
                    <p className="text-body-sm text-ink-secondary">{r.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Pill tone="neutral">{r.type.replace(/_/g, ' ')}</Pill>
                    {r.tags.slice(0, 3).map((t) => (
                      <Pill key={t} tone="accent">
                        {t}
                      </Pill>
                    ))}
                    {href && (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto inline-flex items-center gap-1 text-caption font-semibold text-accent"
                      >
                        Open file
                        <ExternalLink className="size-3.5" aria-hidden />
                      </a>
                    )}
                  </div>

                  {r.moderation_note && (
                    <p className="rounded-xl bg-surface-secondary/70 px-3 py-2 text-caption text-ink-secondary">
                      Note to owner: {r.moderation_note}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="primary"
                      loading={busy}
                      disabled={busy || r.status === 'approved'}
                      iconLeft={<Check className="size-4" />}
                      onClick={() => decide(r, 'approved')}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy}
                      onClick={() => openNote(r, 'changes_requested')}
                    >
                      Request changes
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={busy}
                      iconLeft={<X className="size-4" />}
                      onClick={() => openNote(r, 'rejected')}
                    >
                      Reject
                    </Button>
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      ) : (
        <Card className="flex flex-col items-center gap-3 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Inbox className="size-7" aria-hidden />
          </span>
          <div>
            <p className="text-body font-semibold text-ink">Nothing here</p>
            <p className="mt-1 text-body-sm text-ink-secondary">
              No resources match this filter.
            </p>
          </div>
        </Card>
      )}

      {/* Note modal (reject / request changes) */}
      <Modal
        open={!!noteFor}
        onClose={() => setNoteFor(null)}
        title={noteFor?.decision === 'rejected' ? 'Reject resource' : 'Request changes'}
        className="max-w-md"
      >
        <h2 className="text-h3 text-ink">
          {noteFor?.decision === 'rejected' ? 'Reject resource' : 'Request changes'}
        </h2>
        <p className="mt-1 text-body-sm text-ink-secondary">
          Add a short note for {noteFor?.resource.owner_name}. This is shown to the owner with your
          decision.
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          autoFocus
          placeholder={
            noteFor?.decision === 'rejected'
              ? 'e.g. This duplicates an existing upload for the same subject.'
              : 'e.g. Please upload a clearer scan and add the subject code.'
          }
          className="mt-3 w-full resize-none rounded-xl border border-line bg-surface px-3.5 py-2.5 text-body text-ink outline-none placeholder:text-ink-tertiary focus:border-accent"
        />
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" fullWidth onClick={() => setNoteFor(null)}>
            Cancel
          </Button>
          <Button
            variant={noteFor?.decision === 'rejected' ? 'danger' : 'primary'}
            fullWidth
            onClick={submitNote}
          >
            {noteFor?.decision === 'rejected' ? 'Reject' : 'Send request'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
