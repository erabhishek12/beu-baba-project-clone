import { useQuery } from '@tanstack/react-query'
import { supportService } from '@/services/supportService'
import { useUserId } from '@/features/quiz/hooks'

/** Unread developer replies across the current user's support threads. */
export function useSupportUnread() {
  const userId = useUserId()
  return useQuery({
    queryKey: ['support-unread', userId],
    queryFn: () => supportService.unreadForUser(userId),
    refetchInterval: 5000,
  })
}
