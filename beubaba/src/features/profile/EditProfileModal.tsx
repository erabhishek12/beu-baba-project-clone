import { useState } from 'react'
import { User, Phone } from 'lucide-react'
import { z } from 'zod'
import { Modal } from '@/components/glass/Modal'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/forms/TextField'
import { profileService } from '@/services/profileService'
import { useAuth } from '@/app/providers/AuthProvider'
import { useToast } from '@/components/feedback/Toast'
import { collectErrors } from '@/features/auth/validation'

const schema = z.object({
  full_name: z.string().trim().min(2, 'Enter your full name'),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[0-9\s-]{10,15}$/, 'Enter a valid contact number'),
  bio: z.string().trim().max(160, 'Keep your bio under 160 characters').optional(),
})

export function EditProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, setUser } = useAuth()
  const toast = useToast()
  const [values, setValues] = useState({
    full_name: user?.profile.full_name ?? '',
    phone: user?.profile.phone ?? '',
    bio: user?.profile.bio ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  if (!user) return null

  async function save() {
    if (!user) return
    const parsed = schema.safeParse(values)
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error))
      return
    }
    setErrors({})
    setSaving(true)
    try {
      const updated = await profileService.updateProfile(user.auth.id, {
        full_name: parsed.data.full_name,
        phone: parsed.data.phone,
        bio: parsed.data.bio || null,
      })
      setUser(updated)
      toast.success('Your profile has been updated.')
      onClose()
    } catch {
      toast.error('Could not save your changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit profile">
      <div className="flex flex-col gap-4">
        <TextField
          label="Full name"
          iconLeft={<User className="size-5" />}
          value={values.full_name}
          onChange={(e) => setValues((s) => ({ ...s, full_name: e.target.value }))}
          error={errors.full_name}
        />
        <TextField
          label="Contact number"
          type="tel"
          inputMode="tel"
          iconLeft={<Phone className="size-5" />}
          value={values.phone}
          onChange={(e) => setValues((s) => ({ ...s, phone: e.target.value }))}
          error={errors.phone}
        />
        <div>
          <label htmlFor="bio" className="mb-1.5 block text-label text-ink-secondary">
            Bio (optional)
          </label>
          <textarea
            id="bio"
            rows={3}
            maxLength={160}
            value={values.bio}
            onChange={(e) => setValues((s) => ({ ...s, bio: e.target.value }))}
            placeholder="A short line about you"
            className="w-full resize-none rounded-md border border-line bg-surface px-3.5 py-2.5 text-body text-ink outline-none placeholder:text-ink-tertiary focus:border-accent"
          />
          {errors.bio && <p className="mt-1.5 text-body-sm text-danger">{errors.bio}</p>}
        </div>
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
