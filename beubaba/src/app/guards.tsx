import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { FullScreenLoader } from '@/components/feedback/FullScreenLoader'

/** Requires an authenticated session; otherwise redirects to login. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <FullScreenLoader />
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
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
