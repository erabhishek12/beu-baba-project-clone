/**
 * Supabase implementation of the auth contract (mirrors services/authService).
 * Same method signatures + same SessionUser shape, so AuthProvider is unchanged.
 *
 * Registration passes the multi-step profile as auth metadata; the DB trigger
 * handle_new_user() creates profiles + student_profiles + the default 'student'
 * role server-side (spec 11 §9). The client can never set its own role.
 */
import type { Profile, Role, SessionUser, StudentProfile } from '@/types/domain'
import { AuthError } from '@/types/domain'
import type { RegisterInput } from '@/services/authService'
import { getSupabase } from './supabaseClient'

async function loadSessionUser(userId: string, email: string, verified: boolean): Promise<SessionUser> {
  const sb = getSupabase()
  const [{ data: profile }, { data: student }, { data: roleRows }] = await Promise.all([
    sb.from('profiles').select('*').eq('id', userId).single(),
    sb.from('student_profiles').select('*').eq('user_id', userId).maybeSingle(),
    sb.from('user_roles').select('role').eq('user_id', userId),
  ])

  const p = profile as Record<string, unknown> | null
  const s = student as Record<string, unknown> | null

  const mappedProfile: Profile = {
    id: userId,
    full_name: (p?.full_name as string) ?? 'Student',
    email: (p?.email as string) ?? email,
    phone: (p?.phone as string) ?? '',
    avatar_type: ((p?.avatar_type as string) ?? 'generated') as Profile['avatar_type'],
    avatar_url: (p?.avatar_url as string) ?? null,
    avatar_character_id: (p?.avatar_character_id as string) ?? null,
    gender: (p?.gender as Profile['gender']) ?? 'unspecified',
    bio: (p?.bio as string) ?? null,
    is_active: (p?.is_active as boolean) ?? true,
    onboarding_completed: (s?.onboarding_completed as boolean) ?? false,
    created_at: (p?.created_at as string) ?? new Date().toISOString(),
    updated_at: (p?.updated_at as string) ?? new Date().toISOString(),
  }

  const mappedStudent: StudentProfile | null = s
    ? {
        user_id: userId,
        course_id: (s.course_id as string) ?? null,
        branch_id: (s.branch_id as string) ?? null,
        admission_year: (s.admission_year as number) ?? null,
        current_semester_id: (s.current_semester_id as string) ?? null,
        enrollment_number: (s.enrollment_number as string) ?? null,
        college_name: (s.college_name as string) ?? null,
        onboarding_completed: (s.onboarding_completed as boolean) ?? false,
      }
    : null

  const roles = ((roleRows as { role: Role }[]) ?? []).map((r) => r.role)
  return {
    auth: { id: userId, email, email_verified: verified },
    profile: mappedProfile,
    student: mappedStudent,
    roles: roles.length ? roles : ['student'],
  }
}

export const supabaseAuthService = {
  async getSession(): Promise<SessionUser | null> {
    const sb = getSupabase()
    const { data } = await sb.auth.getSession()
    const u = data.session?.user
    if (!u) return null
    return loadSessionUser(u.id, u.email ?? '', Boolean(u.email_confirmed_at))
  },

  async login(email: string, password: string): Promise<SessionUser> {
    const sb = getSupabase()
    const { data, error } = await sb.auth.signInWithPassword({ email, password })
    if (error || !data.user) throw new AuthError('invalid_credentials')
    return loadSessionUser(data.user.id, data.user.email ?? email, Boolean(data.user.email_confirmed_at))
  },

  async register(input: RegisterInput): Promise<SessionUser> {
    const sb = getSupabase()
    if (input.password.length < 8) throw new AuthError('weak_password')
    const { data, error } = await sb.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        // handle_new_user() reads these to build profile + student_profile.
        data: {
          full_name: input.full_name,
          phone: input.phone,
          gender: input.gender,
          avatar_type: input.avatar_type,
          avatar_url: input.avatar_url ?? null,
          avatar_character_id: input.avatar_character_id ?? null,
          course_id: input.course_id,
          branch_id: input.branch_id,
          current_semester_id: input.semester_id,
          admission_year: input.admission_year ?? new Date().getFullYear(),
          onboarding_completed: true,
        },
      },
    })
    if (error) {
      if (/registered|exists/i.test(error.message)) throw new AuthError('email_taken')
      throw new AuthError('unknown')
    }
    if (!data.user) throw new AuthError('email_not_verified')
    // If email confirmation is required, there may be no session yet.
    if (!data.session) {
      return loadSessionUser(data.user.id, input.email, false)
    }
    return loadSessionUser(data.user.id, input.email, Boolean(data.user.email_confirmed_at))
  },

  async logout(): Promise<void> {
    await getSupabase().auth.signOut()
  },

  async requestPasswordReset(email: string): Promise<void> {
    await getSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })
  },

  /**
   * Rotate the password for the signed-in user. The current password is
   * re-verified with a real signIn first so a stolen unlocked device cannot
   * silently swap the password; updateUser then rotates it server-side.
   */
  async changePassword(current: string, next: string): Promise<void> {
    const sb = getSupabase()
    const { data: session } = await sb.auth.getSession()
    const email = session.session?.user.email
    if (!email) throw new AuthError('invalid_credentials')
    const check = await sb.auth.signInWithPassword({ email, password: current })
    if (check.error) throw new AuthError('invalid_credentials')
    const upd = await sb.auth.updateUser({ password: next })
    if (upd.error) throw new AuthError('weak_password')
  },
}
