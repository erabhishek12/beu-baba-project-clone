import { useState } from 'react'
import { KeyRound, ShieldCheck } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/feedback/Toast'
import { useAuth } from '@/app/providers/AuthProvider'
import { authService, authErrorMessage } from '@/services/authService'
import { AuthError } from '@/types/domain'
import { USE_SUPABASE } from '@/services/backend/config'

/**
 * Settings → Security: authenticated password rotation + session facts.
 * The current password is always verified by the service before rotation
 * (mock DB today, Supabase `auth.updateUser` when the backend is live).
 */
export function SecuritySection() {
  const { user } = useAuth()
  const toast = useToast()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!user) return
    if (next.length < 8) {
      setError('New password needs at least 8 characters.')
      return
    }
    if (next !== confirm) {
      setError('The new passwords do not match.')
      return
    }
    setBusy(true)
    try {
      await authService.changePassword(user.auth.id, current, next)
      setCurrent('')
      setNext('')
      setConfirm('')
      toast.success('Password updated.')
    } catch (err) {
      setError(
        err instanceof AuthError
          ? authErrorMessage(err.code)
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <h2 className="mb-2 mt-7 flex items-center gap-2 text-h3 text-ink">
        <ShieldCheck className="size-4 text-ink-tertiary" aria-hidden />
        Security
      </h2>
      <Card as="neu" className="!p-4">
        <form onSubmit={submit} className="flex flex-col gap-3">
          <p className="text-body-sm font-semibold text-ink">Change password</p>
          <TextField
            label="Current password"
            type="password"
            reveal
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
          <TextField
            label="New password"
            type="password"
            reveal
            autoComplete="new-password"
            hint="At least 8 characters."
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
          <TextField
            label="Confirm new password"
            type="password"
            reveal
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {error && (
            <p role="alert" className="text-body-sm font-semibold text-danger">
              {error}
            </p>
          )}
          <Button
            type="submit"
            variant="soft"
            loading={busy}
            disabled={!current || !next || !confirm}
            iconLeft={<KeyRound className="size-4" aria-hidden />}
            className="self-start"
          >
            Update password
          </Button>
        </form>
        <p className="mt-4 border-t border-line/60 pt-3 text-caption text-ink-tertiary">
          Sessions expire 30 days after sign-in. Sign-in backend:{' '}
          {USE_SUPABASE ? 'Supabase Auth' : 'local preview (mock)'} — five failed logins pause
          sign-in for 10 minutes.
        </p>
      </Card>
    </>
  )
}
