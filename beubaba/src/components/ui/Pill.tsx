import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

const TONE: Record<Tone, string> = {
  neutral: 'bg-surface-secondary text-ink-secondary border-line',
  accent: 'bg-accent-soft text-accent-ink border-transparent',
  success: 'bg-success-soft text-success border-transparent',
  warning: 'bg-warning-soft text-warning border-transparent',
  danger: 'bg-danger-soft text-danger border-transparent',
}

/** Compact status/tag label. Reserved for filters, tags, status (spec §21). */
export function Pill({ tone = 'neutral', className, children, ...rest }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill border px-2.5 py-1 text-caption font-semibold',
        TONE[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  )
}
