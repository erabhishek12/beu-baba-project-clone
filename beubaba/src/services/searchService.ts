/**
 * Global search (spec §20). Builds a lightweight client-side index over ONLY
 * published, publicly-visible content — subjects, PYQs, quizzes, approved
 * resources, notices, government exams and portals.
 *
 * Privacy: private/pending content is never indexed. Pending or rejected
 * resources, private support messages and admin-only records are excluded by
 * construction (we only pull from the public list methods), mirroring the rule
 * that "a search result is never more visible than the underlying content
 * permission allows."
 */
import { academicService } from '@/services/academicService'
import { pyqService } from '@/services/pyqService'
import { quizService } from '@/services/quizService'
import { resourceService } from '@/services/resourceService'
import { dashboardService } from '@/services/dashboardService'
import { toolsService } from '@/services/toolsService'

export type SearchType =
  | 'subject'
  | 'pyq'
  | 'quiz'
  | 'resource'
  | 'notice'
  | 'exam'
  | 'portal'
  | 'course'
  | 'branch'

export interface SearchResult {
  id: string
  type: SearchType
  title: string
  subtitle?: string | null
  /** in-app path or external URL */
  url: string
  external?: boolean
  /** lowercased haystack for matching */
  haystack: string
}

export const SEARCH_TYPE_LABEL: Record<SearchType, string> = {
  subject: 'Subject',
  pyq: 'Previous paper',
  quiz: 'Quiz',
  resource: 'Resource',
  notice: 'Notice',
  exam: 'Govt exam',
  portal: 'Portal',
  course: 'Course',
  branch: 'Branch',
}

let cache: SearchResult[] | null = null
let building: Promise<SearchResult[]> | null = null

async function build(): Promise<SearchResult[]> {
  const results: SearchResult[] = []

  const [subjects, courses, branches, pyqs, quizzes, resources, notices, exams, portalGroups] =
    await Promise.all([
    academicService.listSubjects().catch(() => []),
    academicService.listCourses().catch(() => []),
    academicService.listBranches().catch(() => []),
    pyqService.list({}).catch(() => []),
    quizService.listQuizzes().catch(() => []),
    resourceService.listPublished().catch(() => []),
    dashboardService.listNotices().catch(() => []),
    toolsService.listGovExams().catch(() => []),
    toolsService.listPortals().catch(() => []),
  ])

  for (const s of subjects) {
    results.push({
      id: `subject-${s.id}`,
      type: 'subject',
      title: s.name,
      subtitle: s.code,
      url: `/study/subject/${s.id}`,
      haystack: `${s.name} ${s.code}`.toLowerCase(),
    })
  }
  for (const c of courses) {
    results.push({
      id: `course-${c.id}`,
      type: 'course',
      title: c.name,
      subtitle: c.short_name ?? null,
      url: '/study/courses',
      haystack: `${c.name} ${c.short_name ?? ''} ${c.slug}`.toLowerCase(),
    })
  }
  for (const b of branches) {
    results.push({
      id: `branch-${b.id}`,
      type: 'branch',
      title: b.name,
      subtitle: 'Branch · syllabus & papers',
      url: `/study/syllabus?branch=${b.id}`,
      haystack: `${b.name} ${b.slug}`.toLowerCase(),
    })
  }
  for (const p of pyqs) {
    const title = `${p.subject}${p.year ? ` (${p.year})` : ''}`
    results.push({
      id: `pyq-${p.id}`,
      type: 'pyq',
      title,
      subtitle: p.semester != null ? `Semester ${p.semester}` : p.code,
      url: `/study/pyq/${p.id}`,
      haystack: `${p.subject} ${p.code ?? ''} ${p.year ?? ''}`.toLowerCase(),
    })
  }
  for (const q of quizzes) {
    results.push({
      id: `quiz-${q.id}`,
      type: 'quiz',
      title: q.title,
      subtitle: q.subject_name,
      url: `/quiz/${q.id}`,
      haystack: `${q.title} ${q.subject_name} ${q.subject_code}`.toLowerCase(),
    })
  }
  for (const r of resources) {
    results.push({
      id: `resource-${r.id}`,
      type: 'resource',
      title: r.title,
      subtitle: r.subject_name ?? 'Resource',
      url: r.url ?? `/resources`,
      external: !!r.url,
      haystack: `${r.title} ${r.description} ${r.subject_name ?? ''} ${r.tags.join(' ')}`.toLowerCase(),
    })
  }
  for (const n of notices) {
    results.push({
      id: `notice-${n.id}`,
      type: 'notice',
      title: n.title,
      subtitle: 'Notice',
      url: `/`,
      haystack: `${n.title} ${n.body}`.toLowerCase(),
    })
  }
  for (const e of exams) {
    results.push({
      id: `exam-${e.id}`,
      type: 'exam',
      title: e.name,
      subtitle: e.category,
      url: `/tools/exams/${e.id}`,
      haystack: `${e.name} ${e.category} ${e.summary}`.toLowerCase(),
    })
  }
  for (const g of portalGroups) {
    for (const link of g.items ?? []) {
      results.push({
        id: `portal-${g.key}-${link.url}`,
        type: 'portal',
        title: link.name,
        subtitle: g.title,
        url: link.url,
        external: true,
        haystack: `${link.name} ${g.title} ${link.desc ?? ''}`.toLowerCase(),
      })
    }
  }

  return results
}

export const searchService = {
  /** Warm the index (call from search entry so first keystroke is instant). */
  async warm(): Promise<void> {
    if (cache) return
    if (!building) building = build().then((r) => (cache = r))
    await building
  },

  async query(q: string, limit = 30): Promise<SearchResult[]> {
    const term = q.trim().toLowerCase()
    if (!term) return []
    if (!cache) await this.warm()
    const index = cache ?? []
    const tokens = term.split(/\s+/).filter(Boolean)

    const scored = index
      .map((item) => {
        let score = 0
        for (const t of tokens) {
          const at = item.haystack.indexOf(t)
          if (at < 0) return null
          score += at === 0 ? 3 : item.haystack.includes(` ${t}`) ? 2 : 1
        }
        // small boost for title matches
        if (item.title.toLowerCase().includes(term)) score += 4
        return { item, score }
      })
      .filter((x): x is { item: SearchResult; score: number } => x != null)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((x) => x.item)

    return scored
  },

  /** Drop the cache (e.g. after content changes in a session). */
  invalidate(): void {
    cache = null
    building = null
  },
}
