import type { AvatarCharacter, Gender } from '@/types/domain'

/**
 * Approved BEU BABA character collection.
 * Gender is chosen explicitly by the user (never inferred from a photo).
 * These are application avatars, not a security identity.
 */
export const AVATAR_CHARACTERS: AvatarCharacter[] = [
  { id: 'male_01', gender: 'male', label: 'Clay boy', src: '/assets/avatars/boy_clay.webp' },
  { id: 'female_01', gender: 'female', label: 'Clay girl', src: '/assets/avatars/girl_clay.webp' },
]

export function charactersFor(gender: Gender): AvatarCharacter[] {
  if (gender === 'male' || gender === 'female') {
    return AVATAR_CHARACTERS.filter((c) => c.gender === gender)
  }
  return AVATAR_CHARACTERS
}

export function characterById(id?: string | null): AvatarCharacter | undefined {
  if (!id) return undefined
  return AVATAR_CHARACTERS.find((c) => c.id === id)
}
