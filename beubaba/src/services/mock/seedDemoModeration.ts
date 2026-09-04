/**
 * MOCK-ONLY demo seeding for the moderation queues so the admin panel has
 * realistic content to act on in the preview. Runs once (guarded by a flag).
 * Removed with the Supabase adapter — production data is real user submissions.
 */
import { store } from '@/services/storage'
import type { Report, Resource } from '@/types/domain'

const RESOURCES_KEY = 'resources:all'
const REPORTS_GLOBAL_KEY = 'reports:all'
const SEEDED_FLAG = 'demo:moderation:seeded:v1'

export function ensureDemoModeration(): void {
  if (store.get<boolean>(SEEDED_FLAG, false)) return

  const now = Date.now()
  const iso = (minsAgo: number) => new Date(now - minsAgo * 60000).toISOString()

  const demoResources: Resource[] = [
    {
      id: 'demo_res_1',
      owner_id: 'demo-student-1',
      owner_name: 'Ankit Raj',
      title: 'Data Structures — Complete Unit 1 Notes',
      type: 'notes',
      subject_code: 'CSE201',
      subject_name: 'Data Structures',
      semester: 3,
      branch_id: null,
      description:
        'Hand-written notes covering arrays, linked lists, stacks and queues with diagrams and complexity tables.',
      tags: ['data structures', 'unit 1', 'notes'],
      attachment: null,
      url: 'https://example.com/ds-unit1-notes.pdf',
      status: 'pending',
      moderation_note: null,
      created_at: iso(35),
      updated_at: iso(35),
    },
    {
      id: 'demo_res_2',
      owner_id: 'demo-student-2',
      owner_name: 'Priya Kumari',
      title: 'DBMS Previous Year Solved Paper 2023',
      type: 'question_paper',
      subject_code: 'CSE302',
      subject_name: 'Database Management Systems',
      semester: 5,
      branch_id: null,
      description: 'Fully solved 2023 end-sem paper with normalization examples worked out.',
      tags: ['dbms', 'solved', 'pyq'],
      attachment: null,
      url: 'https://example.com/dbms-2023-solved.pdf',
      status: 'pending',
      moderation_note: null,
      created_at: iso(180),
      updated_at: iso(180),
    },
    {
      id: 'demo_res_3',
      owner_id: 'demo-student-3',
      owner_name: 'Rahul Verma',
      title: 'Operating Systems — Scheduling Cheat Sheet',
      type: 'pdf',
      subject_code: 'CSE304',
      subject_name: 'Operating Systems',
      semester: 5,
      branch_id: null,
      description: 'One-page cheat sheet for FCFS, SJF, Round Robin and priority scheduling.',
      tags: ['os', 'scheduling', 'cheat sheet'],
      attachment: null,
      url: 'https://example.com/os-scheduling.pdf',
      status: 'approved',
      moderation_note: null,
      created_at: iso(60 * 26),
      updated_at: iso(60 * 25),
    },
  ]

  const demoReports: Report[] = [
    {
      id: 'demo_rep_1',
      reporter_id: 'demo-student-4',
      target_type: 'pyq',
      target_id: 'pyq-demo',
      target_label: 'Engineering Mathematics-II · 2022 End Sem',
      reason: 'incorrect_information',
      details:
        'Question 4(b) answer key looks wrong — the integral evaluates to a different value. Please re-check.',
      context_path: '/study/pyq/pyq-demo',
      attachment: null,
      status: 'open',
      created_at: iso(90),
    },
    {
      id: 'demo_rep_2',
      reporter_id: 'demo-student-5',
      target_type: 'resource',
      target_id: 'demo_res_x',
      target_label: 'Thermodynamics Notes (broken link)',
      reason: 'broken_file',
      details: 'The download link returns a 404. Can this be fixed or removed?',
      context_path: '/resources',
      attachment: null,
      status: 'open',
      created_at: iso(60 * 8),
    },
    {
      id: 'demo_rep_3',
      reporter_id: 'demo-student-6',
      target_type: 'app',
      target_id: null,
      target_label: 'Calendar page bug',
      reason: 'bug',
      details:
        'On the calendar page, switching months quickly sometimes shows the wrong month header for a second.',
      context_path: '/study/calendar',
      attachment: null,
      status: 'investigating',
      created_at: iso(60 * 30),
    },
  ]

  // Only seed if the queues are currently empty, so we never clobber real
  // submissions a tester may have created.
  const existingResources = store.get<Resource[]>(RESOURCES_KEY, [])
  if (existingResources.length === 0) {
    store.set(RESOURCES_KEY, demoResources)
  }
  const existingReports = store.get<Report[]>(REPORTS_GLOBAL_KEY, [])
  if (existingReports.length === 0) {
    store.set(REPORTS_GLOBAL_KEY, demoReports)
  }

  store.set(SEEDED_FLAG, true)
}
