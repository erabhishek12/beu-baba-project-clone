import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { bookmarkService, type ToggleBookmarkInput } from '@/services/bookmarkService'
import { useToast } from '@/components/feedback/Toast'
import { useUserId } from '@/features/quiz/hooks'
import { cn } from '@/lib/cn'

/**
 * Save/unsave toggle for any content (spec §23). Reflects the persisted
 * owner-scoped bookmark state and keeps the Saved list + this control in sync
 * through the query cache.
 */
export function BookmarkButton({
  item,
  variant = 'icon',
  className,
}: {
  item: ToggleBookmarkInput
  variant?: 'icon' | 'text'
  className?: string
}) {
  const userId = useUserId()
  const qc = useQueryClient()
  const toast = useToast()

  const { data: saved = false } = useQuery({
    queryKey: ['bookmark', userId, item.target_type, item.target_id],
    queryFn: () => bookmarkService.isSaved(userId, item.target_type, item.target_id),
  })

  async function toggle(e: React.MouseEvent) {
    e.stopPropagation()
    const nowSaved = await bookmarkService.toggle(userId, item)
    qc.setQueryData(['bookmark', userId, item.target_type, item.target_id], nowSaved)
    qc.invalidateQueries({ queryKey: ['bookmarks', userId] })
    toast.info(nowSaved ? 'Saved' : 'Removed from saved')
  }

  if (variant === 'text') {
    return (
      <button
        type="button"
        onClick={toggle}
        className={cn(
          'inline-flex items-center gap-1.5 text-body-sm font-semibold transition-colors',
          saved ? 'text-accent' : 'text-ink-tertiary hover:text-ink',
          className,
        )}
      >
        {saved ? <BookmarkCheck className="size-4" aria-hidden /> : <Bookmark className="size-4" aria-hidden />}
        {saved ? 'Saved' : 'Save'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? 'Remove from saved' : 'Save'}
      aria-pressed={saved}
      className={cn(
        'flex size-9 items-center justify-center rounded-full transition-colors',
        saved ? 'text-accent hover:bg-accent-soft' : 'text-ink-tertiary hover:bg-surface-secondary hover:text-ink',
        className,
      )}
    >
      {saved ? <BookmarkCheck className="size-5" /> : <Bookmark className="size-5" />}
    </button>
  )
}
