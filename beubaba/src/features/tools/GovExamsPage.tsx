import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { AppIcon } from '@/components/ui/AppIcon'
import { Skeleton } from '@/components/feedback/Skeleton'
import { ToolHeader } from '@/features/tools/ToolHeader'
import { toolsService } from '@/services/toolsService'
import { cn } from '@/lib/cn'

export function GovExamsPage() {
  const navigate = useNavigate()
  const [category, setCategory] = useState('All')
  const categories = toolsService.govExamCategories()

  const { data: exams, isLoading } = useQuery({
    queryKey: ['gov-exams', category],
    queryFn: () => toolsService.listGovExams(category),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="page-x pb-8 pt-6">
      <ToolHeader
        title="Government Exams" icon="govexams" tone="peach"
        subtitle="Guides for major exams open to engineering graduates."
      />

      {/* Category filter */}
      <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              'shrink-0 rounded-pill border px-3.5 py-1.5 text-caption font-semibold transition-colors',
              category === c
                ? 'border-transparent bg-accent text-white'
                : 'border-line bg-surface-secondary text-ink-secondary',
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {exams?.map((e) => (
          <Card
            key={e.id}
            as="glass"
            className="flex cursor-pointer items-start gap-3 transition-transform active:scale-[0.99]"
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/tools/exams/${e.id}`)}
            onKeyDown={(ev) => (ev.key === 'Enter' || ev.key === ' ') && navigate(`/tools/exams/${e.id}`)}
          >
            <span className="glass-highlight flex size-11 shrink-0 items-center justify-center rounded-xl bg-cat-violet-soft shadow-soft">
              <AppIcon name="govexams" className="size-7" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-body-lg font-semibold text-ink">{e.name}</h2>
                <span className="rounded-pill bg-surface-secondary px-2 py-0.5 text-caption font-semibold text-ink-secondary">
                  {e.category}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-body-sm text-ink-secondary">{e.summary}</p>
            </div>
            <ChevronRight className="mt-1 size-5 shrink-0 text-ink-tertiary" aria-hidden />
          </Card>
        ))}
      </div>
    </div>
  )
}
