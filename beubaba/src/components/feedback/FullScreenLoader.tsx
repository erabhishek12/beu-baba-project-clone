import { LogoMark } from '@/components/brand/Logo'

/** Calm branded loading state for auth bootstrap / route suspense. */
export function FullScreenLoader() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <div className="bb-environment" />
      <LogoMark className="size-14 animate-fade-in" />
      <div className="flex items-center gap-2 text-body-sm text-ink-tertiary">
        <span className="size-2 animate-pulse rounded-full bg-accent" />
        Loading
      </div>
    </div>
  )
}
