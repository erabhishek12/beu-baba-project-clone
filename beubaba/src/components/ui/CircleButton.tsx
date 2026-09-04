import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'

/**
 * Circular soft button from the reference design language — used for back,
 * search, bell and play actions. Two tones:
 *   surface → soft white raised circle (default)
 *   accent  → solid accent circle with white glyph
 */
export function CircleButton({
  children,
  label,
  onClick,
  to,
  tone = 'surface',
  className = '',
}: {
  children: ReactNode
  label: string
  onClick?: () => void
  to?: string
  tone?: 'surface' | 'accent'
  className?: string
}) {
  const navigate = useNavigate()
  const base =
    'flex size-11 shrink-0 items-center justify-center rounded-full transition-shadow active:scale-[0.97] motion-reduce:active:scale-100'
  const skin =
    tone === 'accent'
      ? 'bg-accent text-white shadow-[0_10px_22px_rgba(91,110,240,0.35)] hover:shadow-[0_12px_26px_rgba(91,110,240,0.45)]'
      : 'bg-surface text-ink-secondary shadow-neu-sm ring-1 ring-line hover:shadow-neu'
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        onClick?.()
        if (to) navigate(to)
      }}
      className={cn(base, skin, className)}
    >
      {children}
    </button>
  )
}
