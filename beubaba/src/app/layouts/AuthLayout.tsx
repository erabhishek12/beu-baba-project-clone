import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'

/**
 * Auth shell with a faded full-screen academic background image plus two soft,
 * slowly-drifting brand orbs for gentle depth. The image and orbs are heavily
 * softened so the glass form stays the visual priority (spec §17–18): bright,
 * calm, readable — never a busy hero.
 */
export function AuthLayout() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      {/* Base quiet gradient */}
      <div className="bb-environment" />

      {/* Soft drifting brand orbs (subtle, on-brand — not neon) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(91,110,240,0.24), transparent 70%)' }}
        animate={{ x: [0, 30, 0], y: [0, 24, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -right-20 size-80 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.20), transparent 70%)' }}
        animate={{ x: [0, -26, 0], y: [0, -20, 0] }}
        transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Faded full-screen campus image */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage: 'url(/assets/university.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-hidden
      />
      {/* Light wash so text stays high-contrast */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-canvas/70 via-canvas/55 to-canvas/85"
        aria-hidden
      />
      <div className="relative">
        <Outlet />
      </div>
    </div>
  )
}
