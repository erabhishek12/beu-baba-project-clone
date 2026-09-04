import type { ReportReason, ReportStatus, ReportTargetType, ResourceStatus } from '@/types/domain'

/** Human labels for report reasons (mirrors reportService.REPORT_REASONS). */
export const REPORT_REASON_LABEL: Record<ReportReason, string> = {
  incorrect_information: 'Incorrect information',
  broken_file: 'Broken or missing file',
  duplicate: 'Duplicate',
  irrelevant: 'Irrelevant / wrong place',
  copyright: 'Copyright concern',
  inappropriate: 'Inappropriate content',
  bug: 'Bug',
  other: 'Other',
}

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  open: 'Open',
  investigating: 'Investigating',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
}

export const REPORT_TARGET_LABEL: Record<ReportTargetType, string> = {
  pyq: 'PYQ',
  subject: 'Subject',
  syllabus: 'Syllabus',
  quiz: 'Quiz',
  quiz_question: 'Quiz question',
  resource: 'Resource',
  notice: 'Notice',
  calendar: 'Calendar',
  app: 'App / bug',
}

export const RESOURCE_STATUS_LABEL: Record<ResourceStatus, string> = {
  pending: 'Pending review',
  approved: 'Approved',
  rejected: 'Rejected',
  changes_requested: 'Changes requested',
  archived: 'Archived',
}

type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

export const RESOURCE_STATUS_TONE: Record<ResourceStatus, Tone> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  changes_requested: 'accent',
  archived: 'neutral',
}

export const REPORT_STATUS_TONE: Record<ReportStatus, Tone> = {
  open: 'warning',
  investigating: 'accent',
  resolved: 'success',
  dismissed: 'neutral',
}
