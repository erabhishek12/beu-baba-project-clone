/**
 * "Check your inbox" screen (shown after an email signup).
 *
 * Supabase requires the address to be confirmed before it will issue a
 * session, and without a session RLS blocks every profile read and write.
 * That is exactly what produced the "Hi, Student / 33% complete / could not
 * save your changes" bug — so rather than dropping the student into a
 * half-working app, we hold them here until the address is confirmed.
 *
 * "I've verified" re-checks against the server. If it is still unconfirmed we
 * say so plainly instead of letting them through to a broken profile.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { RefreshCw, LogIn } from 'lucide-react'
import { Lottie } from '@/components/feedback/Lottie'
import { AuthPanel } from './AuthPanel'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/feedback/Toast'
import { authService } from '@/services/authService'

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [params] = useSearchParams()
  const email = params.get('email') ?? ''
  const [checking, setChecking] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Supabase enforces ~60s between confirmation emails to one address.
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  async function check() {
    setChecking(true)
    try {
      const ok = await authService.refreshVerification()
      if (ok) {
        toast.success('Email verified. Welcome!')
        navigate('/', { replace: true })
      } else {
        toast.error('Not verified yet. Open the link in your inbox, then try again.')
      }
    } catch {
      toast.error('Could not check right now. Please try again.')
    }
    setChecking(false)
  }

  async function resend() {
    if (!email) {
      toast.error('Go back to sign-in and try again.')
      return
    }
    setResending(true)
    try {
      await authService.resendConfirmation(email)
      setCooldown(60)
      toast.success('Sent again. Check your inbox and spam folder.')
    } catch (e) {
      toast.error(
        e instanceof Error && /rate/i.test(e.message)
          ? 'Too many emails just now. Wait a minute and try again.'
          : 'Could not resend. Try signing in with Google instead.',
      )
    }
    setResending(false)
  }

  return (
    <AuthPanel title="Check your inbox" subtitle="One last step before you start.">
      <div className="flex flex-col items-center gap-4 text-center">
        <Lottie
          name="verify-email"
          className="w-full max-w-[220px]"
          ariaLabel="Waiting for email verification"
        />

        <p className="text-body text-ink">
          We sent a confirmation link to{' '}
          <span className="font-semibold">{email || 'your email address'}</span>.
        </p>
        <p className="text-body-sm text-ink-secondary">
          Open it, then come back and press the button below. Your details are already saved —
          they will appear as soon as the address is confirmed.
        </p>

        <div className="mt-1 flex w-full flex-col gap-2">
          <Button loading={checking} onClick={check} fullWidth>
            <RefreshCw className="size-4" /> I&apos;ve verified — continue
          </Button>
          <Button
            variant="secondary"
            loading={resending}
            disabled={cooldown > 0}
            onClick={resend}
            fullWidth
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend the email'}
          </Button>
          <Button variant="tertiary" onClick={() => navigate('/login')} fullWidth>
            <LogIn className="size-4" /> Back to sign in
          </Button>
        </div>

        <p className="text-caption text-ink-tertiary">
          No email after a few minutes? Check spam, or sign in with Google instead — that needs
          no confirmation at all.
        </p>
      </div>
    </AuthPanel>
  )
}
