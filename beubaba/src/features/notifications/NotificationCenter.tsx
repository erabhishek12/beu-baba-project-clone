import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  X,
  BellOff,
  ChevronRight,
  CheckCheck,
  GraduationCap,
  ListChecks,
  Award,
  FileText,
  LifeBuoy,
  Info,
  BellRing,
} from 'lucide-react'
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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export function NotificationCenter({ open, onClose }: { open: boolean; onClose: () => void }) {
  const userId = useUserId()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: items } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => notificationService.list(userId),
    enabled: open,
  })

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  async function openItem(n: AppNotification) {
    await notificationService.markRead(userId, n.id)
    qc.invalidateQueries({ queryKey: ['notifications', userId] })
    qc.invalidateQueries({ queryKey: ['notifications-unread', userId] })
    onClose()
    if (n.url) navigate(n.url)
  }

  async function markAll() {
    await notificationService.markAllRead(userId)
    qc.invalidateQueries({ queryKey: ['notifications', userId] })
    qc.invalidateQueries({ queryKey: ['notifications-unread', userId] })
  }

  const perm = notificationPermission()

  async function enablePush() {
    await requestNotificationPermission()
    qc.invalidateQueries({ queryKey: ['notifications', userId] })
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink/25 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="glass-modal relative flex max-h-[80dvh] w-full max-w-md flex-col rounded-t-3xl sm:rounded-3xl"
            initial={{ y: '100%', opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.6 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <div className="flex items-center justify-between px-5 pb-3 pt-4">
              <div className="flex items-center gap-2">
                <h2 className="text-h3 text-ink">Notifications</h2>
              </div>
              <div className="flex items-center gap-1">
                {!!items?.some((n) => !n.read) && (
                  <button
                    onClick={markAll}
                    className="flex items-center gap-1 rounded-pill px-2.5 py-1 text-caption font-semibold text-accent"
                  >
                    <CheckCheck className="size-3.5" aria-hidden />
                    Mark all read
                  </button>
                )}
                <button onClick={onClose} aria-label="Close" className="p-1 text-ink-tertiary">
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Enable push nudge (only if supported and not yet granted) */}
            {notificationSupported() && perm === 'default' && (
              <button
                onClick={enablePush}
                className="mx-5 mb-2 flex items-center gap-3 rounded-xl border border-accent/30 bg-accent-soft/60 px-3.5 py-3 text-left"
              >
                <BellRing className="size-5 shrink-0 text-accent" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block text-body-sm font-semibold text-ink">Turn on notifications</span>
                  <span className="text-caption text-ink-tertiary">
                    Get quiz updates, results and important academic alerts.
                  </span>
                </span>
              </button>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-[calc(env(safe-area-inset-bottom)+16px)]">
              {items && items.length > 0 ? (
                <ul className="space-y-1.5">
                  {items.map((n) => {
                    const Icon = ICON[n.category]
                    return (
                      <li key={n.id}>
                        <button
                          onClick={() => openItem(n)}
                          className={cn(
                            'flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors',
                            n.read ? 'hover:bg-surface-secondary/60' : 'bg-accent-soft/50 hover:bg-accent-soft',
                          )}
                        >
                          <span
                            className={cn(
                              'flex size-9 shrink-0 items-center justify-center rounded-xl',
                              n.read ? 'bg-surface-secondary text-ink-tertiary' : 'bg-accent/10 text-accent',
                            )}
                          >
                            <Icon className="size-4.5" aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="truncate text-body-sm font-semibold text-ink">{n.title}</span>
                              {!n.read && <span className="size-2 shrink-0 rounded-full bg-accent" />}
                            </span>
                            <span className="mt-0.5 block text-caption text-ink-secondary">{n.body}</span>
                            <span className="mt-1 block text-caption text-ink-tertiary">{timeAgo(n.created_at)}</span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="flex flex-col items-center py-14 text-center">
                  <BellOff className="size-8 text-ink-tertiary" aria-hidden />
                  <p className="mt-3 text-body font-semibold text-ink">You're all caught up</p>
                  <p className="mt-1 text-body-sm text-ink-secondary">
                    New alerts about quizzes, results and academics show up here.
                  </p>
                </div>
              )}
            </div>

            {/* Link to the full, filterable notification page */}
            <div className="border-t border-[var(--glass-border)] px-3 py-2">
              <button
                onClick={() => {
                  onClose()
                  navigate('/notifications')
                }}
                className="press-tile flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-body-sm font-semibold text-accent"
              >
                See all notifications
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
