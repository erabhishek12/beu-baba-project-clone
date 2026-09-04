import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sun, Cloud, Sunset, Moon, Quote, Shuffle, X } from 'lucide-react'
import { LogoLockup } from '@/components/brand/Logo'
import { QUOTES, dayOfYear, greeting, timeOfDay } from './quotes'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const AUTO_SKIP_MS = 6000
const RING = 22 // progress ring radius
const CIRC = 2 * Math.PI * RING

const TOD_ICON = { morning: Sun, afternoon: Cloud, evening: Sunset, night: Moon }

/**
 * Daily welcome splash — interactive, vertically centered:
 *  - BEU BABA character sits centered above a glass card with a gentle float;
 *  - time-based greeting with the student's name;
 *  - the daily motivational quote (with a shuffle to browse more);
 *  - an auto-skip progress ring the user can tap to dismiss now, plus a
 *    "Don't show again today" option.
 */
export function SplashScreen({
  name,
  onClose,
  onSkipToday,
}: {
  name?: string
  onClose: () => void
  onSkipToday: () => void
}) {
  const reduced = useReducedMotion()
  const tod = timeOfDay()
  const TodIcon = TOD_ICON[tod]

  const [quoteIdx, setQuoteIdx] = useState(() => dayOfYear() % QUOTES.length)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0) // 0..1
  const closedRef = useRef(false)
  const startRef = useRef<number>(performance.now())
  const elapsedRef = useRef(0)

  const quote = QUOTES[quoteIdx]

  const close = () => {
    if (closedRef.current) return
    closedRef.current = true
    onClose()
  }

  const shuffle = () => {
    setQuoteIdx((i) => (i + 1 + Math.floor(Math.random() * (QUOTES.length - 1))) % QUOTES.length)
    setPaused(true) // browsing pauses auto-skip so it won't vanish mid-read
  }

  // Auto-skip progress driver (rAF). Respects pause; skips instantly if reduced.
  useEffect(() => {
    if (reduced) return
    let raf = 0
    const tick = (now: number) => {
      if (!paused) elapsedRef.current += now - startRef.current
      startRef.current = now
      const p = Math.min(1, elapsedRef.current / AUTO_SKIP_MS)
      setProgress(p)
      if (p >= 1) {
        close()
        return
      }
      raf = requestAnimationFrame(tick)
    }
    startRef.current = performance.now()
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, reduced])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const remaining = Math.max(1, Math.ceil((AUTO_SKIP_MS - progress * AUTO_SKIP_MS) / 1000))

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[90] flex flex-col items-center justify-center overflow-hidden px-5 py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        role="dialog"
        aria-modal="true"
        aria-label="Daily welcome"
      >
        {/* Full-screen faded academic backdrop (same language as auth) */}
        <div className="absolute inset-0 bb-environment" />
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage: 'url(/assets/university.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-canvas/70 via-canvas/50 to-canvas/85"
          aria-hidden
        />

        {/* Dismiss (top-right) */}
        <button
          onClick={close}
          aria-label="Close"
          className="glass-standard absolute right-4 top-[max(env(safe-area-inset-top),16px)] z-10 flex size-9 items-center justify-center rounded-full text-ink-secondary hover:text-ink"
        >
          <X className="size-5" />
        </button>

        {/* Centered stack: character + card */}
        <motion.div
          className="relative flex w-full max-w-sm flex-col items-center"
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Character — one refined settle-in entrance, then perfectly still.
              Soft radial pedestal glow + grounded shadow (no looping float). */}
          <div className="relative flex w-full justify-center">
            <div
              className="pointer-events-none absolute -bottom-1 left-1/2 h-6 w-36 -translate-x-1/2 rounded-[100%] bg-ink/20 blur-xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute bottom-6 left-1/2 h-40 w-56 -translate-x-1/2 rounded-full bg-gold/20 blur-3xl"
              aria-hidden
            />
            <motion.img
              src="/assets/char-hero.webp"
              alt=""
              className="relative z-10 h-56 w-auto object-contain drop-shadow-[0_24px_34px_rgba(20,27,43,0.30)] sm:h-64"
              initial={reduced ? false : { opacity: 0, y: 24, scale: 0.92 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              transition={
                reduced
                  ? undefined
                  : { type: 'spring', stiffness: 120, damping: 16, mass: 0.9, delay: 0.05 }
              }
            />
          </div>

          {/* Glass card */}
          <div className="glass-modal glass-highlight -mt-4 w-full rounded-[28px] p-6 text-center shadow-glass-lg">
            <LogoLockup markClass="size-7" wordClass="text-body-lg font-bold" />

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-pill bg-gold-soft px-3 py-1 text-label capitalize text-gold-ink">
              <TodIcon className="size-4" aria-hidden />
              {tod}
            </div>

            <h1 className="mt-2 text-h2 text-ink">{greeting(name)}</h1>
            <p className="mt-1 text-body-sm text-ink-secondary">Here’s your thought for the day</p>

            {/* Quote card (interactive) */}
            <div className="glass-standard glass-highlight mt-4 rounded-2xl p-4 text-left">
              <div className="mb-1 flex items-center justify-between">
                <Quote className="size-5 text-accent" aria-hidden />
                <button
                  onClick={shuffle}
                  aria-label="Show another quote"
                  className="flex items-center gap-1 rounded-pill px-2 py-1 text-caption font-semibold text-accent hover:bg-accent-soft"
                >
                  <Shuffle className="size-3.5" aria-hidden />
                  New
                </button>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={quoteIdx}
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="text-body font-medium leading-relaxed text-ink">{quote.text}</p>
                  <p className="mt-2 text-body-sm text-ink-tertiary">— {quote.author}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Continue with auto-skip progress ring */}
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={close}
                className="flex h-12 flex-1 items-center justify-center rounded-xl bg-accent px-4 text-body font-semibold text-white shadow-glass-sm transition-colors hover:bg-accent-strong"
              >
                Let’s study
              </button>
              {!reduced && (
                <button
                  onClick={close}
                  aria-label={`Continue, auto-skips in ${remaining} seconds`}
                  className="relative flex size-12 shrink-0 items-center justify-center rounded-full border border-line bg-surface"
                >
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 52 52" aria-hidden>
                    <circle
                      cx="26"
                      cy="26"
                      r={RING}
                      fill="none"
                      stroke="var(--color-border)"
                      strokeWidth="3"
                    />
                    <circle
                      cx="26"
                      cy="26"
                      r={RING}
                      fill="none"
                      stroke="var(--color-accent)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={CIRC}
                      strokeDashoffset={CIRC * (1 - progress)}
                    />
                  </svg>
                  <span className="tnum text-body-sm font-bold text-ink">{remaining}</span>
                </button>
              )}
            </div>

            <button
              onClick={() => {
                onSkipToday()
                close()
              }}
              className="mt-4 text-body-sm font-semibold text-ink-secondary underline-offset-2 hover:text-ink hover:underline"
            >
              Don’t show again today
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
