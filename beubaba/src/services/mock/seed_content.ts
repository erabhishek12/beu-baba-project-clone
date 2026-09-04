/**
 * Mock dashboard content (notices, events). In production this comes from the
 * database via admin CMS. Kept small and clearly separate from academic data.
 *
 * OWNER POLICY (binding): never display or seed fabricated notices / calendar
 * dates as if they were real BEU content. The arrays below are therefore
 * EMPTY on purpose. The types, services, queries and empty-state UI stay
 * fully wired so real CMS content drops in with zero code changes.
 * ⛔ BLOCKED on: real notice + calendar data from the university / admin CMS.
 */
export interface Notice {
  id: string
  title: string
  body: string
  category: 'exam' | 'result' | 'general' | 'academic'
  published_at: string
}

export interface CalendarEvent {
  id: string
  title: string
  date: string // ISO
  type: 'exam' | 'holiday' | 'event' | 'deadline'
}

/** Empty until real notices exist (production-spec empty state renders). */
export const SEED_NOTICES: Notice[] = []

/** Empty until real dashboard events exist (production-spec empty state renders). */
export const SEED_EVENTS: CalendarEvent[] = []
