import { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { Search, X } from 'lucide-react'
import { Skeleton } from '@/components/feedback/Skeleton'
import { Card } from '@/components/ui/Card'
import { AppIcon } from '@/components/ui/AppIcon'
import { ToolHeader } from '@/features/tools/ToolHeader'
import { LinkRow } from '@/features/tools/LinkRow'
import { toolsService } from '@/services/toolsService'

export function CollegesPage() {
  const [query, setQuery] = useState('')
  const { data: colleges, isLoading } = useQuery({
    queryKey: ['colleges', query.trim()],
    queryFn: () => toolsService.listColleges(query.trim()),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="page-x pb-8 pt-6">
      <ToolHeader
        title="Engineering Colleges" icon="colleges" tone="lav"
        subtitle="Bihar engineering colleges affiliated under BEU."
      />

      <div className="glass-standard glass-highlight mb-4 flex items-center gap-3 rounded-xl px-4 py-3">
        <Search className="size-5 text-ink-tertiary" aria-hidden />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search college…"
          aria-label="Search colleges"
          className="w-full bg-transparent text-body text-ink outline-none placeholder:text-ink-tertiary"
        />
        {query && (
          <button aria-label="Clear" onClick={() => setQuery('')}>
            <X className="size-4 text-ink-tertiary" />
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {!isLoading && colleges?.length === 0 && (
        <Card className="py-8 text-center">
          <p className="text-body-sm text-ink-secondary">No colleges match “{query}”.</p>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {colleges?.map((c) => (
          <LinkRow
            key={c.host}
            name={c.name}
            url={c.url}
            leading={
              <span className="glass-highlight flex size-10 shrink-0 items-center justify-center rounded-lg bg-cat-blue-soft shadow-soft">
                <AppIcon name="colleges" className="size-6" />
              </span>
            }
          />
        ))}
      </div>
    </div>
  )
}
