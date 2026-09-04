import { useState } from 'react'
import { cn } from '@/lib/cn'
import { AppIcon, type AppIconName } from '@/components/ui/AppIcon'
import { useNavigate } from 'react-router-dom'
import { CircleButton } from '@/components/ui/CircleButton'
import { PageHero } from '@/components/ui/PageHero'
import { ChevronLeft, ExternalLink, RotateCcw } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { DeveloperFlipCard } from './DeveloperFlipCard'
import { PROJECT_SOCIALS } from '@/features/support/developerInfo'

function iconFor(label: string): AppIconName {
  const l = label.toLowerCase()
  if (l.includes('telegram')) return 'telegram'
  if (l.includes('youtube')) return 'youtube'
  if (l.includes('whatsapp')) return 'whatsapp'
  if (l.includes('instagram')) return 'instagram'
  return 'globe'
}

export function AboutDeveloperPage() {
  const navigate = useNavigate()
  return (
    <div className="page-x pb-10 pt-6">
      <CircleButton label="Back to profile" onClick={() => navigate('/profile')} className="mb-3">
        <ChevronLeft className="size-5" aria-hidden />
      </CircleButton>

      <PageHero
        tone="pink"
        icon="heart"
        title="About the developer"
        subtitle="Tap the card to flip it and read the full story."
        className="mb-5"
      />

      <div className="mt-5">
        <DeveloperFlipCard />
      </div>

      {/* Special thanks — tap-to-flip cards */}
      <h2 className="font-heading mb-3 mt-8 text-h3 text-ink">Special thanks</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ThanksCard
          img="/assets/team-ranvir.webp"
          name="Er. Ranvir Kumar"
          role="Founder, JavaSourceCode.in"
          msg="Thank you for helping us solve issues and every coding-related problem. Your guidance shaped this project."
        />
        <ThanksCard
          img="/assets/team-chandan.webp"
          name="Er. Chandan Kumar Trigunait"
          role="Mentor & motivator"
          msg="Thank you for constantly motivating us and believing in this idea. Your encouragement kept us going."
        />
      </div>

      {/* Project channels */}
      <h2 className="mb-2 mt-8 text-h3 text-ink">Follow the project</h2>
      <Card as="glass" className="liquid-depth glass-highlight">
        <div className="flex flex-col divide-y divide-line/60">
          {PROJECT_SOCIALS.map((s) => {
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
      </Card>
    </div>
  )
}

function ThanksCard({ img, name, role, msg }: { img: string; name: string; role: string; msg: string }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <div className="flip-scene">
      <div className={cn('flip-inner relative w-full', flipped && 'flipped')}>
        {/* FRONT — full-height photo (never cropped) + frosted identity strip */}
        <div className="flip-face flip-front relative overflow-hidden rounded-[28px] bg-surface ring-1 ring-[var(--glass-border)]">
          <img src={img} alt={name} className="block w-full object-contain" />
          <button
            type="button"
            onClick={() => setFlipped(true)}
            aria-label={`Thank ${name} — tap to flip`}
            className="absolute inset-0 z-[5] cursor-pointer"
          />
          <div className="pointer-events-none absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-pill bg-chip px-3 py-1.5 text-caption font-semibold text-accent-ink backdrop-blur-md ring-1 ring-[var(--glass-border)]">
            <AppIcon name="heart" className="size-4" />
            Special thanks
          </div>
          <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 rounded-3xl border border-[var(--glass-border)] bg-chip p-4 backdrop-blur-xl">
            <p className="text-caption font-semibold uppercase tracking-wide text-accent">{role}</p>
            <h3 className="font-heading mt-0.5 text-[22px] font-extrabold leading-tight tracking-[-0.02em] text-ink">
              {name}
            </h3>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-pill bg-accent/90 px-3 py-1.5 text-caption font-semibold text-white">
              Tap for thanks
            </span>
          </div>
        </div>

        {/* BACK — frosted glass thank-you note */}
        <div className={cn('flip-face flip-back', !flipped && 'pointer-events-none')}>
          <div className="glass-elevated glass-highlight glass-sheen relative flex h-full flex-col overflow-hidden rounded-[28px] p-5 ring-1 ring-[var(--glass-border)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-caption font-semibold uppercase tracking-wide text-accent">
                  With gratitude
                </p>
                <h3 className="font-heading mt-0.5 text-[22px] font-extrabold leading-tight tracking-[-0.02em] text-ink">
                  {name}
                </h3>
                <p className="text-body-sm font-medium text-ink-secondary">{role}</p>
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
            <div className="mt-4 flex items-center gap-3">
              <AppIcon name="heart" className="size-14" />
              <p className="font-hindi text-body-lg font-semibold text-ink">धन्यवाद!</p>
            </div>
            <p className="mt-3 text-body-sm leading-relaxed text-ink-secondary">{msg}</p>
            <p className="mt-auto pt-3 text-caption text-ink-tertiary">— Team BEU BABA</p>
          </div>
        </div>
      </div>
    </div>
  )
}
