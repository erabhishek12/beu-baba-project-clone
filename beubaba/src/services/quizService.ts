/**
 * Quiz / assessment service — the server-authoritative boundary (spec doc 15).
 *
 * This module plays the role the Supabase Edge Functions / RLS-protected tables
 * will play later. The rules it enforces MUST hold at this boundary, never in
 * the UI:
 *   - Correct answer keys are stored here and are NEVER returned to an in-progress
 *     attempt (§23). getAttemptQuestions() returns PublicQuestion (no key).
 *   - Attempts are owned by user_id; a user can only read/write their own (§50).
 *   - Scoring is deterministic and computed here on submit (§22), not the client.
 *   - Submission is idempotent — resubmitting a submitted attempt returns the
 *     same stored result (§21).
 *   - Attempt question order is an immutable snapshot taken at start (§52).
 *
 * The mock persists attempts in namespaced localStorage scoped by user id.
 */
import type {
  Quiz,
  QuizSummary,
  QuizQuestion,
  PublicQuestion,
  QuizAttempt,
  QuizResult,
  AttemptAnswer,
  QuestionReviewItem,
  TopicPerformance,
} from '@/types/domain'
import { store, delay } from '@/services/storage'
import questionsSeed from '@/services/mock/seed_quiz_questions.json'
import quizzesSeed from '@/services/mock/seed_quiz_meta.json'
import { contentAdminService } from '@/services/contentAdminService'

const QUESTIONS = questionsSeed as unknown as QuizQuestion[]
const QUIZZES = quizzesSeed as unknown as Quiz[]

const questionById = new Map(QUESTIONS.map((q) => [q.id, q]))
const quizById = new Map(QUIZZES.map((q) => [q.id, q]))

// ---- Imported question bank (Mechanical MCQ pack, Phase 5) ----------------
// The 6.5k-question bank ships as a static asset and is registered lazily so
// the main bundle stays small. Generated per-subject bank quizzes and admin
// builder quizzes resolve their pools from it.
const BANK_URL = '/assets/data/mech_bank.json'
const MECH_BRANCH = 'cfc6da5e-6af9-5ad2-7463-0af546b09347'
const bankQuizzes: Quiz[] = []
let bankReady: Promise<void> | null = null

function ensureBank(): Promise<void> {
  if (!bankReady) {
    bankReady = fetch(BANK_URL)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: unknown[]) => {
        registerBankRows(rows as Partial<QuizQuestion>[])
        for (const spec of contentAdminService.listBuilderSpecsSync()) {
          const pool = [...questionById.values()].filter(
            (q) =>
              q.subject_code === spec.subject_code &&
              (spec.difficulty === 'mixed' || q.difficulty === spec.difficulty),
          )
          bankQuizzes.push({
            id: spec.id,
            title: spec.title,
            subject_code: spec.subject_code,
            subject_name: spec.subject_name,
            branch_id: MECH_BRANCH,
            semester: null,
            unit_index: null,
            type: 'timed',
            difficulty: spec.difficulty === 'mixed' ? 'medium' : spec.difficulty,
            question_ids: pool.map((q) => q.id),
            pick_count: spec.pick_count,
            duration_sec: spec.duration_sec,
            negative_marking: 0,
            marks_per_question: 1,
            verified: false,
            official: false,
          })
        }
        for (const meta of contentAdminService.listQuizMetasSync()) {
          if (bankQuizzes.some((b) => b.id === meta.id)) continue
          bankQuizzes.push({
            id: meta.id,
            title: meta.title,
            subject_code: meta.subject_code,
            subject_name: meta.subject_name,
            branch_id: MECH_BRANCH,
            semester: null,
            unit_index: null,
            type: 'timed',
            difficulty: 'medium',
            question_ids: meta.question_ids,
            pick_count: meta.pick_count,
            duration_sec: meta.duration_sec,
            negative_marking: 0,
            marks_per_question: 1,
            verified: false,
            official: false,
          })
        }
      })
      .catch(() => undefined)
  }
  return bankReady
}

function allQuizzes(): Quiz[] {
  return [...QUIZZES, ...bankQuizzes]
}

/** Normalize one imported bank row into the domain question shape. */
function normalizeBankRow(row: Partial<QuizQuestion>): QuizQuestion | null {
  if (!row?.id || !Array.isArray(row.options) || !row.stem) return null
  return {
    id: row.id,
    subject_code: row.subject_code ?? '',
    unit_index: row.unit_index ?? 0,
    topic: row.topic ?? '',
    type: row.type === 'assertion_reason' ? 'assertion_reason' : row.type === 'multi' ? 'multi' : 'single',
    difficulty: row.difficulty ?? 'medium',
    stem: row.stem,
    options: row.options,
    correct_index: row.correct_index,
    correct_indices: row.correct_indices,
    explanation: row.explanation ?? '',
    source: row.source,
    pyq: row.pyq ?? false,
    year: row.year ?? null,
    verified: row.verified ?? true,
  }
}

/** Register rows from the Import Center; returns questions added (session). */
function registerBankRows(rows: Partial<QuizQuestion>[]): number {
  const bySubject = new Map<string, QuizQuestion[]>()
  const names = new Map<string, string>()
  let added = 0
  for (const row of rows) {
    const q = normalizeBankRow(row)
    if (!q || questionById.has(q.id)) continue
    questionById.set(q.id, q)
    added++
    const arr = bySubject.get(q.subject_code) ?? []
    arr.push(q)
    bySubject.set(q.subject_code, arr)
    if (typeof (row as { subject_name?: string }).subject_name === 'string')
      names.set(q.subject_code, (row as { subject_name: string }).subject_name)
  }
  for (const [code, qs] of bySubject) {
    const existing = bankQuizzes.find((b) => b.id === `bank-${code}`)
    if (existing) {
      existing.question_ids.push(...qs.map((q) => q.id))
    } else {
      const name = names.get(code) ?? code
      bankQuizzes.push({
        id: `bank-${code}`,
        title: `${name} · MCQ bank`,
        subject_code: code,
        subject_name: name,
        branch_id: MECH_BRANCH,
        semester: null,
        unit_index: null,
        type: 'practice',
        difficulty: 'medium',
        question_ids: qs.map((q) => q.id),
        pick_count: 10,
        duration_sec: 600,
        negative_marking: 0,
        marks_per_question: 1,
        verified: false,
        official: false,
      })
    }
  }
  return added
}

function toSummary(q: Quiz): QuizSummary {
  return {
    id: q.id,
    title: q.title,
    subject_name: q.subject_name,
    subject_code: q.subject_code,
    branch_id: q.branch_id,
    semester: q.semester,
    type: q.type,
    difficulty: q.difficulty,
    question_count: q.pick_count,
    duration_sec: q.duration_sec,
    negative_marking: q.negative_marking,
    verified: q.verified,
    official: q.official,
  }
}

function toPublic(q: QuizQuestion): PublicQuestion {
  return {
    id: q.id,
    type: q.type,
    difficulty: q.difficulty,
    topic: q.topic,
    stem: q.stem,
    options: q.options,
  }
}

function correctOf(q: QuizQuestion): number[] {
  if (q.type === 'multi') return (q.correct_indices ?? []).slice().sort()
  return q.correct_index != null ? [q.correct_index] : []
}

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  const x = [...a].sort()
  const y = [...b].sort()
  return x.every((v, i) => v === y[i])
}

// ---- Attempt persistence (owned by user) --------------------------------
function attemptsKey(userId: string) {
  return `quiz_attempts:${userId}`
}
function loadAttempts(userId: string): QuizAttempt[] {
  return store.get<QuizAttempt[]>(attemptsKey(userId), [])
}
function saveAttempts(userId: string, list: QuizAttempt[]) {
  store.set(attemptsKey(userId), list)
}
function resultKey(userId: string) {
  return `quiz_results:${userId}`
}
function loadResults(userId: string): Record<string, QuizResult> {
  return store.get<Record<string, QuizResult>>(resultKey(userId), {})
}
function saveResult(userId: string, r: QuizResult) {
  const all = loadResults(userId)
  all[r.attempt_id] = r
  store.set(resultKey(userId), all)
}

function pickQuestions(quiz: Quiz): string[] {
  // randomized subset of the quiz's pool, size = pick_count (§41 random pools)
  const pool = [...quiz.question_ids].filter((id) => questionById.has(id))
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, Math.min(quiz.pick_count, pool.length))
}

export const quizService = {
  // ---- Discovery -------------------------------------------------------
  async listQuizzes(filter?: {
    subjectCode?: string
    branchId?: string
    semester?: number
    type?: string
    query?: string
  }): Promise<QuizSummary[]> {
    await delay(120)
    await ensureBank()
    const q = (filter?.query ?? '').trim().toLowerCase()
    return allQuizzes().filter((quiz) => {
      if (filter?.subjectCode && quiz.subject_code !== filter.subjectCode) return false
      if (filter?.branchId && quiz.branch_id && quiz.branch_id !== filter.branchId) return false
      if (filter?.semester && quiz.semester !== filter.semester) return false
      if (filter?.type && filter.type !== 'all' && quiz.type !== filter.type) return false
      if (q && !`${quiz.title} ${quiz.subject_name}`.toLowerCase().includes(q)) return false
      return true
    }).map(toSummary)
  },

  async listSubjects(): Promise<{ code: string; name: string; count: number }[]> {
    await delay(60)
    await ensureBank()
    const map = new Map<string, { code: string; name: string; count: number }>()
    for (const quiz of allQuizzes()) {
      const e = map.get(quiz.subject_code) ?? {
        code: quiz.subject_code,
        name: quiz.subject_name,
        count: 0,
      }
      e.count += 1
      map.set(quiz.subject_code, e)
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
  },

  /** All question ids currently resolvable (seed + banks). Import Center use. */
  async knownQuestionIds(): Promise<string[]> {
    await ensureBank()
    return [...questionById.keys()]
  },

  /** Import Center: register validated bank rows for this session. */
  registerExternalBank(rows: Partial<QuizQuestion>[]): number {
    return registerBankRows(rows)
  },

  async getQuiz(quizId: string): Promise<Quiz | undefined> {
    await delay(80)
    await ensureBank()
    return quizById.get(quizId) ?? allQuizzes().find((q) => q.id === quizId)
  },

  // ---- Attempt lifecycle ----------------------------------------------
  /** Resume an unfinished attempt for this quiz, if any (§11 do not hide). */
  async findActiveAttempt(userId: string, quizId: string): Promise<QuizAttempt | undefined> {
    await delay(40)
    return loadAttempts(userId).find(
      (a) => a.quiz_id === quizId && (a.state === 'initialized' || a.state === 'in_progress'),
    )
  },

  async getAttempt(userId: string, attemptId: string): Promise<QuizAttempt | undefined> {
    await delay(40)
    return loadAttempts(userId).find((a) => a.id === attemptId)
  },

  /** Start (or resume) an attempt. Server creates the immutable snapshot. */
  async startAttempt(userId: string, quizId: string): Promise<QuizAttempt> {
    await delay(160)
    await ensureBank()
    const quiz = quizById.get(quizId) ?? allQuizzes().find((q) => q.id === quizId)
    if (!quiz) throw new Error('quiz_not_found')

    const existing = loadAttempts(userId).find(
      (a) => a.quiz_id === quizId && (a.state === 'initialized' || a.state === 'in_progress'),
    )
    if (existing) return existing

    const now = Date.now()
    const attempt: QuizAttempt = {
      id: `att_${now}_${Math.random().toString(36).slice(2, 8)}`,
      quiz_id: quizId,
      user_id: userId,
      state: 'in_progress',
      question_ids: pickQuestions(quiz),
      answers: {},
      started_at: new Date(now).toISOString(),
      expires_at: new Date(now + quiz.duration_sec * 1000).toISOString(),
      duration_sec: quiz.duration_sec,
      marks_per_question: quiz.marks_per_question,
      negative_marking: quiz.negative_marking,
    }
    const all = loadAttempts(userId)
    all.push(attempt)
    saveAttempts(userId, all)
    return attempt
  },

  /** Questions for an active attempt — NO answer keys (§23). */
  async getAttemptQuestions(userId: string, attemptId: string): Promise<PublicQuestion[]> {
    await delay(80)
    const attempt = loadAttempts(userId).find((a) => a.id === attemptId)
    if (!attempt) throw new Error('attempt_not_found')
    return attempt.question_ids
      .map((id) => questionById.get(id))
      .filter((q): q is QuizQuestion => !!q)
      .map(toPublic)
  },

  /** Auto-save a single answer (idempotent per question; §17). */
  async saveAnswer(userId: string, attemptId: string, answer: AttemptAnswer): Promise<void> {
    await delay(30)
    const all = loadAttempts(userId)
    const attempt = all.find((a) => a.id === attemptId)
    if (!attempt) throw new Error('attempt_not_found')
    if (attempt.state !== 'in_progress' && attempt.state !== 'initialized') return
    attempt.answers[answer.question_id] = answer
    saveAttempts(userId, all)
  },

  isExpired(attempt: QuizAttempt): boolean {
    return Date.now() >= new Date(attempt.expires_at).getTime()
  },

  /**
   * Submit and score (§20-22). Idempotent: if already submitted, returns the
   * stored result unchanged (§21). auto = timer expiry / auto-submit.
   */
  async submitAttempt(userId: string, attemptId: string, auto = false): Promise<QuizResult> {
    await ensureBank()
    await delay(180)
    const all = loadAttempts(userId)
    const attempt = all.find((a) => a.id === attemptId)
    if (!attempt) throw new Error('attempt_not_found')

    const cached = loadResults(userId)[attemptId]
    if (attempt.state === 'submitted' || attempt.state === 'auto_submitted') {
      if (cached) return cached
    }

    const quiz = quizById.get(attempt.quiz_id)
    const title = quiz?.title ?? 'Quiz'
    const subjectName = quiz?.subject_name ?? ''

    const review: QuestionReviewItem[] = []
    const topicAgg = new Map<string, { answered: number; correct: number }>()
    let correct = 0
    let incorrect = 0
    let answered = 0

    for (const qid of attempt.question_ids) {
      const q = questionById.get(qid)
      if (!q) continue
      const ans = attempt.answers[qid]
      const selected = ans?.selected ?? []
      const key = correctOf(q)
      const didAnswer = selected.length > 0
      const isCorrect = didAnswer && arraysEqual(selected, key)
      if (didAnswer) {
        answered += 1
        if (isCorrect) correct += 1
        else incorrect += 1
        const t = topicAgg.get(q.topic) ?? { answered: 0, correct: 0 }
        t.answered += 1
        if (isCorrect) t.correct += 1
        topicAgg.set(q.topic, t)
      }
      review.push({
        id: q.id,
        stem: q.stem,
        options: q.options,
        topic: q.topic,
        type: q.type,
        selected,
        correct: key,
        is_correct: isCorrect,
        explanation: q.explanation,
      })
    }

    const total = attempt.question_ids.length
    const unanswered = total - answered
    const marksObtained =
      correct * attempt.marks_per_question - incorrect * attempt.negative_marking
    const maxMarks = total * attempt.marks_per_question
    const percentage = maxMarks > 0 ? Math.round((marksObtained / maxMarks) * 1000) / 10 : 0
    const accuracy = answered > 0 ? Math.round((correct / answered) * 1000) / 10 : 0

    const startedMs = new Date(attempt.started_at).getTime()
    const timeUsed = Math.min(
      attempt.duration_sec,
      Math.round((Date.now() - startedMs) / 1000),
    )

    const topics: TopicPerformance[] = [...topicAgg.entries()]
      .map(([topic, v]) => ({
        topic,
        answered: v.answered,
        correct: v.correct,
        accuracy: v.answered > 0 ? Math.round((v.correct / v.answered) * 1000) / 10 : 0,
      }))
      .sort((a, b) => a.accuracy - b.accuracy)

    const result: QuizResult = {
      attempt_id: attempt.id,
      quiz_id: attempt.quiz_id,
      quiz_title: title,
      subject_name: subjectName,
      total,
      answered,
      unanswered,
      correct,
      incorrect,
      marks_obtained: Math.round(marksObtained * 100) / 100,
      max_marks: maxMarks,
      percentage,
      accuracy,
      time_used_sec: timeUsed,
      passed: percentage >= 40,
      topics,
      review,
      submitted_at: new Date().toISOString(),
    }

    attempt.state = auto ? 'auto_submitted' : 'submitted'
    attempt.submitted_at = result.submitted_at
    saveAttempts(userId, all)
    saveResult(userId, result)
    return result
  },

  async getResult(userId: string, attemptId: string): Promise<QuizResult | undefined> {
    await delay(60)
    return loadResults(userId)[attemptId]
  },

  // ---- History / progress (§31) ---------------------------------------
  async history(userId: string): Promise<QuizResult[]> {
    await delay(80)
    return Object.values(loadResults(userId)).sort(
      (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime(),
    )
  },

  async progressSnapshot(userId: string): Promise<{
    completed: number
    bestPercentage: number
    avgPercentage: number
  }> {
    await delay(40)
    const results = Object.values(loadResults(userId))
    if (results.length === 0) return { completed: 0, bestPercentage: 0, avgPercentage: 0 }
    const best = Math.max(...results.map((r) => r.percentage))
    const avg = Math.round((results.reduce((s, r) => s + r.percentage, 0) / results.length) * 10) / 10
    return { completed: results.length, bestPercentage: best, avgPercentage: avg }
  },
}
