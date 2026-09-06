import { LogoMark } from '@/components/brand/Logo'
import { Lottie } from '@/components/feedback/Lottie'

/**
 * Calm branded loading state for auth bootstrap / route suspense.
 *
 * The logo paints immediately from the bundle; the animation streams in behind
 * it. That ordering matters — if the Lottie were the only thing here, a slow
 * connection would show an empty screen while the player downloaded.
 */
export function FullScreenLoader() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-2">
      <div className="bb-environment" />
      <LogoMark className="size-12 animate-fade-in" />
      <Lottie name="loading" className="w-full max-w-[240px]" ariaLabel="Loading" />
      <div className="flex items-center gap-2 text-body-sm text-ink-tertiary">
        <span className="size-2 animate-pulse rounded-full bg-accent" />
        Loading
      </div>
    </div>
  )
}
