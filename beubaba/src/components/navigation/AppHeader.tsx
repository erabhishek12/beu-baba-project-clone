import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bell, Search } from 'lucide-react'
import { LogoMark, Wordmark } from '@/components/brand/Logo'
import { NotificationCenter } from '@/features/notifications/NotificationCenter'
import { notificationService } from '@/services/notificationService'
import { useUserId } from '@/features/quiz/hooks'
import { useAuth } from '@/app/providers/AuthProvider'
import { Avatar } from '@/components/ui/Avatar'
import { ThemeToggle } from '@/components/navigation/ThemeToggle'
import { NAV_ITEMS, isNavActive } from '@/components/navigation/navItems'

/**
 * Global application header — BEU BABA branded, theme-aware, responsive.
 *
 * Desktop (md+): logo + wordmark left, primary navigation pills in the
 * header centre-left, then search / theme / notifications / profile on the
 * right, all on one soft glass surface.
 * Mobile: compact branded bar (logo + wordmark, then theme / search /
 * notifications). Primary section navigation lives in the fixed bottom nav,
 * so nothing is duplicated.
 *
 * The surface is FIXED liquid glass + a theme-aware hairline; per-page titles
 * stay inside each page so the header never repeats them.
 */
export function AppHeader() {
  const userId = useUserId()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useAuth()
  const [notifOpen, setNotifOpen] = useState(false)

  const { data: unread = 0 } = useQuery({
    queryKey: ['notifications-unread', userId],
    queryFn: () => notificationService.unreadCount(userId),
  })

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-40"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="glass-standard border-b border-[var(--glass-border)]">
          <div className="mx-auto flex h-14 w-full max-w-2xl items-center gap-2 px-4 md:h-16 md:gap-3 lg:max-w-shell lg:px-6">
            {/* Brand — logo + name, always visible */}
            <Link
              to="/"
              className="press-tile flex shrink-0 items-center gap-2 rounded-pill py-1 pr-2"
              aria-label="BEU BABA home"
            >
              <LogoMark className="size-8 md:size-9" />
              <Wordmark className="text-h3 md:text-h2" />
            </Link>

            {/* Primary navigation — desktop only (mobile uses bottom nav) */}
            <nav aria-label="Primary" className="ml-2 hidden items-center gap-1 md:flex lg:hidden">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="nav-pill"
                  data-active={isNavActive(pathname, item.to) || undefined}
                  aria-current={isNavActive(pathname, item.to) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="ml-auto flex items-center gap-1.5 md:gap-2">
              <button
                aria-label="Search"
                onClick={() => navigate('/search')}
                className="press-tile neu-sm neu-press flex size-10 items-center justify-center rounded-full text-ink-secondary hover:text-ink"
              >
                <Search className="size-[18px]" aria-hidden />
              </button>

              <ThemeToggle />

              <button
                aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
                onClick={() => setNotifOpen(true)}
                className="press-tile neu-sm neu-press relative flex size-10 items-center justify-center rounded-full text-ink-secondary hover:text-ink"
              >
                <Bell className="size-[18px]" aria-hidden />
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold leading-[18px] text-white ring-2 ring-canvas">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              {/* Profile — desktop shortcut (mobile reaches it via bottom nav) */}
              {user && (
                <Link
                  to="/profile"
                  className="press-tile ml-0.5 hidden rounded-full md:block"
                  aria-label="Profile & settings"
                >
                  <Avatar profile={user.profile} size="sm" className="shadow-neu-sm" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <NotificationCenter open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  )
}

/** Fixed header height — driven by the --header-h token (56px / 64px). */
export const APP_HEADER_H = 56
