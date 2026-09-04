/**
 * Syllabus service — documented contract (spec §9).
 * Students select branch + semester and see the published subject list with
 * L/T/P and credit structure. Data-driven from the seeded academic taxonomy;
 * versioning/publication metadata is owned by the future Supabase adapter.
 */
import type { Subject } from '@/types/domain'
import { academicDb } from '@/services/mock/db'
import { contentAdminService } from '@/services/contentAdminService'
import { delay } from '@/services/storage'

export interface SyllabusUnit {
  title: string
  topics: string[]
}

export interface SubjectDetail {
  units: SyllabusUnit[]
  books: string[]
}

/**
 * The heavy unit-wise detail (~3MB) is loaded on demand, cached after first use.
 * Two maps: keyed by subject id (exact) and by subject code (fallback — the same
 * subject code shares one published syllabus across branches, which fills in the
 * branch/semester pages the source extraction did not cover directly).
 */
let detailMapPromise: Promise<{
  byId: Record<string, SubjectDetail>
  byCode: Record<string, SubjectDetail>
}> | null = null
function loadDetailMap() {
  if (!detailMapPromise) {
    detailMapPromise = Promise.all([
      import('./mock/seed_syllabus_detail.json'),
      import('./mock/seed_syllabus_by_code.json'),
    ]).then(([a, b]) => ({
      byId: (a.default ?? a) as unknown as Record<string, SubjectDetail>,
      byCode: (b.default ?? b) as unknown as Record<string, SubjectDetail>,
    }))
  }
  return detailMapPromise
}

export interface SyllabusSummary {
  subjects: Subject[]
  totalCredits: number
  theoryCount: number
  labCount: number
}

export const syllabusService = {
  /** Subjects for a branch + semester, ordered by code. */
  async getSyllabus(branchId: string, semesterId: string): Promise<SyllabusSummary> {
    await delay(140)
    const subjects = academicDb
      .subjects(branchId, semesterId)
      .slice()
      .sort((a, b) => (a.code || a.name).localeCompare(b.code || b.name))
    const totalCredits = subjects.reduce((sum, s) => sum + (s.credits ?? 0), 0)
    const theoryCount = subjects.filter((s) => (s.type ?? 'theory') === 'theory').length
    const labCount = subjects.filter((s) => s.type === 'lab' || s.type === 'practical').length
    return { subjects, totalCredits, theoryCount, labCount }
  },

  /**
   * Unit-wise detail (topics + books) for a subject, if published.
   * Falls back to the shared-by-code syllabus when this exact subject row
   * wasn't in the extracted detail set.
   */
  async getSubjectDetail(subjectId: string, code?: string): Promise<SubjectDetail | undefined> {
    await delay(80)
    const map = await loadDetailMap()
    const override = contentAdminService.getSyllabusOverrideSync(subjectId, code ?? undefined)
    if (override) return { units: override.units, books: override.books ?? [] }
    return map.byId[subjectId] ?? (code ? map.byCode[code.trim()] : undefined)
  },

  /** Semester numbers that actually have published subjects for a branch. */
  async availableSemesters(branchId: string): Promise<string[]> {
    await delay(80)
    const ids = new Set<string>()
    for (const s of academicDb.subjects(branchId)) {
      if (s.semester_id) ids.add(s.semester_id)
    }
    return [...ids]
  },
}
