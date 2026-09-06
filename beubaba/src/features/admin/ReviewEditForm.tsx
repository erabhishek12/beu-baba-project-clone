/**
 * MCQ edit form (Phase 3A-3, Feature A).
 *
 * The database function `review_edit_question` already existed and was tested,
 * but a reviewer had no way to actually rewrite a question from the screen.
 * This is that missing form.
 *
 * It uses the input styling already used by AdminAcademicPage / AdminResourcesPage
 * (rounded-xl, bg-surface-secondary, ring-line, focus:ring-accent) and the
 * existing Button/Pill/Card primitives. No new visual language.
 *
 * Client-side validation exists to give fast, friendly feedback — but it is NOT
 * the security boundary. PostgreSQL re-checks every rule (min 2 options, at
 * least one correct, not all correct, distinct labels) and is the final
 * authority. The form never tries to bypass it.
 */
import { useMemo, useState } from 'react'
import { AlertTriangle, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Pill } from '@/components/ui/Pill'
import { cn } from '@/lib/cn'
import type { ReviewQuestion, EditPayload } from '@/services/reviewService'

const INPUT =
  'w-full rounded-xl bg-surface-secondary px-3.5 py-2.5 text-body text-ink ring-1 ring-line placeholder:text-ink-tertiary focus:ring-2 focus:ring-accent'

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const

interface DraftOption {
  label: string
  is_correct: boolean
}

export function ReviewEditForm({
  question,
  saving,
  onCancel,
  onSave,
}: {
  question: ReviewQuestion
  saving: boolean
  onCancel: () => void
  onSave: (patch: EditPayload) => void
}) {
  const [stem, setStem] = useState(question.stem)
  const [explanation, setExplanation] = useState(question.explanation ?? '')
  const [difficulty, setDifficulty] = useState(question.difficulty)
  const [topic, setTopic] = useState(question.topic ?? '')
  const [options, setOptions] = useState<DraftOption[]>(
    question.options.map((o) => ({ label: o.label, is_correct: o.is_correct })),
  )

  // A multi-answer question may have several correct options; the others have
  // exactly one. Radio vs checkbox follows the question's own type.
  const isMulti = question.question_type === 'multi'

  const originalOptions = useMemo(
    () => question.options.map((o) => `${o.label}\u0000${o.is_correct}`).join('\u0001'),
    [question.options],
  )
  const currentOptions = options.map((o) => `${o.label}\u0000${o.is_correct}`).join('\u0001')

  /**
   * Does this edit count as ACADEMIC content? If so the database will demote
   * the question to pending and pull it out of live quizzes. We warn first so
   * the reviewer is never surprised.
   */
  const academicChange =
    stem.trim() !== question.stem.trim() || currentOptions !== originalOptions

  const errors = useMemo(() => {
    const e: string[] = []
    if (!stem.trim()) e.push('The question text cannot be empty.')
    if (options.length < 2) e.push('A question needs at least 2 options.')
    if (options.some((o) => !o.label.trim())) e.push('Every option needs text.')
    const labels = options.map((o) => o.label.trim().toLowerCase()).filter(Boolean)
    if (new Set(labels).size !== labels.length) e.push('Two options have the same text.')
    const correct = options.filter((o) => o.is_correct).length
    if (correct === 0) e.push('Mark at least one option as the correct answer.')
    if (correct === options.length && options.length > 0)
      e.push('Every option is marked correct — that cannot be answered.')
    return e
  }, [stem, options])

  function setCorrect(index: number, value: boolean) {
    setOptions((prev) =>
      prev.map((o, i) =>
        isMulti
          ? i === index
            ? { ...o, is_correct: value }
            : o
          : // single-answer: selecting one clears the rest
            { ...o, is_correct: i === index },
      ),
    )
  }

  function submit() {
    if (errors.length) return
    // Send options only when they actually changed, so a metadata-only tweak
    // stays metadata-only and does not needlessly demote a published question.
    onSave({
      stem: stem.trim() !== question.stem.trim() ? stem.trim() : null,
      explanation: explanation.trim() !== (question.explanation ?? '').trim() ? explanation.trim() : null,
      difficulty: difficulty !== question.difficulty ? difficulty : null,
      topic: topic.trim() !== (question.topic ?? '').trim() ? topic.trim() : null,
      options:
        currentOptions !== originalOptions
          ? options.map((o) => ({ label: o.label.trim(), is_correct: o.is_correct }))
          : null,
      note: 'edited in review desk',
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-surface-secondary/40 p-3 ring-1 ring-line">
      <div className="flex items-center justify-between">
        <p className="text-body font-semibold text-ink">Edit question</p>
        <button
          onClick={onCancel}
          aria-label="Cancel editing"
          className="flex size-8 items-center justify-center rounded-lg text-ink-secondary hover:bg-chip"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-caption font-semibold text-ink-secondary">Question</span>
        <textarea
          value={stem}
          onChange={(e) => setStem(e.target.value)}
          rows={3}
          className={INPUT}
          placeholder="The question as students will read it…"
        />
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-caption font-semibold text-ink-secondary">
          Options {isMulti ? '(tick every correct answer)' : '(tick the correct answer)'}
        </span>
        {options.map((o, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type={isMulti ? 'checkbox' : 'radio'}
              name="correct-option"
              checked={o.is_correct}
              onChange={(e) => setCorrect(i, e.target.checked)}
              aria-label={`Mark option ${String.fromCharCode(65 + i)} correct`}
              className="size-4 shrink-0 accent-[var(--color-accent)]"
            />
            <input
              value={o.label}
              onChange={(e) =>
                setOptions((prev) =>
                  prev.map((p, j) => (j === i ? { ...p, label: e.target.value } : p)),
                )
              }
              className={cn(INPUT, o.is_correct && 'ring-2 ring-[var(--success)]')}
              placeholder={`Option ${String.fromCharCode(65 + i)}`}
            />
            <button
              onClick={() => setOptions((prev) => prev.filter((_, j) => j !== i))}
              disabled={options.length <= 2}
              aria-label={`Remove option ${String.fromCharCode(65 + i)}`}
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-tertiary hover:bg-chip disabled:opacity-30"
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          </div>
        ))}
        <button
          onClick={() => setOptions((prev) => [...prev, { label: '', is_correct: false }])}
          className="flex items-center gap-1.5 self-start rounded-pill bg-chip px-3 py-1.5 text-caption font-semibold text-ink-secondary ring-1 ring-[var(--glass-border)] hover:text-ink"
        >
          <Plus className="size-3.5" aria-hidden />
          Add option
        </button>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-caption font-semibold text-ink-secondary">Explanation</span>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={2}
          className={INPUT}
          placeholder="Why the correct answer is correct…"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-caption font-semibold text-ink-secondary">Difficulty</span>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className={INPUT}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-caption font-semibold text-ink-secondary">Topic</span>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className={INPUT}
            placeholder="Topic / unit name"
          />
        </label>
      </div>

      {errors.length > 0 ? (
        <ul className="flex flex-col gap-1 rounded-xl bg-danger-soft px-3 py-2">
          {errors.map((e) => (
            <li key={e} className="text-caption text-danger">
              {e}
            </li>
          ))}
        </ul>
      ) : null}

      {academicChange && (question.published || question.human_verified) ? (
        <p className="flex items-start gap-2 rounded-xl bg-warning-soft px-3 py-2 text-caption text-warning">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          You changed the wording or the options. Saving will take this question out of live
          quizzes and send it back for review.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={submit} disabled={errors.length > 0 || saving} loading={saving}>
          Save changes
        </Button>
        <Button size="sm" variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        {academicChange ? <Pill tone="warning">Will need re-review</Pill> : null}
      </div>
    </div>
  )
}
