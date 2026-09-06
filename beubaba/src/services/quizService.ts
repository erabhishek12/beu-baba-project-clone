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
import { USE_SUPABASE } from '@/services/backend/config'
import { supabaseQuizAdapter, isBankQuizId, fetchBankCatalog } from '@/services/quiz/supabaseQuizAdapter'

/**
 * Phase 3A-2 — question-bank routing.
 *
 * When the real backend is configured, quizzes whose id starts with `bank-`
 * are served by the Supabase adapter: the browser receives only the ~10
 * questions it needs, WITHOUT the answer key, and scoring happens in
 * PostgreSQL. Everything else — including the 45 curated legacy quizzes —
 * keeps running on the local implementation below, unchanged.
 *
 * `shouldUseBank()` is deliberately a function, not a constant, so tests and the
 * preview can flip the backend without a rebuild.
 */
function shouldUseBank(quizId: string): boolean {
  return USE_SUPABASE && isBankQuizId(quizId)
}

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

/**
 * Build the bank catalogue from Supabase (Phase 3A-2 completion).
 *
 * In mock mode nothing changes — the 5.4 MB JSON is still the source. With the
 * real backend we ask the database which subjects have PUBLISHED questions and
 * synthesise one `bank-<subject_code>` quiz per subject. That is what makes
 * `shouldUseBank()` match, which in turn routes startAttempt() through
 * `start_bank_attempt`. Without this the adapter is unreachable.
 *
 * Cost: one RPC returning aggregate counts (a few hundred bytes), versus a
 * 5.4 MB download that only ever contained Mechanical questions.
 */
/**
 * The catalogue is ~144 subjects and changes only when an admin publishes more
 * questions. Refetching it on every page load made the Quiz screen feel slow,
 * so it is cached in localStorage for a day and served instantly on the next
 * visit while a fresh copy is fetched in the background.
 */
const CATALOG_KEY = 'beubaba:bank-catalog:v2'
const CATALOG_TTL = 24 * 60 * 60 * 1000

type CachedCatalog = { at: number; rows: Awaited<ReturnType<typeof fetchBankCatalog>> }

function readCatalogCache(): CachedCatalog | null {
  try {
    const raw = localStorage.getItem(CATALOG_KEY)
    if (!raw) return null
    const c = JSON.parse(raw) as CachedCatalog
    return Array.isArray(c?.rows) && c.rows.length ? c : null
  } catch {
    return null
  }
}

function writeCatalogCache(rows: CachedCatalog['rows']): void {
  try {
    localStorage.setItem(CATALOG_KEY, JSON.stringify({ at: Date.now(), rows }))
  } catch {
    /* private mode / quota — caching is optional */
  }
}

function buildBankQuizzes(rows: CachedCatalog['rows']): void {
  allQuizzesCache = null
  for (const row of rows) {
    const total = Number(row.question_count) || 0
    if (total < 1) continue

    // FULL PAPER — the whole subject.
    // pick_count is NOT hardcoded to 10 any more. A paper-style test uses up to
    // 50 questions (the DB clamps at 100), or the whole subject if it is
    // smaller. 1 minute per question.
    const fullCount = Math.min(50, total)
    const fullId = `bank-${row.subject_code}`
    if (!bankQuizzes.some((b) => b.id === fullId)) {
      bankQuizzes.push({
        id: fullId,
        title: `${row.subject_name} · Full paper`,
        subject_code: row.subject_code,
        subject_name: row.subject_name,
        branch_id: row.branch_ids?.[0] ?? null,
        // Shared first-year papers belong to several branches; keep them all so
        // branch filtering does not hide a subject a student legitimately has.
        branch_ids: row.branch_ids ?? [],
        semester: row.semester_number ?? null,
        unit_index: null,
        type: 'practice',
        difficulty: 'medium',
        question_ids: [],
        pick_count: fullCount,
        duration_sec: fullCount * 60,
        negative_marking: 0,
        marks_per_question: 1,
        verified: true,
        // Human-verified AND published before it can be drawn (enforced in SQL),
        // so this is official content, not a community upload.
        official: true,
      })
    }

    // UNIT-WISE — one quiz per unit, so a student can revise a single topic.
    for (const u of row.units ?? []) {
      const n = Number(u.count) || 0
      if (n < 1) continue
      const unitId = `bank-${row.subject_code}-u${u.unit_index}`
      if (bankQuizzes.some((b) => b.id === unitId)) continue
      const pick = Math.min(25, n)
      bankQuizzes.push({
        id: unitId,
        title: `${row.subject_name} · ${u.unit_title}`,
        subject_code: row.subject_code,
        subject_name: row.subject_name,
        branch_id: row.branch_ids?.[0] ?? null,
        branch_ids: row.branch_ids ?? [],
        semester: row.semester_number ?? null,
        unit_index: u.unit_index,
        type: 'topic',
        difficulty: 'medium',
        question_ids: [],
        pick_count: pick,
        duration_sec: pick * 60,
        negative_marking: 0,
        marks_per_question: 1,
        verified: true,
        official: true,
      })
    }
  }
}

async function loadSupabaseBankCatalog(): Promise<void> {
  // 1. Instant paint from cache when we have one.
  const cached = readCatalogCache()
  if (cached) {
    buildBankQuizzes(cached.rows)
    // Still fresh? Nothing more to do.
    if (Date.now() - cached.at < CATALOG_TTL) {
      void fetchBankCatalog()
        .then((rows) => writeCatalogCache(rows))
        .catch(() => undefined)
      return
    }
  }
  // 2. No cache (or stale) — fetch for real.
  const rows = await fetchBankCatalog()
  buildBankQuizzes(rows)
  writeCatalogCache(rows)
}

function ensureBank(): Promise<void> {
  if (USE_SUPABASE) {
    if (!bankReady) {
      bankReady = loadSupabaseBankCatalog().catch(() => undefined)
    }
    return bankReady
  }
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

/**
 * Merged quiz list, memoised.
 *
 * With the full bank this is ~750 objects. The Quiz screen calls it several
 * times per render (list + subjects + filters), and rebuilding the array each
 * time made switching to the Quiz tab feel like a freeze. The contents only
 * change when the catalogue is (re)built, so cache it and invalidate there.
 */
let allQuizzesCache: Quiz[] | null = null

export function invalidateQuizCache(): void {
  allQuizzesCache = null
}

function allQuizzes(): Quiz[] {
  if (allQuizzesCache) return allQuizzesCache
  // With the real backend the database question bank is the main product, so
  // it is listed FIRST. The 45 seeded demo quizzes (3-4 questions each) stay
  // available but move to the end, otherwise they bury the real subjects.
  allQuizzesCache = USE_SUPABASE ? [...bankQuizzes, ...QUIZZES] : [...QUIZZES, ...bankQuizzes]
  return allQuizzesCache
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


/**
 * Does a quiz match a search term?
 *
 * Plain substring matching was not enough: students type short names like
 * "coa" for "Computer Organisation and Architecture" or "dbms", and they also
 * type the subject code. This checks, in order:
 *   1. substring of the title or subject name  ("thermo" -> Thermodynamics)
 *   2. the subject code                        ("100101")
 *   3. the acronym of the subject name         ("coa", "dbms", "adcs")
 *   4. every typed word appearing somewhere    ("machine design")
 */
function quizMatchesQuery(quiz: Quiz, q: string): boolean {
  const term = q.trim().toLowerCase()
  if (!term) return true

  const title = quiz.title.toLowerCase()
  const name = quiz.subject_name.toLowerCase()
  const code = quiz.subject_code.toLowerCase()
  if (title.includes(term) || name.includes(term) || code.includes(term)) return true

  // Well-known student shorthand that the plain acronym rule cannot produce
  // ("Database Management System" -> dms, but everyone types dbms).
  const ALIASES: Record<string, string[]> = {
    dbms: ['database management'],
    coa: ['computer organization', 'computer organisation'],
    dsa: ['data structure', 'algorithm'],
    os: ['operating system'],
    cn: ['computer network'],
    ai: ['artificial intelligence'],
    ml: ['machine learning'],
    toc: ['theory of computation'],
    dld: ['digital logic'],
    bee: ['basic electrical'],
    pps: ['programming for problem solving'],
    som: ['strength of material', 'mechanics of material'],
    rac: ['refrigeration'],
    fm: ['fluid mechanics'],
    thermo: ['thermodynamic'],
    ep: ['engineering physics'],
    em: ['engineering mathematics'],
  }
  for (const needle of ALIASES[term] ?? []) {
    if (name.includes(needle)) return true
  }

  // Acronym: first letter of each significant word of the subject name.
  const SKIP = new Set(['and', 'of', 'the', 'for', 'in', 'to', 'with', 'a', 'an', '&'])
  const words = name.split(/[^a-z0-9]+/).filter(Boolean)
  const acronym = words.filter((w) => !SKIP.has(w)).map((w) => w[0]).join('')
  const acronymAll = words.map((w) => w[0]).join('')
  if (acronym.startsWith(term) || acronymAll.startsWith(term)) return true

  // All typed words present somewhere (order independent).
  const parts = term.split(/\s+/).filter(Boolean)
  if (parts.length > 1) {
    const hay = `${title} ${name} ${code}`
    return parts.every((p) => hay.includes(p))
  }
  return false
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
    if (!USE_SUPABASE) await delay(120)
    await ensureBank()
    const q = (filter?.query ?? '').trim().toLowerCase()
    return allQuizzes().filter((quiz) => {
      if (filter?.subjectCode && quiz.subject_code !== filter.subjectCode) return false
      if (filter?.branchId) {
        // A quiz matches if the branch is among its branches. Quizzes with no
        // branch at all (legacy demo quizzes) are always allowed through.
        const ids = quiz.branch_ids?.length ? quiz.branch_ids : quiz.branch_id ? [quiz.branch_id] : []
        if (ids.length && !ids.includes(filter.branchId)) return false
      }
      if (filter?.semester && quiz.semester !== filter.semester) return false
      if (filter?.type && filter.type !== 'all' && quiz.type !== filter.type) return false
      if (q && !quizMatchesQuery(quiz, q)) return false
      return true
    }).map(toSummary)
  },

  async listSubjects(branchId?: string): Promise<{ code: string; name: string; count: number }[]> {
    if (!USE_SUPABASE) await delay(60)
    await ensureBank()
    const map = new Map<string, { code: string; name: string; count: number }>()
    for (const quiz of allQuizzes()) {
      if (branchId) {
        const ids = quiz.branch_ids?.length ? quiz.branch_ids : quiz.branch_id ? [quiz.branch_id] : []
        if (ids.length && !ids.includes(branchId)) continue
      }
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
    if (!USE_SUPABASE) await delay(80)
    await ensureBank()
    return quizById.get(quizId) ?? allQuizzes().find((q) => q.id === quizId)
  },

  // ---- Attempt lifecycle ----------------------------------------------
  /** Resume an unfinished attempt for this quiz, if any (§11 do not hide). */
  async findActiveAttempt(userId: string, quizId: string): Promise<QuizAttempt | undefined> {
    if (!USE_SUPABASE) await delay(40)
    return loadAttempts(userId).find(
      (a) => a.quiz_id === quizId && (a.state === 'initialized' || a.state === 'in_progress'),
    )
  },

  async getAttempt(userId: string, attemptId: string): Promise<QuizAttempt | undefined> {
    if (!USE_SUPABASE) await delay(40)
    return loadAttempts(userId).find((a) => a.id === attemptId)
  },

  /** Start (or resume) an attempt. Server creates the immutable snapshot. */
  async startAttempt(userId: string, quizId: string): Promise<QuizAttempt> {
    // Real bank quiz: draw from the database instead of the 5.2 MB JSON.
    if (shouldUseBank(quizId)) {
      const meta = allQuizzes().find((q) => q.id === quizId)
      const attempt = await supabaseQuizAdapter.startAttempt(userId, quizId, {
        count: meta?.pick_count ?? 10,
        durationSec: meta?.duration_sec ?? 600,
        unitIndex: meta?.unit_index ?? null,
        negativeMarking: meta?.negative_marking ?? 0,
        marksPerQuestion: meta?.marks_per_question ?? 1,
      })
      const all = loadAttempts(userId)
      all.push(attempt)
      saveAttempts(userId, all)
      return attempt
    }
    if (!USE_SUPABASE) await delay(160)
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
    if (!USE_SUPABASE) await delay(80)
    const attempt = loadAttempts(userId).find((a) => a.id === attemptId)
    if (!attempt) throw new Error('attempt_not_found')
    if (shouldUseBank(attempt.quiz_id)) {
      return supabaseQuizAdapter.getAttemptQuestions(attemptId)
    }
    return attempt.question_ids
      .map((id) => questionById.get(id))
      .filter((q): q is QuizQuestion => !!q)
      .map(toPublic)
  },

  /** Auto-save a single answer (idempotent per question; §17). */
  async saveAnswer(userId: string, attemptId: string, answer: AttemptAnswer): Promise<void> {
    if (!USE_SUPABASE) await delay(30)
    const all = loadAttempts(userId)
    const attempt = all.find((a) => a.id === attemptId)
    if (!attempt) throw new Error('attempt_not_found')
    if (attempt.state !== 'in_progress' && attempt.state !== 'initialized') return
    attempt.answers[answer.question_id] = answer
    saveAttempts(userId, all)

    // Bank attempts also autosave to the database, so a reload — even on a
    // different device — recovers the answers. Kept non-fatal: a failed
    // autosave must not interrupt someone mid-quiz, and the local copy is
    // still sent at submit time.
    if (shouldUseBank(attempt.quiz_id)) {
      try {
        await supabaseQuizAdapter.saveAnswer(
          attemptId,
          answer.question_id,
          answer.selected ?? [],
          attempt.question_ids.indexOf(answer.question_id),
        )
      } catch {
        /* offline or expired — submit reports the authoritative state */
      }
    }
  },

  isExpired(attempt: QuizAttempt): boolean {
    return Date.now() >= new Date(attempt.expires_at).getTime()
  },

  /**
   * Submit and score (§20-22). Idempotent: if already submitted, returns the
   * stored result unchanged (§21). auto = timer expiry / auto-submit.
   */
  async submitAttempt(userId: string, attemptId: string, auto = false): Promise<QuizResult> {
    {
      // Bank quizzes are graded server-side: the key is read inside PostgreSQL
      // and revealed only in the submit response.
      const all = loadAttempts(userId)
      const attempt = all.find((a) => a.id === attemptId)
      if (attempt && shouldUseBank(attempt.quiz_id)) {
        const cached = loadResults(userId)[attemptId]
        if (cached && (attempt.state === 'submitted' || attempt.state === 'auto_submitted')) {
          return cached
        }
        const meta = allQuizzes().find((q) => q.id === attempt.quiz_id)
        const result = await supabaseQuizAdapter.submitAttempt(
          attempt,
          meta?.title ?? 'Quiz',
          meta?.subject_name ?? '',
        )
        attempt.state = auto ? 'auto_submitted' : 'submitted'
        attempt.submitted_at = result.submitted_at
        saveAttempts(userId, all)
        saveResult(userId, result)
        return result
      }
    }
    await ensureBank()
    if (!USE_SUPABASE) await delay(180)
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
    if (!USE_SUPABASE) await delay(60)
    return loadResults(userId)[attemptId]
  },

  // ---- History / progress (§31) ---------------------------------------
  async history(userId: string): Promise<QuizResult[]> {
    if (!USE_SUPABASE) await delay(80)
    return Object.values(loadResults(userId)).sort(
      (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime(),
    )
  },

  async progressSnapshot(userId: string): Promise<{
    completed: number
    bestPercentage: number
    avgPercentage: number
  }> {
    if (!USE_SUPABASE) await delay(40)
    const results = Object.values(loadResults(userId))
    if (results.length === 0) return { completed: 0, bestPercentage: 0, avgPercentage: 0 }
    const best = Math.max(...results.map((r) => r.percentage))
    const avg = Math.round((results.reduce((s, r) => s + r.percentage, 0) / results.length) * 10) / 10
    return { completed: results.length, bestPercentage: best, avgPercentage: avg }
  },
}
