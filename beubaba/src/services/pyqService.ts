/**
 * PYQ (previous-year questions) service — documented contract (spec §11).
 *
 * Data-driven: the paper catalog and question blocks come from the seeded real
 * BEU dataset, never hardcoded in components. Metadata is stored separately from
 * the (heavy) question content — the catalog is always available; full blocks
 * are fetched only when a specific paper is opened (mirrors "store metadata
 * separately from the file object", spec §11 implementation guidance).
 *
 * PYQ papers carry a subject `code`; branches share subject codes, so branch
 * scoping is done by intersecting a paper's code with the codes taught in the
 * student's branch (see codesForBranch). Papers are never silently dropped —
 * unmatched papers remain findable via search and the "all subjects" view.
 */
import type { PyqPaper, PyqPaperDetail } from '@/types/domain'
import { pyqDb, academicDb } from '@/services/mock/db'
import { delay } from '@/services/storage'
import { contentAdminService } from '@/services/contentAdminService'

export interface PyqFilter {
  /** Restrict to codes taught by this branch (optional). */
  branchId?: string | null
  /** Curriculum semester number (1..8). */
  semester?: number | null
  year?: number | null
  /** Subject code exact match. */
  code?: string | null
  /** Free-text query over subject name / code / exam title. */
  query?: string | null
}

export interface PyqSubjectGroup {
  code: string | null
  subject: string
  semester: number | null
  papers: PyqPaper[]
  years: number[]
}

export interface PyqFacets {
  semesters: number[]
  years: number[]
}

function codesForBranch(branchId: string): Set<string> {
  const codes = new Set<string>()
  for (const s of academicDb.subjects(branchId)) {
    if (s.code) codes.add(s.code.trim())
  }
  return codes
}

function matches(p: PyqPaper, f: PyqFilter, branchCodes: Set<string> | null): boolean {
  if (branchCodes && (!p.code || !branchCodes.has(p.code.trim()))) return false
  if (f.semester != null && p.semester !== f.semester) return false
  if (f.year != null && p.year !== f.year) return false
  if (f.code && (p.code ?? '') !== f.code) return false
  if (f.query) {
    const q = f.query.trim().toLowerCase()
    const hay = `${p.subject} ${p.code ?? ''} ${p.exam_title ?? ''}`.toLowerCase()
    if (!hay.includes(q)) return false
  }
  return true
}

export const pyqService = {
  /** Available filter values, optionally scoped to a branch. */
  async facets(branchId?: string | null): Promise<PyqFacets> {
    await delay(60)
    const branchCodes = branchId ? codesForBranch(branchId) : null
    const scoped = pyqDb
      .all()
      .filter((p) => !branchCodes || (p.code && branchCodes.has(p.code.trim())))
    const semesters = [...new Set(scoped.map((p) => p.semester).filter((n): n is number => n != null))].sort(
      (a, b) => a - b,
    )
    const years = [...new Set(scoped.map((p) => p.year).filter((n): n is number => n != null))].sort(
      (a, b) => b - a,
    )
    return { semesters, years }
  },

  /** Flat, filtered list of papers (newest first). */
  async list(filter: PyqFilter = {}): Promise<PyqPaper[]> {
    await delay(120)
    const branchCodes = filter.branchId ? codesForBranch(filter.branchId) : null
    return pyqDb
      .all()
      .filter((p) => contentAdminService.isPyqPublished(p.id))
      .filter((p) => matches(p, filter, branchCodes))
      .sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.subject.localeCompare(b.subject))
  },

  /** Papers grouped by subject (code) — the primary browse view. */
  async listBySubject(filter: PyqFilter = {}): Promise<PyqSubjectGroup[]> {
    await delay(140)
    const branchCodes = filter.branchId ? codesForBranch(filter.branchId) : null
    const groups = new Map<string, PyqSubjectGroup>()
    for (const p of pyqDb.all()) {
      if (!contentAdminService.isPyqPublished(p.id)) continue
      if (!matches(p, filter, branchCodes)) continue
      const key = p.code ?? `name:${p.subject}`
      let g = groups.get(key)
      if (!g) {
        g = { code: p.code, subject: p.subject, semester: p.semester, papers: [], years: [] }
        groups.set(key, g)
      }
      g.papers.push(p)
    }
    const out = [...groups.values()]
    for (const g of out) {
      g.papers.sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
      g.years = [...new Set(g.papers.map((p) => p.year).filter((n): n is number => n != null))].sort(
        (a, b) => b - a,
      )
    }
    return out.sort(
      (a, b) => (a.semester ?? 99) - (b.semester ?? 99) || a.subject.localeCompare(b.subject),
    )
  },

  async get(id: string): Promise<PyqPaper | undefined> {
    await delay(60)
    const p = pyqDb.byId(id)
    return p && contentAdminService.isPyqPublished(p.id) ? p : undefined
  },

  /** Full question blocks for one paper (lazy). */
  async detail(id: string): Promise<PyqPaperDetail | undefined> {
    await delay(160)
    return pyqDb.detail(id)
  },
}
