import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Info } from 'lucide-react'
import { Card } from '@/components/ui/Card'

/** Shared frame for a single toolbox tool: back nav, title, and body. */
export function ToolShell({
  title,
  subtitle,
  note,
  children,
}: {
  title: string
  subtitle?: string
  note?: string
  children: ReactNode
}) {
  const navigate = useNavigate()
  return (
    <div className="page-x pb-10 pt-6">
      <button
        onClick={() => navigate('/tools/toolbox')}
        className="mb-3 flex items-center gap-1 text-body-sm font-semibold text-ink-secondary"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Toolbox
      </button>
      <h1 className="text-h1 text-ink">{title}</h1>
      {subtitle && <p className="mt-1 text-body-sm text-ink-secondary">{subtitle}</p>}

      <div className="mt-4">{children}</div>

      {note && (
        <Card className="mt-4 flex items-start gap-3">
          <Info className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
          <p className="text-body-sm text-ink-secondary">{note}</p>
        </Card>
      )}
    </div>
  )
}

/** Labelled number/text input styled like the app's soft glass fields. */
export function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  suffix,
  inputMode,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  suffix?: string
  inputMode?: 'numeric' | 'decimal' | 'text'
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-caption font-semibold uppercase tracking-wide text-ink-tertiary">
        {label}
      </span>
      <span className="flex h-12 items-center gap-2.5 rounded-xl border border-line/70 bg-surface-secondary/60 px-3.5 transition-all duration-200 focus-within:border-accent/50 focus-within:bg-surface focus-within:shadow-[0_0_0_4px_var(--color-accent-soft)]">
        <input
          type={type}
          inputMode={inputMode}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-body text-ink outline-none placeholder:text-ink-tertiary"
        />
        {suffix && <span className="shrink-0 text-body-sm text-ink-tertiary">{suffix}</span>}
      </span>
    </label>
  )
}

/** Big result display card. */
export function Result({
  label,
  value,
  hint,
  tone = 'accent',
}: {
  label: string
  value: string
  hint?: string
  tone?: 'accent' | 'success' | 'danger' | 'gold'
}) {
  const color =
    tone === 'success'
      ? 'text-success'
      : tone === 'danger'
        ? 'text-danger'
        : tone === 'gold'
          ? 'text-gold-ink'
          : 'text-accent'
  return (
    <Card as="strong" className="glass-sheen mt-4 text-center">
      <p className="text-caption font-semibold uppercase tracking-wide text-ink-tertiary">{label}</p>
      <p className={`mt-1 text-[2.5rem] font-bold leading-tight ${color}`}>{value}</p>
      {hint && <p className="mt-1 text-body-sm text-ink-secondary">{hint}</p>}
    </Card>
  )
}
