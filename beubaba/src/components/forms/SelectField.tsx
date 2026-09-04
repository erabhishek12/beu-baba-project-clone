import { forwardRef, useId, type SelectHTMLAttributes, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

interface Option {
  value: string
  label: string
}

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: string
  options: Option[]
  placeholder?: string
  hint?: string
  error?: string
  iconLeft?: ReactNode
}

/** Accessible native select styled to the design system. */
export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, options, placeholder, hint, error, iconLeft, className, id, value, ...rest }, ref) => {
    const autoId = useId()
    const fieldId = id ?? autoId
    const errorId = `${fieldId}-error`
    const hintId = `${fieldId}-hint`

    return (
      <div className="w-full">
        <label htmlFor={fieldId} className="mb-2 block text-caption font-semibold uppercase tracking-wide text-ink-tertiary">
          {label}
        </label>
        <div
          className={cn(
            'relative flex items-center gap-2.5 rounded-xl border bg-surface-secondary/60 px-3.5 transition-all duration-200',
            'h-12 focus-within:bg-surface focus-within:border-accent/50',
            error
              ? 'border-danger/60 focus-within:border-danger'
              : 'border-line/70',
          )}
        >
          {iconLeft && <span className="text-ink-tertiary shrink-0">{iconLeft}</span>}
          <select
            ref={ref}
            id={fieldId}
            value={value}
            className={cn(
              // Stretch the native control across the WHOLE box so a tap
              // anywhere (icon, padding, chevron) opens the picker.
              'absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent pl-10 pr-9 text-body outline-none',
              value ? 'text-ink' : 'text-ink-tertiary',
              !iconLeft && 'pl-3.5',
              className,
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={cn(error ? errorId : undefined, hint ? hintId : undefined) || undefined}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none ml-auto size-5 shrink-0 text-ink-tertiary" />
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
SelectField.displayName = 'SelectField'
