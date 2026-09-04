import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Compact progress indicator for the multi-step registration. */
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="mb-6 flex items-center gap-2" aria-label="Registration progress">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full text-caption font-bold transition-colors',
                done && 'bg-accent text-white',
                active && 'bg-accent-soft text-accent-ink ring-2 ring-accent',
                !done && !active && 'bg-surface-secondary text-ink-tertiary',
              )}
              aria-current={active ? 'step' : undefined}
            >
              {done ? <Check className="size-4" aria-hidden /> : i + 1}
            </span>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  'h-0.5 flex-1 rounded-full transition-colors',
                  done ? 'bg-accent' : 'bg-line',
                )}
                aria-hidden
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
