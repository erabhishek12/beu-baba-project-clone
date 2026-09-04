import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  ChevronRight,
  BellOff,
  BellRing,
  CheckCheck,
  Trash2,
  X,
  GraduationCap,
  ListChecks,
  Award,
  FileText,
  LifeBuoy,
  Info,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/feedback/Skeleton'
import {
  notificationService,
  notificationPermission,
  requestNotificationPermission,
  notificationSupported,
  type AppNotification,
  type NotificationCategory,
} from '@/services/notificationService'
import { useUserId } from '@/features/quiz/hooks'
import { cn } from '@/lib/cn'

const ICON: Record<NotificationCategory, typeof Info> = {
  academic: GraduationCap,
  quiz: ListChecks,
  result: Award,
  resource: FileText,
  support: LifeBuoy,
  system: Info,
}

type Filter = 'all' | 'unread' | NotificationCategory

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'academic', label: 'Academic' },
  { key: 'quiz', label: 'Quiz' },
  { key: 'result', label: 'Results' },
  { key: 'resource', label: 'Resources' },
  { key: 'support', label: 'Support' },
  { key: 'system', label: 'System' },
]

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

/**
 * Full Notification Center page (spec §19). The header bell opens a quick
 * dropdown; this route is the complete, filterable history with mark-all-read,
 * per-item delete, clear-all and the OS push-permission nudge. Same service,
 * so read/unread state stays in sync with the badge everywhere.
 */
export function NotificationsPage() {
  const userId = useUserId()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [filter, setFilter] = useState<Filter>('all')

  const { data: items, isLoading } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => notificationService.list(userId),
  })

  const unreadCount = items?.filter((n) => !n.read).length ?? 0

  const shown = useMemo(() => {
    if (!items) return []
    if (filter === 'all') return items
    if (filter === 'unread') return items.filter((n) => !n.read)
    return items.filter((n) => n.category === filter)
  }, [items, filter])

  function refresh() {
    qc.invalidateQueries({ queryKey: ['notifications', userId] })
    qc.invalidateQueries({ queryKey: ['notifications-unread', userId] })
  }

  async function openItem(n: AppNotification) {
    await notificationService.markRead(userId, n.id)
    refresh()
    if (n.url) navigate(n.url)
  }

  async function markAll() {
    await notificationService.markAllRead(userId)
    refresh()
  }

  async function removeItem(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    await notificationService.remove(userId, id)
    refresh()
  }

  async function clearAll() {
    await notificationService.clearAll(userId)
    refresh()
  }

  const perm = notificationPermission()
  async function enablePush() {
    await requestNotificationPermission()
    refresh()
  }

  return (
    <div className="page-x pb-8 pt-6">
      <header className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-3 flex items-center gap-1 text-body-sm font-semibold text-ink-secondary"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Back
        </button>
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">Notifications</h1>
            <p className="mt-1 text-body-sm text-ink-secondary">
              {unreadCount > 0
                ? `${unreadCount} unread ${unreadCount === 1 ? 'alert' : 'alerts'}`
                : 'Quiz updates, results and academic alerts.'}
            </p>
          </div>
          {(items?.length ?? 0) > 0 && (
            <div className="flex shrink-0 items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={markAll}
                  className="press-tile flex items-center gap-1 rounded-pill bg-accent-soft px-3 py-1.5 text-caption font-semibold text-accent"
                >
                  <CheckCheck className="size-3.5" aria-hidden />
                  Read all
                </button>
              )}
              <button
                onClick={clearAll}
                className="press-tile flex items-center gap-1 rounded-pill bg-chip px-3 py-1.5 text-caption font-semibold text-ink-tertiary ring-1 ring-[var(--glass-border)] hover:text-danger"
              >
                <Trash2 className="size-3.5" aria-hidden />
                Clear
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Enable push nudge */}
      {notificationSupported() && perm === 'default' && (
        <button
          onClick={enablePush}
          className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-accent/30 bg-accent-soft/60 px-4 py-3.5 text-left"
        >
          <BellRing className="size-5 shrink-0 text-accent" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block text-body-sm font-semibold text-ink">Turn on notifications</span>
            <span className="text-caption text-ink-tertiary">
              Get quiz updates, results and important academic alerts on this device.
            </span>
          </span>
          <ChevronRight className="size-5 shrink-0 text-accent" aria-hidden />
        </button>
      )}

      {/* Filter chips */}
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'shrink-0 rounded-pill px-3.5 py-1.5 text-caption font-semibold transition-colors',
              filter === f.key
                ? 'bg-accent text-white shadow-soft'
                : 'bg-chip text-ink-secondary ring-1 ring-[var(--glass-border)] hover:text-ink',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : shown.length > 0 ? (
        <ul className="flex flex-col gap-2.5">
          {shown.map((n) => {
            const Icon = ICON[n.category]
            return (
              <li key={n.id}>
                <Card
                  as="glass"
                  role="button"
                  tabIndex={0}
                  onClick={() => openItem(n)}
                  onKeyDown={(e: React.KeyboardEvent) =>
                    (e.key === 'Enter' || e.key === ' ') && openItem(n)
                  }
                  className={cn(
                    'glass-highlight liquid-depth flex cursor-pointer items-start gap-3',
                    !n.read && 'ring-1 ring-accent/25',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-xl',
                      n.read ? 'bg-surface-secondary text-ink-tertiary' : 'bg-accent/10 text-accent',
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-body font-semibold text-ink">{n.title}</p>
                      {!n.read && <span className="size-2 shrink-0 rounded-full bg-accent" />}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-body-sm text-ink-secondary">{n.body}</p>
                    <p className="mt-1 text-caption text-ink-tertiary">{timeAgo(n.created_at)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => removeItem(n.id, e)}
                    aria-label="Delete notification"
                    className="press-tile -mr-1 shrink-0 rounded-full p-1.5 text-ink-tertiary hover:bg-danger-soft hover:text-danger"
                  >
                    <X className="size-4" />
                  </button>
                </Card>
              </li>
            )
          })}
        </ul>
      ) : (
        <Card className="flex flex-col items-center gap-3 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
            <BellOff className="size-7" aria-hidden />
          </span>
          <div>
            <p className="text-body font-semibold text-ink">
              {filter === 'all' ? "You're all caught up" : 'Nothing here'}
            </p>
            <p className="mt-1 text-body-sm text-ink-secondary">
              {filter === 'all'
                ? 'New alerts about quizzes, results and academics show up here.'
                : 'No notifications match this filter.'}
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
