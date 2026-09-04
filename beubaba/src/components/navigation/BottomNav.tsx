import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, useMotionValueEvent, useSpring, useTransform } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { NAV_ITEMS, isNavActive } from '@/components/navigation/navItems'

// ---- Geometry (px) ----
const BAR_H = 62 // bar height
const LIFT = 26 // how far the active bubble rises above the bar top edge
const WRAP_H = BAR_H + LIFT
const BUBBLE_R = 24
const DIP = 22 // depth of the cradle
const SPREAD = 42 // half-width of the cradle mouth
const FLARE = 20 // how far the flat edge flares before dipping
const CORNER = 26

/** Rounded bar path with a smooth cradle dip centered at cx (light-glass wave). */
function buildBarPath(w: number, cx: number): string {
  const top = LIFT
  const bottom = LIFT + BAR_H
  const l = cx - SPREAD
  const r = cx + SPREAD
  return [
    `M0,${top + CORNER}`,
    `Q0,${top} ${CORNER},${top}`,
    `L${l - FLARE},${top}`,
    `C${l + 4},${top} ${l + 2},${top + DIP} ${cx},${top + DIP}`,
    `C${r - 2},${top + DIP} ${r - 4},${top} ${r + FLARE},${top}`,
    `L${w - CORNER},${top}`,
    `Q${w},${top} ${w},${top + CORNER}`,
    `L${w},${bottom - CORNER}`,
    `Q${w},${bottom} ${w - CORNER},${bottom}`,
    `L${CORNER},${bottom}`,
    `Q0,${bottom} 0,${bottom - CORNER}`,
    'Z',
  ].join(' ')
}

/**
 * Signature notched "wave" bottom navigation (reference-matched shape and
 * motion), rendered in theme-aware frosted glass:
 *  - the active item lifts into a floating accent bubble;
 *  - the bar dips in a smooth cradle beneath it;
 *  - bubble + cradle glide between destinations with one shared spring.
 * Mobile / tablet-portrait only — on md+ the header carries primary nav.
 */
export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const reduced = useReducedMotion()

  const wrapRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<SVGPathElement>(null)
  const strokeRef = useRef<SVGPathElement>(null)
  const frostRef = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(0)

  const activeIndex = Math.max(
    0,
    NAV_ITEMS.findIndex((it) => isNavActive(pathname, it.to)),
  )

  // Measure width responsively.
  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setW(Math.round(entry.contentRect.width)))
    ro.observe(el)
    setW(Math.round(el.getBoundingClientRect().width))
    return () => ro.disconnect()
  }, [])

  const centerFor = (i: number) => (w > 0 ? ((i + 0.5) * w) / NAV_ITEMS.length : 0)

  // Shared spring drives the cradle + bubble.
  const cx = useSpring(centerFor(activeIndex), { stiffness: 420, damping: 34, mass: 0.9 })
  const bubbleX = useTransform(cx, (v) => v - BUBBLE_R)

  useEffect(() => {
    const target = centerFor(activeIndex)
    if (reduced || w === 0) cx.jump(target)
    else cx.set(target)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, w, reduced])

  // Paint the wavy path + clip directly to the DOM each frame (no React churn).
  const paint = (value: number) => {
    if (w === 0) return
    const d = buildBarPath(w, value)
    fillRef.current?.setAttribute('d', d)
    strokeRef.current?.setAttribute('d', d)
    if (frostRef.current) {
      frostRef.current.style.clipPath = `path('${d}')`
      ;(frostRef.current.style as unknown as { webkitClipPath: string }).webkitClipPath =
        `path('${d}')`
    }
  }
  useMotionValueEvent(cx, 'change', paint)
  useLayoutEffect(() => {
    paint(cx.get())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w])

  const ActiveIcon = NAV_ITEMS[activeIndex].icon

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-nav flex justify-center px-4 pb-[max(env(safe-area-inset-bottom),10px)] md:hidden"
      aria-label="Primary"
    >
      <div ref={wrapRef} className="relative w-full max-w-md" style={{ height: WRAP_H }}>
        {w > 0 && (
          <>
            {/* Base fill (carries the soft shadow that follows the wave) */}
            <svg
              width={w}
              height={WRAP_H}
              className="absolute inset-0"
              style={{ filter: 'var(--nav-drop)' }}
              aria-hidden
            >
              <path ref={fillRef} fill="var(--nav-fill)" />
            </svg>

            {/* Frosted glass, clipped to the same wave shape */}
            <div
              ref={frostRef}
              className="absolute inset-0"
              style={{
                backdropFilter: 'blur(22px) saturate(1.7)',
                WebkitBackdropFilter: 'blur(22px) saturate(1.7)',
              }}
              aria-hidden
            />

            {/* Hairline edge + top highlight */}
            <svg width={w} height={WRAP_H} className="absolute inset-0" aria-hidden>
              <path ref={strokeRef} fill="none" stroke="var(--nav-stroke)" strokeWidth={1.25} />
            </svg>

            {/* Floating active bubble */}
            <motion.div
              className="pointer-events-none absolute left-0 top-0 flex items-center justify-center rounded-full bg-accent shadow-[0_8px_20px_rgba(47,107,255,0.4)] ring-4 ring-canvas"
              style={{ width: BUBBLE_R * 2, height: BUBBLE_R * 2, x: bubbleX, y: LIFT - BUBBLE_R }}
              aria-hidden
            >
              <motion.span
                key={activeIndex}
                initial={reduced ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              >
                <ActiveIcon className="size-6 text-white" strokeWidth={2.4} />
              </motion.span>
            </motion.div>

            {/* Tap targets + inactive icons */}
            <div className="absolute left-0" style={{ top: LIFT, height: BAR_H, width: w }}>
              <ul className="flex h-full">
                {NAV_ITEMS.map((item, i) => {
                  const active = i === activeIndex
                  const Icon = item.icon
                  return (
                    <li key={item.to} className="flex flex-1">
                      <button
                        onClick={() => navigate(item.to)}
                        className="group relative flex h-full w-full items-center justify-center"
                        aria-label={item.label}
                        aria-current={active ? 'page' : undefined}
                      >
                        <motion.span
                          animate={{ opacity: active ? 0 : 1, y: active ? -6 : 0 }}
                          transition={{ duration: 0.18 }}
                          className="flex flex-col items-center gap-0.5"
                        >
                          <Icon
                            className="size-[22px] text-ink-tertiary group-hover:text-ink-secondary"
                            strokeWidth={2}
                          />
                          <span className="text-[10px] font-semibold leading-none text-ink-tertiary">
                            {item.label}
                          </span>
                        </motion.span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </>
        )}
      </div>
    </nav>
  )
}
