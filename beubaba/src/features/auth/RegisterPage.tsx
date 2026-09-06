import { useMemo, useState } from 'react'
import { GoogleButton } from './GoogleButton'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Mail, Lock, Phone, User, ArrowLeft, ArrowRight } from 'lucide-react'
import { AuthPanel } from './AuthPanel'
import { Stepper } from './Stepper'
import { TextField } from '@/components/forms/TextField'
import { SelectField } from '@/components/forms/SelectField'
import { Button } from '@/components/ui/Button'
import { ProfileImagePicker } from './ProfileImagePicker'
import { charactersFor } from './avatars'
import { academicService } from '@/services/academicService'
import {
  accountStepSchema,
  academicStepSchema,
  collectErrors,
} from './validation'
import { useAuth } from '@/app/providers/AuthProvider'
import { authErrorMessage } from '@/services/authService'
import { AuthError, type Gender } from '@/types/domain'
import { cn } from '@/lib/cn'
import { fadeUp } from '@/lib/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const STEPS = ['Account', 'Academic', 'Profile', 'Review']

interface FormState {
  full_name: string
  email: string
  phone: string
  password: string
  confirm_password: string
  course_id: string
  branch_id: string
  semester_id: string
  gender: Gender
  avatar_type: 'generated' | 'uploaded'
  avatar_character_id: string | null
  avatar_url: string | null
}

const INITIAL: FormState = {
  full_name: '',
  email: '',
  phone: '',
  password: '',
  confirm_password: '',
  course_id: '',
  branch_id: '',
  semester_id: '',
  gender: 'unspecified',
  avatar_type: 'generated',
  avatar_character_id: null,
  avatar_url: null,
}

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(INITIAL)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((s) => ({ ...s, [k]: v }))
    if (errors[k as string]) setErrors((e) => ({ ...e, [k]: '' }))
  }

  // Academic data (data-driven selectors)
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => academicService.listCourses(),
  })
  const { data: branches = [] } = useQuery({
    queryKey: ['branches', form.course_id],
    queryFn: () => academicService.listBranches(form.course_id || undefined),
    enabled: step >= 1,
  })
  const { data: semesters = [] } = useQuery({
    queryKey: ['semesters'],
    queryFn: () => academicService.listSemesters(),
    enabled: step >= 1,
  })

  // Default the single course automatically.
  const courseOptions = courses.map((c) => ({ value: c.id, label: c.name }))
  const branchOptions = branches.map((b) => ({ value: b.id, label: b.name }))
  const semesterOptions = semesters.map((s) => ({ value: s.id, label: s.label }))

  const characters = useMemo(() => charactersFor(form.gender), [form.gender])

  function validateStep(): boolean {
    if (step === 0) {
      const r = accountStepSchema.safeParse(form)
      if (!r.success) {
        setErrors(collectErrors(r.error))
        return false
      }
    }
    if (step === 1) {
      const courseId = form.course_id || courses[0]?.id || ''
      const candidate = { ...form, course_id: courseId }
      const r = academicStepSchema.safeParse(candidate)
      if (!r.success) {
        setErrors(collectErrors(r.error))
        return false
      }
      if (courseId !== form.course_id) set('course_id', courseId)
    }
    if (step === 2) {
      // A photo is the preferred avatar, but it is optional: if the student
      // skips it we pick a character that matches their gender automatically,
      // so nobody is blocked at signup by an avatar choice.
      if (form.avatar_type === 'uploaded' && !form.avatar_url) {
        setErrors({ avatar: 'Please choose a photo, or continue without one.' })
        return false
      }
      if (form.avatar_type !== 'uploaded' && !form.avatar_character_id) {
        const pool = charactersFor(form.gender)
        const picked = pool[Math.floor(Math.random() * pool.length)]
        if (picked) {
          set('avatar_type', 'generated')
          set('avatar_character_id', picked.id)
        }
      }
    }
    setErrors({})
    return true
  }

  function next() {
    if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }
  function back() {
    setServerError(null)
    setStep((s) => Math.max(s - 1, 0))
  }

  async function submit() {
    setServerError(null)
    setSubmitting(true)
    try {
      const created = await register({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        course_id: form.course_id || courses[0]?.id || '',
        branch_id: form.branch_id,
        semester_id: form.semester_id,
        gender: form.gender,
        avatar_type: form.avatar_type,
        avatar_character_id: form.avatar_character_id,
        avatar_url: form.avatar_url,
      })
      // If the project requires email confirmation there is no session yet, so
      // the app would show a placeholder profile and refuse to save changes.
      // Hold them on the verify screen until the address is confirmed.
      if (created && !created.auth.email_verified) {
        navigate(`/verify-email?email=${encodeURIComponent(form.email)}`, { replace: true })
        return
      }
      navigate('/', { replace: true })
    } catch (err) {
      const code = err instanceof AuthError ? err.code : 'unknown'
      setServerError(authErrorMessage(code))
      if (code === 'email_taken') setStep(0)
    } finally {
      setSubmitting(false)
    }
  }

  const branchName = branches.find((b) => b.id === form.branch_id)?.name
  const semName = semesters.find((s) => s.id === form.semester_id)?.label

  return (
    <AuthPanel title="Create your account" subtitle="A few quick steps to get set up.">
      {step === 0 && <GoogleButton label="Sign up with Google" variant="primary" />}
      <Stepper steps={STEPS} current={step} />

      {serverError && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-danger/30 bg-danger-soft px-3.5 py-3 text-body-sm text-danger"
        >
          {serverError}
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          variants={reduced ? undefined : fadeUp}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <TextField
                label="Full name"
                autoComplete="name"
                placeholder="Your full name"
                iconLeft={<User className="size-5" />}
                value={form.full_name}
                onChange={(e) => set('full_name', e.target.value)}
                error={errors.full_name}
              />
              <TextField
                label="Email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                iconLeft={<Mail className="size-5" />}
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                error={errors.email}
              />
              <TextField
                label="Contact number"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="10-digit mobile number"
                iconLeft={<Phone className="size-5" />}
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                error={errors.phone}
              />
              <TextField
                label="Password"
                reveal
                autoComplete="new-password"
                placeholder="At least 8 characters"
                iconLeft={<Lock className="size-5" />}
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                error={errors.password}
                hint={!errors.password ? 'Use letters and numbers.' : undefined}
              />
              <TextField
                label="Confirm password"
                reveal
                autoComplete="new-password"
                placeholder="Re-enter your password"
                iconLeft={<Lock className="size-5" />}
                value={form.confirm_password}
                onChange={(e) => set('confirm_password', e.target.value)}
                error={errors.confirm_password}
              />
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <SelectField
                label="Course"
                placeholder="Select your course"
                options={courseOptions}
                value={form.course_id || courses[0]?.id || ''}
                onChange={(e) => set('course_id', e.target.value)}
                error={errors.course_id}
              />
              <SelectField
                label="Branch"
                placeholder="Select your branch"
                options={branchOptions}
                value={form.branch_id}
                onChange={(e) => set('branch_id', e.target.value)}
                error={errors.branch_id}
              />
              <SelectField
                label="Current semester"
                placeholder="Select your semester"
                options={semesterOptions}
                value={form.semester_id}
                onChange={(e) => set('semester_id', e.target.value)}
                error={errors.semester_id}
              />
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5">
              {/* Gender (explicit, drives character set) */}
              <fieldset>
                <legend className="mb-1.5 text-label text-ink-secondary">Gender</legend>
                <div className="grid grid-cols-3 gap-2">
                  {(['male', 'female', 'unspecified'] as Gender[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        set('gender', g)
                        set('avatar_character_id', null)
                      }}
                      className={cn(
                        'rounded-md border px-3 py-2.5 text-body-sm font-semibold capitalize transition-colors',
                        form.gender === g
                          ? 'border-accent bg-accent-soft text-accent-ink'
                          : 'border-line bg-surface text-ink-secondary hover:border-accent/40',
                      )}
                      aria-pressed={form.gender === g}
                    >
                      {g === 'unspecified' ? 'Prefer not to say' : g}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/*
                Photo is the priority (spec change): the student is only shown
                "Upload a photo". If they skip it we assign a character that
                matches their gender automatically in validate(), so the choice
                never blocks signup.
              */}
              <ProfileImagePicker
                value={form.avatar_url}
                onChange={(url) => {
                  set('avatar_url', url)
                  // Choosing a photo makes it the avatar; clearing it falls back
                  // to an auto-assigned character on continue.
                  set('avatar_type', url ? 'uploaded' : 'generated')
                }}
              />
              <p className="text-caption text-ink-tertiary">
                Optional — if you skip this we will pick a character for you.
              </p>
              {errors.avatar && (
                <p role="alert" className="text-body-sm text-danger">
                  {errors.avatar}
                </p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <ReviewRow label="Full name" value={form.full_name} />
              <ReviewRow label="Email" value={form.email} />
              <ReviewRow label="Contact number" value={form.phone} />
              <ReviewRow label="Course" value={courses[0]?.name ?? '—'} />
              <ReviewRow label="Branch" value={branchName ?? '—'} />
              <ReviewRow label="Semester" value={semName ?? '—'} />
              <div className="flex items-center gap-3 rounded-md border border-line bg-surface p-3">
                <img
                  src={
                    form.avatar_type === 'uploaded' && form.avatar_url
                      ? form.avatar_url
                      : characters.find((c) => c.id === form.avatar_character_id)?.src
                  }
                  alt="Chosen avatar"
                  className="size-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-body-sm font-semibold text-ink">Profile picture</p>
                  <p className="text-caption text-ink-tertiary">
                    {form.avatar_type === 'uploaded' ? 'Uploaded photo' : 'Selected character'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="mt-6 flex items-center gap-3">
        {step > 0 && (
          <Button
            type="button"
            variant="secondary"
            onClick={back}
            iconLeft={<ArrowLeft className="size-4" />}
          >
            Back
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            fullWidth
            onClick={next}
            iconRight={<ArrowRight className="size-4" />}
          >
            Continue
          </Button>
        ) : (
          <Button type="button" fullWidth loading={submitting} onClick={submit}>
            Create account
          </Button>
        )}
      </div>

      <p className="mt-6 text-center text-body-sm text-ink-secondary">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-accent hover:text-accent-strong">
          Login
        </Link>
      </p>
    </AuthPanel>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-line pb-2 last:border-0">
      <span className="text-body-sm text-ink-tertiary">{label}</span>
      <span className="text-body-sm font-semibold text-ink">{value}</span>
    </div>
  )
}
