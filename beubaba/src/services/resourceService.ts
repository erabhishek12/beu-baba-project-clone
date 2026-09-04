/**
 * Resource service (spec §19–23). Students upload study resources (notes, PDFs,
 * links, question papers, images). Uploads are NEVER auto-published — they enter
 * a moderation queue (pending → approved / rejected / changes_requested).
 *
 * Ownership: a resource is owned by its uploader. Students list their OWN
 * uploads and the PUBLISHED (approved) library. Moderation views are role-gated
 * (mirrored by RLS in the Supabase adapter).
 */
import { store, delay } from '@/services/storage'
import { notificationService } from '@/services/notificationService'
import type { Resource, ResourceStatus, ResourceType } from '@/types/domain'
import type { Attachment } from '@/lib/media'

const GLOBAL_KEY = 'resources:all'

export const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: 'notes', label: 'Notes' },
  { value: 'pdf', label: 'PDF document' },
  { value: 'question_paper', label: 'Question paper' },
  { value: 'image', label: 'Image / diagram' },
  { value: 'link', label: 'Useful link' },
  { value: 'other', label: 'Other' },
]

export const RESOURCE_STATUS_LABEL: Record<ResourceStatus, string> = {
  pending: 'Pending review',
  approved: 'Approved',
  rejected: 'Rejected',
  changes_requested: 'Changes requested',
  archived: 'Archived',
}

function all(): Resource[] {
  return store.get<Resource[]>(GLOBAL_KEY, [])
}
function saveAll(list: Resource[]) {
  store.set(GLOBAL_KEY, list)
}

export interface CreateResourceInput {
  title: string
  type: ResourceType
  subject_code?: string | null
  subject_name?: string | null
  semester?: number | null
  branch_id?: string | null
  description: string
  tags: string[]
  attachment?: Attachment | null
  url?: string | null
}

export const resourceService = {
  async create(
    userId: string,
    ownerName: string,
    input: CreateResourceInput,
  ): Promise<Resource> {
    await delay()
    const now = new Date().toISOString()
    const resource: Resource = {
      id: `res_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      owner_id: userId,
      owner_name: ownerName,
      title: input.title.trim(),
      type: input.type,
      subject_code: input.subject_code ?? null,
      subject_name: input.subject_name ?? null,
      semester: input.semester ?? null,
      branch_id: input.branch_id ?? null,
      description: input.description.trim(),
      tags: input.tags,
      attachment: input.attachment ?? null,
      url: input.url ?? null,
      status: 'pending',
      moderation_note: null,
      created_at: now,
      updated_at: now,
    }
    saveAll([resource, ...all()])
    await notificationService.push(userId, {
      category: 'resource',
      title: 'Resource submitted',
      body: `“${resource.title}” is now pending review. You'll be notified once it's moderated.`,
      url: '/resources/mine',
    })
    return resource
  },

  /** Published library — approved resources visible to everyone. */
  async listPublished(filter?: {
    q?: string
    type?: ResourceType | 'all'
    semester?: number | null
  }): Promise<Resource[]> {
    await delay(140)
    let list = all().filter((r) => r.status === 'approved')
    const q = filter?.q?.trim().toLowerCase()
    if (q) {
      list = list.filter((r) =>
        `${r.title} ${r.description} ${r.subject_name ?? ''} ${r.tags.join(' ')}`
          .toLowerCase()
          .includes(q),
      )
    }
    if (filter?.type && filter.type !== 'all') list = list.filter((r) => r.type === filter.type)
    if (filter?.semester != null) list = list.filter((r) => r.semester === filter.semester)
    return list
  },

  /** A student's OWN uploads (any status) — owner-scoped. */
  async listMine(userId: string): Promise<Resource[]> {
    await delay(120)
    return all().filter((r) => r.owner_id === userId)
  },

  async get(id: string): Promise<Resource | undefined> {
    await delay(80)
    return all().find((r) => r.id === id)
  },

  /**
   * Owner updates their own resource. Any edit re-enters moderation (status
   * returns to 'pending') so changes are re-reviewed before going live again.
   * Ownership is enforced: a mismatched owner is a no-op.
   */
  async update(
    userId: string,
    id: string,
    patch: Partial<CreateResourceInput>,
  ): Promise<Resource | undefined> {
    await delay(200)
    const list = all()
    const target = list.find((r) => r.id === id)
    if (!target || target.owner_id !== userId) return undefined
    Object.assign(target, {
      ...patch,
      tags: patch.tags ?? target.tags,
      status: 'pending' as ResourceStatus,
      moderation_note: null,
      updated_at: new Date().toISOString(),
    })
    saveAll(list)
    await notificationService.push(userId, {
      category: 'resource',
      title: 'Resource resubmitted',
      body: `“${target.title}” was updated and is pending review again.`,
      url: '/resources/mine',
    })
    return target
  },

  /** Owner deletes their own resource. */
  async remove(userId: string, id: string): Promise<void> {
    await delay(120)
    saveAll(all().filter((r) => !(r.id === id && r.owner_id === userId)))
  },

  // ---- Moderation (role-gated) ----
  async listQueue(status?: ResourceStatus): Promise<Resource[]> {
    await delay(120)
    const list = all()
    return status ? list.filter((r) => r.status === status) : list
  },

  async moderate(
    id: string,
    status: Extract<ResourceStatus, 'approved' | 'rejected' | 'changes_requested' | 'archived'>,
    note?: string,
  ): Promise<void> {
    await delay(160)
    const list = all()
    const target = list.find((r) => r.id === id)
    if (!target) return
    target.status = status
    target.moderation_note = note ?? null
    target.updated_at = new Date().toISOString()
    saveAll(list)

    const copy: Record<typeof status, { title: string; body: string }> = {
      approved: {
        title: 'Resource approved',
        body: `“${target.title}” is now live in the resource library.`,
      },
      rejected: {
        title: 'Resource rejected',
        body: note ? `“${target.title}” was rejected: ${note}` : `“${target.title}” was rejected.`,
      },
      changes_requested: {
        title: 'Changes requested',
        body: note
          ? `“${target.title}” needs changes: ${note}`
          : `“${target.title}” needs some changes before it can be published.`,
      },
      archived: {
        title: 'Resource archived',
        body: `“${target.title}” was archived.`,
      },
    }
    await notificationService.push(target.owner_id, {
      category: 'resource',
      title: copy[status].title,
      body: copy[status].body,
      url: '/resources/mine',
    })
  },
}
