import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { academicService } from '@/services/academicService'
import { AppIcon } from '@/components/ui/AppIcon'
import { cn } from '@/lib/cn'

const TILE_BG = ['bb-tile-lav', 'bb-tile-mint', 'bb-tile-peach', 'bb-tile-pink']

/**
 * Courses → Branches browser (Phase 3 "courses" surface). Expanding a course
 * lists its branches; a branch deep-links into the syllabus with
 * ?branch=<id> so the study context preselects it.
 */
export function CoursesPage() {
  const navigate = useNavigate()
  const [openId, setOpenId] = useState<string | null>(null)

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => academicService.listCourses(),
  })
  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: () => academicService.listBranches(),
  })

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-heading px-1 text-h3 font-extrabold tracking-tight text-ink">
        Courses & branches
      </h2>
      {isLoading ? (
        <div className="rounded-2xl bg-surface p-4 text-body-sm text-ink-secondary shadow-neu-sm ring-1 ring-line">
          Loading courses…
        </div>
      ) : null}
      {courses.map((c, i) => {
        const list = branches.filter((b) => b.course_id === c.id)
        const expanded = openId === c.id
        return (
          <div key={c.id} className="rounded-2xl bg-surface p-4 shadow-neu-sm ring-1 ring-line">
            <button
              type="button"
              className="flex w-full items-center gap-3.5 text-left"
              onClick={() => setOpenId(expanded ? null : c.id)}
              aria-expanded={expanded}
            >
              <span className={cn('flex size-14 shrink-0 items-center justify-center rounded-2xl', TILE_BG[i % TILE_BG.length])}>
                <AppIcon name="courses" className="pointer-events-none size-11" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-body font-semibold text-ink">
                  {c.name}
                  {c.short_name ? <span className="ml-2 text-caption font-bold text-accent">{c.short_name}</span> : null}
                </span>
                <span className="text-caption text-ink-tertiary">
                  {list.length} branch{list.length === 1 ? '' : 'es'}
                </span>
              </span>
              <span
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-full bg-accent shadow-[0_8px_18px_rgba(91,110,240,0.35)] transition-transform',
                  expanded && 'rotate-90',
                )}
              >
                <ChevronRight className="size-4 text-white" aria-hidden />
              </span>
            </button>
            {expanded ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {list.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    className="bb-chip px-3 py-1.5 text-caption font-semibold"
                    onClick={() => navigate(`/study/syllabus?branch=${b.id}`)}
                  >
                    {b.name}
                  </button>
                ))}
                {list.length === 0 ? (
                  <span className="text-caption text-ink-tertiary">No branches listed yet.</span>
                ) : null}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
