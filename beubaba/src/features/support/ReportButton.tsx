import { useState } from 'react'
import { Flag } from 'lucide-react'
import { ReportModal } from './ReportModal'
import type { ReportTargetType } from '@/types/domain'
import { cn } from '@/lib/cn'

/**
 * Compact "Report" trigger to embed on any content (PYQ, subject, quiz question,
 * resource, notice…). Opens the shared report sheet. Two visual styles:
 *  - 'icon'  → a small icon button (for dense rows/toolbars);
 *  - 'text'  → an inline text+icon button (for detail pages).
 */
export function ReportButton({
  targetType,
  targetId,
  targetLabel,
  variant = 'text',
  className,
}: {
  targetType: ReportTargetType
  targetId: string | null
  targetLabel: string
  variant?: 'icon' | 'text'
  className?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setOpen(true)
          }}
          aria-label={`Report ${targetLabel}`}
          className={cn(
            'flex size-9 items-center justify-center rounded-full text-ink-tertiary transition-colors hover:bg-danger-soft hover:text-danger',
            className,
          )}
        >
          <Flag className="size-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setOpen(true)
          }}
          className={cn(
            'inline-flex items-center gap-1.5 text-body-sm font-semibold text-ink-tertiary transition-colors hover:text-danger',
            className,
          )}
        >
          <Flag className="size-4" aria-hidden />
          Report
        </button>
      )}
      <ReportModal
        open={open}
        onClose={() => setOpen(false)}
        targetType={targetType}
        targetId={targetId}
        targetLabel={targetLabel}
      />
    </>
  )
}
