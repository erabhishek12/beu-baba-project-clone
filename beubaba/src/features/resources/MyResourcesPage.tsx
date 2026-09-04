import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Plus, FolderOpen, FileText, LinkIcon, Pencil, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Pill } from '@/components/ui/Pill'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useToast } from '@/components/feedback/Toast'
import { resourceService, RESOURCE_STATUS_LABEL } from '@/services/resourceService'
import type { ResourceStatus } from '@/types/domain'
import { useUserId } from '@/features/quiz/hooks'

const STATUS_TONE: Record<ResourceStatus, 'accent' | 'warning' | 'success' | 'danger' | 'neutral'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  changes_requested: 'accent',
  archived: 'neutral',
}

export function MyResourcesPage() {
  const userId = useUserId()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const toast = useToast()
  const { data: resources, isLoading } = useQuery({
    queryKey: ['my-resources', userId],
    queryFn: () => resourceService.listMine(userId),
  })

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return
    await resourceService.remove(userId, id)
    qc.invalidateQueries({ queryKey: ['my-resources', userId] })
    toast.info('Resource deleted')
  }

  return (
    <div className="page-x pb-8 pt-6">
      <button
        onClick={() => navigate('/resources')}
        className="mb-3 flex items-center gap-1 text-body-sm font-semibold text-ink-secondary"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Resources
      </button>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-h1 text-ink">My uploads</h1>
        <Button size="sm" iconLeft={<Plus className="size-4" />} onClick={() => navigate('/resources/upload')}>
          New
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}

        {!isLoading && (resources?.length ?? 0) === 0 && (
          <Card className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
              <FolderOpen className="size-7" />
            </span>
            <div>
              <p className="text-body font-semibold text-ink">Nothing uploaded yet</p>
              <p className="mt-1 text-body-sm text-ink-secondary">
                Share notes, PDFs or links to help other students.
              </p>
            </div>
            <Button size="sm" iconLeft={<Plus className="size-4" />} onClick={() => navigate('/resources/upload')}>
              Share a resource
            </Button>
          </Card>
        )}

        {resources?.map((r) => (
          <Card key={r.id} as="glass" className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              {r.type === 'link' ? <LinkIcon className="size-5" /> : <FileText className="size-5" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-body font-semibold text-ink">{r.title}</p>
                <Pill tone={STATUS_TONE[r.status]}>{RESOURCE_STATUS_LABEL[r.status]}</Pill>
              </div>
              {r.description && (
                <p className="mt-0.5 line-clamp-2 text-body-sm text-ink-secondary">{r.description}</p>
              )}
              {r.moderation_note && r.status !== 'approved' && (
                <p className="mt-1.5 rounded-lg bg-surface-secondary px-2.5 py-1.5 text-caption text-ink-secondary">
                  <span className="font-semibold text-ink">Note from team:</span> {r.moderation_note}
                </p>
              )}
              <div className="mt-3 flex items-center gap-4 border-t border-line/60 pt-2.5">
                <button
                  onClick={() => navigate(`/resources/edit/${r.id}`)}
                  className="inline-flex items-center gap-1.5 text-caption font-semibold text-ink-secondary hover:text-accent"
                >
                  <Pencil className="size-3.5" aria-hidden />
                  Edit &amp; resubmit
                </button>
                <button
                  onClick={() => handleDelete(r.id, r.title)}
                  className="inline-flex items-center gap-1.5 text-caption font-semibold text-ink-tertiary hover:text-danger"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                  Delete
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
