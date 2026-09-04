/**
 * Academic calendar service — documented contract (spec §10).
 * Structured event records, separate from any uploaded calendar document.
 * Data-driven; a future admin CMS / Supabase adapter replaces the seed source.
 */
import type { AcademicEvent, CalendarEventType } from '@/types/domain'
import { SEED_ACADEMIC_EVENTS } from '@/services/mock/seed_calendar'
import { contentAdminService } from '@/services/contentAdminService'
import { delay } from '@/services/storage'

export interface CalendarFilter {
  type?: CalendarEventType | 'all'
  /** Only events on/after this ISO date. */
  from?: string | null
  year?: number | null
}

function endOf(e: AcademicEvent): number {
  return +new Date(e.end_date ?? e.date)
}

/** Imported academic events (Import Center) as calendar events. */
function importedEvents(): AcademicEvent[] {
  return contentAdminService.listEventsSync().map((e) => ({
    id: `imp-${e.id}`,
    title: e.title,
    date: e.date,
    end_date: e.end_date ?? null,
    type: (e.type as AcademicEvent['type']) ?? 'event',
    description: e.description,
  }))
}

/** Imported holidays (admin JSON / master extract) as calendar events. */
function holidayEvents(): AcademicEvent[] {
  return contentAdminService.listHolidaysSync().map((h) => ({
    id: `holiday-${h.id}`,
    title: h.title,
    date: h.date,
    end_date: h.end_date ?? null,
    type: 'holiday' as const,
    description: 'Holiday',
  }))
}

export const calendarService = {
  async list(filter: CalendarFilter = {}): Promise<AcademicEvent[]> {
    await delay(120)
    return [...SEED_ACADEMIC_EVENTS, ...holidayEvents(), ...importedEvents()].filter((e) => {
      if (filter.type && filter.type !== 'all' && e.type !== filter.type) return false
      if (filter.from && endOf(e) < +new Date(filter.from)) return false
      if (filter.year != null && new Date(e.date).getFullYear() !== filter.year) return false
      return true
    }).sort((a, b) => +new Date(a.date) - +new Date(b.date))
  },

  /** Next N upcoming (or in-progress) events from `now`. */
  async upcoming(now: Date = new Date(), limit = 5): Promise<AcademicEvent[]> {
    await delay(100)
    const t = +now
    return [...SEED_ACADEMIC_EVENTS, ...holidayEvents(), ...importedEvents()].filter((e) => endOf(e) >= t)
      .sort((a, b) => +new Date(a.date) - +new Date(b.date))
      .slice(0, limit)
  },

  types(): { value: CalendarEventType; label: string }[] {
    return [
      { value: 'exam', label: 'Exams' },
      { value: 'result', label: 'Results' },
      { value: 'deadline', label: 'Deadlines' },
      { value: 'holiday', label: 'Holidays' },
      { value: 'event', label: 'Events' },
    ]
  },
}
