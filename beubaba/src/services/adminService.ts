/**
 * Admin service — dashboard, users, roles, notices, audit and health.
 *
 * Everything here goes through the EXISTING RLS and RPCs. There is no
 * service-role key in the browser: an admin can do these things only because
 * the database recognises their role, so a tampered client gains nothing.
 *
 * Counts use `head: true` + `count: 'exact'`, which returns a number without
 * downloading rows — the dashboard must not pull 22,868 questions to show a
 * total.
 */
import { USE_SUPABASE } from '@/services/backend/config'
import { getSupabase } from '@/services/backend/supabaseClient'
import type { Role } from '@/types/domain'

export interface AdminStats {
  students: number
  activeStudents: number
  newThisWeek: number
  branches: number
  subjects: number
  pyqs: number
  resources: number
  mcqTotal: number
  mcqPublished: number
  mcqPending: number
  mcqQuarantined: number
  quizzes: number
  attempts: number
  bookmarks: number
  reports: number
  openReports: number
  supportOpen: number
  banners: number
  notices: number
}

export interface AdminUserRow {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  is_active: boolean
  created_at: string
  roles: string[]
  branch_id: string | null
  branch_name: string | null
  semester_number: number | null
  avatar_url: string | null
  avatar_character_id: string | null
  avatar_type: string | null
  gender: string | null
  admission_year: number | null
  college_name: string | null
}

export interface AuditRow {
  id: string
  actor_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface HealthRow {
  name: string
  ok: boolean
  detail: string
}

const EMPTY: AdminStats = {
  students: 0, activeStudents: 0, newThisWeek: 0, branches: 0, subjects: 0,
  pyqs: 0, resources: 0, mcqTotal: 0, mcqPublished: 0, mcqPending: 0,
  mcqQuarantined: 0, quizzes: 0, attempts: 0, bookmarks: 0, reports: 0,
  openReports: 0, supportOpen: 0, banners: 0, notices: 0,
}

/** Count rows without downloading them. Returns 0 if the table is unreadable. */
async function countOf(table: string, apply?: (q: never) => unknown): Promise<number> {
  try {
    const sb = getSupabase()
    let q = sb.from(table).select('*', { count: 'exact', head: true })
    if (apply) q = apply(q as never) as typeof q
    const { count, error } = await q
    if (error) return 0
    return count ?? 0
  } catch {
    return 0
  }
}

export const adminService = {
  async stats(): Promise<AdminStats> {
    if (!USE_SUPABASE) return EMPTY
    const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString()
    const [
      students, activeStudents, newThisWeek, branches, subjects, pyqs, resources,
      mcqTotal, mcqPublished, mcqPending, mcqQuarantined, quizzes, attempts,
      bookmarks, reports, openReports, supportOpen, banners, notices,
    ] = await Promise.all([
      countOf('profiles'),
      countOf('profiles', (q) => (q as never as { eq: (a: string, b: boolean) => unknown }).eq('is_active', true)),
      countOf('profiles', (q) => (q as never as { gte: (a: string, b: string) => unknown }).gte('created_at', weekAgo)),
      countOf('branches'),
      countOf('subjects'),
      countOf('pyqs'),
      countOf('resources'),
      countOf('question_bank'),
      countOf('question_bank', (q) => (q as never as { eq: (a: string, b: boolean) => unknown }).eq('published', true)),
      countOf('question_bank', (q) => (q as never as { eq: (a: string, b: string) => unknown }).eq('review_status', 'pending')),
      countOf('question_quarantine'),
      countOf('quizzes'),
      countOf('bank_attempts'),
      countOf('bookmarks'),
      countOf('reports'),
      countOf('reports', (q) => (q as never as { eq: (a: string, b: string) => unknown }).eq('status', 'open')),
      countOf('support_conversations', (q) => (q as never as { neq: (a: string, b: string) => unknown }).neq('status', 'resolved')),
      countOf('banners'),
      countOf('notices'),
    ])
    return {
      students, activeStudents, newThisWeek, branches, subjects, pyqs, resources,
      mcqTotal, mcqPublished, mcqPending, mcqQuarantined, quizzes, attempts,
      bookmarks, reports, openReports, supportOpen, banners, notices,
    }
  },

  /* ------------------------------- users -------------------------------- */

  async listUsers(search = ''): Promise<AdminUserRow[]> {
    if (!USE_SUPABASE) return []
    const sb = getSupabase()
    let q = sb
      .from('profiles')
      .select(
        'id,full_name,email,phone,is_active,created_at,avatar_url,avatar_character_id,avatar_type,gender',
      )
      .order('created_at', { ascending: false })
      .limit(200)
    const s = search.trim()
    if (s) q = q.or(`full_name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`)
    const { data, error } = await q
    if (error) throw new Error(error.message)
    type Base = Omit<
      AdminUserRow,
      'roles' | 'branch_id' | 'branch_name' | 'semester_number' | 'admission_year' | 'college_name'
    >
    const rows = (data ?? []) as Base[]
    if (!rows.length) return []

    // Resolve roles, academic details, branch names and semester numbers in
    // one round each rather than per student.
    const ids = rows.map((r) => r.id)
    const [{ data: roleRows }, { data: stu }] = await Promise.all([
      sb.from('user_roles').select('user_id,role').in('user_id', ids),
      sb
        .from('student_profiles')
        .select('user_id,branch_id,current_semester_id,admission_year,college_name')
        .in('user_id', ids),
    ])

    const students = (stu ?? []) as {
      user_id: string
      branch_id: string | null
      current_semester_id: string | null
      admission_year: number | null
      college_name: string | null
    }[]

    const branchIds = [...new Set(students.map((s) => s.branch_id).filter(Boolean))] as string[]
    const semIds = [...new Set(students.map((s) => s.current_semester_id).filter(Boolean))] as string[]
    const [{ data: branches }, { data: sems }] = await Promise.all([
      branchIds.length
        ? sb.from('branches').select('id,name').in('id', branchIds)
        : Promise.resolve({ data: [] as { id: string; name: string }[] }),
      semIds.length
        ? sb.from('semesters').select('id,number').in('id', semIds)
        : Promise.resolve({ data: [] as { id: string; number: number }[] }),
    ])
    const branchName = new Map((branches ?? []).map((b) => [b.id, b.name]))
    const semNumber = new Map((sems ?? []).map((x) => [x.id, x.number]))

    const byUser = new Map<string, string[]>()
    for (const r of (roleRows ?? []) as { user_id: string; role: string }[]) {
      byUser.set(r.user_id, [...(byUser.get(r.user_id) ?? []), r.role])
    }
    const stuOf = new Map(students.map((s) => [s.user_id, s]))

    return rows.map((r) => {
      const st = stuOf.get(r.id)
      return {
        ...r,
        roles: byUser.get(r.id) ?? ['student'],
        branch_id: st?.branch_id ?? null,
        branch_name: st?.branch_id ? (branchName.get(st.branch_id) ?? null) : null,
        semester_number: st?.current_semester_id
          ? (semNumber.get(st.current_semester_id) ?? null)
          : null,
        admission_year: st?.admission_year ?? null,
        college_name: st?.college_name ?? null,
      }
    })
  },

  /** Grant a role. The database checks the caller may do this. */
  async grantRole(userId: string, role: Role): Promise<void> {
    if (!USE_SUPABASE) return
    const { error } = await getSupabase().rpc('grant_role', { p_user: userId, p_role: role })
    if (error) throw new Error(error.message)
  },

  async revokeRole(userId: string, role: Role): Promise<void> {
    if (!USE_SUPABASE) return
    const { error } = await getSupabase().rpc('revoke_role', { p_user: userId, p_role: role })
    if (error) throw new Error(error.message)
  },

  /** Disable or re-enable an account. */
  async setActive(userId: string, active: boolean): Promise<void> {
    if (!USE_SUPABASE) return
    const { error } = await getSupabase()
      .from('profiles')
      .update({ is_active: active, updated_at: new Date().toISOString() })
      .eq('id', userId)
    if (error) throw new Error(error.message)
  },

  /* ------------------------------- audit -------------------------------- */

  async auditLog(limit = 100, action?: string): Promise<AuditRow[]> {
    if (!USE_SUPABASE) return []
    let q = getSupabase()
      .from('audit_logs')
      .select('id,actor_id,action,entity_type,entity_id,metadata,created_at')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (action) q = q.eq('action', action)
    const { data, error } = await q
    if (error) throw new Error(error.message)
    return (data ?? []) as AuditRow[]
  },

  /* ------------------------------ notices ------------------------------- */

  async listNotices(): Promise<Record<string, unknown>[]> {
    if (!USE_SUPABASE) return []
    const { data, error } = await getSupabase()
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) throw new Error(error.message)
    return (data ?? []) as Record<string, unknown>[]
  },

  async createNotice(input: {
    title: string
    body?: string | null
    category?: string
    is_published?: boolean
  }): Promise<void> {
    if (!USE_SUPABASE) throw new Error('Notices need the online backend.')
    const { error } = await getSupabase().from('notices').insert({
      title: input.title,
      // `body` is NOT NULL in the schema — fall back to the title rather than
      // failing the insert with a constraint error the admin cannot act on.
      body: input.body?.trim() || input.title,
      category: input.category ?? 'general',
      is_published: input.is_published ?? true,
    })
    if (error) throw new Error(error.message)
  },

  async setNoticePublished(id: string, published: boolean): Promise<void> {
    if (!USE_SUPABASE) return
    const { error } = await getSupabase()
      .from('notices')
      .update({ is_published: published })
      .eq('id', id)
    if (error) throw new Error(error.message)
  },

  async deleteNotice(id: string): Promise<void> {
    if (!USE_SUPABASE) return
    const { error } = await getSupabase().from('notices').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },

  /* ------------------------------- health ------------------------------- */

  /**
   * Real reachability checks — each one performs an actual query, so a green
   * light means the subsystem genuinely answered.
   */
  async health(): Promise<HealthRow[]> {
    if (!USE_SUPABASE) {
      return [{ name: 'Backend', ok: false, detail: 'Running on local demo data' }]
    }
    const sb = getSupabase()
    const out: HealthRow[] = []
    const probe = async (name: string, fn: () => Promise<unknown>) => {
      const t = performance.now()
      try {
        await fn()
        out.push({ name, ok: true, detail: `${Math.round(performance.now() - t)} ms` })
      } catch (e) {
        out.push({ name, ok: false, detail: e instanceof Error ? e.message.slice(0, 60) : 'failed' })
      }
    }
    await probe('Database', async () => {
      const { error } = await sb.from('branches').select('id', { head: true, count: 'exact' })
      if (error) throw new Error(error.message)
    })
    await probe('Authentication', async () => {
      const { data, error } = await sb.auth.getUser()
      if (error || !data.user) throw new Error('no session')
    })
    await probe('Question bank', async () => {
      const { error } = await sb.rpc('question_bank_stats')
      if (error) throw new Error(error.message)
    })
    await probe('Quiz engine', async () => {
      const { error } = await sb.rpc('bank_subject_catalog_v2')
      if (error) throw new Error(error.message)
    })
    await probe('Review workflow', async () => {
      const { error } = await sb.rpc('review_progress')
      if (error) throw new Error(error.message)
    })
    return out
  },

  /* --------------------------- question bank ---------------------------- */

  /**
   * Browse the 22,868-question bank with filters.
   *
   * Paged deliberately: the admin screen must never try to hold the whole bank
   * in memory. Answer keys are NOT selected here — reviewers see them through
   * `review_queue`, which the database gates on the review permission.
   */
  async questions(opts: {
    search?: string
    subject?: string
    status?: string
    difficulty?: string
    type?: string
    page?: number
    pageSize?: number
  }): Promise<{ rows: Record<string, unknown>[]; total: number }> {
    if (!USE_SUPABASE) return { rows: [], total: 0 }
    const size = opts.pageSize ?? 25
    const from = (opts.page ?? 0) * size
    let q = getSupabase()
      .from('question_bank')
      .select(
        'id,stem,subject_code,subject_name,unit_title,topic,difficulty,question_type,review_status,published,human_verified,source_pack,source_ref',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(from, from + size - 1)
    if (opts.search?.trim()) q = q.ilike('stem', `%${opts.search.trim()}%`)
    if (opts.subject) q = q.eq('subject_code', opts.subject)
    if (opts.status) q = q.eq('review_status', opts.status)
    if (opts.difficulty) q = q.eq('difficulty', opts.difficulty)
    if (opts.type) q = q.eq('question_type', opts.type)
    const { data, count, error } = await q
    if (error) throw new Error(error.message)
    return { rows: (data ?? []) as Record<string, unknown>[], total: count ?? 0 }
  },

  async quarantine(limit = 50): Promise<Record<string, unknown>[]> {
    if (!USE_SUPABASE) return []
    const { data, error } = await getSupabase()
      .from('question_quarantine')
      .select('id,source_pack,source_ref,subject_code,subject_name,reason,severity,detail,status')
      .order('id')
      .limit(limit)
    if (error) throw new Error(error.message)
    return (data ?? []) as Record<string, unknown>[]
  },

  /* ------------------------------ academic ------------------------------ */

  async branches(): Promise<{ id: string; name: string; code: string | null; is_active: boolean }[]> {
    if (!USE_SUPABASE) return []
    const { data, error } = await getSupabase()
      .from('branches')
      .select('id,name,code,is_active')
      .order('name')
    if (error) throw new Error(error.message)
    return (data ?? []) as { id: string; name: string; code: string | null; is_active: boolean }[]
  },

  async subjects(branchId?: string, search = ''): Promise<Record<string, unknown>[]> {
    if (!USE_SUPABASE) return []
    let q = getSupabase()
      .from('subjects')
      .select('id,code,name,semester_number,credits,branch_id,is_active')
      .order('name')
      .limit(300)
    if (branchId) q = q.eq('branch_id', branchId)
    if (search.trim()) q = q.or(`name.ilike.%${search.trim()}%,code.ilike.%${search.trim()}%`)
    const { data, error } = await q
    if (error) throw new Error(error.message)
    return (data ?? []) as Record<string, unknown>[]
  },

  /* ------------------------------- support ------------------------------ */

  async supportThreads(status?: string): Promise<Record<string, unknown>[]> {
    if (!USE_SUPABASE) return []
    let q = getSupabase()
      .from('support_conversations')
      .select('id,user_id,subject,category,status,priority,last_message_at,created_at')
      .order('last_message_at', { ascending: false })
      .limit(100)
    if (status) q = q.eq('status', status)
    const { data, error } = await q
    if (error) throw new Error(error.message)
    return (data ?? []) as Record<string, unknown>[]
  },

  async supportMessages(convId: string): Promise<Record<string, unknown>[]> {
    if (!USE_SUPABASE) return []
    const { data, error } = await getSupabase()
      .from('support_messages')
      .select('id,sender_id,sender_role,body,created_at')
      .eq('conversation_id', convId)
      .order('created_at')
    if (error) throw new Error(error.message)
    return (data ?? []) as Record<string, unknown>[]
  },

  /** Reply as staff. `post_support_message` stamps the developer role and notifies the student. */
  async supportReply(convId: string, body: string): Promise<void> {
    if (!USE_SUPABASE) return
    const { error } = await getSupabase().rpc('post_support_message', {
      p_conversation: convId,
      p_body: body,
    })
    if (error) throw new Error(error.message)
  },

  async setSupportStatus(convId: string, status: string): Promise<void> {
    if (!USE_SUPABASE) return
    const { error } = await getSupabase()
      .from('support_conversations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', convId)
    if (error) throw new Error(error.message)
  },

  /* ------------------------------- chatbot ------------------------------ */

  async intents(search = ''): Promise<Record<string, unknown>[]> {
    if (!USE_SUPABASE) return []
    let q = getSupabase()
      .from('chatbot_intents')
      .select('id,key,category,title,action_type,action_target,is_active')
      .order('category')
      // 500 intents exist; a smaller cap silently hid entire categories.
      .limit(1000)
    if (search.trim()) q = q.or(`title.ilike.%${search.trim()}%,key.ilike.%${search.trim()}%`)
    const { data, error } = await q
    if (error) throw new Error(error.message)
    return (data ?? []) as Record<string, unknown>[]
  },

  async unanswered(): Promise<Record<string, unknown>[]> {
    if (!USE_SUPABASE) return []
    const { data, error } = await getSupabase()
      .from('chatbot_unanswered')
      .select('id,question,context,created_at')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) throw new Error(error.message)
    return (data ?? []) as Record<string, unknown>[]
  },

  /* ------------------------------ external ------------------------------ */

  async externalLinks(): Promise<Record<string, unknown>[]> {
    if (!USE_SUPABASE) return []
    const { data, error } = await getSupabase()
      .from('external_links')
      .select('key,label,url,description,category,is_active,display_order')
      .order('display_order')
    if (error) throw new Error(error.message)
    return (data ?? []) as Record<string, unknown>[]
  },

  async setLinkActive(key: string, active: boolean): Promise<void> {
    if (!USE_SUPABASE) return
    const { error } = await getSupabase()
      .from('external_links')
      .update({ is_active: active, updated_at: new Date().toISOString() })
      .eq('key', key)
    if (error) throw new Error(error.message)
  },

  /* ------------------------------- PYQs --------------------------------- */

  async pyqs(search = '', limit = 100): Promise<Record<string, unknown>[]> {
    if (!USE_SUPABASE) return []
    let q = getSupabase()
      .from('pyqs')
      .select('id,subject_code,subject_name,exam_year,exam_session,semester_number,title,source_url,is_published')
      .order('exam_year', { ascending: false })
      .limit(limit)
    if (search.trim()) {
      q = q.or(`title.ilike.%${search.trim()}%,subject_name.ilike.%${search.trim()}%,subject_code.ilike.%${search.trim()}%`)
    }
    const { data, error } = await q
    if (error) throw new Error(error.message)
    return (data ?? []) as Record<string, unknown>[]
  },

  async setPyqPublished(id: string, published: boolean): Promise<void> {
    if (!USE_SUPABASE) return
    const { error } = await getSupabase()
      .from('pyqs')
      .update({ is_published: published, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw new Error(error.message)
  },

  /* ------------------------------ calendar ------------------------------ */

  async calendarEvents(): Promise<Record<string, unknown>[]> {
    if (!USE_SUPABASE) return []
    const { data, error } = await getSupabase()
      .from('academic_calendar_events')
      .select('id,title,description,category,starts_on,ends_on,is_published')
      .order('starts_on')
    if (error) throw new Error(error.message)
    return (data ?? []) as Record<string, unknown>[]
  },

  async createCalendarEvent(input: {
    title: string
    starts_on: string
    ends_on?: string | null
    category?: string
    description?: string | null
  }): Promise<void> {
    if (!USE_SUPABASE) throw new Error('Calendar needs the online backend.')
    const { error } = await getSupabase().from('academic_calendar_events').insert({
      title: input.title,
      starts_on: input.starts_on,
      ends_on: input.ends_on || null,
      category: input.category ?? 'other',
      description: input.description ?? null,
      is_published: true,
    })
    if (error) throw new Error(error.message)
  },

  async deleteCalendarEvent(id: string): Promise<void> {
    if (!USE_SUPABASE) return
    const { error } = await getSupabase().from('academic_calendar_events').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },

  /* ------------------------------- quizzes ------------------------------ */

  async quizzes(): Promise<Record<string, unknown>[]> {
    if (!USE_SUPABASE) return []
    const { data, error } = await getSupabase()
      .from('quizzes')
      .select('id,title,subject_name,subject_code,difficulty,status,duration_seconds,source_kind')
      .order('title')
      .limit(200)
    if (error) throw new Error(error.message)
    return (data ?? []) as Record<string, unknown>[]
  },

  /* ------------------------------ analytics ----------------------------- */

  /**
   * Quiz analytics from real attempts.
   *
   * Reads only the columns needed for the aggregate, capped at the most recent
   * 1000 attempts — an analytics screen must not pull the whole table.
   */
  async quizAnalytics(): Promise<{
    attempts: number
    avgPercent: number
    completed: number
    bySubject: { subject: string; attempts: number; avg: number }[]
  }> {
    if (!USE_SUPABASE) return { attempts: 0, avgPercent: 0, completed: 0, bySubject: [] }
    const { data, error } = await getSupabase()
      .from('bank_attempts')
      .select('subject_code,score,max_score,state')
      .order('created_at', { ascending: false })
      .limit(1000)
    if (error) throw new Error(error.message)
    const rows = (data ?? []) as {
      subject_code: string | null
      score: number | null
      max_score: number | null
      state: string
    }[]
    const graded = rows.filter((r) => r.score != null && (r.max_score ?? 0) > 0)
    const pct = (r: (typeof graded)[number]) => (Number(r.score) / Number(r.max_score)) * 100
    const bucket = new Map<string, { n: number; sum: number }>()
    for (const r of graded) {
      const k = r.subject_code ?? 'unknown'
      const b = bucket.get(k) ?? { n: 0, sum: 0 }
      b.n += 1
      b.sum += pct(r)
      bucket.set(k, b)
    }
    return {
      attempts: rows.length,
      completed: graded.length,
      avgPercent: graded.length
        ? Math.round((graded.reduce((a, r) => a + pct(r), 0) / graded.length) * 10) / 10
        : 0,
      bySubject: [...bucket.entries()]
        .map(([subject, b]) => ({ subject, attempts: b.n, avg: Math.round((b.sum / b.n) * 10) / 10 }))
        .sort((a, b) => b.attempts - a.attempts)
        .slice(0, 12),
    }
  },

  /* ------------------------------ resources ----------------------------- */

  async resources(status?: string): Promise<Record<string, unknown>[]> {
    if (!USE_SUPABASE) return []
    let q = getSupabase()
      .from('resources')
      .select('id,title,type,status,subject_code,subject_name,created_at')
      .order('created_at', { ascending: false })
      .limit(100)
    if (status) q = q.eq('status', status)
    const { data, error } = await q
    if (error) throw new Error(error.message)
    return (data ?? []) as Record<string, unknown>[]
  },
}
