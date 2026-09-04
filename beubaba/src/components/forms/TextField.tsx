import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/cn'

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string
  hint?: string
  error?: string
  iconLeft?: ReactNode
  /** For password fields: render a visibility toggle. */
  reveal?: boolean
}

/**
 * Labelled input with proper a11y wiring, error + hint text.
 * Never relies on placeholder as the only label (spec §113).
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, hint, error, iconLeft, reveal = false, type = 'text', className, id, ...rest }, ref) => {
    const autoId = useId()
    const fieldId = id ?? autoId
    const hintId = `${fieldId}-hint`
    const errorId = `${fieldId}-error`
    const [show, setShow] = useState(false)
    const effectiveType = reveal ? (show ? 'text' : 'password') : type

    return (
      <div className="w-full">
        <label htmlFor={fieldId} className="mb-2 block text-caption font-semibold uppercase tracking-wide text-ink-tertiary">
          {label}
        </label>
        <div
          className={cn(
            'flex items-center gap-2.5 rounded-xl border bg-surface-secondary/60 px-3.5 transition-all duration-200',
            'h-12 focus-within:bg-surface focus-within:shadow-[0_0_0_4px_var(--color-accent-soft)]',
            error
              ? 'border-danger/60 focus-within:border-danger'
              : 'border-line/70 focus-within:border-accent/50',
          )}
        >
          {iconLeft && <span className="text-ink-tertiary shrink-0">{iconLeft}</span>}
          <input
            ref={ref}
            id={fieldId}
            type={effectiveType}
            className={cn(
              'peer w-full bg-transparent text-body text-ink outline-none',
              'placeholder:text-ink-tertiary',
              className,
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={cn(error ? errorId : undefined, hint ? hintId : undefined) || undefined}
            {...rest}
          />
          {reveal && (
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="shrink-0 rounded-md p-1 text-ink-tertiary hover:text-ink-secondary"
              aria-label={show ? 'Hide password' : 'Show password'}
              aria-pressed={show}
            >
              {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          )}
        </div>
        {error ? (
          <p id={errorId} className="mt-1.5 text-body-sm text-danger" role="alert">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="mt-1.5 text-body-sm text-ink-tertiary">
            {hint}
          </p>
        ) : null}
      </div>
    )
  },
)
TextField.displayName = 'TextField'
