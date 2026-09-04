import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { modalVariants, overlayVariants } from '@/lib/motion'
import { cn } from '@/lib/cn'

/**
 * Centered glass modal (spec §61): background dims, panel fades + scales
 * 0.98→1. Never zoom from 0.5, never rotate. Escape + backdrop close.
 *
 * IMPORTANT: rendered through a portal on <body> so it always escapes any
 * nested stacking context created by page cards (transform / backdrop-filter /
 * will-change). Without the portal the fixed header + bottom nav painted ON TOP
 * of the dialog, which looked like the modal was "broken / overlapping".
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-ink/45 backdrop-blur-md"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              'glass-modal glass-highlight relative z-10 max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-2xl p-5 shadow-glass-lg',
              className,
            )}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {title && (
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-h3 text-ink">{title}</h2>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="rounded-full p-1.5 text-ink-tertiary hover:bg-surface-secondary hover:text-ink"
                >
                  <X className="size-5" />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
