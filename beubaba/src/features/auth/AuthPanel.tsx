import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { LogoMark } from '@/components/brand/Logo'

/**
 * Premium clay-neumorphism auth composition — two panes on large screens,
 * one focused card on phones.
 *
 * Left (desktop only): brand stage — purple gradient hero panel with the new
 * app icon, headline, feature bullets and the clay mascot.
 * Right: soft raised clay form card with the clay boy & girl DPs on top.
 */
export function AuthPanel({
  children,
  title,
  subtitle,
  highlights,
}: {
  children: ReactNode
  title: string
  subtitle?: string
  /** Optional selling points shown on the desktop brand stage. */
  highlights?: string[]
}) {
  const reduced = useReducedMotion()
  const points =
    highlights ??
    [
      'Previous-year papers, syllabus & academic calendar',
      'Exam-realistic quizzes with instant scoring',
      'Results, portals, government exams & colleges',
    ]

  return (
    <div className="flex min-h-dvh w-full items-center justify-center px-5 py-8">
      <div className="grid w-full max-w-5xl items-stretch gap-6 lg:grid-cols-2">
        {/* Brand stage — desktop only */}
        <motion.aside
          className="relative hidden overflow-hidden rounded-[28px] lg:flex"
          initial={reduced ? false : { opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="bb-hero relative flex w-full flex-col justify-center gap-10 p-8">
            <div>
              <div className="flex items-center gap-2.5">
                <LogoMark className="size-11" />
                <span className="font-display text-h2 text-white">BEU BABA</span>
              </div>
              <h2 className="font-heading mt-8 max-w-xs text-h1 leading-tight text-white">
                Your complete academic companion.
              </h2>
              <ul className="mt-6 flex flex-col gap-3">
                {points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-body-sm text-white/85">
                    <span className="mt-1.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-white/25">
                      <span className="size-1.5 rounded-full bg-white" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </motion.aside>

        {/* Form pane */}
        <motion.div
          className="flex w-full items-center justify-center"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
          }}
        >
          <div className="w-full max-w-md">
            {/* Compact brand — phones only */}
            <motion.div className="mb-6 flex flex-col items-center text-center lg:hidden" variants={fadeUp}>
              <div className="flex items-center gap-2.5">
                <LogoMark className="size-12" />
                <span className="font-display text-h1 text-ink">BEU BABA</span>
              </div>
              <p className="mt-2 text-body-sm text-ink-secondary">Your complete academic companion</p>
            </motion.div>

            <motion.div variants={fadeUp}>
              <div className="rounded-[28px] bg-surface p-6 shadow-neu-lg ring-1 ring-line sm:p-8">
                <div className="mb-4 flex justify-center gap-3">
                  <img
                    src="/assets/avatars/boy_clay.webp"
                    alt=""
                    className="size-14 rounded-[26%] shadow-neu-sm ring-1 ring-line"
                  />
                  <img
                    src="/assets/avatars/girl_clay.webp"
                    alt=""
                    className="size-14 rounded-[26%] shadow-neu-sm ring-1 ring-line"
                  />
                </div>
                <header className="mb-6 text-center">
                  <h1 className="font-heading text-h2 text-ink">{title}</h1>
                  {subtitle && <p className="mt-1.5 text-body text-ink-secondary">{subtitle}</p>}
                </header>
                {children}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
}
