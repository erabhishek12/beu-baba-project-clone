import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FolderOpen } from 'lucide-react'
import { cn } from '@/lib/cn'
import { AppIcon, type AppIconName } from '@/components/ui/AppIcon'
import { PageHero } from '@/components/ui/PageHero'

const TILE_BG = ['bb-tile-lav', 'bb-tile-mint', 'bb-tile-peach', 'bb-tile-pink']

const TABS: { to: string; label: string; icon: AppIconName; end?: boolean }[] = [
  { to: '/study', label: 'PYQs', icon: 'pyq', end: true },
  { to: '/study/syllabus', label: 'Syllabus', icon: 'syllabus' },
  { to: '/study/calendar', label: 'Calendar', icon: 'calendar' },
]

/**
 * Study shell: gradient hero + reference-style category tiles (single
 * navigation set) over the sub-routes.
 */
export function StudyPage() {
  const navigate = useNavigate()

  return (
    <div className="page-x pb-8 pt-6">
      <PageHero
        tone="mint"
        icon="courses"
        title="Study"
        subtitle="Previous-year papers, syllabus and the academic calendar."
        className="mb-4"
      >
        <button
          onClick={() => navigate('/resources')}
          className="mt-4 flex items-center gap-2 rounded-pill bg-canvas px-4 py-2 text-caption font-bold text-ink shadow-[0_10px_22px_rgba(20,16,60,0.25)]"
        >
          <FolderOpen className="size-4 text-accent" aria-hidden />
          Resources
        </button>
      </PageHero>

      {/* Reference-style category tiles — the single section switcher */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        {TABS.map((t, i) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              cn(
                'flex min-h-[96px] flex-col items-start justify-between overflow-hidden rounded-3xl p-3.5 shadow-neu-sm ring-1 transition-shadow hover:shadow-neu',
                t.to === '/study/calendar' && 'col-span-2 flex-row items-center justify-between',
                TILE_BG[i],
                isActive && 'ring-2 ring-accent',
              )
            }
          >
            <span className="font-heading text-body font-bold text-ink">{t.label}</span>
            <AppIcon
              name={t.icon}
              className="pointer-events-none size-12 drop-shadow-[0_8px_12px_rgba(40,30,90,0.18)]"
            />
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  )
}
