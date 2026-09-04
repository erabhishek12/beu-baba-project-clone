import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, ChevronRight, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { AppIcon } from '@/components/ui/AppIcon'
import { Pill } from '@/components/ui/Pill'
import { Skeleton } from '@/components/feedback/Skeleton'
import { ContextPicker } from '@/features/study/ContextPicker'
import { useStudyContext } from '@/features/study/hooks'
import { pyqService, type PyqSubjectGroup } from '@/services/pyqService'
import { staggerParent, staggerChild } from '@/lib/motion'
import { cn } from '@/lib/cn'

export function PyqListPage() {
  const navigate = useNavigate()
  const { branchId, setBranchId, branches, semesters } = useStudyContext()
  const [semNum, setSemNum] = useState<number | null>(null)
  const [year, setYear] = useState<number | null>(null)
  const [query, setQuery] = useState('')

  const { data: facets } = useQuery({
    queryKey: ['pyq-facets', branchId || 'all'],
    queryFn: () => pyqService.facets(branchId || null),
  })

  const { data: groups, isLoading } = useQuery({
    queryKey: ['pyq-groups', branchId || 'all', semNum, year, query.trim()],
    queryFn: () =>
      pyqService.listBySubject({
        branchId: branchId || null,
        semester: semNum,
        year,
        query: query.trim() || null,
      }),
    placeholderData: keepPreviousData,
  })

  const paperCount = groups?.reduce((n, g) => n + g.papers.length, 0) ?? 0
  const hasFilters = Boolean(semNum || year || query.trim())

  return (
    <div>
      {/* Branch scope */}
      <ContextPicker
        branches={branches}
        semesters={semesters}
        branchId={branchId}
        semesterId=""
        onBranch={setBranchId}
        onSemester={() => {}}
        showSemester={false}
        branchLabel="Branch (optional — filters by your subjects)"
      />

      {/* Search */}
      <div className="glass-standard glass-highlight mt-4 flex items-center gap-3 rounded-xl px-4 py-3">
        <Search className="size-5 text-ink-tertiary" aria-hidden />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search subject, code or exam…"
          aria-label="Search PYQ papers"
          className="w-full bg-transparent text-body text-ink outline-none placeholder:text-ink-tertiary"
        />
        {query && (
          <button aria-label="Clear search" onClick={() => setQuery('')}>
            <X className="size-4 text-ink-tertiary" />
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="mt-3 flex flex-col gap-2">
        {!!facets?.semesters.length && (
          <ChipRow
            label="Semester"
            active={semNum}
            options={facets.semesters.map((n) => ({ value: n, label: `Sem ${n}` }))}
            onSelect={(v) => setSemNum(v)}
          />
        )}
        {!!facets?.years.length && (
          <ChipRow
            label="Year"
            active={year}
            options={facets.years.map((y) => ({ value: y, label: String(y) }))}
            onSelect={(v) => setYear(v)}
          />
        )}
      </div>

      {/* Result count / clear */}
      <div className="mt-4 flex items-center justify-between px-1">
        <p className="text-caption text-ink-tertiary">
          {isLoading
            ? 'Loading papers…'
            : `${paperCount} paper${paperCount === 1 ? '' : 's'} · ${groups?.length ?? 0} subject${
                (groups?.length ?? 0) === 1 ? '' : 's'
              }`}
        </p>
        {hasFilters && (
          <button
            onClick={() => {
              setSemNum(null)
              setYear(null)
              setQuery('')
            }}
            className="text-caption font-semibold text-accent"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results */}
      <div className="mt-3">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        )}

        {!isLoading && groups?.length === 0 && (
          <Card className="flex flex-col items-center gap-2 py-8 text-center">
            <AppIcon name="pyq" className="size-16" />
            <p className="text-body font-semibold text-ink">No papers found</p>
            <p className="text-body-sm text-ink-secondary">
              Try a different branch, semester, year or search term.
            </p>
            {!!facets?.semesters.length && (
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {facets.semesters.slice(0, 4).map((n) => (
                  <button key={n} onClick={() => { setSemNum(n); setYear(null) }} className="bb-chip bb-chip-active">
                    Sem {n}
                  </button>
                ))}
              </div>
            )}
          </Card>
        )}

        {!isLoading && !!groups?.length && (
          <motion.div
            variants={staggerParent}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-3"
          >
            {groups.map((g) => (
              <motion.div key={g.code ?? g.subject} variants={staggerChild}>
                <SubjectCard group={g} onOpenPaper={(id) => navigate(`/study/pyq/${id}`)} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function ChipRow<T extends number>({
  label,
  options,
  active,
  onSelect,
}: {
  label: string
  options: { value: T; label: string }[]
  active: T | null
  onSelect: (v: T | null) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-caption font-semibold text-ink-tertiary">{label}</span>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {options.map((o) => {
          const on = active === o.value
          return (
            <button
              key={o.value}
              onClick={() => onSelect(on ? null : o.value)}
              className={cn(
                'shrink-0 rounded-pill border px-3 py-1 text-caption font-semibold transition-colors',
                on
                  ? 'border-transparent bg-accent text-white'
                  : 'border-line bg-surface-secondary text-ink-secondary',
              )}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SubjectCard({
  group,
  onOpenPaper,
}: {
  group: PyqSubjectGroup
  onOpenPaper: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <Card padded={false} className={cn('overflow-hidden glass-highlight', !open && 'liquid-depth')}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 p-4 text-left"
        aria-expanded={open}
      >
        <span className="bb-tile-lav flex size-14 shrink-0 items-center justify-center rounded-2xl">
          <AppIcon name="subject" className="size-11" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body font-semibold text-ink">{group.subject}</span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-ink-tertiary">
            {group.code && <span className="tnum">{group.code}</span>}
            {group.semester != null && <span>· Sem {group.semester}</span>}
            <span>· {group.papers.length} paper{group.papers.length === 1 ? '' : 's'}</span>
          </span>
        </span>
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-full bg-accent shadow-[0_8px_18px_rgba(91,110,240,0.35)] transition-transform',
            open && 'rotate-90',
          )}
        >
          <ChevronRight className="size-4 text-white" aria-hidden />
        </span>
      </button>

      {open && (
        <div className="border-t border-line/70 px-4 pb-3 pt-1">
          {group.papers.map((p) => (
            <button
              key={p.id}
              onClick={() => onOpenPaper(p.id)}
              className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-surface-secondary/60"
            >
              <span className="flex items-center gap-2">
                <Pill tone="neutral" className="tnum">
                  {p.year ?? '—'}
                </Pill>
                <span className="text-body-sm text-ink-secondary">
                  {p.question_count} questions
                  {p.full_marks ? ` · ${p.full_marks} marks` : ''}
                </span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-ink-tertiary/70" aria-hidden />
            </button>
          ))}
        </div>
      )}
    </Card>
  )
}
