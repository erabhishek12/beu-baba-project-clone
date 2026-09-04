/**
 * Smart External Search + Study Assist engine — documented contract (spec §24).
 *
 * Centralized query/prompt generation. Components pass a StudyContext; this
 * module builds correctly-structured Google / YouTube queries and AI prompts,
 * then produces ordinary provider URLs. It never injects private student data
 * (email, phone, ids, tokens) into any external query (spec §24 rules 15–17).
 *
 * No AI API key is required — Google/YouTube/ChatGPT launch via plain URLs
 * (rule 19). AI providers can be added later as optional modules.
 */

export interface StudyContext {
  sourceType?: 'pyq' | 'syllabus_topic' | 'subject' | 'unit'
  title?: string | null
  question?: string | null
  subject?: string | null
  branch?: string | null
  semester?: number | null
  unit?: string | null
  topic?: string | null
  examYear?: number | null
  marks?: number | null
  /** Academic level; defaults to B.Tech. */
  level?: string
}

const LEVEL = 'B.Tech'

/** The single, most meaningful academic phrase for a context. */
function coreTopic(ctx: StudyContext): string {
  return (ctx.topic || ctx.title || ctx.subject || ctx.question || '').trim()
}

function compact(parts: (string | number | null | undefined)[]): string {
  return parts
    .map((p) => (p == null ? '' : String(p).trim()))
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Google: exact topic + subject + academic level. Concise, no keyword stuffing. */
export function googleQuery(ctx: StudyContext): string {
  return compact([ctx.level || LEVEL, ctx.subject, ctx.topic || ctx.title, ctx.question])
}

/** YouTube: topic + subject + level + a single teaching term. */
export function youtubeQuery(ctx: StudyContext): string {
  return compact([ctx.level || LEVEL, ctx.subject, ctx.topic || ctx.title, 'lecture'])
}

/** Google PDF-notes variant (only when the user explicitly wants documents). */
export function googlePdfQuery(ctx: StudyContext): string {
  return compact([ctx.level || LEVEL, ctx.subject, ctx.topic || ctx.title, 'notes filetype:pdf'])
}

/** AI/ChatGPT task templates — the same engine, different requested tasks. */
export type AiTask =
  | 'explain'
  | 'exam_answer'
  | 'notes'
  | 'example'
  | 'hinglish'
  | 'quiz'
  | 'viva'

export const AI_TASKS: { id: AiTask; label: string }[] = [
  { id: 'explain', label: 'Explain simply' },
  { id: 'exam_answer', label: 'Exam-ready answer' },
  { id: 'notes', label: 'Make quick notes' },
  { id: 'example', label: 'Real-life example' },
  { id: 'hinglish', label: 'Explain in Hinglish' },
  { id: 'quiz', label: 'Quiz me' },
  { id: 'viva', label: 'Viva questions' },
]

export function aiPrompt(task: AiTask, ctx: StudyContext): string {
  const level = ctx.level || LEVEL
  const subject = ctx.subject ? ` in ${ctx.subject}` : ''
  const topic = coreTopic(ctx)
  const q = ctx.question ? ` Question: ${ctx.question}.` : ''
  const marks = ctx.marks ? ` Structure it as an exam-ready ${ctx.marks}-mark university answer.` : ''

  switch (task) {
    case 'exam_answer':
      return `You are an expert university teacher. Write a clear, exam-ready answer for a ${level} student${subject}. Start with a short definition, then the key points with brief explanations, add a diagram description or example if useful, and end with a one-line conclusion.${marks} Topic: ${topic}.${q}`
    case 'notes':
      return `Make concise revision notes for a ${level} student${subject} on the topic "${topic}". Use short bullet points, bold the key terms, and keep it easy to memorize for exams.${q}`
    case 'example':
      return `Explain the topic "${topic}"${subject} for a ${level} student using a simple real-life example first, then connect it back to the concept in easy language.${q}`
    case 'hinglish':
      return `Ek ${level} student ko "${topic}"${subject} bahut easy Hinglish (Hindi + English) mein samjhao. Pehle simple meaning, phir step-by-step concept, phir ek example, aur end mein short exam-ready answer.${q}`
    case 'quiz':
      return `Act as an examiner for a ${level} student${subject}. Create 5 short quiz questions (mix of MCQ and one-line) on "${topic}", then provide the answers separately below.${q}`
    case 'viva':
      return `List 8 likely viva/oral-exam questions with short model answers for a ${level} student${subject} on the topic "${topic}".${q}`
    case 'explain':
    default:
      return `You are an expert university teacher. Explain the following topic in very easy human language for a ${level} student. Start with a simple meaning, then explain the concept step by step, give a practical example where useful, mention important points to remember, and finally provide an exam-ready answer. Use simple words. Topic: ${topic}.${subject ? ` Subject: ${ctx.subject}.` : ''}${q}`
  }
}

// ---- Provider URL builders (plain, safe URLs only) ----
export const providers = {
  google: (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  youtube: (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
  /** ChatGPT prefilled prompt via the supported query param. */
  chatgpt: (prompt: string) => `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`,
}
