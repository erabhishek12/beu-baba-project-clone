/**
 * Supabase quiz adapter (Phase 3A-2, instruction PART D).
 *
 * `quizService` keeps its public API exactly as it was. This module supplies
 * the same five lifecycle operations backed by the real question bank, and
 * `quizService` delegates to it only when BOTH conditions hold:
 *
 *   1. VITE_BACKEND=supabase (with URL + anon key present), and
 *   2. the quiz being played is a BANK quiz (`bank-<subject_code>`).
 *
 * The 45 curated legacy quizzes never enter this path — they continue to run
 * on the existing local implementation, untouched (instruction PART I).
 *
 * WHAT CHANGES vs THE MOCK
 * ------------------------
 *   Mock: 5.2 MB JSON downloaded, key held in the browser, marked in the browser.
 *   Here: ~5 KB downloaded, key never leaves PostgreSQL, marked by PostgreSQL.
 *
 * Measured against a live database: a 10-question draw is 5,660 bytes in
 * 1.487 ms, and the payload contains no `is_correct` field at all.
 */
import type {
  QuizAttempt,
  QuizResult,
  PublicQuestion,
  QuestionReviewItem,
  TopicPerformance,
  QuestionType,
  Difficulty,
} from '@/types/domain'
import { getSupabase } from '@/services/backend/supabaseClient'

/** `bank-<subject_code>` is the id convention the existing UI already uses. */
export const BANK_PREFIX = 'bank-'
export function isBankQuizId(quizId: string): boolean {
  return quizId.startsWith(BANK_PREFIX)
}
/**
 * Bank quiz ids are `bank-<subject_code>` for a full paper and
 * `bank-<subject_code>-u<unit_index>` for a single unit. Subject codes can
 * themselves contain hyphens (e.g. `PCC-CE-301`), so the unit suffix is matched
 * with an anchored `-u<digits>` at the END only.
 */
const UNIT_SUFFIX = /-u(\d+)$/

export function subjectCodeOf(quizId: string): string {
  return quizId.slice(BANK_PREFIX.length).replace(UNIT_SUFFIX, '')
}

/** Unit index encoded in a bank quiz id, or null for a full-paper quiz. */
export function unitIndexOf(quizId: string): number | null {
  const m = UNIT_SUFFIX.exec(quizId.slice(BANK_PREFIX.length))
  return m ? Number(m[1]) : null
}

interface DrawnOption {
  id: string
  label: string
}
interface DrawnQuestion {
  question_id: string
  stem: string
  question_type: string
  difficulty: string
  topic: string | null
  unit_index: number | null
  options: DrawnOption[] | null
}
interface GradedItem {
  question_id: string
  picked: string[]
  correct: string[]
  is_correct: boolean | null
  explanation: string | null
}
interface GradedResult {
  attempt_id: string
  score: number
  max_score: number
  correct_count: number
  wrong_count: number
  unanswered_count: number
  submitted_at: string
  items: GradedItem[]
}

/**
 * The drawn questions are cached per attempt for the life of the page so that
 * paging between questions costs zero extra requests. This is a presentation
 * cache only — it holds no answer key, because the server never sent one.
 */
const drawCache = new Map<string, DrawnQuestion[]>()

/** An attempt rebuilt from the database after a reload. */
export interface ResumedAttempt {
  attemptId: string
  state: 'in_progress' | 'submitted' | 'expired'
  resumable: boolean
  questions: DrawnQuestion[]
  /** question_id -> selected option INDICES (what the UI works in). */
  answers: Record<string, number[]>
  /** Remaining seconds according to the SERVER, not the browser clock. */
  remainingSec: number
  durationSec: number
  marksPerQuestion: number
  negativeMarking: number
  lastSeenIndex: number
  startedAt: string
  expiresAt: string | null
  result: unknown
}

/** Turn stored option ids back into the option indices the UI renders with. */
function rebuildAnswers(
  questions: DrawnQuestion[],
  stored: Record<string, string[]>,
): Record<string, number[]> {
  const out: Record<string, number[]> = {}
  for (const q of questions) {
    const ids = stored[q.question_id]
    if (!ids?.length) continue
    const opts = q.options ?? []
    const idx = ids
      .map((id) => opts.findIndex((o) => o.id === id))
      .filter((i) => i >= 0)
      .sort((a, b) => a - b)
    if (idx.length) out[q.question_id] = idx
  }
  return out
}

function toType(v: string): QuestionType {
  return v === 'multi' || v === 'truefalse' || v === 'assertion_reason'
    ? (v as QuestionType)
    : 'single'
}
function toDifficulty(v: string): Difficulty {
  return v === 'easy' || v === 'hard' ? v : 'medium'
}

function toPublicQuestion(q: DrawnQuestion): PublicQuestion {
  return {
    id: q.question_id,
    type: toType(q.question_type),
    difficulty: toDifficulty(q.difficulty),
    topic: q.topic ?? '',
    stem: q.stem,
    // Order is the deterministic import shuffle; do not re-sort.
    options: (q.options ?? []).map((o) => o.label),
  }
}

/** Map an option INDEX (what the UI reports) to its option id (what the DB wants). */
function indicesToOptionIds(q: DrawnQuestion, indices: number[]): string[] {
  const opts = q.options ?? []
  return indices.map((i) => opts[i]?.id).filter((id): id is string => Boolean(id))
}

/** Map option ids back to indices, for rendering the review screen. */
function optionIdsToIndices(q: DrawnQuestion, ids: string[]): number[] {
  const opts = q.options ?? []
  return ids
    .map((id) => opts.findIndex((o) => o.id === id))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b)
}

/** One catalogue entry: a subject that has published questions in the bank. */
export interface BankUnit {
  unit_index: number
  unit_title: string
  count: number
}

export interface BankCatalogEntry {
  subject_code: string
  subject_name: string
  question_count: number
  /** Unit breakdown; [] when the older catalogue function is in use. */
  units: BankUnit[]
  unit_count?: number
  branch_ids?: string[]
  branch_names?: string[]
  semester_number?: number | null
}

/**
 * List the subjects that actually have published + human-verified questions.
 *
 * This replaces downloading `/assets/data/mech_bank.json` (5.4 MB, Mechanical
 * only) just to discover what quizzes exist. The RPC returns aggregate counts
 * only — no stems, no options, no answer keys — so it is safe for students and
 * costs a few hundred bytes instead of megabytes.
 */
export async function fetchBankCatalog(): Promise<BankCatalogEntry[]> {
  const sb = getSupabase()
  // Prefer the richer v2 catalogue (branch + semester + unit breakdown).
  // Fall back to v1 if migration 0015 has not been applied yet.
  const v2 = await sb.rpc('bank_subject_catalog_v2')
  if (!v2.error) {
    return ((v2.data ?? []) as BankCatalogEntry[]).map((r) => ({
      ...r,
      units: Array.isArray(r.units) ? r.units : [],
    }))
  }
  const v1 = await sb.rpc('bank_subject_catalog')
  if (v1.error) throw v1.error
  return ((v1.data ?? []) as { subject_code: string; subject_name: string; question_count: number }[]).map(
    (r) => ({ ...r, units: [] }),
  )
}

export const supabaseQuizAdapter = {
  /**
   * Start an attempt. One round trip returns the attempt id AND the drawn
   * questions, so opening a quiz costs a single request.
   */
  async startAttempt(
    userId: string,
    quizId: string,
    opts: {
      count?: number
      durationSec?: number
      negativeMarking?: number
      marksPerQuestion?: number
      difficulty?: string | null
      unitIndex?: number | null
      branchId?: string | null
    } = {},
  ): Promise<QuizAttempt> {
    const { data, error } = await getSupabase().rpc('start_bank_attempt', {
      p_subject_code: isBankQuizId(quizId) ? subjectCodeOf(quizId) : null,
      p_branch: opts.branchId ?? null,
      // Unit comes from the quiz id (bank-<code>-u<n>) unless overridden.
      p_unit: opts.unitIndex ?? unitIndexOf(quizId),
      p_difficulty: opts.difficulty ?? null,
      p_count: opts.count ?? 10,
      p_duration_sec: opts.durationSec ?? 600,
      p_negative: opts.negativeMarking ?? 0,
      p_marks: opts.marksPerQuestion ?? 1,
    })
    if (error) throw new Error(error.message)

    const row = (Array.isArray(data) ? data[0] : data) as
      | { attempt_id: string; expires_at: string; questions: DrawnQuestion[] }
      | undefined
    if (!row) throw new Error('quiz_not_found')

    const questions = row.questions ?? []
    drawCache.set(row.attempt_id, questions)

    const durationSec = opts.durationSec ?? 600
    return {
      id: row.attempt_id,
      quiz_id: quizId,
      user_id: userId,
      state: 'in_progress',
      question_ids: questions.map((q) => q.question_id),
      answers: {},
      started_at: new Date().toISOString(),
      expires_at: row.expires_at,
      duration_sec: durationSec,
      marks_per_question: opts.marksPerQuestion ?? 1,
      negative_marking: opts.negativeMarking ?? 0,
    }
  },

  /**
   * Keyless questions for an in-progress attempt.
   *
   * Served from the in-memory draw cache when possible. After a hard refresh
   * that cache is gone, so we fall back to `resume_bank_attempt`, which returns
   * the FROZEN question set stored on the attempt — the same questions in the
   * same order, never a fresh draw. A resumed quiz is the same paper.
   */
  async getAttemptQuestions(attemptId: string): Promise<PublicQuestion[]> {
    const cached = drawCache.get(attemptId)
    if (cached) return cached.map(toPublicQuestion)

    const state = await this.resumeAttempt(attemptId)
    if (!state.resumable) {
      // Finished or out of time: the caller should route to the result screen
      // rather than reopen a quiz that is over.
      throw new Error(
        state.state === 'submitted' ? 'attempt_already_submitted' : 'attempt_expired',
      )
    }
    return state.questions.map(toPublicQuestion)
  },

  /**
   * Rebuild an attempt after a page reload.
   *
   * Returns the frozen questions, the answers autosaved so far, and — crucially
   * — `remainingSec` computed from the SERVER clock, so a student cannot gain
   * time by reloading or by changing their device clock.
   */
  async resumeAttempt(attemptId: string): Promise<ResumedAttempt> {
    const { data, error } = await getSupabase().rpc('resume_bank_attempt', {
      p_attempt: attemptId,
    })
    if (error) throw new Error(error.message)
    const r = (data ?? {}) as {
      state?: string
      resumable?: boolean
      questions?: DrawnQuestion[]
      answers?: Record<string, string[]>
      remaining_sec?: number
      duration_sec?: number
      marks_per_question?: number
      negative_marking?: number
      last_seen_index?: number
      started_at?: string
      expires_at?: string
      result?: unknown
    }

    const questions = r.questions ?? []
    if (questions.length) drawCache.set(attemptId, questions)

    return {
      attemptId,
      state: (r.state ?? 'in_progress') as ResumedAttempt['state'],
      resumable: Boolean(r.resumable),
      questions,
      // Convert the stored option ids back into the option INDICES the UI uses.
      answers: rebuildAnswers(questions, r.answers ?? {}),
      remainingSec: Number(r.remaining_sec ?? 0),
      durationSec: Number(r.duration_sec ?? 600),
      marksPerQuestion: Number(r.marks_per_question ?? 1),
      negativeMarking: Number(r.negative_marking ?? 0),
      lastSeenIndex: Number(r.last_seen_index ?? 0),
      startedAt: r.started_at ?? new Date().toISOString(),
      expiresAt: r.expires_at ?? null,
      result: r.result ?? null,
    }
  },

  /**
   * Autosave one answer server-side.
   *
   * Without this, answers lived only in the browser and a reload on another
   * device lost them. It also means the graded result is based on what the
   * server recorded, not solely on what the client sends at submit time.
   */
  async saveAnswer(
    attemptId: string,
    questionId: string,
    selectedIndices: number[],
    questionIndex?: number,
  ): Promise<void> {
    const drawn = drawCache.get(attemptId) ?? []
    const q = drawn.find((d) => d.question_id === questionId)
    const optionIds = q ? indicesToOptionIds(q, selectedIndices) : []

    const { error } = await getSupabase().rpc('save_bank_answer', {
      p_attempt: attemptId,
      p_question: questionId,
      p_options: optionIds,
      p_index: questionIndex ?? null,
    })
    // An expired or submitted attempt rejects the write. That is correct
    // behaviour, not a crash: the submit call will report the real state.
    if (error) throw new Error(error.message)
  },

  /**
   * Submit and grade. Marking happens in PostgreSQL; the browser learns the
   * correct answers only in the response to THIS call.
   */
  async submitAttempt(
    attempt: QuizAttempt,
    quizTitle: string,
    subjectName: string,
  ): Promise<QuizResult> {
    const drawn = drawCache.get(attempt.id) ?? []
    const byId = new Map(drawn.map((q) => [q.question_id, q]))

    // Convert the UI's index-based answers into option ids.
    const payload: Record<string, string[]> = {}
    for (const [qid, ans] of Object.entries(attempt.answers)) {
      const q = byId.get(qid)
      if (!q || !ans?.selected?.length) continue
      const ids = indicesToOptionIds(q, ans.selected)
      if (ids.length) payload[qid] = ids
    }

    const { data, error } = await getSupabase().rpc('submit_bank_attempt', {
      p_attempt: attempt.id,
      p_answers: payload,
    })
    if (error) throw new Error(error.message)
    const graded = data as GradedResult

    // The server refuses to mark a paper handed in after the deadline. It
    // returns an expired marker rather than a score, so surface that instead of
    // rendering a fake 0%.
    if ((graded as unknown as { expired?: boolean }).expired) {
      throw new Error('attempt_expired')
    }

    const review: QuestionReviewItem[] = []
    const topicAgg = new Map<string, { answered: number; correct: number }>()

    for (const item of graded.items ?? []) {
      const q = byId.get(item.question_id)
      if (!q) continue
      const selected = optionIdsToIndices(q, item.picked ?? [])
      const key = optionIdsToIndices(q, item.correct ?? [])
      if (selected.length > 0) {
        const t = topicAgg.get(q.topic ?? '') ?? { answered: 0, correct: 0 }
        t.answered += 1
        if (item.is_correct) t.correct += 1
        topicAgg.set(q.topic ?? '', t)
      }
      review.push({
        id: q.question_id,
        stem: q.stem,
        options: (q.options ?? []).map((o) => o.label),
        topic: q.topic ?? '',
        type: toType(q.question_type),
        selected,
        correct: key,
        is_correct: Boolean(item.is_correct),
        explanation: item.explanation ?? '',
      })
    }

    const total = graded.items?.length ?? attempt.question_ids.length
    const answered = graded.correct_count + graded.wrong_count
    const maxMarks = Number(graded.max_score) || total * attempt.marks_per_question
    const marks = Number(graded.score)
    const percentage = maxMarks > 0 ? Math.round((marks / maxMarks) * 1000) / 10 : 0
    const accuracy =
      answered > 0 ? Math.round((graded.correct_count / answered) * 1000) / 10 : 0

    const topics: TopicPerformance[] = [...topicAgg.entries()]
      .map(([topic, v]) => ({
        topic,
        answered: v.answered,
        correct: v.correct,
        accuracy: v.answered > 0 ? Math.round((v.correct / v.answered) * 1000) / 10 : 0,
      }))
      .sort((a, b) => a.accuracy - b.accuracy)

    return {
      attempt_id: attempt.id,
      quiz_id: attempt.quiz_id,
      quiz_title: quizTitle,
      subject_name: subjectName,
      total,
      answered,
      unanswered: graded.unanswered_count,
      correct: graded.correct_count,
      incorrect: graded.wrong_count,
      marks_obtained: Math.round(marks * 100) / 100,
      max_marks: maxMarks,
      percentage,
      accuracy,
      time_used_sec: Math.min(
        attempt.duration_sec,
        Math.round((Date.now() - new Date(attempt.started_at).getTime()) / 1000),
      ),
      passed: percentage >= 40,
      topics,
      review,
      submitted_at: graded.submitted_at ?? new Date().toISOString(),
    }
  },

  /** Past scores for the history screen. Summary rows only — no question text. */
  async history(): Promise<
    {
      attempt_id: string
      subject_code: string | null
      score: number
      max_score: number
      correct_count: number
      wrong_count: number
      submitted_at: string
    }[]
  > {
    const { data, error } = await getSupabase().rpc('bank_attempt_history', { p_limit: 30 })
    if (error) throw new Error(error.message)
    return (data ?? []) as never
  },
}
