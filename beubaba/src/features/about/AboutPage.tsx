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


      {/*
        What BEU BABA is and what it costs. Every claim below is checked
        against the real app: the figures come from the live database and the
        features listed are ones that actually ship. Nothing unfinished is
        advertised here.
      */}
      <Card className="mt-4 px-4 py-5">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-pill bg-accent-soft px-3 py-1.5 text-caption font-bold text-accent-ink">
            100% Free
          </span>
          <span className="rounded-pill bg-accent-soft px-3 py-1.5 text-caption font-bold text-accent-ink">
            No Ads
          </span>
          <span className="rounded-pill bg-accent-soft px-3 py-1.5 text-caption font-bold text-accent-ink">
            No Payment
          </span>
          <span className="rounded-pill bg-accent-soft px-3 py-1.5 text-caption font-bold text-accent-ink">
            Works Offline
          </span>
        </div>

        <p className="mt-3 text-body text-ink">
          BEU BABA puts everything a Bihar Engineering University student needs in one place —
          syllabus, previous year papers, practice questions and study tools — organised by
          branch and semester so you are not hunting through folders before an exam.
        </p>

        <h3 className="mt-4 text-body font-bold text-ink">No ads. Ever.</h3>
        <p className="mt-1 text-body-sm text-ink-secondary">
          There are no banner ads, no pop-up ads, no video ads and no sponsored questions mixed
          into your practice. Nothing is locked behind a payment, and there is no premium tier.
          Studying should not be interrupted by someone trying to sell you something.
        </p>

        <h3 className="mt-4 text-body font-bold text-ink">What you get</h3>
        <ul className="mt-1 flex flex-col gap-1.5 text-body-sm text-ink-secondary">
          <li>• <span className="text-ink">22,000+ practice questions</span>, each checked by a human before it reaches you</li>
          <li>• <span className="text-ink">Full paper and unit-wise quizzes</span> with a timer, instant scoring and explanations</li>
          <li>• <span className="text-ink">1,749 subjects</span> of syllabus across all 30 branches</li>
          <li>• <span className="text-ink">363 previous year papers</span>, savable for offline reading</li>
          <li>• <span className="text-ink">Exam planner</span> — tick off units and get a day-by-day plan before your exam</li>
          <li>• <span className="text-ink">Revision</span> — questions you got wrong come back until you know them</li>
          <li>• <span className="text-ink">Math Mind</span> — five levels of maths practice with worked solutions</li>
          <li>• <span className="text-ink">17 tools</span> — CGPA, SGPA, attendance, photo-to-text, translator and more</li>
          <li>• <span className="text-ink">Assistant</span> — ask it to open anything or find notes for a subject</li>
          <li>• <span className="text-ink">Academic calendar</span>, notices and college directory</li>
        </ul>

        <h3 className="mt-4 text-body font-bold text-ink">Built to be fast</h3>
        <p className="mt-1 text-body-sm text-ink-secondary">
          Install it from your browser and it behaves like a real app — its own icon, full
          screen, and it opens even with no internet. A quiz downloads only the questions you
          need, so it works on a slow connection and barely touches your data.
        </p>

        <h3 className="mt-4 text-body font-bold text-ink">Your data</h3>
        <p className="mt-1 text-body-sm text-ink-secondary">
          Your profile, bookmarks and quiz history are yours alone — other students cannot see
          them. Answer keys never leave the server, so a quiz cannot be cheated by inspecting
          the page. Photos you scan with the text tool are read on your own phone and are never
          uploaded.
        </p>

        <p className="mt-4 text-caption text-ink-tertiary">
          BEU BABA is not an official Bihar Engineering University product. Always confirm exam
          dates and results on the official university website.
        </p>
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
