/**
 * Mock database seeded from the real extracted BEU dataset.
 * Academic master data is loaded from seed_academic.json.
 * Mutable user data (accounts, sessions) persists in localStorage.
 *
 * This module is intentionally the ONLY place that owns raw persistence for
 * the mock. Feature code talks to services, services talk to this. Swapping to
 * Supabase later means replacing the service adapters, not the UI.
 */
import type {
  Branch,
  Course,
  Semester,
  Subject,
  Profile,
  StudentProfile,
  Role,
  PyqPaper,
  PyqPaperDetail,
} from '@/types/domain'
import { store } from '@/services/storage'
import seed from './seed_academic.json'
import pyqMeta from './seed_pyq_meta.json'

interface SeedShape {
  courses: Course[]
  branches: Branch[]
  semesters: Semester[]
  subjects: Subject[]
  stats: Record<string, number>
}

const academic = seed as unknown as SeedShape
const pyqPapers = pyqMeta as unknown as PyqPaper[]

// ---- Read-only academic accessors ----
export const academicDb = {
  courses: (): Course[] => academic.courses,
  branches: (courseId?: string): Branch[] =>
    academic.branches
      .filter((b) => !courseId || b.course_id === courseId)
      .sort((a, b) => a.display_order - b.display_order),
  branch: (id: string): Branch | undefined => academic.branches.find((b) => b.id === id),
  semesters: (): Semester[] => academic.semesters,
  semester: (id: string): Semester | undefined => academic.semesters.find((s) => s.id === id),
  subjects: (branchId?: string, semesterId?: string): Subject[] =>
    academic.subjects.filter(
      (s) =>
        (!branchId || s.branch_id === branchId) &&
        (!semesterId || s.semester_id === semesterId),
    ),
  stats: () => academic.stats,
}

// ---- PYQ accessors (metadata is bundled; full blocks are lazy-loaded) ----
export const pyqDb = {
  all: (): PyqPaper[] => pyqPapers,
  byId: (id: string): PyqPaper | undefined => pyqPapers.find((p) => p.id === id),
  /** Lazy-load the heavy per-paper question blocks only when a paper is opened. */
  async detail(id: string): Promise<PyqPaperDetail | undefined> {
    const mod = await import('./seed_pyq_full.json')
    const map = (mod.default ?? mod) as unknown as Record<string, PyqPaperDetail>
    return map[id]
  },
}

// ---- Mutable account store (mock auth) ----
export interface AccountRecord {
  id: string
  email: string
  password_hash: string
  email_verified: boolean
  is_active: boolean
  profile: Profile
  student: StudentProfile | null
  roles: Role[]
}

const ACCOUNTS_KEY = 'accounts'

export const accountsDb = {
  all(): AccountRecord[] {
    return store.get<AccountRecord[]>(ACCOUNTS_KEY, [])
  },
  byEmail(email: string): AccountRecord | undefined {
    const norm = email.trim().toLowerCase()
    return accountsDb.all().find((a) => a.email.toLowerCase() === norm)
  },
  byId(id: string): AccountRecord | undefined {
    return accountsDb.all().find((a) => a.id === id)
  },
  upsert(rec: AccountRecord): void {
    const all = accountsDb.all()
    const idx = all.findIndex((a) => a.id === rec.id)
    if (idx >= 0) all[idx] = rec
    else all.push(rec)
    store.set(ACCOUNTS_KEY, all)
  },
}

/**
 * Seed a demo administrator account so the moderation / admin panel is usable
 * end-to-end in the preview. MOCK-ONLY: a real deployment assigns privileged
 * roles server-side via Supabase, never from the client. The password hash is
 * computed lazily with the same hashing the auth service uses.
 *
 * Credentials: admin@beubaba.app / admin1234
 */
const DEMO_ADMIN_ID = 'demo-admin-0000-0000-000000000001'
const DEMO_ADMIN_EMAIL = 'admin@beubaba.app'

export async function ensureDemoAdmin(): Promise<void> {
  if (accountsDb.byEmail(DEMO_ADMIN_EMAIL)) return
  const { hashPassword } = await import('./hash')
  const now = new Date().toISOString()
  const profile: Profile = {
    id: DEMO_ADMIN_ID,
    full_name: 'BEU BABA Admin',
    email: DEMO_ADMIN_EMAIL,
    phone: '',
    avatar_type: 'generated',
    avatar_url: null,
    avatar_character_id: 'male_01',
    gender: 'unspecified',
    bio: 'Content & moderation team',
    is_active: true,
    onboarding_completed: true,
    created_at: now,
    updated_at: now,
  }
  const student: StudentProfile = {
    user_id: DEMO_ADMIN_ID,
    course_id: null,
    branch_id: null,
    admission_year: null,
    current_semester_id: null,
    enrollment_number: null,
    college_name: null,
    onboarding_completed: true,
  }
  accountsDb.upsert({
    id: DEMO_ADMIN_ID,
    email: DEMO_ADMIN_EMAIL,
    password_hash: await hashPassword('admin1234'),
    email_verified: true,
    is_active: true,
    profile,
    student,
    roles: ['super_admin', 'admin', 'content_manager', 'moderator', 'support_manager'],
  })
}
