import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bookmark,
  FileText,
  BookOpen,
  GraduationCap,
  FolderOpen,
  Bell,
  CalendarDays,
  Clock,
  X,
  ChevronRight,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/feedback/Skeleton'
import { ToolHeader } from '@/features/tools/ToolHeader'
import { bookmarkService } from '@/services/bookmarkService'
import { recentlyViewedService, type RecentType } from '@/services/recentlyViewedService'
import type { BookmarkType } from '@/types/domain'
import { useUserId } from '@/features/quiz/hooks'
import { cn } from '@/lib/cn'

const TYPE_ICON: Record<BookmarkType, typeof FileText> = {
  pyq: FileText,
  subject: BookOpen,
  quiz: GraduationCap,
  resource: FolderOpen,
  notice: Bell,
  calendar: CalendarDays,
}
const RECENT_ICON: Record<RecentType, typeof FileText> = {
  pyq: FileText,
  subject: BookOpen,
  quiz: GraduationCap,
  resource: FolderOpen,
}

type Tab = 'saved' | 'recent'

export function SavedPage() {
  const userId = useUserId()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('saved')

  const { data: bookmarks, isLoading } = useQuery({
    queryKey: ['bookmarks', userId],
    queryFn: () => bookmarkService.list(userId),
  })
  const { data: recents, isLoading: recentLoading } = useQuery({
    queryKey: ['recently-viewed', userId],
    queryFn: () => recentlyViewedService.list(userId),
  })

  async function removeBookmark(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    await bookmarkService.remove(userId, id)
    qc.invalidateQueries({ queryKey: ['bookmarks', userId] })
    qc.invalidateQueries({ queryKey: ['bookmark', userId] })
  }

  async function removeRecent(type: RecentType, targetId: string, e: React.MouseEvent) {
    e.stopPropagation()
    await recentlyViewedService.remove(userId, type, targetId)
    qc.invalidateQueries({ queryKey: ['recently-viewed', userId] })
  }

  async function clearRecents() {
    await recentlyViewedService.clear(userId)
    qc.invalidateQueries({ queryKey: ['recently-viewed', userId] })
  }

  function open(url: string) {
    if (/^https?:\/\//.test(url)) window.open(url, '_blank', 'noopener,noreferrer')
    else navigate(url)
  }

  return (
    <div className="page-x pb-8 pt-6">
      <ToolHeader
        title="Library" icon="notes" tone="peach"
        subtitle="Your bookmarks and the things you opened recently — pick up right where you left off."
      />

      {/* Tabs */}
      <div className="glass-standard glass-highlight relative mt-2 grid grid-cols-2 gap-1 rounded-xl p-1">
        {(['saved', 'recent'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'relative z-10 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-body-sm font-semibold transition-colors',
              tab === t ? 'bg-surface text-accent-ink shadow-soft' : 'text-ink-tertiary',
            )}
          >
            {t === 'saved' ? <Bookmark className="size-4" /> : <Clock className="size-4" />}
            {t === 'saved' ? 'Saved' : 'Recent'}
          </button>
        ))}
      </div>

      {/* SAVED */}
      {tab === 'saved' && (
        <div className="mt-4 flex flex-col gap-3">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}

          {!isLoading && (bookmarks?.length ?? 0) === 0 && (
            <Card className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
                <Bookmark className="size-7" />
              </span>
              <div>
                <p className="text-body font-semibold text-ink">Nothing saved yet</p>
                <p className="mt-1 text-body-sm text-ink-secondary">
                  Tap the bookmark icon on any content to save it for later.
                </p>
              </div>
            </Card>
          )}

          {bookmarks?.map((b) => {
            const Icon = TYPE_ICON[b.target_type]
            return (
              <Card
                key={b.id}
                as="glass"
                role="button"
                tabIndex={0}
                onClick={() => open(b.url)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && open(b.url)}
                className="glass-highlight liquid-depth flex cursor-pointer items-center gap-3"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body font-semibold text-ink">{b.title}</p>
                  {b.subtitle && (
                    <p className="truncate text-caption text-ink-tertiary">{b.subtitle}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => removeBookmark(b.id, e)}
                  aria-label="Remove"
                  className="rounded-full p-1.5 text-ink-tertiary hover:bg-danger-soft hover:text-danger"
                >
                  <X className="size-4" />
                </button>
                <ChevronRight className="size-5 shrink-0 text-ink-tertiary" aria-hidden />
              </Card>
            )
          })}
        </div>
      )}

      {/* RECENT */}
      {tab === 'recent' && (
        <div className="mt-4 flex flex-col gap-3">
          {(recents?.length ?? 0) > 0 && (
            <div className="flex justify-end">
              <button
                onClick={clearRecents}
                className="text-caption font-semibold text-ink-tertiary hover:text-danger"
              >
                Clear history
              </button>
            </div>
          )}

          {recentLoading &&
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}

          {!recentLoading && (recents?.length ?? 0) === 0 && (
            <Card className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
                <Clock className="size-7" />
              </span>
              <div>
                <p className="text-body font-semibold text-ink">No recent activity</p>
                <p className="mt-1 text-body-sm text-ink-secondary">
                  Papers and subjects you open will appear here.
                </p>
              </div>
            </Card>
          )}

          {recents?.map((r) => {
            const Icon = RECENT_ICON[r.type]
            return (
              <Card
                key={`${r.type}-${r.target_id}`}
                as="glass"
                role="button"
                tabIndex={0}
                onClick={() => open(r.url)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && open(r.url)}
                className="glass-highlight liquid-depth flex cursor-pointer items-center gap-3"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body font-semibold text-ink">{r.title}</p>
                  {r.subtitle && (
                    <p className="truncate text-caption text-ink-tertiary">{r.subtitle}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => removeRecent(r.type, r.target_id, e)}
                  aria-label="Remove"
                  className="rounded-full p-1.5 text-ink-tertiary hover:bg-danger-soft hover:text-danger"
                >
                  <X className="size-4" />
                </button>
                <ChevronRight className="size-5 shrink-0 text-ink-tertiary" aria-hidden />
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
