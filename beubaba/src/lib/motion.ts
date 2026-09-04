/**
 * Centralized motion tokens for Framer Motion.
 * Restrained, purposeful, physically believable. No decorative loops.
 */
import type { Transition, Variants } from 'framer-motion'

export const DURATION = {
  fast: 0.12,
  base: 0.2,
  slow: 0.32,
} as const

export const EASE = {
  standard: [0.32, 0.72, 0, 1] as [number, number, number, number],
  emphasized: [0.22, 1, 0.36, 1] as [number, number, number, number],
}

export const spring: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 34,
  mass: 0.9,
}

export const softSpring: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 30,
}

/** Modal: opacity 0->1, scale 0.98->1 (per spec, never zoom from 0.5). */
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: DURATION.base, ease: EASE.emphasized } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: DURATION.fast, ease: EASE.standard } },
}

/** Bottom sheet: slide up with short spring. */
export const sheetVariants: Variants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: softSpring },
  exit: { y: '100%', transition: { duration: DURATION.base, ease: EASE.standard } },
}

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.base } },
  exit: { opacity: 0, transition: { duration: DURATION.fast } },
}

/** Subtle content entrance for step/page transitions. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE.emphasized } },
  exit: { opacity: 0, y: -8, transition: { duration: DURATION.fast, ease: EASE.standard } },
}

/** Staggered list appearance (e.g. search results) — subtle, capped. */
export const staggerParent: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03, delayChildren: 0.02 } },
}

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE.emphasized } },
}
