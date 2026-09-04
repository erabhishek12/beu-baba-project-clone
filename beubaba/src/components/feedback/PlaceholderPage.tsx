import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Neutral "coming in a later phase" screen for not-yet-built destinations. */
export function PlaceholderPage({
  title,
  icon: Icon,
  description,
  className,
}: {
  title: string
  icon: LucideIcon
  description?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'page-x flex min-h-[70dvh] flex-col items-center justify-center text-center',
        className,
      )}
    >
      <div className="glass-elevated glass-highlight mb-4 flex size-16 items-center justify-center rounded-2xl">
        <Icon className="size-8 text-accent" aria-hidden />
      </div>
      <h1 className="text-h2 text-ink">{title}</h1>
      <p className="mt-2 max-w-sm text-body text-ink-secondary">
        {description ?? 'This section will be available in an upcoming phase.'}
      </p>
    </div>
  )
}
