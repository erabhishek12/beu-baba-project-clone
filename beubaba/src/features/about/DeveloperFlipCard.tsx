import { useState } from 'react'
import { RotateCcw, ArrowLeftRight, ExternalLink, MapPin, GraduationCap, Sparkles } from 'lucide-react'
import { AppIcon, type AppIconName } from '@/components/ui/AppIcon'

/**
 * Full-image liquid-glass flip card for "About the Developer".
 *  - FRONT: the character fills the whole card; a frosted-glass panel is
 *    overlaid at the bottom with the name, role and social chips, plus a clear
 *    "Click to flip" control. No content overlaps the header/nav (the card is a
 *    self-contained block in the page flow).
 *  - BACK:  bio + facts from erabhi.in and a portfolio CTA.
 * Genuine frosted glass, app palette, restrained motion.
 */

const DEV = {
  name: 'Abhishek Kumar',
  role: 'Web Developer · B.Tech CSE',
  location: 'Bihar, India',
  education: 'B.Tech CSE (2024–2028) · A.M.I.T Shivdham',
  bio: "A second-year B.Tech Computer Science student who learned to code out of curiosity and turned it into a working freelance practice. 16 shipped projects — from offline-first study tools to full client platforms. Obsessed with the details most people skip: load times, spacing rhythm, and how a button feels when you press it.",
  portfolio: 'https://erabhi.in',
}

const SOCIALS: { label: string; handle: string; url: string; icon: AppIconName }[] = [
  { label: 'Portfolio', handle: 'erabhi.in', url: 'https://erabhi.in', icon: 'globe' },
  {
    label: 'Instagram',
    handle: '@naturelensbyabhi',
    url: 'https://www.instagram.com/naturelensbyabhi',
    icon: 'instagram',
  },
  {
    label: 'Instagram',
    handle: '@er_abhi2026',
    url: 'https://www.instagram.com/er_abhi2026',
    icon: 'instagram',
  },
]

export function DeveloperFlipCard() {
  const [flipped, setFlipped] = useState(false)

  return (
    /* Portrait card: capped on md+ so it never balloons to full desktop width. */
    <div className="mx-auto w-full max-w-[380px] [perspective:1800px] md:max-w-[420px]">
      <div
        className="relative aspect-[844/1264] w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d]"
        style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* ================= FRONT ================= */}
        {/* NOTE: the card container is a plain div (not a button) so the social
            <a> links and the flip control are valid interactive elements, not
            nested inside another button. A full-surface overlay button handles
            the "tap anywhere to flip" affordance and sits BELOW the links. */}
        <div
          aria-hidden={flipped}
          className={`absolute inset-0 overflow-hidden rounded-[28px] [backface-visibility:hidden] [transform:rotateY(0deg)] ${flipped ? 'pointer-events-none' : ''}`}
        >
          <div className="glass-highlight liquid-depth relative h-full w-full overflow-hidden rounded-[28px] ring-1 ring-[var(--glass-border)]">
            {/* Full-bleed character image */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(120% 100% at 50% 0%, rgba(139,92,246,0.28), rgba(91,110,240,0.16) 45%, #eef0fb 78%)',
              }}
            />
            <img
              src="/assets/dev-character-3.webp"
              alt="Illustration of the developer, Abhishek Kumar"
              className="absolute inset-0 size-full object-cover object-top"
              draggable={false}
            />

            {/* Subtle transparent grid overlay (low blur, glassy) */}
            <div
              className="pointer-events-none absolute inset-0 z-[1] opacity-40 mix-blend-soft-light"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                backgroundSize: '26px 26px',
                maskImage:
                  'radial-gradient(120% 90% at 50% 20%, rgba(0,0,0,0.9), transparent 75%)',
                WebkitMaskImage:
                  'radial-gradient(120% 90% at 50% 20%, rgba(0,0,0,0.9), transparent 75%)',
                backdropFilter: 'blur(1px)',
                WebkitBackdropFilter: 'blur(1px)',
              }}
            />

            {/* Tap-anywhere flip surface (behind the interactive chrome) */}
            <button
              type="button"
              onClick={() => setFlipped(true)}
              aria-label="Flip to read about the developer"
              className="absolute inset-0 z-0 size-full cursor-pointer"
            />

            {/* Top badge */}
            <div className="pointer-events-none absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-pill bg-chip px-3 py-1.5 text-caption font-semibold text-accent-ink backdrop-blur-md ring-1 ring-[var(--glass-border)]">
              <Sparkles className="size-3.5 text-accent" aria-hidden />
              Meet the developer
            </div>

            {/* "Click to flip" button */}
            <button
              type="button"
              onClick={() => setFlipped(true)}
              className="press-tile absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-pill bg-accent/90 px-3 py-1.5 text-caption font-semibold text-white shadow-soft backdrop-blur-md"
            >
              <ArrowLeftRight className="size-3.5" aria-hidden />
              Click to flip
            </button>

            {/* Bottom frosted overlay: identity + socials */}
            <div className="absolute inset-x-3 bottom-3 z-10 rounded-3xl border border-[var(--glass-border)] bg-chip p-4 backdrop-blur-xl">
              <p className="text-caption font-semibold uppercase tracking-wide text-accent">
                Developer
              </p>
              <h3 className="mt-0.5 font-heading text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink">
                {DEV.name}
              </h3>
              <p className="text-body-sm font-medium text-ink-secondary">{DEV.role}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SOCIALS.map((s) => {
                  const icon = s.icon
                  return (
                    <a
                      key={s.url}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="press-tile inline-flex items-center gap-1.5 rounded-pill bg-chip-strong px-3 py-1.5 text-caption font-semibold text-accent-ink ring-1 ring-[var(--glass-border)] backdrop-blur-md"
                    >
                      <AppIcon name={icon} className="size-5" />
                      {s.handle}
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ================= BACK ================= */}
        <div
          aria-hidden={!flipped}
          className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] ${flipped ? '' : 'pointer-events-none'}`}
        >
          <div className="glass-elevated glass-highlight glass-sheen liquid-depth relative flex h-full flex-col overflow-hidden rounded-[28px] p-5 ring-1 ring-[var(--glass-border)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-caption font-semibold uppercase tracking-wide text-accent">
                  About the developer
                </p>
                <h3 className="mt-0.5 font-heading text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-ink">
                  {DEV.name}
                </h3>
                <p className="text-body-sm font-medium text-ink-secondary">{DEV.role}</p>
              </div>
              <button
                type="button"
                onClick={() => setFlipped(false)}
                aria-label="Flip back"
                className="press-tile flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent ring-1 ring-[var(--glass-border)]"
              >
                <RotateCcw className="size-5" />
              </button>
            </div>

            <p className="mt-3 text-body-sm leading-relaxed text-ink-secondary">{DEV.bio}</p>

            <div className="mt-4 space-y-2.5">
              <div className="flex items-center gap-2.5 text-body-sm text-ink-secondary">
                <GraduationCap className="size-4 shrink-0 text-accent" aria-hidden />
                {DEV.education}
              </div>
              <div className="flex items-center gap-2.5 text-body-sm text-ink-secondary">
                <MapPin className="size-4 shrink-0 text-accent" aria-hidden />
                {DEV.location}
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-2 pt-4">
              <a
                href={DEV.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="press-tile flex items-center justify-center gap-2 rounded-xl bg-accent py-3 text-body-sm font-semibold text-white"
              >
                Visit portfolio
                <ExternalLink className="size-4" aria-hidden />
              </a>
              <button
                type="button"
                onClick={() => setFlipped(false)}
                className="press-tile flex items-center justify-center gap-2 rounded-xl bg-chip py-2.5 text-body-sm font-semibold text-accent-ink ring-1 ring-[var(--glass-border)]"
              >
                <ArrowLeftRight className="size-4" aria-hidden />
                Flip back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
