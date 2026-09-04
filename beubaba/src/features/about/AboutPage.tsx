import { ChevronLeft, ExternalLink, Heart, ShieldCheck, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { AppIcon, type AppIconName } from '@/components/ui/AppIcon'
import { DeveloperFlipCard } from './DeveloperFlipCard'
import {
  APP_INFO,
  PROJECT_SOCIALS,
  type SocialLink,
} from '@/features/support/developerInfo'

function iconFor(label: string): AppIconName {
  const l = label.toLowerCase()
  if (l.includes('telegram')) return 'telegram'
  if (l.includes('youtube')) return 'youtube'
  if (l.includes('whatsapp')) return 'whatsapp'
  if (l.includes('instagram')) return 'instagram'
  return 'globe'
}

function LinkList({ links }: { links: SocialLink[] }) {
  return (
    <div className="flex flex-col divide-y divide-line/60">
      {links.map((s) => {
        const icon = iconFor(s.label)
        return (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 py-3 transition-colors first:pt-0 last:pb-0 hover:text-accent"
          >
            <AppIcon name={icon} className="size-10 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-body font-semibold text-ink">{s.label}</p>
              <p className="truncate text-caption text-ink-tertiary">{s.handle}</p>
            </div>
            <ExternalLink className="size-4 shrink-0 text-ink-tertiary" aria-hidden />
          </a>
        )
      })}
    </div>
  )
}

export function AboutPage() {
  const navigate = useNavigate()
  return (
    <div className="page-x pb-8 pt-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-3 flex items-center gap-1 text-body-sm font-semibold text-ink-secondary"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Back
      </button>

      {/* App identity */}
      <Card as="strong" className="flex flex-col items-center gap-3 py-8 text-center">
        <img
          src="/assets/char-hero.webp"
          alt="BEU BABA"
          className="size-20 rounded-2xl object-contain"
        />
        <div>
          <h1 className="text-h1 text-ink">{APP_INFO.name}</h1>
          <p className="mt-1 text-body-sm text-ink-secondary">{APP_INFO.tagline}</p>
          <p className="mt-2 text-caption text-ink-tertiary">Version {APP_INFO.version}</p>
        </div>
      </Card>

      {/* Developer — interactive flip card (tap the ⓘ to see details) */}
      <h2 className="mb-2 mt-7 text-h3 text-ink">Meet the developer</h2>
      <DeveloperFlipCard />

      {/* Project channels */}
      <h2 className="mb-2 mt-7 text-h3 text-ink">Follow the project</h2>
      <Card as="glass" className="liquid-depth glass-highlight">
        <LinkList links={PROJECT_SOCIALS} />
      </Card>

      {/* Privacy */}
      <h2 className="mb-2 mt-7 text-h3 text-ink">Privacy</h2>
      <Card as="glass" className="!p-0">
        <button
          onClick={() => navigate('/privacy')}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3.5 text-left transition-colors hover:bg-surface-secondary/60"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <ShieldCheck className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-body font-semibold text-ink">Privacy Policy</p>
            <p className="text-caption text-ink-tertiary">
              BEU BABA does not store your data — your data is fully safe.
            </p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-ink-tertiary" aria-hidden />
        </button>
      </Card>

      <p className="mt-8 flex items-center justify-center gap-1.5 text-caption text-ink-tertiary">
        Made with <Heart className="size-3.5 text-accent" aria-hidden /> for BEU students
      </p>
    </div>
  )
}
