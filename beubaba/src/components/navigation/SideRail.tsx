import { NavLink, useLocation } from 'react-router-dom'
import { NAV_ITEMS, isNavActive } from './navItems'
import { AppIcon, type AppIconName } from '@/components/ui/AppIcon'
import { LogoLockup } from '@/components/brand/Logo'
import { cn } from '@/lib/cn'

/** 3D-icon counterpart for each primary destination (single source: NAV_ITEMS). */
const RAIL_ICONS: Record<string, AppIconName> = {
  '/': 'star',
  '/study': 'courses',
  '/quiz': 'quiz',
  '/tools': 'toolbox',
  '/profile': 'profile',
}

const SECONDARY = [
  { to: '/saved', label: 'Saved', icon: 'bookmark' as AppIconName },
  { to: '/notifications', label: 'Notices', icon: 'notifications' },
  { to: '/support', label: 'Support', icon: 'chat' },
  { to: '/resources', label: 'Resources', icon: 'resources' },
] as const

/**
 * Phase 3 desktop sidebar — lg+ only. Primary nav mirrors the bottom-nav /
 * header pill set so the three shells never drift; secondary shortcuts expose
 * saved, notifications, support and resources without extra taps.
 */
export function SideRail() {
  const { pathname } = useLocation()
  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-line/60 bg-surface/70 px-3 py-5 backdrop-blur-xl lg:flex"
      aria-label="Sidebar"
    >
      <div className="mb-5 px-2">
        <LogoLockup className="justify-start" />
      </div>
      <nav aria-label="Sidebar primary" className="flex flex-col gap-1">
        {NAV_ITEMS.map((it) => {
          const active = isNavActive(pathname, it.to)
          return (
            <NavLink
              key={it.to}
              to={it.to}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-body font-semibold transition-colors',
                active
                  ? 'bg-accent-soft text-accent-ink shadow-neu-sm ring-1 ring-accent/30'
                  : 'text-ink-secondary hover:bg-surface-secondary hover:text-ink',
              )}
            >
              <AppIcon name={RAIL_ICONS[it.to]} className="size-7 shrink-0" />
              {it.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="my-4 h-px bg-line/70" aria-hidden />

      <nav aria-label="Sidebar secondary" className="flex flex-col gap-0.5">
        {SECONDARY.map((it) => {
          const active = isNavActive(pathname, it.to)
          return (
            <NavLink
              key={it.to}
              to={it.to}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2 text-body-sm font-medium transition-colors',
                active ? 'text-accent' : 'text-ink-tertiary hover:bg-surface-secondary hover:text-ink',
              )}
            >
              <AppIcon name={it.icon} className="size-6 shrink-0" />
              {it.label}
            </NavLink>
          )
        })}
      </nav>

      <p className="mt-auto px-3 pt-4 text-caption text-ink-tertiary">
        BEU BABA · your campus companion
      </p>
    </aside>
  )
}
