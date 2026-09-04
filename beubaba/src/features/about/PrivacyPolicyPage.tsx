import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ShieldCheck, Lock, EyeOff, Database, UserCheck, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'

/**
 * Privacy Policy (spec §72). Written plainly and honestly for students: the app
 * is data-light by design — academic content is read-only reference data, and
 * the little personal data there is (profile, saved items, quiz attempts) stays
 * scoped to the signed-in account. No selling, no tracking, no ads.
 */

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Lock
  title: string
  children: React.ReactNode
}) {
  return (
    <Card as="glass" className="liquid-depth glass-highlight flex gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-body font-semibold text-ink">{title}</h2>
        <div className="mt-1 space-y-2 text-body-sm leading-relaxed text-ink-secondary">
          {children}
        </div>
      </div>
    </Card>
  )
}

export function PrivacyPolicyPage() {
  const navigate = useNavigate()
  return (
    <div className="page-x pb-10 pt-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-3 flex items-center gap-1 text-body-sm font-semibold text-ink-secondary"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Back
      </button>

      {/* Hero promise */}
      <Card as="strong" className="glass-highlight flex flex-col items-center gap-3 py-8 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <ShieldCheck className="size-8" aria-hidden />
        </span>
        <div>
          <h1 className="text-h1 text-ink">Your data is safe</h1>
          <p className="mx-auto mt-2 max-w-md text-body-sm text-ink-secondary">
            <span className="font-semibold text-ink">BEU BABA does not store your data.</span> The
            app is built to be data-light — there are no ads, no trackers, and nothing about you is
            sold or shared. Your information stays yours.
          </p>
        </div>
      </Card>

      <p className="mt-4 px-1 text-caption text-ink-tertiary">Last updated: 2 September 2026</p>

      <div className="mt-4 flex flex-col gap-3">
        <Section icon={Database} title="What we keep — and where">
          <p>
            The academic content in the app (syllabus, previous papers, quizzes, exam info) is
            public reference data — it is not about you.
          </p>
          <p>
            The only personal information is what you enter yourself: your name, email, academic
            details, saved items, quiz attempts and any support messages. In this version of the
            app, that information lives <span className="font-semibold text-ink">on your own
            device</span>, scoped to your account — it is not uploaded to any BEU BABA server.
          </p>
        </Section>

        <Section icon={Lock} title="It stays scoped to you">
          <p>
            Everything personal is tied to your account and read back only for you. One student's
            saved items, results or support chats are never shown to another account on the same
            device.
          </p>
        </Section>

        <Section icon={EyeOff} title="No tracking, no ads, no selling">
          <p>
            We don't run advertising, we don't embed third-party trackers or analytics that profile
            you, and we never sell or rent your information to anyone. There is no hidden data
            collection.
          </p>
        </Section>

        <Section icon={UserCheck} title="You're in control">
          <p>
            You can edit your profile and academic details at any time, and remove anything you've
            saved. When you sign out, your session ends on that device.
          </p>
        </Section>

        <Section icon={Trash2} title="Deleting your data">
          <p>
            Because your data is stored locally and scoped to your account, clearing it removes it
            for good. You can remove saved items and support conversations from within the app, and
            signing out clears your active session.
          </p>
        </Section>

        <Section icon={ShieldCheck} title="Content you contribute">
          <p>
            If you share a resource or send a support message, only the developer team reviews it —
            support conversations are private between you and the team. Nothing you submit is made
            public without moderation.
          </p>
        </Section>

        <Section icon={UserCheck} title="Questions?">
          <p>
            Have a privacy question or a request about your data? Reach out through{' '}
            <button
              onClick={() => navigate('/support')}
              className="font-semibold text-accent underline-offset-2 hover:underline"
            >
              Developer Support
            </button>{' '}
            inside the app and the team will help.
          </p>
        </Section>
      </div>

      <p className="mt-6 text-center text-caption text-ink-tertiary">
        BEU BABA is built by students, for students — with your privacy respected by default.
      </p>
    </div>
  )
}
