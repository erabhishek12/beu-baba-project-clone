/** Chatbot intent catalog types (spec §24–§28). */

export type IntentAction =
  | 'navigate'        // go to an in-app route
  | 'external'        // open an external study site in a new tab
  | 'answer'          // reply with a fixed, factual answer
  | 'search_quiz'     // find a quiz for a subject
  | 'search_resource' // find notes for a subject
  | 'search_syllabus'
  | 'search_pyq'
  | 'search_subject'
  | 'search_unit'
  | 'search_semester'
  | 'search_branch'

export interface Intent {
  key: string
  category: string
  title: string
  action: IntentAction
  target: string
  phrases: string[]
  answer?: string
}

/** What the chatbot decided to do about one message. */
export interface BotReply {
  text: string
  /** Optional cards the user can tap. */
  cards?: BotCard[]
  /** True when we could not answer and are offering the developer fallback. */
  fallback?: boolean
  intentKey?: string
}

export interface BotCard {
  label: string
  /** In-app path, or an absolute URL for external. */
  target: string
  external?: boolean
  subtitle?: string
}
