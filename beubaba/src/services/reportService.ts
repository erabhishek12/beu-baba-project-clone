/**
 * Report service (spec §21, §57, §58). A student can report any piece of
 * content (PYQ, subject, quiz question, resource, notice…) or file a general
 * bug/app report with an optional screenshot.
 *
 * Ownership: reports are owned by the reporter. A student can list only their
 * OWN reports; moderation/admin views are role-gated (mirrored server-side by
 * RLS in the Supabase adapter). Data is scoped by user id in the mock store.
 */
import { store, delay } from '@/services/storage'
import { USE_SUPABASE } from '@/services/backend/config'
import { getSupabase } from '@/services/backend/supabaseClient'
import { notificationService } from '@/services/notificationService'
import type {
  Report,
  ReportReason,
  ReportStatus,
  ReportTargetType,
} from '@/types/domain'
import type { Attachment } from '@/lib/media'

const OWNER_KEY = (userId: string) => `reports:${userId}`
const GLOBAL_KEY = 'reports:all' // moderation queue (role-gated read)

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'incorrect_information', label: 'Incorrect information' },
  { value: 'broken_file', label: 'Broken or missing file' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'irrelevant', label: 'Irrelevant / wrong place' },
  { value: 'copyright', label: 'Copyright concern' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'bug', label: 'Something is broken (bug)' },
  { value: 'other', label: 'Other' },
]

export interface CreateReportInput {
  target_type: ReportTargetType
  target_id: string | null
  target_label: string
  reason: ReportReason
  details: string
  context_path?: string | null
  attachment?: Attachment | null
}

export const reportService = {
  async create(userId: string, input: CreateReportInput): Promise<Report> {
    if (USE_SUPABASE) {
      const { data, error } = await getSupabase()
        .from('reports')
        .insert({
          reporter_id: userId,
          target_type: input.target_type,
          target_id: input.target_id,
          target_label: input.target_label,
          reason: input.reason,
          details: input.details.trim(),
          context_path: input.context_path ?? null,
        })
        .select()
        .single()
      if (error) throw new Error(error.message)
      const row = data as Record<string, unknown>
      return {
        ...(row as unknown as Report),
        attachment: input.attachment ?? null,
      }
    }
    await delay()
    const now = new Date().toISOString()
    const report: Report = {
      id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      reporter_id: userId,
      target_type: input.target_type,
      target_id: input.target_id,
      target_label: input.target_label,
      reason: input.reason,
      details: input.details.trim(),
      context_path: input.context_path ?? null,
      attachment: input.attachment ?? null,
      status: 'open',
      created_at: now,
    }
    // Owner list (private) + global moderation queue.
    const mine = store.get<Report[]>(OWNER_KEY(userId), [])
    store.set(OWNER_KEY(userId), [report, ...mine])
    const all = store.get<Report[]>(GLOBAL_KEY, [])
    store.set(GLOBAL_KEY, [report, ...all])

    // Acknowledge to the reporter (deep-links to their reports list).
    await notificationService.push(userId, {
      category: 'system',
      title: 'Report received',
      body: `Thanks — we logged your report about “${input.target_label}”. We'll review it.`,
      url: '/support/reports',
    })
    return report
  },

  /** A student's OWN reports (owner-scoped). */
  async listMine(userId: string): Promise<Report[]> {
    if (USE_SUPABASE) {
      const { data, error } = await getSupabase()
        .from('reports')
        .select('*')
        .eq('reporter_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw new Error(error.message)
      return (data ?? []) as unknown as Report[]
    }
    await delay(120)
    return store.get<Report[]>(OWNER_KEY(userId), [])
  },

  /** Moderation queue — role-gated (admin/moderator). */
  async listAll(): Promise<Report[]> {
    if (USE_SUPABASE) {
      // RLS decides what is visible: moderators see all, students only their own.
      const { data, error } = await getSupabase()
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw new Error(error.message)
      return (data ?? []) as unknown as Report[]
    }
    await delay(120)
    return store.get<Report[]>(GLOBAL_KEY, [])
  },

  async setStatus(reportId: string, status: ReportStatus): Promise<void> {
    if (USE_SUPABASE) {
      const { error } = await getSupabase()
        .from('reports')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', reportId)
      if (error) throw new Error(error.message)
      return
    }
    await delay(120)
    const all = store.get<Report[]>(GLOBAL_KEY, [])
    const next = all.map((r) => (r.id === reportId ? { ...r, status } : r))
    store.set(GLOBAL_KEY, next)
  },
}
