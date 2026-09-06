import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { FullScreenLoader } from '@/components/feedback/FullScreenLoader'

/**
 * Requires an authenticated session; otherwise redirects to login.
 *
 * Also gates on profile completeness. A Google sign-in gives us an email and a
 * name but NOT a branch or semester, and the whole app is organised around
 * those — without them the Quiz tab has nothing to filter and Home is empty.
 * So an incomplete profile is sent to /complete-profile first.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <FullScreenLoader />
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const needsSetup =
    !!user &&
    (!user.student?.branch_id ||
      !user.student?.current_semester_id ||
      !user.student?.onboarding_completed)
  if (needsSetup && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />
  }

  return <>{children}</>
}

/** For auth screens: authenticated users are bounced to the app. */
export function RequireGuest({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  if (status === 'loading') return <FullScreenLoader />
  if (status === 'authenticated') return <Navigate to="/" replace />
  return <>{children}</>
}

/**
 * Requires a privileged (admin/moderator) session. Non-privileged users are
 * sent home. This mirrors the server-side RBAC boundary — the client guard is
 * UX only; the real authority is enforced by RLS/policies in the backend.
 */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { status, isAdmin } = useAuth()
  if (status === 'loading') return <FullScreenLoader />
  if (status === 'unauthenticated') return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}
