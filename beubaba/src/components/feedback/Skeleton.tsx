import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/** Neutral shimmer placeholder. Prefer skeletons over full-screen spinners. */
export function Skeleton({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('skeleton animate-skeleton rounded-md', className)}
      aria-hidden
      {...rest}
    />
  )
}
