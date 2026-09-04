import { useEffect } from 'react'
import { recentlyViewedService, type RecentType } from '@/services/recentlyViewedService'
import { useUserId } from '@/features/quiz/hooks'

/**
 * Record a "recently viewed" entry once the item's title is known. Pass a null
 * title while loading; the effect fires only when a real title arrives.
 */
export function useRecordView(
  type: RecentType,
  targetId: string | undefined,
  title: string | null | undefined,
  opts?: { subtitle?: string | null; url?: string },
) {
  const userId = useUserId()
  useEffect(() => {
    if (!targetId || !title) return
    recentlyViewedService.record(userId, {
      type,
      target_id: targetId,
      title,
      subtitle: opts?.subtitle ?? null,
      url: opts?.url ?? window.location.pathname,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, type, targetId, title])
}
