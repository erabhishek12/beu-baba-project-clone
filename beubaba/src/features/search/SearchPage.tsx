import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  X,
  ChevronLeft,
  ExternalLink,
} from 'lucide-react'
import { AppIcon, type AppIconName } from '@/components/ui/AppIcon'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Skeleton } from '@/components/feedback/Skeleton'
import {
  searchService,
  SEARCH_TYPE_LABEL,
  type SearchType,
  type SearchResult,
} from '@/services/searchService'

/** 3D brand icons for every result type (Phase 1 icon language). */
const TYPE_ICON: Record<SearchType, AppIconName> = {
  subject: 'notes',
  pyq: 'pyq',
  quiz: 'quiz',
  resource: 'resources',
  notice: 'notifications',
  exam: 'govexams',
  portal: 'portals',
  course: 'courses',
  branch: 'branch',
}

const FILTERS: (SearchType | 'all')[] = ['all', 'subject', 'pyq', 'quiz', 'resource', 'exam', 'portal']

export function SearchPage() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<SearchType | 'all'>('all')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    void searchService.warm()
    inputRef.current?.focus()
  }, [])

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['search', q],
    queryFn: () => searchService.query(q),
    enabled: q.trim().length > 0,
    placeholderData: (prev) => prev,
  })

  const filtered = useMemo(
    () => (filter === 'all' ? results : results.filter((r) => r.type === filter)),
    [results, filter],
  )

  function open(r: SearchResult) {
    if (r.external || /^https?:\/\//.test(r.url)) {
      window.open(r.url, '_blank', 'noopener,noreferrer')
    } else {
      navigate(r.url)
    }
  }

  return (
    <div className="page-x pb-8 pt-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-3 flex items-center gap-1 text-body-sm font-semibold text-ink-secondary"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Back
      </button>

      {/* Search input */}
      <div className="glass-standard glass-highlight flex items-center gap-3 rounded-xl px-4 py-3">
        <Search className="size-5 text-ink-tertiary" aria-hidden />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search subjects, papers, quizzes, resources…"
          className="w-full bg-transparent text-body text-ink outline-none placeholder:text-ink-tertiary"
        />
        {q && (
          <button aria-label="Clear" onClick={() => setQ('')}>
            <X className="size-4 text-ink-tertiary" />
          </button>
        )}
      </div>

      {/* Filters */}
      {q.trim() && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={
                'shrink-0 rounded-pill border px-3.5 py-1.5 text-caption font-semibold transition-colors ' +
                (filter === f
                  ? 'border-transparent bg-accent text-white'
                  : 'border-line bg-surface-secondary text-ink-secondary hover:text-ink')
              }
            >
              {f === 'all' ? 'All' : SEARCH_TYPE_LABEL[f]}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <div className="mt-4 flex flex-col gap-2.5">
        {!q.trim() && (
          <Card className="flex flex-col items-center gap-2 py-12 text-center">
            <Search className="size-8 text-ink-tertiary" aria-hidden />
            <p className="text-body font-semibold text-ink">Search everything</p>
            <p className="max-w-xs text-body-sm text-ink-secondary">
              Find subjects, previous papers, quizzes, resources, notices, government exams and
              official portals — all from one place.
            </p>
          </Card>
        )}

        {q.trim() && isFetching && results.length === 0 &&
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}

        {q.trim() && !isFetching && filtered.length === 0 && (
          <Card className="py-10 text-center">
            <p className="text-body font-semibold text-ink">No results for “{q}”</p>
            <p className="mt-1 text-body-sm text-ink-secondary">Try a different word or check the spelling.</p>
          </Card>
        )}

        {filtered.map((r) => {
          const icon = TYPE_ICON[r.type]
          return (
            <Card
              key={r.id}
              as="glass"
              role="button"
              tabIndex={0}
              onClick={() => open(r)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && open(r)}
              className="glass-highlight liquid-depth flex cursor-pointer items-center gap-3"
            >
              <AppIcon name={icon} className="size-10 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-body font-semibold text-ink">{r.title}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <Pill tone="neutral">{SEARCH_TYPE_LABEL[r.type]}</Pill>
                  {r.subtitle && (
                    <span className="truncate text-caption text-ink-tertiary">{r.subtitle}</span>
                  )}
                </div>
              </div>
              {r.external && <ExternalLink className="size-4 shrink-0 text-ink-tertiary" aria-hidden />}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
