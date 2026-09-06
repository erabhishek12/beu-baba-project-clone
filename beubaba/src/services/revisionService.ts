/**
 * Revision Center + Math Mind service (spec §19, §20).
 *
 * Both features are only meaningful with the real backend — a revision schedule
 * that resets when you clear your browser is not a revision schedule. In mock
 * mode they degrade quietly to empty rather than inventing progress.
 */
import { USE_SUPABASE } from '@/services/backend/config'
import { getSupabase } from '@/services/backend/supabaseClient'

export interface RevisionItem {
  id: string
  item_type: string
  target_id: string
  title: string
  subtitle: string | null
  url: string | null
  topic: string | null
  box: number
  times_revised: number
  due_at: string | null
}

export interface WeakTopic {
  subject_code: string
  topic: string
  attempted: number
  correct: number
  accuracy: number
}

export interface RevisionOverview {
  total: number
  due: number
  mastered: number
  weak_topics: WeakTopic[]
}

export interface LevelStat {
  level: number
  rounds: number
  best_pct: number
  accuracy: number
}

export interface MathProgress {
  rounds: number
  accuracy: number
  levels: LevelStat[]
  unlocked_level: number
}

const EMPTY_OVERVIEW: RevisionOverview = { total: 0, due: 0, mastered: 0, weak_topics: [] }
const EMPTY_PROGRESS: MathProgress = { rounds: 0, accuracy: 0, levels: [], unlocked_level: 1 }

export const revisionService = {
  async overview(): Promise<RevisionOverview> {
    if (!USE_SUPABASE) return EMPTY_OVERVIEW
    const { data, error } = await getSupabase().rpc('revision_overview')
    if (error) throw new Error(error.message)
    return { ...EMPTY_OVERVIEW, ...(data as RevisionOverview) }
  },

  /** Items due for revision right now. */
  async due(limit = 20): Promise<RevisionItem[]> {
    if (!USE_SUPABASE) return []
    const { data, error } = await getSupabase().rpc('revision_due', { p_limit: limit })
    if (error) throw new Error(error.message)
    return (data ?? []) as RevisionItem[]
  },

  /** Right/wrong on a revision item — moves it through the spaced-repetition boxes. */
  async mark(itemId: string, correct: boolean): Promise<void> {
    if (!USE_SUPABASE) return
    const { error } = await getSupabase().rpc('revision_mark', {
      p_item: itemId,
      p_correct: correct,
    })
    if (error) throw new Error(error.message)
  },

  /**
   * Pull the wrong answers of a finished bank attempt into revision, and update
   * weak-topic accuracy. Call once, right after a quiz is graded.
   */
  async syncFromAttempt(attemptId: string): Promise<number> {
    if (!USE_SUPABASE) return 0
    const { data, error } = await getSupabase().rpc('sync_revision_from_bank_attempt', {
      p_attempt: attemptId,
    })
    if (error) throw new Error(error.message)
    return Number(data ?? 0)
  },
}

export const mathMindService = {
  async progress(): Promise<MathProgress> {
    if (!USE_SUPABASE) return EMPTY_PROGRESS
    const { data, error } = await getSupabase().rpc('mathmind_progress')
    if (error) throw new Error(error.message)
    return { ...EMPTY_PROGRESS, ...(data as MathProgress) }
  },

  async saveRound(input: {
    level: number
    total: number
    correct: number
    topic?: string | null
    durationMs?: number | null
  }): Promise<void> {
    if (!USE_SUPABASE) return
    const { error } = await getSupabase().rpc('mathmind_save_round', {
      p_level: input.level,
      p_total: input.total,
      p_correct: input.correct,
      p_topic: input.topic ?? null,
      p_duration_ms: input.durationMs ?? null,
    })
    if (error) throw new Error(error.message)
  },
}
