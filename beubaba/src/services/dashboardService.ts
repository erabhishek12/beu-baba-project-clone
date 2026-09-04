/**
 * Dashboard/content service — data-driven home (spec §8.3).
 * Home content comes from services, not hardcoded in the component.
 */
import { SEED_EVENTS, type Notice, type CalendarEvent } from '@/services/mock/seed_content'
import { contentAdminService } from '@/services/contentAdminService'
import { delay } from '@/services/storage'

export const dashboardService = {
  async listNotices(): Promise<Notice[]> {
    return contentAdminService.listPublishedNotices()
  },
  async listUpcomingEvents(): Promise<CalendarEvent[]> {
    await delay(120)
    return [...SEED_EVENTS].sort((a, b) => +new Date(a.date) - +new Date(b.date))
  },
}

export type { Notice, CalendarEvent }
