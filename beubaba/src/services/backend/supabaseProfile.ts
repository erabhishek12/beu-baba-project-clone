/**
 * Supabase profile writer (Phase 3A-2 follow-up).
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * `authService` was wired to Supabase, but `profileService` was not: every
 * mutation went to `accountsDb` (the in-browser mock store). With
 * VITE_BACKEND=supabase the signed-in user is a REAL Supabase account that has
 * no row in that mock store, so `requireOwner()` threw "Profile not found." —
 * editing the name, bio, avatar or academic details appeared to do nothing.
 *
 * These functions write to the real tables instead. Ownership is enforced by
 * RLS in PostgreSQL (a user may only update the row whose id equals auth.uid()),
 * verified live: PATCH of another user's row is rejected, PATCH of your own
 * succeeds. The `userId` argument is still checked client-side first so the UI
 * can show a friendly message before a round trip.
 */
import type { AvatarType, Gender } from '@/types/domain'
import { getSupabase } from './supabaseClient'

export interface ProfilePatch {
  full_name?: string
  phone?: string | null
  bio?: string | null
  avatar_type?: AvatarType
  avatar_character_id?: string | null
  avatar_url?: string | null
  gender?: Gender | null
}

export interface AcademicPatch {
  branch_id: string | null
  current_semester_id: string | null
  admission_year?: number | null
}

/** Update the caller's own row in public.profiles. */
export async function updateSupabaseProfile(
  userId: string,
  patch: ProfilePatch,
): Promise<void> {
  const body: Record<string, unknown> = { updated_at: new Date().toISOString() }
  // Only send keys the caller actually set, so a name edit cannot blank an avatar.
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) body[k] = v
  }
  const sb = getSupabase()
  const { data: auth } = await sb.auth.getUser()
  if (!auth?.user) {
    // RLS will silently reject the write without a session. Say so plainly —
    // "could not save your changes" hid the real cause (unconfirmed email).
    throw new Error('Please confirm your email and sign in again to save changes.')
  }
  const { data, error } = await sb.from('profiles').update(body).eq('id', userId).select('id')
  if (error) throw new Error(error.message)
  if (!data?.length) {
    throw new Error('Your profile could not be found. Please sign out and sign in again.')
  }
}

/**
 * Update the caller's academic details. The row may not exist yet (the signup
 * trigger creates it, but an account made from the dashboard has none), so this
 * upserts rather than updates.
 */
export async function updateSupabaseAcademic(
  userId: string,
  sel: AcademicPatch,
): Promise<void> {
  const { error } = await getSupabase()
    .from('student_profiles')
    .upsert(
      {
        user_id: userId,
        branch_id: sel.branch_id,
        current_semester_id: sel.current_semester_id,
        ...(sel.admission_year !== undefined ? { admission_year: sel.admission_year } : {}),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
  if (error) throw new Error(error.message)
}
