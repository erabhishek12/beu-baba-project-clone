/**
 * Academic content control (Phase 4 — publication states & versioning).
 *
 * Owns the mutable editorial layer over the seeded academic dataset:
 *  - notices authored from the admin console (with publish/unpublish),
 *  - publication overrides for PYQ papers and notices,
 *  - syllabus version history (publish a new version per subject).
 *
 * Persisted in localStorage through the shared `store` so the mock backend
 * behaves like a real CMS; the Supabase adapter replaces this module with
 * table writes (pyqs.is_published / notices / syllabus_versions).
 */
import { store, delay } from '@/services/storage'
import { SEED_NOTICES, type Notice } from '@/services/mock/seed_content'

export interface SyllabusVersion {
  version: number
  published_at: string
  note: string
}

export interface Holiday {
  id: string
  title: string
  date: string
  end_date?: string | null
}

export interface QuizMeta {
  id: string
  title: string
  subject_code: string
  subject_name: string
  question_ids: string[]
  pick_count: number
  duration_sec: number
}

export interface SyllabusOverride {
  subject_code?: string
  subject_id?: string
  units: { title: string; topics: string[] }[]
  books?: string[]
}

export interface CalEvent {
  id: string
  title: string
  date: string
  end_date?: string | null
  type: string
  description?: string | null
}

export interface AuditEntry {
  id: string
  at: string
  kind: string
  file: string
  total: number
  imported: number
  skipped: number
}

export interface BuilderSpec {
  id: string
  title: string
  subject_code: string
  subject_name: string
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed'
  pick_count: number
  duration_sec: number
  created_at: string
}

interface State {
  notices: Notice[]
  unpublished: Record<string, true>
  versions: Record<string, SyllabusVersion[]>
  holidays: Holiday[]
  builder: BuilderSpec[]
  quizMetas: QuizMeta[]
  syllabusOverrides: SyllabusOverride[]
  events: CalEvent[]
  audit: AuditEntry[]
}

const KEY = 'content-admin:v1'

function load(): State {
  return store.get<State>(KEY, {
    notices: [],
    unpublished: {},
    versions: {},
    holidays: [],
    builder: [],
    quizMetas: [],
    syllabusOverrides: [],
    events: [],
    audit: [],
  })
}
function save(s: State) {
  store.set(KEY, s)
}

export const contentAdminService = {
  /** All notices (seeded + authored), newest first, including unpublished. */
  async listAllNotices(): Promise<(Notice & { is_published: boolean })[]> {
    await delay(80)
    const s = load()
    return [...SEED_NOTICES, ...s.notices]
      .map((n) => ({ ...n, is_published: !s.unpublished[n.id] }))
      .sort((a, b) => +new Date(b.published_at) - +new Date(a.published_at))
  },

  /** Only published notices — what students may see. */
  async listPublishedNotices(): Promise<Notice[]> {
    const all = await contentAdminService.listAllNotices()
    return all.filter((n) => n.is_published)
  },

  async createNotice(draft: {
    title: string
    body: string
    category: Notice['category']
  }): Promise<Notice> {
    await delay(120)
    const s = load()
    const notice: Notice = {
      id: crypto.randomUUID(),
      title: draft.title.trim(),
      body: draft.body.trim(),
      category: draft.category,
      published_at: new Date().toISOString(),
    }
    s.notices.push(notice)
    save(s)
    return notice
  },

  async importNotices(
    rows: { title?: string; body?: string; category?: Notice['category'] }[],
  ): Promise<number> {
    const s = load()
    const have = new Set(s.notices.map((n) => n.title))
    let added = 0
    for (const r of rows) {
      const title = (r.title ?? '').trim()
      const body = (r.body ?? '').trim()
      if (!title || !body || have.has(title)) continue
      s.notices.push({
        id: crypto.randomUUID(),
        title,
        body,
        category: r.category ?? 'general',
        published_at: new Date().toISOString(),
      })
      have.add(title)
      added++
    }
    save(s)
    return added
  },

  async setNoticePublished(id: string, published: boolean): Promise<void> {
    const s = load()
    if (published) delete s.unpublished[id]
    else s.unpublished[id] = true
    save(s)
  },

  // ---- PYQ publication -------------------------------------------------
  isPyqPublished(id: string): boolean {
    return !load().unpublished[id]
  },

  async setPyqPublished(id: string, published: boolean): Promise<void> {
    const s = load()
    if (published) delete s.unpublished[id]
    else s.unpublished[id] = true
    save(s)
  },

  // ---- Syllabus versioning ---------------------------------------------
  async listVersions(subjectId: string): Promise<SyllabusVersion[]> {
    await delay(60)
    const s = load()
    return (
      s.versions[subjectId] ?? [
        {
          version: 1,
          published_at: new Date().toISOString(),
          note: 'Initial published syllabus',
        },
      ]
    )
  },

  async currentVersion(subjectId: string): Promise<number> {
    const v = await contentAdminService.listVersions(subjectId)
    return v[v.length - 1]?.version ?? 1
  },

  // ---- Holidays (calendar) ----------------------------------------------
  listHolidaysSync(): Holiday[] {
    return load().holidays
  },

  async importHolidays(rows: { title?: string; name?: string; date?: string }[]): Promise<number> {
    const s = load()
    const have = new Set(s.holidays.map((h) => h.date + h.title))
    let added = 0
    for (const r of rows) {
      const title = (r.title ?? r.name ?? '').trim()
      const date = (r.date ?? '').trim()
      if (!title || !date || have.has(date + title)) continue
      s.holidays.push({ id: crypto.randomUUID(), title, date })
      have.add(date + title)
      added++
    }
    save(s)
    return added
  },

  // ---- Imported quiz metas / syllabus overrides / events / audit ----------
  async importQuizMetas(rows: Record<string, unknown>[]): Promise<number> {
    const s = load()
    const have = new Set(s.quizMetas.map((m) => m.id))
    let added = 0
    for (const r of rows) {
      const id = typeof r.id === 'string' ? r.id : `quiz_${Date.now().toString(36)}_${added}`
      if (have.has(id)) continue
      s.quizMetas.push({
        id,
        title: String(r.title ?? 'Imported quiz'),
        subject_code: String(r.subject_code ?? ''),
        subject_name: String(r.subject_name ?? r.title ?? 'Imported quiz'),
        question_ids: (r.question_ids as string[]) ?? [],
        pick_count: Number(r.pick_count ?? 10),
        duration_sec: Number(r.duration_sec ?? 600),
      })
      have.add(id)
      added++
    }
    save(s)
    return added
  },

  listQuizMetasSync(): QuizMeta[] {
    return load().quizMetas
  },

  async importSyllabusOverrides(rows: Record<string, unknown>[]): Promise<number> {
    const s = load()
    let added = 0
    for (const r of rows) {
      const code = typeof r.subject_code === 'string' ? r.subject_code : undefined
      const sid = typeof r.subject_id === 'string' ? r.subject_id : undefined
      s.syllabusOverrides = s.syllabusOverrides.filter(
        (o) => o.subject_code !== code && o.subject_id !== sid,
      )
      s.syllabusOverrides.push({
        subject_code: code,
        subject_id: sid,
        units: (r.units as SyllabusOverride['units']) ?? [],
        books: (r.books as string[]) ?? [],
      })
      added++
    }
    save(s)
    return added
  },

  getSyllabusOverrideSync(subjectId: string, code?: string): SyllabusOverride | undefined {
    return load().syllabusOverrides.find(
      (o) => (o.subject_id && o.subject_id === subjectId) || (o.subject_code && o.subject_code === code),
    )
  },

  async importEvents(rows: Record<string, unknown>[]): Promise<number> {
    const s = load()
    const have = new Set(s.events.map((e) => e.date + e.title))
    let added = 0
    for (const r of rows) {
      const title = String(r.title ?? '').trim()
      const date = String(r.date ?? '').trim()
      if (!title || !date || have.has(date + title)) continue
      s.events.push({
        id: crypto.randomUUID(),
        title,
        date,
        end_date: (r.end_date as string) ?? null,
        type: String(r.type ?? 'event'),
        description: (r.description as string) ?? null,
      })
      have.add(date + title)
      added++
    }
    save(s)
    return added
  },

  listEventsSync(): CalEvent[] {
    return load().events
  },

  addAudit(e: Omit<AuditEntry, 'id' | 'at'>): void {
    const s = load()
    s.audit.unshift({ ...e, id: crypto.randomUUID(), at: new Date().toISOString() })
    s.audit = s.audit.slice(0, 30)
    save(s)
  },

  listAuditSync(): AuditEntry[] {
    return load().audit
  },

  // ---- Quiz builder specs -------------------------------------------------
  listBuilderSpecsSync(): BuilderSpec[] {
    return load().builder
  },

  async createBuilderSpec(spec: Omit<BuilderSpec, 'id' | 'created_at'>): Promise<BuilderSpec> {
    await delay(100)
    const s = load()
    const full: BuilderSpec = {
      ...spec,
      id: `built_${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
    }
    s.builder.push(full)
    save(s)
    return full
  },

  async publishVersion(subjectId: string, note: string): Promise<SyllabusVersion> {
    await delay(120)
    const s = load()
    const list = s.versions[subjectId] ?? [
      {
        version: 1,
        published_at: new Date().toISOString(),
        note: 'Initial published syllabus',
      },
    ]
    const entry: SyllabusVersion = {
      version: list[list.length - 1].version + 1,
      published_at: new Date().toISOString(),
      note: note.trim() || 'Revision published',
    }
    s.versions[subjectId] = [...list, entry]
    save(s)
    return entry
  },
}
