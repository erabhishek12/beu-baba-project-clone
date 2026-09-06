/**
 * Question review desk (Phase 3A-2, instruction PART A–C).
 *
 * The 22,868 imported questions land as
 *   automatically_validated = true, human_verified = false, published = false
 * and a database CHECK makes it impossible to publish anything a human has not
 * verified. This service is the client side of the ONLY sanctioned route
 * through that gate.
 *
 * SECURITY NOTE — every call here lands on a SECURITY DEFINER function that
 * re-checks `review_questions` permission inside PostgreSQL. The UI hiding the
 * admin route is a convenience, NOT the security boundary: a student calling
 * these RPCs directly receives `42501 not authorized to review questions`
 * (verified against a live database).
 *
 * Availability: the review desk is a Supabase-only feature. There is no mock
 * implementation, because reviewing questions that exist only in a browser's
 * localStorage would be meaningless. In mock mode `isAvailable()` returns false
 * and the admin page renders an explanatory empty state rather than a dead card.
 */
import { USE_SUPABASE } from '@/services/backend/config'
import { getSupabase } from '@/services/backend/supabaseClient'

export type ReviewStatus = 'pending' | 'verified' | 'published' | 'rejected' | 'skipped'

export type QuarantineReason =
  | 'duplicate_options'
  | 'unresolved_subject'
  | 'conflicting_subject_mapping'
  | 'malformed_question'
  | 'invalid_answer'
  | 'duplicate'
  | 'manual_review'
  | 'other'

/** Option AS SHOWN TO A REVIEWER — includes the answer key by design. */
export interface ReviewOption {
  id: string
  label: string
  is_correct: boolean
  display_order: number
}

export interface ReviewBranch {
  branch_id: string | null
  branch_name: string | null
  subject_code: string
  semester: number | null
}

export interface ReviewQuestion {
  id: string
  stem: string
  explanation: string | null
  question_type: string
  difficulty: string
  subject_code: string | null
  subject_name: string | null
  unit_index: number | null
  unit_title: string | null
  topic: string | null
  source_pack: string | null
  source_ref: string | null
  automatically_validated: boolean
  human_verified: boolean
  published: boolean
  review_status: ReviewStatus
  review_note: string | null
  reviewed_at: string | null
  edited_after_review: boolean
  branches: ReviewBranch[]
  options: ReviewOption[]
  total_count: number
}

export interface ReviewFilter {
  status?: ReviewStatus | 'all'
  branchId?: string | null
  subjectCode?: string | null
  semester?: number | null
  topic?: string | null
  difficulty?: string | null
  questionType?: string | null
  sourcePack?: string | null
  search?: string | null
  limit?: number
  offset?: number
}

export interface ReviewFacets {
  by_status: Record<string, number>
  by_pack: Record<string, number>
  by_difficulty: Record<string, number>
  by_type: Record<string, number>
  subjects: { subject_code: string; subject_name: string | null; pending: number }[]
  quarantined: number
}

export interface EditPayload {
  stem?: string | null
  explanation?: string | null
  difficulty?: string | null
  topic?: string | null
  /** Replacing options is an ACADEMIC CONTENT change: it demotes the question. */
  options?: { label: string; is_correct: boolean }[] | null
  note?: string | null
}

/** Outcome of a bulk verify/publish, including per-question failures. */
export interface BulkResult {
  succeeded: number
  failed: number
  errors: { question_id: string; error: string }[]
}

function unavailable(): never {
  throw new Error(
    'The review desk requires the Supabase backend. Set VITE_BACKEND=supabase.',
  )
}


export interface SubjectProgress {
  subject_code: string
  subject_name: string
  total: number
  pending: number
  published: number
  rejected: number
  quarantined: number
  eligible: number
}

export interface BulkPublishResult {
  batch_id: string
  would_publish: number
  published: number
  skipped: number
  reason_counts: Record<string, number>
}

export const reviewService = {
  /** False in mock mode — the caller shows an explanation instead of a dead UI. */
  isAvailable(): boolean {
    return USE_SUPABASE
  },

  async list(filter: ReviewFilter = {}): Promise<{ rows: ReviewQuestion[]; total: number }> {
    if (!USE_SUPABASE) unavailable()
    const { data, error } = await getSupabase().rpc('review_queue', {
      p_status: filter.status ?? 'pending',
      p_branch: filter.branchId ?? null,
      p_subject_code: filter.subjectCode ?? null,
      p_semester: filter.semester ?? null,
      p_topic: filter.topic ?? null,
      p_difficulty: filter.difficulty ?? null,
      p_question_type: filter.questionType ?? null,
      p_source_pack: filter.sourcePack ?? null,
      p_search: filter.search ?? null,
      p_limit: Math.max(1, Math.min(filter.limit ?? 25, 100)),
      p_offset: Math.max(0, filter.offset ?? 0),
    })
    if (error) throw new Error(error.message)
    const rows = (data ?? []) as ReviewQuestion[]
    return { rows, total: rows.length ? Number(rows[0].total_count) : 0 }
  },

  async facets(): Promise<ReviewFacets> {
    if (!USE_SUPABASE) unavailable()
    const { data, error } = await getSupabase().rpc('review_queue_facets')
    if (error) throw new Error(error.message)
    return data as ReviewFacets
  },

  /** Mark reviewed and correct, but keep it OUT of live quizzes. */
  async verify(questionId: string, note?: string): Promise<void> {
    if (!USE_SUPABASE) unavailable()
    const { error } = await getSupabase().rpc('review_verify_question', {
      p_question: questionId,
      p_note: note ?? null,
    })
    if (error) throw new Error(error.message)
  },

  /** Verify AND make live. The server re-checks the question is answerable. */
  async publish(questionId: string, note?: string): Promise<void> {
    if (!USE_SUPABASE) unavailable()
    const { error } = await getSupabase().rpc('review_publish_question', {
      p_question: questionId,
      p_note: note ?? null,
    })
    if (error) throw new Error(error.message)
  },

  /** Unpublish + copy into quarantine WITH the full payload. Never deletes. */
  async reject(
    questionId: string,
    reason: QuarantineReason = 'manual_review',
    note?: string,
  ): Promise<void> {
    if (!USE_SUPABASE) unavailable()
    const { error } = await getSupabase().rpc('review_reject_question', {
      p_question: questionId,
      p_reason: reason,
      p_note: note ?? null,
    })
    if (error) throw new Error(error.message)
  },

  async skip(questionId: string, note?: string): Promise<void> {
    if (!USE_SUPABASE) unavailable()
    const { error } = await getSupabase().rpc('review_skip_question', {
      p_question: questionId,
      p_note: note ?? null,
    })
    if (error) throw new Error(error.message)
  },

  /**
   * Edit. Changing the stem or the options is an academic-content change, so
   * the server demotes the question to pending/unverified/unpublished and it
   * must be reviewed again. Metadata-only edits do not demote.
   */
  async edit(questionId: string, patch: EditPayload): Promise<void> {
    if (!USE_SUPABASE) unavailable()
    const { error } = await getSupabase().rpc('review_edit_question', {
      p_question: questionId,
      p_stem: patch.stem ?? null,
      p_explanation: patch.explanation ?? null,
      p_difficulty: patch.difficulty ?? null,
      p_topic: patch.topic ?? null,
      p_options: patch.options ?? null,
      p_note: patch.note ?? null,
    })
    if (error) throw new Error(error.message)
  },

  /** Publish a batch; unpublishable rows are skipped. Returns how many landed. */
  async publishMany(questionIds: string[]): Promise<number> {
    if (!USE_SUPABASE) unavailable()
    const { data, error } = await getSupabase().rpc('review_publish_many', {
      p_questions: questionIds,
    })
    if (error) throw new Error(error.message)
    return Number(data ?? 0)
  },

  /**
   * Bulk verify / publish with HONEST reporting.
   *
   * `publishMany` above returns only a count, so "8 of 10 worked" is
   * indistinguishable from "10 worked". This returns per-question failures so
   * the reviewer is told exactly what did not go live and why (e.g. a question
   * whose options are all marked correct). Each question is handled in its own
   * sub-transaction server-side: one bad row does not undo the good ones.
   */
  async bulkAction(
    questionIds: string[],
    action: 'verify' | 'publish',
    note?: string,
  ): Promise<BulkResult> {
    if (!USE_SUPABASE) unavailable()
    const { data, error } = await getSupabase().rpc('review_bulk_action', {
      p_questions: questionIds,
      p_action: action,
      p_note: note ?? null,
    })
    if (error) throw new Error(error.message)
    const r = (data ?? {}) as Partial<BulkResult>
    return {
      succeeded: Number(r.succeeded ?? 0),
      failed: Number(r.failed ?? 0),
      errors: r.errors ?? [],
    }
  },

  /* ---------------------- Phase 4: bulk review at scale ---------------------- */

  /** Per-subject progress: how much is left, and how much can be auto-published. */
  async progress(): Promise<SubjectProgress[]> {
    if (!USE_SUPABASE) unavailable()
    const { data, error } = await getSupabase().rpc('review_progress')
    if (error) throw new Error(error.message)
    return (data ?? []) as SubjectProgress[]
  },

  /**
   * Publish everything in a subject that passes the strict automated checks.
   * Dry-run by default so the admin always sees the count BEFORE anything
   * changes. Returns a batch id that can be handed to `undoBatch`.
   */
  async bulkPublishSafe(
    subjectCode: string | null,
    limit = 500,
    dryRun = true,
  ): Promise<BulkPublishResult> {
    if (!USE_SUPABASE) unavailable()
    const { data, error } = await getSupabase().rpc('bulk_publish_safe', {
      p_subject_code: subjectCode,
      p_limit: limit,
      p_dry_run: dryRun,
    })
    if (error) throw new Error(error.message)
    const r = (Array.isArray(data) ? data[0] : data) as Partial<BulkPublishResult>
    return {
      batch_id: String(r.batch_id ?? ''),
      would_publish: Number(r.would_publish ?? 0),
      published: Number(r.published ?? 0),
      skipped: Number(r.skipped ?? 0),
      reason_counts: r.reason_counts ?? {},
    }
  },

  /** Reverse a bulk publish. Returns how many rows went back to pending. */
  async undoBatch(batchId: string): Promise<number> {
    if (!USE_SUPABASE) unavailable()
    const { data, error } = await getSupabase().rpc('unpublish_batch', { p_batch: batchId })
    if (error) throw new Error(error.message)
    return Number(data ?? 0)
  },
}
