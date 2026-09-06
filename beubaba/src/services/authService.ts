/**
 * Auth service — documented contract (docs 09, 11, 21).
 * Backed by the mock DB today; a Supabase adapter can implement the same
 * interface later. Feature code imports ONLY from here, never from the mock.
 *
 * Security notes reflected in the mock so behavior matches spec:
 *  - passwords are never stored in plaintext (hashed);
 *  - roles come from the account record (server), never trusted from client;
 *  - login errors avoid account enumeration (generic invalid_credentials);
 *  - session is a real object, never a `localStorage.authenticated = true` boolean.
 */
import type {
  AuthErrorCode,
  Gender,
  Profile,
  Role,
  SessionUser,
  StudentProfile,
} from '@/types/domain'
import { AuthError } from '@/types/domain'
import { accountsDb, type AccountRecord } from '@/services/mock/db'
import { hashPassword, verifyPassword } from '@/services/mock/hash'
import { store, delay } from '@/services/storage'
import { USE_SUPABASE } from '@/services/backend/config'
import { supabaseAuthService } from '@/services/backend/supabaseAuth'

const SESSION_KEY = 'session'
/** Sessions expire 30 days after issue; restoration then asks for login again. */
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000
/** Brute-force guard: 5 failed logins lock the account for 10 minutes (mock). */
const LOCK_AFTER_FAILURES = 5
const LOCK_MS = 10 * 60 * 1000
const LOCK_KEY = 'auth_login_failures'

interface SessionToken {
  userId: string
  issuedAt: number
  expiresAt: number
}

interface FailureRecord {
  count: number
  lockedUntil: number | null
}

function failuresFor(email: string): FailureRecord {
  const all = store.get<Record<string, FailureRecord>>(LOCK_KEY, {})
  return all[email] ?? { count: 0, lockedUntil: null }
}

function setFailures(email: string, rec: FailureRecord): void {
  const all = store.get<Record<string, FailureRecord>>(LOCK_KEY, {})
  all[email] = rec
  store.set(LOCK_KEY, all)
}

function clearFailures(email: string): void {
  const all = store.get<Record<string, FailureRecord>>(LOCK_KEY, {})
  delete all[email]
  store.set(LOCK_KEY, all)
}

function uuid(): string {
  return crypto.randomUUID()
}

function toSession(rec: AccountRecord): SessionUser {
  return {
    auth: { id: rec.id, email: rec.email, email_verified: rec.email_verified },
    profile: rec.profile,
    student: rec.student,
    roles: rec.roles,
  }
}

// ---- Registration payloads (multi-step, assembled at the end) ----
export interface RegisterAccountInput {
  full_name: string
  email: string
  phone: string
  password: string
}

export interface RegisterAcademicInput {
  course_id: string
  branch_id: string
  semester_id: string
  admission_year?: number
}

export interface RegisterProfileInput {
  gender: Gender
  avatar_type: 'generated' | 'uploaded'
  avatar_character_id?: string | null
  avatar_url?: string | null
}

export interface RegisterInput
  extends RegisterAccountInput,
    RegisterAcademicInput,
    RegisterProfileInput {}

const mockAuthService = {
  /** Current session, if any. Validates the token against the account store. */
  async getSession(): Promise<SessionUser | null> {
    const token = store.get<SessionToken | null>(SESSION_KEY, null)
    if (!token) return null
    // Expired sessions are dropped, never silently extended.
    if (typeof token.expiresAt === 'number' && Date.now() > token.expiresAt) {
      store.remove(SESSION_KEY)
      return null
    }
    const rec = accountsDb.byId(token.userId)
    if (!rec || !rec.is_active) {
      store.remove(SESSION_KEY)
      return null
    }
    return toSession(rec)
  },

  /** True if an email is already registered (used only for pre-submit UX hints). */
  async emailExists(email: string): Promise<boolean> {
    await delay(120)
    return Boolean(accountsDb.byEmail(email))
  },

  async register(input: RegisterInput): Promise<SessionUser> {
    await delay(320)
    if (accountsDb.byEmail(input.email)) {
      throw new AuthError('email_taken')
    }
    if (input.password.length < 8) {
      throw new AuthError('weak_password')
    }

    const now = new Date().toISOString()
    const id = uuid()
    const profile: Profile = {
      id,
      full_name: input.full_name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      avatar_type: input.avatar_type,
      avatar_url: input.avatar_url ?? null,
      avatar_character_id: input.avatar_character_id ?? null,
      gender: input.gender,
      bio: null,
      is_active: true,
      onboarding_completed: true,
      created_at: now,
      updated_at: now,
    }
    const student: StudentProfile = {
      user_id: id,
      course_id: input.course_id,
      branch_id: input.branch_id,
      current_semester_id: input.semester_id,
      admission_year: input.admission_year ?? new Date().getFullYear(),
      enrollment_number: null,
      college_name: null,
      onboarding_completed: true,
    }
    const roles: Role[] = ['student']

    const rec: AccountRecord = {
      id,
      email: profile.email,
      password_hash: await hashPassword(input.password),
      // Mock: mark verified so the preview is usable end-to-end. The UI still
      // demonstrates the email-verification state where the flow requires it.
      email_verified: true,
      is_active: true,
      profile,
      student,
      roles,
    }
    accountsDb.upsert(rec)
    const issuedAt = Date.now()
    store.set<SessionToken>(SESSION_KEY, {
      userId: id,
      issuedAt,
      expiresAt: issuedAt + SESSION_TTL_MS,
    })
    return toSession(rec)
  },

  async login(email: string, password: string): Promise<SessionUser> {
    await delay(300)
    const key = email.trim().toLowerCase()
    // Brute-force guard (checked before any lookup so it cannot enumerate).
    const fails = failuresFor(key)
    if (fails.lockedUntil && Date.now() < fails.lockedUntil) {
      throw new AuthError('rate_limited')
    }
    const rec = accountsDb.byEmail(key)
    // Avoid account enumeration: identical error whether email or password wrong.
    if (!rec || !(await verifyPassword(password, rec.password_hash))) {
      const count = (fails.lockedUntil && Date.now() >= fails.lockedUntil ? 0 : fails.count) + 1
      setFailures(key, {
        count,
        lockedUntil: count >= LOCK_AFTER_FAILURES ? Date.now() + LOCK_MS : null,
      })
      throw new AuthError('invalid_credentials')
    }
    if (!rec.is_active) throw new AuthError('account_disabled')
    clearFailures(key)
    const issuedAt = Date.now()
    store.set<SessionToken>(SESSION_KEY, {
      userId: rec.id,
      issuedAt,
      expiresAt: issuedAt + SESSION_TTL_MS,
    })
    return toSession(rec)
  },

  async logout(): Promise<void> {
    await delay(120)
    store.remove(SESSION_KEY)
  },

  /**
   * Authenticated password change (the usable reset path while email
   * delivery is ⛔ blocked on the Supabase backend). Verifies the current
   * password server-side (mock DB) before rotating the hash.
   */
  async changePassword(userId: string, current: string, next: string): Promise<void> {
    await delay(280)
    if (next.length < 8) throw new AuthError('weak_password')
    const rec = accountsDb.byId(userId)
    if (!rec) throw new AuthError('invalid_credentials')
    if (!(await verifyPassword(current, rec.password_hash))) {
      throw new AuthError('invalid_credentials')
    }
    accountsDb.upsert({ ...rec, password_hash: await hashPassword(next) })
  },

  /** Mock password reset: always returns success (no enumeration leak). */
  async requestPasswordReset(_email: string): Promise<void> {
    await delay(280)
    /* In production this triggers a Supabase reset email. */
  },
}

/**
 * Public auth service. Delegates to the Supabase adapter when the real backend
 * is configured (VITE_BACKEND=supabase + keys), otherwise the local mock. The
 * shared method surface (getSession/login/register/logout/requestPasswordReset)
 * is identical, so no feature code changes when the backend is swapped.
 */
export const authService = {
  getSession: (): Promise<SessionUser | null> =>
    USE_SUPABASE ? supabaseAuthService.getSession() : mockAuthService.getSession(),
  emailExists: (email: string): Promise<boolean> => mockAuthService.emailExists(email),
  login: (email: string, password: string): Promise<SessionUser> =>
    USE_SUPABASE ? supabaseAuthService.login(email, password) : mockAuthService.login(email, password),
  register: (input: RegisterInput): Promise<SessionUser> =>
    USE_SUPABASE ? supabaseAuthService.register(input) : mockAuthService.register(input),
  logout: (): Promise<void> =>
    USE_SUPABASE ? supabaseAuthService.logout() : mockAuthService.logout(),
  requestPasswordReset: (email: string): Promise<void> =>
    USE_SUPABASE
      ? supabaseAuthService.requestPasswordReset(email)
      : mockAuthService.requestPasswordReset(email),
  /** Google sign-in. Only meaningful with the real backend. */
  signInWithGoogle: (): Promise<void> =>
    USE_SUPABASE
      ? supabaseAuthService.signInWithGoogle()
      : Promise.reject(new Error('Google sign-in needs the online backend.')),
  /** Has the signed-up email been confirmed yet? */
  refreshVerification: (): Promise<boolean> =>
    USE_SUPABASE ? supabaseAuthService.refreshVerification() : Promise.resolve(true),
  resendConfirmation: (email: string): Promise<void> =>
    USE_SUPABASE ? supabaseAuthService.resendConfirmation(email) : Promise.resolve(),
  changePassword: (userId: string, current: string, next: string): Promise<void> =>
    USE_SUPABASE
      ? supabaseAuthService.changePassword(current, next)
      : mockAuthService.changePassword(userId, current, next),
}

/** Maps AuthErrorCode -> friendly, non-technical student copy. */
export function authErrorMessage(code: AuthErrorCode): string {
  switch (code) {
    case 'invalid_credentials':
      return 'The email or password is incorrect. Please try again.'
    case 'email_taken':
      return 'This email is already registered. Try logging in instead.'
    case 'email_not_verified':
      return 'Please verify your email address before signing in.'
    case 'account_disabled':
      return 'This account is currently inactive. Please contact support.'
    case 'weak_password':
      return 'Please choose a stronger password with at least 8 characters.'
    case 'rate_limited':
      return 'Too many attempts. Please wait a moment and try again.'
    case 'network':
      return 'Check your internet connection and try again.'
    default:
      return 'Something went wrong. Please try again.'
  }
}
