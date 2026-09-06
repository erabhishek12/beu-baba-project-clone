/**
 * Profile service — documented contract (docs 04 §7, 09 §7-9, 21).
 * Ownership is enforced: a caller may only read/mutate their OWN profile.
 * The mock mirrors the RLS rule (id must equal the current session user).
 */
import type { AvatarType, Gender, SessionUser, StudentProfile } from '@/types/domain'
import { accountsDb } from '@/services/mock/db'
import { authService } from '@/services/authService'
import { delay } from '@/services/storage'
import { USE_SUPABASE } from '@/services/backend/config'
import { getSupabase } from '@/services/backend/supabaseClient'
import {
  updateSupabaseProfile,
  updateSupabaseAcademic,
} from '@/services/backend/supabaseProfile'

export interface ProfileEditable {
  full_name: string
  phone: string
  bio: string | null
}

export interface AvatarSelection {
  avatar_type: AvatarType
  avatar_character_id?: string | null
  avatar_url?: string | null
  gender?: Gender
}

export interface AcademicSelection {
  branch_id: string | null
  current_semester_id: string | null
  admission_year?: number | null
}

/**
 * Ownership check.
 *
 * With the real backend the profile lives in PostgreSQL, not in `accountsDb`,
 * so we must NOT demand a mock record — that lookup is what made every edit
 * fail with "Profile not found." RLS is the real guard; this is just an early,
 * friendlier check.
 */
async function requireSession(userId: string) {
  const session = await authService.getSession()
  if (!session || session.auth.id !== userId) {
    throw new Error('Not authorized to modify this profile.')
  }
  return session
}

async function requireOwner(userId: string) {
  const session = await requireSession(userId)
  const rec = accountsDb.byId(userId)
  if (!rec) throw new Error('Profile not found.')
  return { session, rec }
}

export const profileService = {
  async updateProfile(userId: string, patch: ProfileEditable): Promise<SessionUser> {
    if (USE_SUPABASE) {
      await requireSession(userId)
      await updateSupabaseProfile(userId, {
        full_name: patch.full_name.trim(),
        phone: patch.phone.trim() || null,
        bio: patch.bio,
      })
      return (await authService.getSession())!
    }
    await delay(260)
    const { rec } = await requireOwner(userId)
    rec.profile = {
      ...rec.profile,
      full_name: patch.full_name.trim(),
      phone: patch.phone.trim(),
      bio: patch.bio,
      updated_at: new Date().toISOString(),
    }
    accountsDb.upsert(rec)
    return (await authService.getSession())!
  },

  async updateAvatar(userId: string, sel: AvatarSelection): Promise<SessionUser> {
    if (USE_SUPABASE) {
      await requireSession(userId)
      await updateSupabaseProfile(userId, {
        avatar_type: sel.avatar_type,
        avatar_character_id: sel.avatar_character_id ?? null,
        avatar_url: sel.avatar_url ?? null,
        ...(sel.gender !== undefined ? { gender: sel.gender } : {}),
      })
      return (await authService.getSession())!
    }
    await delay(220)
    const { rec } = await requireOwner(userId)
    rec.profile = {
      ...rec.profile,
      avatar_type: sel.avatar_type,
      avatar_character_id: sel.avatar_character_id ?? null,
      avatar_url: sel.avatar_url ?? null,
      gender: sel.gender ?? rec.profile.gender,
      updated_at: new Date().toISOString(),
    }
    accountsDb.upsert(rec)
    return (await authService.getSession())!
  },

  async updateAcademic(userId: string, sel: AcademicSelection): Promise<SessionUser> {
    if (USE_SUPABASE) {
      await requireSession(userId)
      await updateSupabaseAcademic(userId, {
        branch_id: sel.branch_id,
        current_semester_id: sel.current_semester_id,
        admission_year: sel.admission_year ?? null,
      })
      return (await authService.getSession())!
    }
    await delay(220)
    const { rec } = await requireOwner(userId)
    const student: StudentProfile = {
      ...(rec.student ?? {
        user_id: userId,
        course_id: null,
        branch_id: null,
        admission_year: null,
        current_semester_id: null,
        onboarding_completed: true,
      }),
      branch_id: sel.branch_id,
      current_semester_id: sel.current_semester_id,
      admission_year: sel.admission_year ?? rec.student?.admission_year ?? null,
    }
    rec.student = student
    accountsDb.upsert(rec)
    return (await authService.getSession())!
  },

  /**
   * Mark onboarding finished.
   *
   * Kept separate from updateAcademic so the flag only flips once the student
   * has actually supplied branch + semester — otherwise the guard would let
   * them into an app that cannot show them anything.
   */
  async completeOnboarding(userId: string): Promise<void> {
    if (USE_SUPABASE) {
      await requireSession(userId)
      const { error } = await getSupabase()
        .from('student_profiles')
        .update({ onboarding_completed: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
      if (error) throw new Error(error.message)
      return
    }
    const { rec } = await requireOwner(userId)
    rec.student = { ...(rec.student ?? { user_id: userId }), onboarding_completed: true } as typeof rec.student
    accountsDb.upsert(rec)
  },
}
