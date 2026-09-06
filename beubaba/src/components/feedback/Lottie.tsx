/**
 * Lottie animation player.
 *
 * Both the player (~250 KB) and each animation JSON are loaded ON DEMAND, so a
 * student who never sees an error page never downloads the 404 cat. The JSONs
 * live in /public rather than being imported, which keeps them out of the JS
 * bundle entirely.
 *
 * Honours "reduce motion": if the user has asked for less animation we show a
 * single still frame instead of looping, rather than ignoring the preference.
 */
import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'

export type LottieName = 'verify-email' | 'not-found' | 'loading'

export function Lottie({
  name,
  className,
  loop = true,
  ariaLabel,
}: {
  name: LottieName
  className?: string
  loop?: boolean
  /** Describe the animation for screen readers, or omit if purely decorative. */
  ariaLabel?: string
}) {
  const host = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    let anim: { destroy: () => void; goToAndStop: (f: number, isFrame: boolean) => void } | null =
      null
    let cancelled = false

    void (async () => {
      try {
        const [{ default: lottie }, data] = await Promise.all([
          import('lottie-web/build/player/lottie_light'),
          fetch(`/assets/lottie/${name}.json`).then((r) => r.json()),
        ])
        if (cancelled || !host.current) return
        anim = lottie.loadAnimation({
          container: host.current,
          renderer: 'svg',
          loop: reduced ? false : loop,
          autoplay: !reduced,
          animationData: data,
        })
        // Reduced motion: show a representative still frame, not a blank box.
        if (reduced) anim.goToAndStop(20, true)
      } catch {
        /* A missing animation must never break the screen it decorates. */
      }
    })()

    return () => {
      cancelled = true
      anim?.destroy()
    }
  }, [name, loop, reduced])

  return (
    <div
      ref={host}
      className={cn('pointer-events-none select-none', className)}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    />
  )
}
