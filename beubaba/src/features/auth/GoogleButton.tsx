/**
 * "Continue with Google" — the fastest, most reliable way in.
 *
 * Why this matters here: Supabase's built-in mailer sends only 2 emails per
 * hour for the WHOLE project and delivers to team addresses only, so email
 * signup silently failed for real students. Google involves no email delivery
 * at all — Google has already verified the address, so the account is
 * confirmed and a session exists immediately.
 *
 * Uses the app's existing surfaces; the only new thing is the Google mark,
 * which must keep its brand colours to satisfy Google's branding rules.
 */
import { useState } from 'react'
import { authService } from '@/services/authService'
import { useToast } from '@/components/feedback/Toast'

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden focusable="false">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.4 14.4 0 0 1 9.77 24c0-1.6.28-3.14.76-4.59l-7.98-6.19A23.97 23.97 0 0 0 0 24c0 3.88.93 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.9-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}

export function GoogleButton({
  label = 'Continue with Google',
  /** `primary` renders it ABOVE the email form as the recommended path. */
  variant = 'secondary',
}: {
  label?: string
  variant?: 'primary' | 'secondary'
}) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  async function go() {
    setBusy(true)
    try {
      // Redirects away from the app; the promise resolves before that happens.
      await authService.signInWithGoogle()
    } catch (e) {
      setBusy(false)
      toast.error(
        e instanceof Error && /backend/i.test(e.message)
          ? e.message
          : 'Google sign-in is not enabled yet. Ask the developer to switch it on.',
      )
    }
  }

  const divider = (
    <div className="my-4 flex items-center gap-3">
      <span className="h-px flex-1 bg-line" />
      <span className="text-caption text-ink-tertiary">
        {variant === 'primary' ? 'or use email' : 'or'}
      </span>
      <span className="h-px flex-1 bg-line" />
    </div>
  )

  const button = (
    <>
      <button
        type="button"
        onClick={go}
        disabled={busy}
        className={
          variant === 'primary'
            ? 'flex w-full items-center justify-center gap-2.5 rounded-xl border-2 border-accent bg-surface px-4 py-3.5 text-body font-bold text-ink shadow-neu-sm transition-colors hover:bg-accent-soft disabled:opacity-60'
            : 'flex w-full items-center justify-center gap-2.5 rounded-xl border border-line bg-surface px-4 py-3 text-body font-semibold text-ink transition-colors hover:border-accent/40 disabled:opacity-60'
        }
      >
        <GoogleMark />
        {busy ? 'Opening Google…' : label}
      </button>
      <p className="mt-2 text-center text-caption text-ink-tertiary">
        {variant === 'primary'
          ? 'Recommended — one tap, no password, no confirmation email.'
          : 'Fastest way in — no password, no confirmation email.'}
      </p>
    </>
  )

  // Primary: button first, then the divider leading into the email form.
  return <div>{variant === 'primary' ? <>{button}{divider}</> : <>{divider}{button}</>}</div>
}
