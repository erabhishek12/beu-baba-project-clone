import { useState, type FormEvent } from 'react'
import { GoogleButton } from './GoogleButton'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { AuthPanel } from './AuthPanel'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/ui/Button'
import { loginSchema, collectErrors } from './validation'
import { useAuth } from '@/app/providers/AuthProvider'
import { authErrorMessage } from '@/services/authService'
import { AuthError } from '@/types/domain'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function update(k: 'email' | 'password', v: string) {
    setValues((s) => ({ ...s, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }))
    if (serverError) setServerError(null)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = loginSchema.safeParse(values)
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error))
      return
    }
    setErrors({})
    setLoading(true)
    try {
      await login(parsed.data.email, parsed.data.password)
      navigate('/', { replace: true })
    } catch (err) {
      const code = err instanceof AuthError ? err.code : 'unknown'
      setServerError(authErrorMessage(code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPanel title="Welcome back" subtitle="Sign in to continue your studies.">
      <GoogleButton label="Continue with Google" variant="primary" />
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {serverError && (
          <div
            role="alert"
            className="rounded-md border border-danger/30 bg-danger-soft px-3.5 py-3 text-body-sm text-danger"
          >
            {serverError}
          </div>
        )}
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          iconLeft={<Mail className="size-5" />}
          value={values.email}
          onChange={(e) => update('email', e.target.value)}
          error={errors.email}
        />
        <TextField
          label="Password"
          reveal
          autoComplete="current-password"
          placeholder="Enter your password"
          iconLeft={<Lock className="size-5" />}
          value={values.password}
          onChange={(e) => update('password', e.target.value)}
          error={errors.password}
        />
        <div className="-mt-1 flex justify-end">
          <Link
            to="/forgot-password"
            className="text-body-sm font-semibold text-accent hover:text-accent-strong"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" fullWidth loading={loading}>
          Login
        </Button>
      </form>

      <p className="mt-6 text-center text-body-sm text-ink-secondary">
        New to BEU BABA?{' '}
        <Link to="/register" className="font-semibold text-accent hover:text-accent-strong">
          Create an account
        </Link>
      </p>
    </AuthPanel>
  )
}
