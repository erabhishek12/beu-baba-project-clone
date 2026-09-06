import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Role, SessionUser } from '@/types/domain'
import { authService, type RegisterInput } from '@/services/authService'
import { ensureDemoAdmin } from '@/services/mock/db'
import { ensureDemoModeration } from '@/services/mock/seedDemoModeration'
import { USE_SUPABASE } from '@/services/backend/config'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  status: AuthStatus
  user: SessionUser | null
  roles: Role[]
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  /** Returns the new session so the caller can check email verification. */
  register: (input: RegisterInput) => Promise<SessionUser>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  setUser: (user: SessionUser) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const ADMIN_ROLES: Role[] = ['moderator', 'content_manager', 'support_manager', 'admin', 'super_admin']

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<SessionUser | null>(null)

  const bootstrap = useCallback(async () => {
    // MOCK-only: make sure the demo admin exists so the moderation panel is
    // reachable in the preview. Skipped entirely on the real Supabase backend.
    if (!USE_SUPABASE) {
      await ensureDemoAdmin()
      ensureDemoModeration()
    }
    const session = await authService.getSession()
    setUser(session)
    setStatus(session ? 'authenticated' : 'unauthenticated')
  }, [])

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  const login = useCallback(async (email: string, password: string) => {
    const session = await authService.login(email, password)
    setUser(session)
    setStatus('authenticated')
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    const session = await authService.register(input)
    setUser(session)
    setStatus('authenticated')
    return session
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    const roles = user?.roles ?? []
    return {
      status,
      user,
      roles,
      isAdmin: roles.some((r) => ADMIN_ROLES.includes(r)),
      login,
      register,
      logout,
      refresh: bootstrap,
      setUser,
    }
  }, [status, user, login, register, logout, bootstrap])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
