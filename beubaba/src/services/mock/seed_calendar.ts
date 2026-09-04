/**
 * Mock academic calendar (spec §10). In production these are structured event
 * records managed via the admin CMS with publish/audit status. Kept separate
 * from uploaded documents so events remain filterable and notifiable.
 *
 * OWNER POLICY (binding): never invent official BEU academic dates. The
 * source dataset's holidays were empty and no verified BEU calendar has been
 * supplied, so this seed is EMPTY on purpose. Types, services, filters and
 * the production-spec empty state stay wired; real CMS data drops in as-is.
 * ⛔ BLOCKED on: real BEU academic calendar data.
 */
import type { AcademicEvent } from '@/types/domain'

/** Empty until a real, verified BEU academic calendar is supplied. */
export const SEED_ACADEMIC_EVENTS: AcademicEvent[] = []
