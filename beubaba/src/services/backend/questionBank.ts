/**
 * Supabase question-bank adapter (Phase 3A-2).
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * `quizService` historically resolved its question pool by fetching
 * `/assets/data/mech_bank.json` — a single 5.2 MB file containing ONLY the
 * Mechanical pack — and holding all 6,500 rows in browser memory. With the
 * full dataset imported (22,868 questions / 89,560 options) that approach
 * would mean shipping ~63 MB to a phone. It is also branch-locked: every quiz
 * built from that file is stamped Mechanical regardless of its real subject.
 *
 * This adapter replaces the DATA SOURCE only. It does not change the quiz
 * engine, the scoring rules, the attempt lifecycle or any screen. The browser
 * asks the database for the N questions it needs and receives exactly those,
 * WITHOUT the answer key — the key never leaves PostgreSQL (verified in
 * Phase 3A: `draw_pool_questions()` output contains no `is_correct`).
 *
 * Measured: a 10-question draw is ~3.7 KB and ~3.5 ms, versus 63 MB.
 *
 * Everything here is inert unless VITE_BACKEND=supabase. In mock mode the
 * module is never called, so the offline/demo experience is unchanged.
 */
import type { PublicQuestion, Difficulty, QuestionType } from '@/types/domain'
import { getSupabase } from './supabaseClient'

/** One option as the student sees it — id + label, never correctness. */
export interface DrawnOption {
  id: string
  label: string
}

/** Row shape returned by the `draw_pool_questions` RPC. */
interface DrawnRow {
  question_id: string
  stem: string
  question_type: string
  difficulty: string
  topic: string | null
  unit_index: number | null
  options: DrawnOption[] | null
}

export interface PoolFilter {
  branchId?: string | null
  subjectCode?: string | null
  unitIndex?: number | null
  difficulty?: Difficulty | null
  limit?: number
  /**
   * Seed for the server-side ordering. Passing the attempt id makes a draw
   * stable for the lifetime of an attempt, so a refresh re-renders the SAME
   * questions instead of silently swapping them mid-quiz.
   */
  seed?: string | null
}

function toQuestionType(v: string): QuestionType {
  // The bank stores the four source types verbatim; the domain model uses the
  // same vocabulary, with anything unexpected degraded to a plain MCQ.
  return v === 'multi' || v === 'truefalse' || v === 'assertion_reason'
    ? (v as QuestionType)
    : 'single'
}

function toDifficulty(v: string): Difficulty {
  return v === 'easy' || v === 'hard' ? v : 'medium'
}

/**
 * Draw a quiz-sized set of PUBLISHED questions.
 *
 * Only questions that a human reviewer has verified AND published can be
 * returned — that is enforced inside the SQL function, not here, so a bug in
 * this file cannot leak unreviewed content. (Proven in testing: a student
 * requesting 20 questions from a subject with 8 published rows received
 * exactly 8.)
 */
export async function drawQuestions(filter: PoolFilter): Promise<PublicQuestion[]> {
  const { data, error } = await getSupabase().rpc('draw_pool_questions', {
    p_branch: filter.branchId ?? null,
    p_subject_code: filter.subjectCode ?? null,
    p_unit: filter.unitIndex ?? null,
    p_difficulty: filter.difficulty ?? null,
    p_limit: Math.max(1, Math.min(filter.limit ?? 10, 100)),
    p_seed: filter.seed ?? null,
  })
  if (error) throw new Error(error.message)

  return ((data ?? []) as DrawnRow[]).map((r) => ({
    id: r.question_id,
    type: toQuestionType(r.question_type),
    difficulty: toDifficulty(r.difficulty),
    topic: r.topic ?? '',
    stem: r.stem,
    // Option ORDER is authoritative: it is the deterministic shuffle applied at
    // import (Phase 3A), which fixed the 88.7% answer-at-B bias in the
    // Mechanical pack. Do not re-sort on the client.
    options: (r.options ?? []).map((o) => o.label),
  }))
}

/**
 * Option ids alongside labels. `submitAttempt` needs the ids to tell the
 * server which choice was made; the plain-label form above is what the
 * renderer consumes.
 */
export async function drawQuestionsWithOptionIds(
  filter: PoolFilter,
): Promise<{ question: PublicQuestion; optionIds: string[] }[]> {
  const { data, error } = await getSupabase().rpc('draw_pool_questions', {
    p_branch: filter.branchId ?? null,
    p_subject_code: filter.subjectCode ?? null,
    p_unit: filter.unitIndex ?? null,
    p_difficulty: filter.difficulty ?? null,
    p_limit: Math.max(1, Math.min(filter.limit ?? 10, 100)),
    p_seed: filter.seed ?? null,
  })
  if (error) throw new Error(error.message)

  return ((data ?? []) as DrawnRow[]).map((r) => ({
    question: {
      id: r.question_id,
      type: toQuestionType(r.question_type),
      difficulty: toDifficulty(r.difficulty),
      topic: r.topic ?? '',
      stem: r.stem,
      options: (r.options ?? []).map((o) => o.label),
    },
    optionIds: (r.options ?? []).map((o) => o.id),
  }))
}

export interface BankStats {
  total: number
  published: number
  humanVerified: number
  autoValidated: number
  quarantined: number
  subjects: number
}

/** Counts for the admin dashboard. Cheap: aggregates only, no content. */
export async function bankStats(): Promise<BankStats> {
  const { data, error } = await getSupabase().rpc('question_bank_stats')
  if (error) throw new Error(error.message)
  const r = (Array.isArray(data) ? data[0] : data) ?? {}
  return {
    total: Number(r.total ?? 0),
    published: Number(r.published ?? 0),
    humanVerified: Number(r.human_verified ?? 0),
    autoValidated: Number(r.auto_validated ?? 0),
    quarantined: Number(r.quarantined ?? 0),
    subjects: Number(r.subjects ?? 0),
  }
}
