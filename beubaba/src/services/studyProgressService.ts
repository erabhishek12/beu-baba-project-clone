/**
 * Syllabus progress + exam planner service.
 *
 * Answers the question a student actually asks before an exam: "how much of
 * this subject is left, and what should I study today?"
 *
 * All of it is server-side so it follows the student across devices — progress
 * that vanishes when you clear your browser is worse than none.
 */
import { USE_SUPABASE } from '@/services/backend/config'
import { getSupabase } from '@/services/backend/supabaseClient'

export interface SubjectProgress {
  subject_code: string
  subject_name: string
  total_units: number
  studied_units: number
  percent: number
  exam_on: string | null
  days_left: number | null
}

export interface PlanDay {
  day_number: number
  plan_date: string
  unit_index: number
  unit_title: string
}

export const studyProgressService = {
  async summary(): Promise<SubjectProgress[]> {
    if (!USE_SUPABASE) return []
    const { data, error } = await getSupabase().rpc('study_progress_summary')
    if (error) throw new Error(error.message)
    return (data ?? []) as SubjectProgress[]
  },

  /** Which unit numbers of a subject the student has already ticked off. */
  async studiedUnits(subjectCode: string): Promise<number[]> {
    if (!USE_SUPABASE) return []
    const { data, error } = await getSupabase()
      .from('study_progress')
      .select('unit_index')
      .eq('subject_code', subjectCode)
    if (error) throw new Error(error.message)
    return (data ?? []).map((r) => Number((r as { unit_index: number }).unit_index))
  },

  /** Mark a unit studied / not studied. Returns the new state. */
  async toggleUnit(subjectCode: string, unitIndex: number, unitTitle?: string): Promise<boolean> {
    if (!USE_SUPABASE) return false
    const { data, error } = await getSupabase().rpc('toggle_unit_studied', {
      p_subject_code: subjectCode,
      p_unit_index: unitIndex,
      p_unit_title: unitTitle ?? null,
    })
    if (error) throw new Error(error.message)
    return Boolean(data)
  },

  /** Save an exam date, or pass null to clear it. */
  async setExamDate(subjectCode: string, examOn: string | null, subjectName?: string): Promise<void> {
    if (!USE_SUPABASE) return
    const { error } = await getSupabase().rpc('set_exam_date', {
      p_subject_code: subjectCode,
      p_exam_on: examOn,
      p_subject_name: subjectName ?? null,
    })
    if (error) throw new Error(error.message)
  },

  /** Day-by-day plan across the units still to study. Empty if no exam date. */
  async plan(subjectCode: string): Promise<PlanDay[]> {
    if (!USE_SUPABASE) return []
    const { data, error } = await getSupabase().rpc('study_plan', {
      p_subject_code: subjectCode,
    })
    if (error) throw new Error(error.message)
    return (data ?? []) as PlanDay[]
  },
}
