import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@/components/glass/Modal'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/forms/TextField'
import { SelectField } from '@/components/forms/SelectField'
import { AttachmentPicker } from '@/components/forms/AttachmentPicker'
import { useToast } from '@/components/feedback/Toast'
import { useUserId } from '@/features/quiz/hooks'
import { supportService, SUPPORT_CATEGORIES } from '@/services/supportService'
import type { SupportCategory } from '@/types/domain'
import type { Attachment } from '@/lib/media'

export function NewSupportModal({
  open,
  onClose,
  prefill,
}: {
  open: boolean
  onClose: () => void
  /** Question carried over from the assistant when it could not answer (§28). */
  prefill?: string
}) {
  const userId = useUserId()
  const navigate = useNavigate()
  const toast = useToast()
  const [category, setCategory] = useState<SupportCategory>('bug')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  // Carry the assistant's unanswered question into the message so the
  // developer receives the actual context, not an empty ticket.
  useEffect(() => {
    if (open && prefill) {
      setBody((b) => b || prefill)
      setSubject((s) => s || prefill.slice(0, 60))
    }
  }, [open, prefill])
  const [attachment, setAttachment] = useState<Attachment | null>(null)
  const [errors, setErrors] = useState<{ subject?: string; body?: string }>({})
  const [saving, setSaving] = useState(false)

  async function submit() {
    const next: typeof errors = {}
    if (subject.trim().length < 3) next.subject = 'Add a short subject.'
    if (body.trim().length < 10) next.body = 'Describe your issue in a little more detail.'
    setErrors(next)
    if (Object.keys(next).length) return

    setSaving(true)
    try {
      const thread = await supportService.start(userId, { subject, category, body, attachment })
      toast.success('Message sent', 'The developer team will reply here.')
      setSubject('')
      setBody('')
      setAttachment(null)
      onClose()
      navigate(`/support/${thread.id}`)
    } catch {
      toast.error('Could not send', 'Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New developer message">
      <div className="flex flex-col gap-4">
        <SelectField
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value as SupportCategory)}
          options={SUPPORT_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
        />
        <TextField
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Briefly, what is this about?"
          error={errors.subject}
        />
        <div>
          <label
            htmlFor="support-body"
            className="mb-2 block text-caption font-semibold uppercase tracking-wide text-ink-tertiary"
          >
            Message
          </label>
          <textarea
            id="support-body"
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Describe your issue, request or feedback."
            className="w-full resize-none rounded-xl border border-line bg-surface px-3.5 py-2.5 text-body text-ink outline-none placeholder:text-ink-tertiary focus:border-accent"
          />
          {errors.body && (
            <p className="mt-1.5 text-caption text-danger" role="alert">
              {errors.body}
            </p>
          )}
        </div>
        <AttachmentPicker
          value={attachment}
          onChange={setAttachment}
          label="Attach a screenshot (optional)"
          hint="JPG, PNG, WebP or PDF up to 8 MB."
        />
        <div className="flex gap-3 pt-1">
          <Button variant="secondary" fullWidth onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button fullWidth onClick={submit} loading={saving}>
            Send message
          </Button>
        </div>
      </div>
    </Modal>
  )
}
