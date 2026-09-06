import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ASSET_V } from '@/lib/brand'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ChatSheet } from '@/features/chatbot/ChatSheet'

/**
 * Floating chat launcher — bottom-right, above the mobile bottom nav.
 * Carries the BEU BABA mascot and opens the BEU BABA assistant (spec §29:
 * globally available on normal app pages). Calm clay-style FAB: soft
 * extrusion, press settle, no pulse rings / particles / neon.
 */
export function FloatingChatButton() {
  const { pathname } = useLocation()
  const reduced = useReducedMotion()
  const [open, setOpen] = useState(false)

  // Already inside the chat section — the launcher would only overlap it.
  if (pathname.startsWith('/support')) return null

  return (
    <>
    <motion.button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Open the BEU BABA assistant"
      title="Ask BEU BABA"
      whileTap={reduced ? undefined : { scale: 0.92 }}
      initial={reduced ? false : { scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26, delay: 0.25 }}
      className="fixed right-4 z-40 flex size-14 items-center justify-center overflow-hidden rounded-full shadow-[0_10px_28px_-8px_var(--lift-1),0_4px_10px_-4px_var(--lift-2)] ring-2 ring-[var(--glass-border-strong)] md:right-6"
      style={{
        bottom: 'calc(var(--nav-height) + 18px + env(safe-area-inset-bottom, 0px))',
        background: 'linear-gradient(160deg, var(--cat-violet-soft), var(--color-surface))',
      }}
    >
      <img
        src={`/assets/brand-mascot.webp?v=${ASSET_V}`}
        alt=""
        aria-hidden
        draggable={false}
        decoding="async"
        className="size-full scale-105 object-contain select-none"
      />
      {/* soft top-light so the FAB reads clay, not sticker */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(90% 70% at 32% 12%, rgba(255,255,255,0.5), rgba(255,255,255,0) 60%)',
        }}
      />
    </motion.button>
      <ChatSheet open={open} onClose={() => setOpen(false)} />
    </>
  )
}
