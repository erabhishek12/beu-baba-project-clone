/**
 * Complete-your-profile step (shown after Google sign-in).
 *
 * Google gives us an email, a name and a photo — but not the things the app is
 * organised around: branch and semester. Without those the Quiz tab cannot
 * filter to the student's own subjects, so dropping a Google user straight
 * into the app leaves them looking at an empty, broken-feeling product.
 *
 * Google users therefore land here first. Name and photo are pre-filled and
 * editable; contact, branch and semester are required. Saving flips
 * `onboarding_completed`, after which the guard stops redirecting here.
 *
 * Uses the existing form components — no new design language.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { User, Phone, ArrowRight } from 'lucide-react'
import { AuthPanel } from './AuthPanel'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/forms/TextField'
import { ProfileImagePicker } from './ProfileImagePicker'
import { useToast } from '@/components/feedback/Toast'
import { useAuth } from '@/app/providers/AuthProvider'
import { profileService } from '@/services/profileService'
import { academicService } from '@/services/academicService'
import { charactersFor } from './avatars'
import type { Gender } from '@/types/domain'

const GENDERS: Gender[] = ['male', 'female', 'unspecified']

export function CompleteProfilePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user, refresh } = useAuth()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState<Gender>('unspecified')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [branchId, setBranchId] = useState('')
  const [semesterId, setSemesterId] = useState('')
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  /**
   * Prefill from whatever Google gave us — ONCE.
   *
   * `user` is a fresh object on each auth render, so depending on it re-ran
   * this effect forever ("Maximum update depth exceeded", blank screen).
   * Keying on the stable user id and guarding with a ref fixes it.
   */
  const prefilled = useRef<string | null>(null)
  const userId = user?.auth.id ?? null
  useEffect(() => {
    if (!user || !userId || prefilled.current === userId) return
    prefilled.current = userId
    setFullName(user.profile.full_name === 'Student' ? '' : (user.profile.full_name ?? ''))
    setPhone(user.profile.phone ?? '')
    setAvatarUrl(user.profile.avatar_url ?? null)
    setGender(user.profile.gender ?? 'unspecified')
    setBranchId(user.student?.branch_id ?? '')
    setSemesterId(user.student?.current_semester_id ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: () => academicService.listBranches(),
  })
  const { data: semesters } = useQuery({
    queryKey: ['semesters'],
    queryFn: () => academicService.listSemesters(),
  })

  const characters = useMemo(() => charactersFor(gender), [gender])

  async function save() {
    const next: Record<string, string> = {}
    if (fullName.trim().length < 2) next.full_name = 'Enter your full name'
    if (!/^[+]?[0-9\s-]{10,15}$/.test(phone.trim())) next.phone = 'Enter a valid contact number'
    if (!branchId) next.branch = 'Choose your branch'
    if (!semesterId) next.semester = 'Choose your semester'
    setErrors(next)
    if (Object.keys(next).length) return
    if (!user) return

    setBusy(true)
    try {
      // No photo? Assign a character matching their gender so the profile is
      // never left half-finished.
      let avatarCharacter: string | null = user.profile.avatar_character_id ?? null
      if (!avatarUrl && !avatarCharacter) {
        avatarCharacter = characters[Math.floor(Math.random() * characters.length)]?.id ?? null
      }

      await profileService.updateProfile(user.auth.id, {
        full_name: fullName.trim(),
        phone: phone.trim(),
        bio: user.profile.bio ?? null,
      })
      await profileService.updateAvatar(user.auth.id, {
        avatar_type: avatarUrl ? 'uploaded' : 'generated',
        avatar_url: avatarUrl,
        avatar_character_id: avatarUrl ? null : avatarCharacter,
        gender,
      })
      await profileService.updateAcademic(user.auth.id, {
        branch_id: branchId,
        current_semester_id: semesterId,
      })
      await profileService.completeOnboarding(user.auth.id)
      await refresh()
      toast.success('Profile saved. Welcome to BEU BABA!')
      navigate('/', { replace: true })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save your profile.')
    }
    setBusy(false)
  }

  return (
    <AuthPanel
      title="Finish setting up"
      subtitle="A few details so we can show the right subjects for you."
    >
      <div className="flex flex-col gap-4">
        <ProfileImagePicker value={avatarUrl} onChange={setAvatarUrl} />
        <p className="-mt-2 text-center text-caption text-ink-tertiary">
          Optional — we will pick a character if you skip it.
        </p>

        <TextField
          label="Full name"
          iconLeft={<User className="size-5" />}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.full_name}
        />

        <TextField
          label="Contact number"
          type="tel"
          inputMode="tel"
          iconLeft={<Phone className="size-5" />}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
        />

        <fieldset>
          <legend className="mb-1.5 text-label text-ink-secondary">Gender</legend>
          <div className="grid grid-cols-3 gap-2">
            {GENDERS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`rounded-md border px-2 py-2.5 text-caption font-semibold capitalize transition-colors ${
                  gender === g
                    ? 'border-accent bg-accent-soft text-accent-ink'
                    : 'border-line bg-surface text-ink-secondary'
                }`}
                aria-pressed={gender === g}
              >
                {g === 'unspecified' ? 'Prefer not to say' : g}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="cp-branch" className="mb-1.5 block text-label text-ink-secondary">
            Branch
          </label>
          <select
            id="cp-branch"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className="w-full rounded-xl bg-surface-secondary px-3 py-2.5 text-body text-ink ring-1 ring-line focus:ring-accent"
          >
            <option value="">Select your branch</option>
            {(branches ?? []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          {errors.branch && (
            <p role="alert" className="mt-1 text-body-sm text-danger">
              {errors.branch}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="cp-sem" className="mb-1.5 block text-label text-ink-secondary">
            Semester
          </label>
          <select
            id="cp-sem"
            value={semesterId}
            onChange={(e) => setSemesterId(e.target.value)}
            className="w-full rounded-xl bg-surface-secondary px-3 py-2.5 text-body text-ink ring-1 ring-line focus:ring-accent"
          >
            <option value="">Select your semester</option>
            {(semesters ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.label ?? `Semester ${s.number}`}
              </option>
            ))}
          </select>
          {errors.semester && (
            <p role="alert" className="mt-1 text-body-sm text-danger">
              {errors.semester}
            </p>
          )}
        </div>

        <Button loading={busy} onClick={save} fullWidth>
          Start using BEU BABA <ArrowRight className="size-4" />
        </Button>
      </div>
    </AuthPanel>
  )
}
