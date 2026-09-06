import { useState } from 'react'
import { cn } from '@/lib/cn'

/**
 * BEU BABA 3D icon system.
 * True clay-3D renders (generated art pack, sliced to transparent PNGs and
 * self-hosted under /assets/icons3d). Each icon carries its own pastel tile,
 * matching the kid-friendly reference design language.
 *
 * The component degrades gracefully: if an icon file ever fails to load a
 * soft accent placeholder square is shown instead of a broken image.
 */
const ICONS = [
  // core / academic
  'pyq',
  'syllabus',
  'calendar',
  'quiz',
  'results',
  'portals',
  'govexams',
  'colleges',
  'resources',
  'notes',
  'progress',
  'assistant',
  'search',
  'notifications',
  'profile',
  'exams',
  // toolbox
  'tool-cgpa',
  'tool-sgpa',
  'tool-gpa-target',
  'tool-percentage',
  'tool-marks',
  'tool-attendance',
  'tool-exam-countdown',
  'tool-pomodoro',
  'tool-scientific',
  'tool-unit-converter',
  'tool-age',
  'tool-date-diff',
  'tool-qr',
  'tool-password',
  'tool-text-formatter',
  'toolbox',
  // learning / rewards / misc
  'courses',
  'telegram',
  'youtube',
  'whatsapp',
  'instagram',
  'globe',
  'theory',
  'lab',
  'subject',
  'revision',
  'mathmind',
  'focus',
  'collaborate',
  'planner',
  'ocr',
  'translator',
  'trophy',
  'flame',
  'star',
  'gift',
  'medal',
  'plant',
  'palette',
  'rocket',
  'heart',
  // ui / actions / profile
  'edit',
  'camera',
  'logout',
  'shield',
  'info',
  'email',
  'phone',
  'branch',
  'layers',
  'timer',
  'help',
  'verified',
  'history',
  'bookmark',
  'upload',
  'filter',
  'crown',
  'bulb',
  'flag',
  'coin',
  'download',
  'link',
  'share',
  'warning',
  'sparkle',
  'grid',
  'list',
  'chat',
  'compass',
  'map',
  'headphones',
  'lock',
] as const

export type AppIconName = (typeof ICONS)[number]

/** Legacy / semantic names kept working by mapping onto the 3D pack. */
const ALIASES: Record<string, AppIconName> = {
  'portal-official': 'colleges',
  'portal-learning': 'courses',
  'portal-scholarship': 'medal',
  'portal-results': 'results',
  dashboard: 'progress',
  settings: 'toolbox',
  support: 'heart',
  games: 'rocket',
  rewards: 'trophy',
  home: 'star',
  learn: 'courses',
  theme: 'palette',
}

function resolve(name: string): AppIconName {
  if ((ICONS as readonly string[]).includes(name)) return name as AppIconName
  return ALIASES[name] ?? 'subject'
}

const srcFor = (name: string) => `/assets/icons3d/${resolve(name)}.webp`

export function AppIcon({
  name,
  className = '',
  alt,
}: {
  name: string
  className?: string
  alt?: string
}) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <span
        aria-hidden
        className={cn('inline-block rounded-[26%] bg-accent-soft', className)}
      />
    )
  }
  return (
    <img
      src={srcFor(name)}
      alt={alt ?? ''}
      draggable={false}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn('select-none object-contain', className)}
    />
  )
}

/** Pre-warm the browser cache for icons a screen is about to show. */
export function warmIconCache(names: string[]): void {
  for (const n of names) {
    const img = new Image()
    img.src = srcFor(n)
  }
}
