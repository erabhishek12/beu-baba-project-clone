import { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import type { AcademicEvent, CalendarEventType } from '@/types/domain'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Skeleton } from '@/components/feedback/Skeleton'
import { calendarService } from '@/services/calendarService'
import { cn } from '@/lib/cn'

const TYPE_TONE: Record<CalendarEventType, 'accent' | 'success' | 'warning' | 'danger' | 'neutral'> = {
  exam: 'warning',
  result: 'success',
  deadline: 'danger',
  holiday: 'accent',
  event: 'neutral',
}

const ACCENT_BAR: Record<CalendarEventType, string> = {
  exam: 'bg-warning',
  result: 'bg-success',
  deadline: 'bg-danger',
  holiday: 'bg-gold',
  event: 'bg-accent',
}

const DATE_TINT: Record<CalendarEventType, string> = {
  exam: 'bg-warning-soft text-warning',
  result: 'bg-success-soft text-success',
  deadline: 'bg-danger-soft text-danger',
  holiday: 'bg-gold-soft text-gold-ink',
  event: 'bg-accent-soft text-accent',
}

export function CalendarPage() {
  const [type, setType] = useState<CalendarEventType | 'all'>('all')
  const types = calendarService.types()

  const { data: events, isLoading } = useQuery({
    queryKey: ['calendar', type],
    queryFn: () => calendarService.list({ type }),
    placeholderData: keepPreviousData,
  })

  const grouped = groupByMonth(events ?? [])
  const todayKey = new Date().toISOString().slice(0, 10)

  return (
    <div>
      {/* Type filter */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        <FilterChip label="All" on={type === 'all'} onClick={() => setType('all')} />
        {types.map((t) => (
          <FilterChip
            key={t.value}
            label={t.label}
            on={type === t.value}
            onClick={() => setType(t.value)}
          />
        ))}
      </div>

      <MonthGrid events={events ?? []} />

      <div className="mt-4">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}

        {!isLoading && events?.length === 0 && (
          <Card className="flex flex-col items-center gap-2 py-10 text-center">
            <CalendarDays className="size-8 text-ink-tertiary" aria-hidden />
            <p className="text-body font-semibold text-ink">No events</p>
            <p className="text-body-sm text-ink-secondary">Nothing scheduled for this filter.</p>
          </Card>
        )}

        {!isLoading &&
          grouped.map((month) => (
            <section key={month.key} className="mb-5">
              <h2 className="mb-2 px-1 text-label uppercase tracking-wide text-ink-tertiary">
                {month.label}
              </h2>
              <div className="flex flex-col gap-2.5">
                {month.events.map((e) => (
                  <EventCard key={e.id} event={e} isPast={dateKey(e.date) < todayKey} />
                ))}
              </div>
            </section>
          ))}
      </div>
    </div>
  )
}

function FilterChip({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-pill border px-3.5 py-1.5 text-caption font-semibold transition-colors',
        on
          ? 'border-transparent bg-accent text-white'
          : 'border-line bg-surface-secondary text-ink-secondary',
      )}
    >
      {label}
    </button>
  )
}

function EventCard({ event, isPast }: { event: AcademicEvent; isPast: boolean }) {
  const start = new Date(event.date)
  const range = event.end_date ? formatRange(event.date, event.end_date) : null
  return (
    <Card padded={false} className={cn('flex items-stretch overflow-hidden', isPast && 'opacity-55')}>
      <span className={cn('w-1.5 shrink-0', ACCENT_BAR[event.type])} aria-hidden />
      <div className="flex flex-1 items-center gap-3 p-3">
        <div
          className={cn(
            'flex size-12 shrink-0 flex-col items-center justify-center rounded-xl',
            DATE_TINT[event.type],
          )}
        >
          <span className="text-caption font-semibold uppercase leading-none opacity-80">
            {start.toLocaleString('en', { month: 'short' })}
          </span>
          <span className="tnum text-h3 leading-tight">{start.getDate()}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-medium text-ink">{event.title}</p>
          <p className="mt-0.5 text-caption text-ink-tertiary">
            {range ?? start.toLocaleDateString('en', { weekday: 'long' })}
          </p>
          {event.description && (
            <p className="mt-1 line-clamp-2 text-body-sm text-ink-secondary">{event.description}</p>
          )}
        </div>
        <Pill tone={TYPE_TONE[event.type]} className="shrink-0 capitalize">
          {event.type}
        </Pill>
      </div>
    </Card>
  )
}

function dateKey(iso: string): string {
  return iso.slice(0, 10)
}

function groupByMonth(events: AcademicEvent[]) {
  const map = new Map<string, { key: string; label: string; events: AcademicEvent[] }>()
  for (const e of events) {
    const d = new Date(e.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    let g = map.get(key)
    if (!g) {
      g = { key, label: d.toLocaleString('en', { month: 'long', year: 'numeric' }), events: [] }
      map.set(key, g)
    }
    g.events.push(e)
  }
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key))
}

function formatRange(startIso: string, endIso: string): string {
  const s = new Date(startIso)
  const e = new Date(endIso)
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()
  const sTxt = s.toLocaleDateString('en', { day: 'numeric', month: 'short' })
  const eTxt = e.toLocaleDateString('en', {
    day: 'numeric',
    month: sameMonth ? undefined : 'short',
  })
  return `${sTxt} – ${eTxt}`
}

/** Real month grid (Phase: calendar). Dots mark days holding events/holidays. */
function MonthGrid({ events }: { events: AcademicEvent[] }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return { y: d.getFullYear(), m: d.getMonth() }
  })
  const [selected, setSelected] = useState<string | null>(null)

  const first = new Date(cursor.y, cursor.m, 1)
  const startPad = (first.getDay() + 6) % 7
  const days = new Date(cursor.y, cursor.m + 1, 0).getDate()
  const todayKey = new Date().toISOString().slice(0, 10)

  const byDay = new Map<string, AcademicEvent[]>()
  for (const e of events) {
    const k = e.date.slice(0, 10)
    byDay.set(k, [...(byDay.get(k) ?? []), e])
  }
  const shift = (d: number) => {
    const n = new Date(cursor.y, cursor.m + d, 1)
    setCursor({ y: n.getFullYear(), m: n.getMonth() })
    setSelected(null)
  }
  const selectedEvents = selected ? (byDay.get(selected) ?? []) : []

  return (
    <Card className="mb-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => shift(-1)}
          aria-label="Previous month"
          className="flex size-9 items-center justify-center rounded-full bg-surface-secondary text-ink-secondary"
        >
          <ChevronLeft className="size-4" />
        </button>
        <p className="font-heading text-body font-bold text-ink">
          {first.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </p>
        <button
          onClick={() => shift(1)}
          aria-label="Next month"
          className="flex size-9 items-center justify-center rounded-full bg-surface-secondary text-ink-secondary"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
          <span key={d} className="text-caption font-semibold text-ink-tertiary">
            {d}
          </span>
        ))}
        {Array.from({ length: startPad }).map((_, i) => (
          <span key={`pad-${i}`} />
        ))}
        {Array.from({ length: days }).map((_, i) => {
          const key = `${cursor.y}-${String(cursor.m + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
          const dayEvents = byDay.get(key) ?? []
          return (
            <button
              key={key}
              onClick={() => setSelected(selected === key ? null : key)}
              className={cn(
                'relative flex h-10 flex-col items-center justify-center rounded-xl text-body-sm font-semibold transition-colors',
                key === todayKey && 'bg-accent text-white',
                key !== todayKey && dayEvents.length > 0 && 'bg-accent-soft text-accent-ink',
                selected === key && 'ring-2 ring-accent',
              )}
            >
              {i + 1}
              {dayEvents.length > 0 && (
                <span
                  className={cn(
                    'absolute bottom-1.5 size-1.5 rounded-full',
                    key === todayKey ? 'bg-white' : 'bg-gold',
                  )}
                />
              )}
            </button>
          )
        })}
      </div>
      {selected && (
        <div className="mt-3 flex flex-col gap-1.5 border-t border-line/70 pt-3">
          {selectedEvents.length === 0 && (
            <p className="text-caption text-ink-tertiary">Nothing on this day.</p>
          )}
          {selectedEvents.map((e) => (
            <p key={e.id} className="flex items-center gap-2 text-body-sm text-ink-secondary">
              <span className={cn('size-2 rounded-full', ACCENT_BAR[e.type])} />
              {e.title}
            </p>
          ))}
        </div>
      )}
    </Card>
  )
}
