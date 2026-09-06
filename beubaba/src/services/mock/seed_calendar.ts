/**
 * Mock academic calendar (spec §10). In production these are structured event
 * records managed via the admin CMS with publish/audit status. Kept separate
 * from uploaded documents so events remain filterable and notifiable.
 *
 * OWNER POLICY (binding): never invent official BEU academic dates.
 *
 * ── Phase 3B update (2026-09-04) ────────────────────────────────────────────
 * The previous version of this file was EMPTY with a "⛔ BLOCKED on: real BEU
 * academic calendar data" note. That claim was STALE: the repository already
 * ships the official source at
 *
 *   production md file and other data/BEU_Holiday_Calendar_2026.json
 *   ("Bihar Engineering University, Patna — Holiday Calendar 2026")
 *
 * It was validated during the Phase 3B audit before being wired in:
 *   • 28 entries, every date parses and falls in 2026
 *   • every weekday label matches the real 2026 calendar (0 mismatches)
 *   • 5 multi-day ranges; holiday_days correctly excludes Sundays
 *     (e.g. 1–30 June = 30 days − 4 Sundays = 26, exactly as printed)
 *   • sum(holiday_days) = 65, sundays = 8, total = 73 — matches the sheet's
 *     own official_total block
 *   • the June entry is TEACHERS ONLY and carries that note
 *
 * No date is invented, added or altered here. The same data is seeded into
 * PostgreSQL by supabase/seed/seed_calendar_2026.sql, so mock and Supabase
 * agree. Muslim festival dates and any government-declared extra holidays may
 * change by official order — that caveat is preserved in the calendar notes.
 *
 * Academic (non-holiday) BEU dates — exam schedules, result dates, admission
 * deadlines — are still ⛔ genuinely unavailable and are NOT fabricated.
 */
import type { AcademicEvent } from '@/types/domain'
import holidays2026 from './seed_calendar_2026.json'

/** Official BEU 2026 holiday calendar (28 entries). Source: see header. */
export const SEED_ACADEMIC_EVENTS: AcademicEvent[] =
  holidays2026 as unknown as AcademicEvent[]

/**
 * Notes printed on the official BEU 2026 calendar. Surfaced in the UI so
 * students understand which dates can still move (master §14).
 */
export const CALENDAR_2026_NOTES: string[] = [
  'Republic Day (26 January) and Independence Day (15 August) are to be observed according to applicable rules.',
  'Muslim festival holiday dates may be changed according to the relevant government order.',
  'Additional holidays may be declared by government order.',
  'The June summer vacation entry is specifically for teachers.',
]

/** The sheet's own totals, kept for display/verification. */
export const CALENDAR_2026_TOTALS = { holidayDays: 65, sundays: 8, total: 73 } as const
