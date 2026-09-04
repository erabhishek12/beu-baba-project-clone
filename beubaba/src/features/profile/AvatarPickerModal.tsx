import { useState } from 'react'
import { Check } from 'lucide-react'
import { Modal } from '@/components/glass/Modal'
import { Button } from '@/components/ui/Button'
import { ProfileImagePicker } from '@/features/auth/ProfileImagePicker'
import { charactersFor } from '@/features/auth/avatars'
import { profileService, type AvatarSelection } from '@/services/profileService'
import { useAuth } from '@/app/providers/AuthProvider'
import { useToast } from '@/components/feedback/Toast'
import type { Gender } from '@/types/domain'
import { cn } from '@/lib/cn'

/** Change the profile character or upload a new photo (in-app avatar system). */
export function AvatarPickerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, setUser } = useAuth()
  const toast = useToast()
  const [gender, setGender] = useState<Gender>(user?.profile.gender ?? 'unspecified')
  const [mode, setMode] = useState<'generated' | 'uploaded'>(
    user?.profile.avatar_type ?? 'generated',
  )
  const [charId, setCharId] = useState<string | null>(user?.profile.avatar_character_id ?? null)
  const [url, setUrl] = useState<string | null>(user?.profile.avatar_url ?? null)
  const [saving, setSaving] = useState(false)

  if (!user) return null
  const characters = charactersFor(gender)

  async function save() {
    if (!user) return
    const sel: AvatarSelection = {
      avatar_type: mode,
      avatar_character_id: mode === 'generated' ? charId : null,
      avatar_url: mode === 'uploaded' ? url : null,
      gender,
    }
    if (mode === 'generated' && !charId) return toast.error('Choose a character first.')
    if (mode === 'uploaded' && !url) return toast.error('Upload a photo first.')
    setSaving(true)
    try {
      const updated = await profileService.updateAvatar(user.auth.id, sel)
      setUser(updated)
      toast.success('Profile picture updated.')
      onClose()
    } catch {
      toast.error('Could not update your picture. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Profile picture">
      <div className="grid grid-cols-3 gap-2">
        {(['male', 'female', 'unspecified'] as Gender[]).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => {
              setGender(g)
              setCharId(null)
            }}
            className={cn(
              'rounded-md border px-2 py-2 text-body-sm font-semibold capitalize transition-colors',
              gender === g
                ? 'border-accent bg-accent-soft text-accent-ink'
                : 'border-line bg-surface text-ink-secondary hover:border-accent/40',
            )}
            aria-pressed={gender === g}
          >
            {g === 'unspecified' ? 'Any' : g}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {(['generated', 'uploaded'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setMode(t)}
            className={cn(
              'rounded-md border px-3 py-2 text-body-sm font-semibold transition-colors',
              mode === t
                ? 'border-accent bg-accent-soft text-accent-ink'
                : 'border-line bg-surface text-ink-secondary hover:border-accent/40',
            )}
            aria-pressed={mode === t}
          >
            {t === 'generated' ? 'Character' : 'Upload photo'}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {mode === 'generated' ? (
          <div className="grid grid-cols-3 gap-3">
            {characters.map((c) => {
              const selected = charId === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCharId(c.id)}
                  className={cn(
                    'relative aspect-square overflow-hidden rounded-lg border-2 transition-colors',
                    selected ? 'border-accent' : 'border-line hover:border-accent/40',
                  )}
                  aria-pressed={selected}
                >
                  <img src={c.src} alt="" className="size-full object-cover" />
                  {selected && (
                    <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-accent text-white">
                      <Check className="size-3.5" aria-hidden />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ) : (
          <ProfileImagePicker value={url} onChange={setUrl} />
        )}
      </div>

      <div className="mt-5 flex gap-3">
        <Button variant="secondary" fullWidth onClick={onClose}>
          Cancel
        </Button>
        <Button fullWidth loading={saving} onClick={save}>
          Save
        </Button>
      </div>
    </Modal>
  )
}
