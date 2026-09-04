/**
 * BEU BABA core domain types.
 * Mirrors the documented Supabase data model (docs 05, 08, 10, 13, 22).
 * These types are backend-agnostic: the mock service and a future Supabase
 * adapter both satisfy the same contracts.
 */

import type { Attachment } from '@/lib/media'

export type { Attachment }

export type UUID = string
export type ISODate = string

// ---- Identity ----
export type AvatarType = 'generated' | 'uploaded'
export type Gender = 'male' | 'female' | 'unspecified'

export type Role =
  | 'student'
  | 'moderator'
  | 'content_manager'
  | 'support_manager'
  | 'admin'
  | 'super_admin'

export interface Profile {
  id: UUID
  full_name: string
  email: string
  phone?: string
  avatar_type: AvatarType
  avatar_url?: string | null
  avatar_character_id?: string | null
  gender?: Gender
  bio?: string | null
  is_active: boolean
  onboarding_completed: boolean
  created_at: ISODate
  updated_at: ISODate
}

export interface StudentProfile {
  user_id: UUID
  course_id: UUID | null
  branch_id: UUID | null
  admission_year: number | null
  current_semester_id: UUID | null
  enrollment_number?: string | null
  college_name?: string | null
  onboarding_completed: boolean
}

export interface AuthUser {
  id: UUID
  email: string
  email_verified: boolean
}

export interface SessionUser {
  auth: AuthUser
  profile: Profile
  student?: StudentProfile | null
  roles: Role[]
}

// ---- Academic taxonomy ----
export interface Course {
  id: UUID
  name: string
  short_name?: string
  slug: string
  display_order: number
}

export interface Branch {
  id: UUID
  course_id: UUID
  name: string
  slug: string
  display_order: number
}

export interface Semester {
  id: UUID
  number: number
  label: string
}

export interface Subject {
  id: UUID
  branch_id: UUID | null
  semester_id: UUID | null
  name: string
  code: string
  credits?: number
  type?: 'theory' | 'lab' | 'practical' | string
  /** Lecture / Tutorial / Practical weekly hours (from published syllabus). */
  L?: number | null
  T?: number | null
  P?: number | null
}

// ---- PYQ (previous-year questions) ----
export interface PyqPaper {
  id: UUID
  code: string | null
  subject: string
  /** Curriculum semester number (1..8); may be null when the source omits it. */
  semester: number | null
  semester_id: UUID | null
  year: number | null
  group: string | null
  exam_title?: string | null
  full_marks?: number | null
  time?: string | null
  question_count: number
  block_count: number
}

export interface PyqSubQuestion {
  number?: number
  text: string
  options?: string[] | null
  marks?: number | null
}

export interface PyqBlock {
  number?: number
  title: string
  marks?: number | null
  subquestions: PyqSubQuestion[]
}

export interface PyqPaperDetail {
  instructions: string[]
  blocks: PyqBlock[]
}

// ---- Academic calendar ----
export type CalendarEventType = 'exam' | 'holiday' | 'event' | 'deadline' | 'result'

export interface AcademicEvent {
  id: string
  title: string
  date: ISODate
  end_date?: ISODate | null
  type: CalendarEventType
  description?: string | null
}

// ---- Avatar characters (application avatar, not a security identity) ----
export interface AvatarCharacter {
  id: string
  gender: Gender
  label: string
  /** Path/URL to the character asset. */
  src: string
}

// ---- Auth error contract (mapped to friendly copy in the UI) ----
export type AuthErrorCode =
  | 'invalid_credentials'
  | 'email_taken'
  | 'email_not_verified'
  | 'account_disabled'
  | 'weak_password'
  | 'rate_limited'
  | 'network'
  | 'unknown'

export class AuthError extends Error {
  code: AuthErrorCode
  constructor(code: AuthErrorCode, message?: string) {
    super(message ?? code)
    this.code = code
    this.name = 'AuthError'
  }
}

// ---- Quiz / assessment engine (spec doc 15) ----
export type QuestionType = 'single' | 'multi' | 'truefalse' | 'assertion_reason'
export type QuizType = 'practice' | 'timed' | 'pyq' | 'topic' | 'mixed'
export type Difficulty = 'easy' | 'medium' | 'hard'

/**
 * A question as stored in the bank. The correct answer lives here and is
 * resolved on the SERVICE (server) boundary only — the attempt UI receives a
 * PublicQuestion that omits the key (spec §23 scoring security).
 */
export interface QuizQuestion {
  id: string
  subject_code: string
  unit_index: number
  topic: string
  type: QuestionType
  difficulty: Difficulty
  stem: string
  options: string[]
  /** single/truefalse/assertion_reason */
  correct_index?: number
  /** multi */
  correct_indices?: number[]
  explanation: string
  source?: string
  pyq?: boolean
  year?: number | null
  verified: boolean
}

/** Question shipped to the client during an active attempt — NO answer key. */
export interface PublicQuestion {
  id: string
  type: QuestionType
  difficulty: Difficulty
  topic: string
  stem: string
  options: string[]
}

export interface Quiz {
  id: string
  title: string
  subject_code: string
  subject_name: string
  branch_id: string | null
  semester: number | null
  unit_index: number | null
  type: QuizType
  difficulty: Difficulty
  question_ids: string[]
  pick_count: number
  duration_sec: number
  negative_marking: number
  marks_per_question: number
  verified: boolean
  official: boolean
}

/** Quiz card for discovery — computed summary, no question payload. */
export interface QuizSummary {
  id: string
  title: string
  subject_name: string
  subject_code: string
  branch_id: string | null
  semester: number | null
  type: QuizType
  difficulty: Difficulty
  question_count: number
  duration_sec: number
  negative_marking: number
  verified: boolean
  official: boolean
}

export type AttemptState =
  | 'initialized'
  | 'in_progress'
  | 'submitted'
  | 'auto_submitted'
  | 'expired'

export interface AttemptAnswer {
  question_id: string
  /** selected option indices (single => length 0 or 1) */
  selected: number[]
  marked_for_review: boolean
}

/** Persisted attempt (mirrors the future quiz_attempts row; owned by user_id). */
export interface QuizAttempt {
  id: string
  quiz_id: string
  user_id: string
  state: AttemptState
  /** ordered question ids for THIS attempt (the immutable snapshot) */
  question_ids: string[]
  answers: Record<string, AttemptAnswer>
  started_at: ISODate
  expires_at: ISODate
  submitted_at?: ISODate | null
  duration_sec: number
  marks_per_question: number
  negative_marking: number
}

export interface QuestionReviewItem {
  id: string
  stem: string
  options: string[]
  topic: string
  type: QuestionType
  selected: number[]
  correct: number[]
  is_correct: boolean
  explanation: string
}

export interface TopicPerformance {
  topic: string
  answered: number
  correct: number
  accuracy: number
}

export interface QuizResult {
  attempt_id: string
  quiz_id: string
  quiz_title: string
  subject_name: string
  total: number
  answered: number
  unanswered: number
  correct: number
  incorrect: number
  marks_obtained: number
  max_marks: number
  percentage: number
  accuracy: number
  time_used_sec: number
  passed: boolean
  topics: TopicPerformance[]
  review: QuestionReviewItem[]
  submitted_at: ISODate
}

// =====================================================================
// Contribution & support layer (spec docs 19–31): reports, resources,
// developer support, bookmarks. All owner-scoped; the mock enforces the
// ownership/RLS contract the Supabase adapter will mirror server-side.
// =====================================================================

// ---- Reports (content correction / bug / takedown) ----
export type ReportTargetType =
  | 'pyq'
  | 'subject'
  | 'syllabus'
  | 'quiz'
  | 'quiz_question'
  | 'resource'
  | 'notice'
  | 'calendar'
  | 'app'
export type ReportReason =
  | 'incorrect_information'
  | 'broken_file'
  | 'duplicate'
  | 'irrelevant'
  | 'copyright'
  | 'inappropriate'
  | 'bug'
  | 'other'
export type ReportStatus = 'open' | 'investigating' | 'resolved' | 'dismissed'

export interface Report {
  id: string
  reporter_id: string
  target_type: ReportTargetType
  /** id or path of the reported entity (null for a whole-app bug report) */
  target_id: string | null
  target_label: string
  reason: ReportReason
  details: string
  /** page path captured for bug reports */
  context_path?: string | null
  attachment?: Attachment | null
  status: ReportStatus
  created_at: ISODate
}

// ---- Student-contributed resources (moderated before publish) ----
export type ResourceType = 'notes' | 'pdf' | 'link' | 'question_paper' | 'image' | 'other'
export type ResourceStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested' | 'archived'

export interface Resource {
  id: string
  owner_id: string
  owner_name: string
  title: string
  type: ResourceType
  subject_code?: string | null
  subject_name?: string | null
  semester?: number | null
  branch_id?: string | null
  description: string
  tags: string[]
  /** file attachment (notes/pdf/image/question_paper) OR external link */
  attachment?: Attachment | null
  url?: string | null
  status: ResourceStatus
  /** moderation note shown to the owner when rejected / changes requested */
  moderation_note?: string | null
  created_at: ISODate
  updated_at: ISODate
}

// ---- Private developer support (owner-scoped conversations) ----
export type SupportCategory =
  | 'bug'
  | 'content_correction'
  | 'missing_resource'
  | 'feature_request'
  | 'account'
  | 'feedback'
  | 'other'
export type SupportStatus =
  | 'open'
  | 'awaiting_student'
  | 'awaiting_developer'
  | 'resolved'
  | 'archived'
export type SupportSenderRole = 'student' | 'developer'

export interface SupportMessage {
  id: string
  conversation_id: string
  sender_id: string
  sender_role: SupportSenderRole
  body: string
  attachment?: Attachment | null
  created_at: ISODate
  read_at?: ISODate | null
}

export interface SupportConversation {
  id: string
  student_id: string
  subject: string
  category: SupportCategory
  status: SupportStatus
  created_at: ISODate
  updated_at: ISODate
}

export interface SupportThread extends SupportConversation {
  messages: SupportMessage[]
}

// ---- Bookmarks / saved content ----
export type BookmarkType = 'pyq' | 'subject' | 'quiz' | 'resource' | 'notice' | 'calendar'

export interface Bookmark {
  id: string
  owner_id: string
  target_type: BookmarkType
  target_id: string
  title: string
  subtitle?: string | null
  url: string
  created_at: ISODate
}
