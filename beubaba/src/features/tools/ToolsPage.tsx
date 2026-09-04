import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import { AppIcon, type AppIconName } from '@/components/ui/AppIcon'
import { PageHero } from '@/components/ui/PageHero'

type Tint = 'blue' | 'violet' | 'teal' | 'coral'

const TINT_BG: Record<Tint, string> = {
  blue: 'bg-cat-blue-soft',
  violet: 'bg-cat-violet-soft',
  teal: 'bg-cat-teal-soft',
  coral: 'bg-cat-coral-soft',
}

interface Tool {
  label: string
  desc: string
  clay?: AppIconName
  icon?: LucideIcon
  to: string
  tint: Tint
}

export const TOOLS: Tool[] = [
  {
    label: 'Resources',
    desc: 'Notes, PDFs & links shared by students',
    clay: 'resources',
    to: '/resources',
    tint: 'violet',
  },
  {
    label: 'Developer Support',
    desc: 'Report a problem or send private feedback',
    clay: 'assistant',
    to: '/support',
    tint: 'teal',
  },
  {
    label: 'Student Toolbox',
    desc: 'CGPA, attendance, timer & 12 more tools',
    clay: 'toolbox',
    to: '/tools/toolbox',
    tint: 'blue',
  },
  {
    label: 'Check Result',
    desc: 'BEU B.Tech results, semester-wise',
    clay: 'results',
    to: '/tools/results',
    tint: 'teal',
  },
  {
    label: 'Important Portals',
    desc: 'BEU official, NPTEL, scholarships & more',
    clay: 'portals',
    to: '/tools/portals',
    tint: 'coral',
  },
  {
    label: 'Government Exams',
    desc: 'UPSC, BPSC, SSC, ISRO, GATE & more',
    clay: 'govexams',
    to: '/tools/exams',
    tint: 'violet',
  },
  {
    label: 'Engineering Colleges',
    desc: 'Bihar engineering college directory',
    clay: 'colleges',
    to: '/tools/colleges',
    tint: 'blue',
  },
]

export function ToolsPage() {
  const navigate = useNavigate()
  return (
    <div className="page-x pb-8 pt-6">
      <PageHero
        tone="lav"
        icon="toolbox"
        title="Tools"
        subtitle="Results, official portals, exam guides and college directory."
        className="mb-5"
      />

      <div className="flex flex-col gap-3">
        {TOOLS.map((t) => (
          <Card
            key={t.to}
            as="glass"
            className="glass-sheen liquid-depth glass-highlight flex cursor-pointer items-center gap-4"
            role="button"
            tabIndex={0}
            onClick={() => navigate(t.to)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(t.to)}
          >
            <span className={cn('glass-highlight flex size-14 shrink-0 items-center justify-center rounded-2xl shadow-soft', TINT_BG[t.tint])}>
              {t.clay ? (
                <AppIcon name={t.clay} className="size-9" />
              ) : t.icon ? (
                <t.icon className="size-7 text-accent" aria-hidden />
              ) : null}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-body-lg font-semibold text-ink">{t.label}</h2>
              <p className="mt-0.5 text-body-sm text-ink-secondary">{t.desc}</p>
            </div>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent shadow-[0_8px_18px_rgba(91,110,240,0.35)]">
              <ChevronRight className="size-4 text-white" aria-hidden />
            </span>
          </Card>
        ))}
      </div>
    </div>
  )
}
