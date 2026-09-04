import { useState } from 'react'
import { Search, PlayCircle, Sparkles, Copy, FileText, ChevronDown } from 'lucide-react'
import { Modal } from '@/components/glass/Modal'
import { useToast } from '@/components/feedback/Toast'
import {
  type StudyContext,
  type AiTask,
  AI_TASKS,
  googleQuery,
  youtubeQuery,
  googlePdfQuery,
  aiPrompt,
  providers,
} from '@/services/smartSearch'
import { cn } from '@/lib/cn'

interface SmartSearchSheetProps {
  open: boolean
  onClose: () => void
  context: StudyContext
}

/**
 * Study Assist action sheet (spec §24). Builds correct external queries from an
 * academic context and opens the provider with the query prepared. Calm, glass,
 * no "AI theme" — just useful one-tap actions. Prompts are previewable + copyable.
 */
export function SmartSearchSheet({ open, onClose, context }: SmartSearchSheetProps) {
  const toast = useToast()
  const [task, setTask] = useState<AiTask>('explain')
  const [showPrompt, setShowPrompt] = useState(false)

  const label = context.topic || context.title || context.subject || 'this topic'
  const prompt = aiPrompt(task, context)

  function launch(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  async function copy(text: string, what: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${what} copied`)
    } catch {
      toast.error('Could not copy', 'Your browser blocked clipboard access.')
    }
  }

  function askChatGpt() {
    launch(providers.chatgpt(prompt))
    // The external interface may not accept the prefill; also copy so the
    // student always has the exact prompt (spec §24: never fake submission).
    copy(prompt, 'Prompt')
  }

  return (
    <Modal open={open} onClose={onClose} title="Study assist" className="max-w-lg">
      <div className="mb-4">
        <h2 className="text-h3 text-ink">Study assist</h2>
        <p className="mt-0.5 line-clamp-2 text-body-sm text-ink-secondary">{label}</p>
        {context.subject && (
          <p className="mt-1 text-caption text-ink-tertiary">
            {context.subject}
            {context.semester ? ` · Semester ${context.semester}` : ''}
          </p>
        )}
      </div>

      {/* Search providers */}
      <div className="grid grid-cols-2 gap-3">
        <ActionButton
          icon={Search}
          label="Search Google"
          tone="bg-accent-soft text-accent"
          onClick={() => launch(providers.google(googleQuery(context)))}
        />
        <ActionButton
          icon={PlayCircle}
          label="Search YouTube"
          tone="bg-danger-soft text-danger"
          onClick={() => launch(providers.youtube(youtubeQuery(context)))}
        />
        <ActionButton
          icon={Sparkles}
          label="Ask AI (ChatGPT)"
          tone="bg-[#e9f7f1] text-[#0f9d63]"
          onClick={askChatGpt}
        />
        <ActionButton
          icon={FileText}
          label="Find PDF notes"
          tone="bg-warning-soft text-warning"
          onClick={() => launch(providers.google(googlePdfQuery(context)))}
        />
      </div>

      {/* AI task selection */}
      <div className="mt-5">
        <p className="mb-2 text-label uppercase tracking-wide text-ink-tertiary">AI task</p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {AI_TASKS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTask(t.id)}
              className={cn(
                'shrink-0 rounded-pill border px-3 py-1.5 text-caption font-semibold transition-colors',
                task === t.id
                  ? 'border-transparent bg-accent text-white'
                  : 'border-line bg-surface-secondary text-ink-secondary',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt preview */}
      <div className="mt-4">
        <button
          onClick={() => setShowPrompt((v) => !v)}
          className="flex w-full items-center justify-between text-body-sm font-semibold text-ink-secondary"
          aria-expanded={showPrompt}
        >
          Preview prompt
          <ChevronDown className={cn('size-4 transition-transform', showPrompt && 'rotate-180')} />
        </button>
        {showPrompt && (
          <div className="mt-2 rounded-lg bg-surface-secondary/70 p-3">
            <p className="whitespace-pre-wrap text-body-sm text-ink-secondary">{prompt}</p>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="mt-5 flex gap-3">
        <button
          onClick={() => copy(prompt, 'Prompt')}
          className="glass-standard glass-highlight flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-body-sm font-semibold text-ink-secondary"
        >
          <Copy className="size-4" aria-hidden />
          Copy prompt
        </button>
        <button
          onClick={askChatGpt}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-3 text-body-sm font-semibold text-white"
        >
          <Sparkles className="size-4" aria-hidden />
          Ask AI
        </button>
      </div>
    </Modal>
  )
}

function ActionButton({
  icon: Icon,
  label,
  tone,
  onClick,
}: {
  icon: typeof Search
  label: string
  tone: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="glass-standard glass-highlight flex items-center gap-3 rounded-xl p-3 text-left"
    >
      <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', tone)}>
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="text-body-sm font-semibold text-ink">{label}</span>
    </button>
  )
}
