import { User } from 'lucide-react'
import { cn } from '@/lib/cn'
import { characterById } from '@/features/auth/avatars'
import type { Profile } from '@/types/domain'

const SIZE = {
  sm: 'size-9',
  md: 'size-12',
  lg: 'size-16',
  xl: 'size-24',
} as const

/** Resolves a profile's avatar (uploaded image or selected character). */
export function resolveAvatar(profile: Pick<Profile, 'avatar_type' | 'avatar_url' | 'avatar_character_id'>) {
  if (profile.avatar_type === 'uploaded' && profile.avatar_url) return profile.avatar_url
  return characterById(profile.avatar_character_id)?.src
}

export function Avatar({
  profile,
  size = 'md',
  className,
}: {
  profile: Pick<Profile, 'avatar_type' | 'avatar_url' | 'avatar_character_id' | 'full_name'>
  size?: keyof typeof SIZE
  className?: string
}) {
  const src = resolveAvatar(profile)
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--glass-border-strong)] bg-surface-secondary shadow-soft',
        SIZE[size],
        className,
      )}
    >
      {src ? (
        <img src={src} alt={profile.full_name} className="size-full object-cover" />
      ) : (
        <User className="size-1/2 text-ink-tertiary" aria-hidden />
      )}
    </span>
  )
}
