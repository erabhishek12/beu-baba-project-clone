import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Mail, CheckCircle2 } from 'lucide-react'
import { AuthPanel } from './AuthPanel'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/ui/Button'
import { forgotSchema, collectErrors } from './validation'
import { authService } from '@/services/authService'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = forgotSchema.safeParse({ email })
    if (!parsed.success) {
      setError(collectErrors(parsed.error).email)
      return
    }
    setError(undefined)
    setLoading(true)
    // Always succeeds — avoids revealing whether an email is registered.
    await authService.requestPasswordReset(parsed.data.email)
    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <AuthPanel title="Check your email">
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <CheckCircle2 className="size-12 text-success" aria-hidden />
          <p className="text-body text-ink-secondary">
            If an account exists for <span className="font-semibold text-ink">{email}</span>, we've
            sent a link to reset your password.
          </p>
          <Button variant="secondary" fullWidth onClick={() => setSent(false)}>
            Use a different email
          </Button>
          <Link to="/login" className="text-body-sm font-semibold text-accent">
            Back to login
          </Link>
        </div>
      </AuthPanel>
    )
  }

  return (
    <AuthPanel
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <TextField
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          iconLeft={<Mail className="size-5" />}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (error) setError(undefined)
          }}
          error={error}
        />
        <Button type="submit" size="lg" fullWidth loading={loading}>
          Send reset link
        </Button>
      </form>
      <p className="mt-6 text-center text-body-sm text-ink-secondary">
        Remembered it?{' '}
        <Link to="/login" className="font-semibold text-accent hover:text-accent-strong">
          Login
        </Link>
      </p>
    </AuthPanel>
  )
}
