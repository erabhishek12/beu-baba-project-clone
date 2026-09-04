import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { AppIcon } from '@/components/ui/AppIcon'

export type HeroTone = 'violet' | 'mint' | 'lav' | 'pink' | 'peach'

const TONE_BG: Record<HeroTone, string> = {
  violet: 'bb-hero',
  mint: 'bb-hero-mint',
  lav: 'bb-hero-lav',
  pink: 'bb-hero-pink',
  peach: 'bb-hero-peach',
}

const TONE_SHADOW: Record<HeroTone, string> = {
  violet: 'shadow-[0_18px_38px_rgba(114,92,240,0.35)]',
  mint: 'shadow-[0_18px_38px_rgba(45,160,125,0.3)]',
  lav: 'shadow-[0_18px_38px_rgba(140,120,235,0.3)]',
  pink: 'shadow-[0_18px_38px_rgba(214,86,140,0.28)]',
  peach: 'shadow-[0_18px_38px_rgba(235,140,80,0.28)]',
}

/**
 * Gradient banner used at the top of every screen (reference-matched).
 * Carries the page title, a one-line guide, and either a 3D icon or art.
 */
export function PageHero({
  tone = 'violet',
  title,
  subtitle,
  icon,
  art,
  children,
  className = '',
}: {
  tone?: HeroTone
  title: string
  subtitle?: string
  icon?: string
  art?: string
  children?: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-[28px] p-5 pr-24 sm:p-6 sm:pr-32',
        TONE_BG[tone],
        TONE_SHADOW[tone],
        className,
      )}
    >
      <h1 className="font-heading max-w-[18ch] text-h2 leading-snug text-white sm:text-h1">
        {title}
      </h1>
      {subtitle && <p className="mt-1.5 max-w-[34ch] text-body-sm text-white/85">{subtitle}</p>}
      {children}
      {art ? (
        <img
          src={art}
          alt=""
          className="bb-float pointer-events-none absolute -bottom-2 right-2 h-28 w-auto object-contain drop-shadow-[0_14px_22px_rgba(30,20,80,0.3)] sm:right-4 sm:h-34"
        />
      ) : icon ? (
        <AppIcon
          name={icon}
          className="pointer-events-none absolute -bottom-2 right-1 size-20 rotate-6 drop-shadow-[0_10px_18px_rgba(30,20,80,0.3)] sm:size-24"
        />
      ) : null}
    </section>
  )
}
