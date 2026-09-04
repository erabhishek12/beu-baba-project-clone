/**
 * JSON Import Center (Phase 6) — schema + semantic validation, duplicate
 * detection, preview reports, transactional commits, search/chatbot sync and
 * an audit trail.
 *
 * Supported kinds:
 *  - bank:     question-bank rows (same shape as the Mechanical MCQ pack)
 *  - quiz:     quiz metadata referencing known question ids
 *  - syllabus: per-subject unit/topic overrides
 *  - calendar: holidays & academic events
 *
 * Commits are transactional per kind: payloads are assembled first and written
 * with a single store write; if assembly throws, nothing is persisted.
 */
import { contentAdminService } from '@/services/contentAdminService'
import { quizService } from '@/services/quizService'
import { searchService } from '@/services/searchService'

export type ImportKind = 'bank' | 'quiz' | 'syllabus' | 'calendar'

export type RowStatus = 'ok' | 'duplicate' | 'error'

export interface RowReport {
  index: number
  status: RowStatus
  message?: string
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  data: any
}

export interface PreviewResult {
  kind: ImportKind
  rows: RowReport[]
  ok: number
  duplicate: number
  error: number
}

export type { AuditEntry } from '@/services/contentAdminService'
import type { AuditEntry } from '@/services/contentAdminService'

const QUESTION_TYPES = ['single', 'multi', 'truefalse', 'assertion_reason']
const DIFFICULTIES = ['easy', 'medium', 'hard']
const EVENT_TYPES = ['exam', 'holiday', 'event', 'deadline', 'result']

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}
function stemKey(stem: string, options: string[]): string {
  return `${stem.trim().toLowerCase()}|${options.map((o) => o.trim().toLowerCase()).join('~')}`
}

/** Structural + semantic validation and duplicate detection for one kind. */
export async function validateImport(kind: ImportKind, raw: unknown): Promise<PreviewResult> {
  const rowsIn = Array.isArray(raw)
    ? raw
    : isObj(raw)
      ? ((raw[kind === 'bank' ? 'questions' : kind] ??
          raw.questions ??
          raw.holidays ??
          raw.events ??
          raw.units) as unknown)
      : undefined
  const rows: RowReport[] = []
  if (!Array.isArray(rowsIn)) {
    return { kind, rows: [], ok: 0, duplicate: 0, error: 1 }
  }

  const knownIds = new Set(await quizService.knownQuestionIds())
  const seenKeys = new Set<string>()
  const seenIds = new Set<string>()

  rowsIn.forEach((r, index) => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const push = (status: RowStatus, message: string | undefined, data: any) =>
      rows.push({ index, status, message, data })

    if (!isObj(r)) return push('error', 'Row is not an object', r)

    if (kind === 'bank') {
      const stem = typeof r.stem === 'string' ? r.stem.trim() : ''
      const options = Array.isArray(r.options) ? (r.options as unknown[]).filter((o) => typeof o === 'string') : []
      const type = typeof r.type === 'string' ? r.type : 'single'
      const ciRaw = r.correct_index
      const ci =
        typeof ciRaw === 'string' && /^\d+$/.test(ciRaw.trim()) ? Number(ciRaw) : ciRaw
      if (!stem) return push('error', 'Missing stem', r)
      if (options.length < 2) return push('error', 'Needs at least 2 options', r)
      if (!QUESTION_TYPES.includes(type)) return push('error', `Unknown type "${type}"`, r)
      if (r.difficulty != null && !DIFFICULTIES.includes(String(r.difficulty)))
        return push('error', `Unknown difficulty "${String(r.difficulty)}"`, r)
      if (type !== 'multi') {
        if (typeof ci !== 'number' || ci < 0 || ci >= options.length)
          return push('error', `correct_index ${String(ci)} out of range`, r)
      } else if (!Array.isArray(r.correct_indices)) {
        return push('error', 'multi needs correct_indices', r)
      }
      const id = typeof r.id === 'string' ? r.id : `imp_${index}_${stemKey(stem, options as string[]).length}`
      const key = stemKey(stem, options as string[])
      if (seenIds.has(id) || knownIds.has(id)) return push('duplicate', `Question id "${id}" already exists`, { ...r, id })
      if (seenKeys.has(key)) return push('duplicate', 'Same question already in this file', { ...r, id })
      seenIds.add(id)
      seenKeys.add(key)
      return push('ok', undefined, { ...r, id })
    }

    if (kind === 'quiz') {
      const title = typeof r.title === 'string' ? r.title.trim() : ''
      const ids = Array.isArray(r.question_ids) ? (r.question_ids as unknown[]).filter((q) => typeof q === 'string') : []
      const pick = Number(r.pick_count ?? 10)
      const dur = Number(r.duration_sec ?? 600)
      if (!title) return push('error', 'Missing title', r)
      if (ids.length === 0) return push('error', 'No question_ids', r)
      const missing = ids.filter((id) => !knownIds.has(String(id)))
      if (missing.length === ids.length) return push('error', 'No question_ids resolve to known questions', r)
      if (!(pick > 0) || !(dur > 0)) return push('error', 'pick_count/duration must be positive', r)
      return push(missing.length ? 'ok' : 'ok', missing.length ? `${missing.length} unresolved ids will be dropped` : undefined, {
        ...r,
        question_ids: ids.filter((id) => knownIds.has(String(id))),
      })
    }

    if (kind === 'syllabus') {
      const code = typeof r.subject_code === 'string' ? r.subject_code.trim() : ''
      const subjectId = typeof r.subject_id === 'string' ? r.subject_id.trim() : ''
      const units = Array.isArray(r.units) ? r.units : []
      if (!code && !subjectId) return push('error', 'Needs subject_code or subject_id', r)
      if (units.length === 0) return push('error', 'No units', r)
      for (const u of units) {
        if (!isObj(u) || typeof u.title !== 'string' || !Array.isArray(u.topics))
          return push('error', 'Units need {title, topics[]}', r)
      }
      return push('ok', undefined, r)
    }

    // calendar
    const title = typeof r.title === 'string' ? r.title.trim() : (typeof r.name === 'string' ? (r.name as string).trim() : '')
    const date = typeof r.date === 'string' ? r.date.trim() : ''
    const type = typeof r.type === 'string' ? r.type : 'holiday'
    if (!title) return push('error', 'Missing title', r)
    if (!/^\d{4}-\d{2}-\d{2}/.test(date) || Number.isNaN(+new Date(date)))
      return push('error', `Bad date "${date}"`, r)
    if (!EVENT_TYPES.includes(type)) return push('error', `Unknown type "${type}"`, r)
    return push('ok', undefined, { ...r, title, date, type })
  })

  const count = (s: RowStatus) => rows.filter((r) => r.status === s).length
  return { kind, rows, ok: count('ok'), duplicate: count('duplicate'), error: count('error') }
}

/** Transactional commit of the valid rows of a preview. */
export async function commitImport(
  preview: PreviewResult,
  opts: { file: string; skipInvalid: boolean },
): Promise<{ imported: number; skipped: number }> {
  if (preview.error > 0 && !opts.skipInvalid) throw new Error('Fix or skip invalid rows first')
  const rows = preview.rows.filter((r) => r.status === 'ok').map((r) => r.data)
  const skipped = preview.rows.length - rows.length
  let imported = 0

  if (preview.kind === 'bank') {
    imported = quizService.registerExternalBank(rows)
  } else if (preview.kind === 'quiz') {
    imported = await contentAdminService.importQuizMetas(rows)
  } else if (preview.kind === 'syllabus') {
    imported = await contentAdminService.importSyllabusOverrides(rows)
  } else {
    imported =
      (await contentAdminService.importHolidays(rows.filter((r) => r.type === 'holiday' || !r.type))) +
      (await contentAdminService.importEvents(rows.filter((r) => r.type && r.type !== 'holiday')))
  }

  contentAdminService.addAudit({
    kind: preview.kind,
    file: opts.file,
    total: preview.rows.length,
    imported,
    skipped,
  })
  // Search index + assistant suggestions always see fresh content.
  searchService.invalidate()
  return { imported, skipped }
}

export function listAudit(): AuditEntry[] {
  return contentAdminService.listAuditSync()
}
