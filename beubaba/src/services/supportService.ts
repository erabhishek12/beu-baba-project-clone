/**
 * Developer support service (spec §25–29). PRIVATE, owner-scoped conversations
 * between a student and the developer team. This is NOT a public chat: a student
 * can only ever read their OWN conversations. The mock enforces this by scoping
 * every read/write to the authenticated user id; the Supabase adapter mirrors it
 * with RLS (student_id = auth.uid()).
 *
 * A lightweight auto-reply simulates a developer response so the notification /
 * status flow is demonstrable end-to-end without a backend.
 */
import { store, delay } from '@/services/storage'
import { notificationService } from '@/services/notificationService'
import type {
  SupportCategory,
  SupportConversation,
  SupportMessage,
  SupportStatus,
  SupportThread,
} from '@/types/domain'
import type { Attachment } from '@/lib/media'

const CONV_KEY = (userId: string) => `support:conv:${userId}`
const MSG_KEY = (convId: string) => `support:msg:${convId}`

export const SUPPORT_CATEGORIES: { value: SupportCategory; label: string }[] = [
  { value: 'bug', label: 'Report a bug' },
  { value: 'content_correction', label: 'Content / syllabus correction' },
  { value: 'missing_resource', label: 'Missing resource or PYQ' },
  { value: 'feature_request', label: 'Feature request' },
  { value: 'account', label: 'Account problem' },
  { value: 'feedback', label: 'General feedback' },
  { value: 'other', label: 'Other' },
]

export const SUPPORT_STATUS_LABEL: Record<SupportStatus, string> = {
  open: 'Open',
  awaiting_student: 'Awaiting your reply',
  awaiting_developer: 'Awaiting developer',
  resolved: 'Resolved',
  archived: 'Archived',
}

function convs(userId: string): SupportConversation[] {
  return store.get<SupportConversation[]>(CONV_KEY(userId), [])
}
function saveConvs(userId: string, list: SupportConversation[]) {
  store.set(CONV_KEY(userId), list)
}
function msgs(convId: string): SupportMessage[] {
  return store.get<SupportMessage[]>(MSG_KEY(convId), [])
}
function saveMsgs(convId: string, list: SupportMessage[]) {
  store.set(MSG_KEY(convId), list)
}

export const supportService = {
  async listConversations(userId: string): Promise<SupportConversation[]> {
    await delay(120)
    return convs(userId).sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    )
  },

  /** Owner-scoped: returns undefined if the conversation isn't the user's. */
  async getThread(userId: string, convId: string): Promise<SupportThread | undefined> {
    await delay(120)
    const conv = convs(userId).find((c) => c.id === convId)
    if (!conv) return undefined
    return { ...conv, messages: msgs(convId) }
  },

  async unreadForUser(userId: string): Promise<number> {
    const list = convs(userId)
    let n = 0
    for (const c of list) {
      n += msgs(c.id).filter((m) => m.sender_role === 'developer' && !m.read_at).length
    }
    return n
  },

  async start(
    userId: string,
    input: { subject: string; category: SupportCategory; body: string; attachment?: Attachment | null },
  ): Promise<SupportThread> {
    await delay()
    const now = new Date().toISOString()
    const conv: SupportConversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      student_id: userId,
      subject: input.subject.trim(),
      category: input.category,
      status: 'awaiting_developer',
      created_at: now,
      updated_at: now,
    }
    saveConvs(userId, [conv, ...convs(userId)])
    const first: SupportMessage = {
      id: `m_${Date.now()}`,
      conversation_id: conv.id,
      sender_id: userId,
      sender_role: 'student',
      body: input.body.trim(),
      attachment: input.attachment ?? null,
      created_at: now,
      read_at: now,
    }
    saveMsgs(conv.id, [first])
    void this.scheduleAutoReply(userId, conv.id)
    return { ...conv, messages: [first] }
  },

  async reply(
    userId: string,
    convId: string,
    input: { body: string; attachment?: Attachment | null },
  ): Promise<SupportMessage> {
    await delay(160)
    const now = new Date().toISOString()
    const msg: SupportMessage = {
      id: `m_${Date.now()}`,
      conversation_id: convId,
      sender_id: userId,
      sender_role: 'student',
      body: input.body.trim(),
      attachment: input.attachment ?? null,
      created_at: now,
      read_at: now,
    }
    saveMsgs(convId, [...msgs(convId), msg])
    const list = convs(userId).map((c) =>
      c.id === convId ? { ...c, status: 'awaiting_developer' as SupportStatus, updated_at: now } : c,
    )
    saveConvs(userId, list)
    void this.scheduleAutoReply(userId, convId)
    return msg
  },

  /** Mark developer messages in a thread as read (called when the user opens it). */
  async markThreadRead(_userId: string, convId: string): Promise<void> {
    const now = new Date().toISOString()
    const list = msgs(convId).map((m) =>
      m.sender_role === 'developer' && !m.read_at ? { ...m, read_at: now } : m,
    )
    saveMsgs(convId, list)
  },

  /**
   * Simulated developer reply (mock only). In production the developer answers
   * from the admin panel; this just proves the notification + status wiring.
   */
  async scheduleAutoReply(userId: string, convId: string): Promise<void> {
    setTimeout(async () => {
      const now = new Date().toISOString()
      const reply: SupportMessage = {
        id: `m_${Date.now()}_dev`,
        conversation_id: convId,
        sender_id: 'developer',
        sender_role: 'developer',
        body: 'Thanks for reaching out. The developer team has received your message and will look into it. We will update you here.',
        attachment: null,
        created_at: now,
        read_at: null,
      }
      saveMsgs(convId, [...msgs(convId), reply])
      const list = convs(userId).map((c) =>
        c.id === convId ? { ...c, status: 'awaiting_student' as SupportStatus, updated_at: now } : c,
      )
      saveConvs(userId, list)
      await notificationService.push(userId, {
        category: 'support',
        title: 'Developer replied',
        body: 'You have a new reply in your developer support conversation.',
        url: `/support/${convId}`,
      })
    }, 4000)
  },
}
