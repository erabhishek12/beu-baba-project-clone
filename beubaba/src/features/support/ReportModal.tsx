import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Modal } from '@/components/glass/Modal'
import { Button } from '@/components/ui/Button'
import { AttachmentPicker } from '@/components/forms/AttachmentPicker'
import { useToast } from '@/components/feedback/Toast'
import { useUserId } from '@/features/quiz/hooks'
import { reportService, REPORT_REASONS } from '@/services/reportService'
import type { ReportReason, ReportTargetType } from '@/types/domain'
import type { Attachment } from '@/lib/media'
import { cn } from '@/lib/cn'

/**
 * Reusable report sheet (spec §21, §57). Drop it anywhere with a target and it
 * files an owner-scoped report with an optional screenshot. Bug reports capture
 * the current page path automatically.
 */
export function ReportModal({
  open,
  onClose,
  targetType,
  targetId,
  targetLabel,
}: {
  open: boolean
  onClose: () => void
  targetType: ReportTargetType
  targetId: string | null
  targetLabel: string
}) {
  const userId = useUserId()
  const toast = useToast()
  const { pathname } = useLocation()
  const [reason, setReason] = useState<ReportReason>(
    targetType === 'app' ? 'bug' : 'incorrect_information',
  )
  const [details, setDetails] = useState('')
  const [attachment, setAttachment] = useState<Attachment | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (details.trim().length < 5) {
      setError('Please add a short description (at least 5 characters).')
      return
    }
    setError(null)
    setSaving(true)
    try {
      await reportService.create(userId, {
        target_type: targetType,
        target_id: targetId,
        target_label: targetLabel,
        reason,
        details,
        context_path: pathname,
        attachment,
      })
      toast.success('Report submitted', 'Thanks for helping us improve BEU BABA.')
      setDetails('')
      setAttachment(null)
      onClose()
    } catch {
      toast.error('Could not submit', 'Please try again in a moment.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Report a problem">
      <p className="-mt-2 mb-4 text-body-sm text-ink-secondary">
        Reporting: <span className="font-semibold text-ink">{targetLabel}</span>
      </p>

      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-2 block text-caption font-semibold uppercase tracking-wide text-ink-tertiary">
            Reason
          </label>
          <div className="flex flex-wrap gap-2">
            {REPORT_REASONS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setReason(r.value)}
                className={cn(
                  'rounded-pill border px-3 py-1.5 text-caption font-semibold transition-colors',
                  reason === r.value
                    ? 'border-transparent bg-accent text-white'
                    : 'border-line bg-surface-secondary text-ink-secondary hover:text-ink',
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="report-details"
            className="mb-2 block text-caption font-semibold uppercase tracking-wide text-ink-tertiary"
          >
            Description
          </label>
          <textarea
            id="report-details"
            rows={4}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="What's wrong? Add any detail that helps us fix it."
            className="w-full resize-none rounded-xl border border-line bg-surface px-3.5 py-2.5 text-body text-ink outline-none placeholder:text-ink-tertiary focus:border-accent"
          />
          {error && (
            <p className="mt-1.5 text-caption text-danger" role="alert">
              {error}
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
            Submit report
          </Button>
        </div>
      </div>
    </Modal>
  )
}
