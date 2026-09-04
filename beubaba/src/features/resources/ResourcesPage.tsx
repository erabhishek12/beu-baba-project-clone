import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, FolderOpen, UploadCloud } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/feedback/Skeleton'
import { ToolHeader } from '@/features/tools/ToolHeader'
import { ResourceCard } from './ResourceCard'
import { resourceService, RESOURCE_TYPES } from '@/services/resourceService'
import type { ResourceType } from '@/types/domain'
import { cn } from '@/lib/cn'

export function ResourcesPage() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [type, setType] = useState<ResourceType | 'all'>('all')

  const { data: resources, isLoading } = useQuery({
    queryKey: ['resources', q, type],
    queryFn: () => resourceService.listPublished({ q, type }),
  })

  return (
    <div className="page-x pb-8 pt-6">
      <ToolHeader
        title="Resources" icon="resources" tone="mint"
        subtitle="Notes, PDFs and links shared by students and reviewed by the team. Contribute your own — every upload is checked before it goes live."
      />

      <div className="mt-2 grid grid-cols-2 gap-3">
        <Button iconLeft={<Plus className="size-5" />} onClick={() => navigate('/resources/upload')}>
          Share a resource
        </Button>
        <Button
          variant="secondary"
          iconLeft={<FolderOpen className="size-5" />}
          onClick={() => navigate('/resources/mine')}
        >
          My uploads
        </Button>
      </div>

      {/* Search */}
      <div className="relative mt-5">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-ink-tertiary" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search resources…"
          className="w-full rounded-xl border border-line bg-surface py-2.5 pl-11 pr-4 text-body text-ink outline-none placeholder:text-ink-tertiary focus:border-accent"
        />
      </div>

      {/* Type filter */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        <FilterChip active={type === 'all'} onClick={() => setType('all')}>
          All
        </FilterChip>
        {RESOURCE_TYPES.map((t) => (
          <FilterChip key={t.value} active={type === t.value} onClick={() => setType(t.value)}>
            {t.label}
          </FilterChip>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 w-full" />)}

        {!isLoading &&
          resources?.map((r) => <ResourceCard key={r.id} resource={r} />)}
      </div>

      {!isLoading && (resources?.length ?? 0) === 0 && (
        <Card className="mt-5 flex flex-col items-center gap-3 py-10 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
            <UploadCloud className="size-7" />
          </span>
          <div>
            <p className="text-body font-semibold text-ink">No resources yet</p>
            <p className="mt-1 text-body-sm text-ink-secondary">
              Be the first to share notes or a helpful link with your peers.
            </p>
          </div>
          <Button size="sm" iconLeft={<Plus className="size-4" />} onClick={() => navigate('/resources/upload')}>
            Share a resource
          </Button>
        </Card>
      )}
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-pill border px-3.5 py-1.5 text-caption font-semibold transition-colors',
        active
          ? 'border-transparent bg-accent text-white'
          : 'border-line bg-surface-secondary text-ink-secondary hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}
