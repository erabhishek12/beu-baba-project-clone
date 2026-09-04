/**
 * Profile service — documented contract (docs 04 §7, 09 §7-9, 21).
 * Ownership is enforced: a caller may only read/mutate their OWN profile.
 * The mock mirrors the RLS rule (id must equal the current session user).
 */
import type { AvatarType, Gender, SessionUser, StudentProfile } from '@/types/domain'
import { accountsDb } from '@/services/mock/db'
import { authService } from '@/services/authService'
import { delay } from '@/services/storage'

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

async function requireOwner(userId: string) {
  const session = await authService.getSession()
  if (!session || session.auth.id !== userId) {
    throw new Error('Not authorized to modify this profile.')
  }
  const rec = accountsDb.byId(userId)
  if (!rec) throw new Error('Profile not found.')
  return { session, rec }
}

export const profileService = {
  async updateProfile(userId: string, patch: ProfileEditable): Promise<SessionUser> {
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
}
