import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { AppIcon } from '@/components/ui/AppIcon'
import { ToolHeader } from '@/features/tools/ToolHeader'
import { settingsService, type UserSettings } from '@/services/settingsService'
import { useUserId } from '@/features/quiz/hooks'
import { SecuritySection } from '@/features/settings/SecuritySection'
import { cn } from '@/lib/cn'

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-7 w-12 shrink-0 rounded-pill transition-colors',
        checked ? 'bg-accent' : 'bg-surface-secondary',
      )}
    >
      <span
        className={cn(
          'absolute left-0 top-0.5 size-6 rounded-full bg-surface shadow-[0_2px_6px_rgba(20,25,60,0.25)] ring-1 ring-line/60 transition-transform',
          checked ? 'translate-x-[22px]' : 'translate-x-[2px]',
        )}
      />
    </button>
  )
}

function Row({
  icon,
  title,
  desc,
  trailing,
  onClick,
}: {
  icon: string
  title: string
  desc?: string
  trailing?: React.ReactNode
  onClick?: () => void
}) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-3.5 text-left',
        onClick && 'transition-colors hover:bg-surface-secondary/60',
      )}
    >
      <AppIcon name={icon} className="size-10 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-body font-semibold text-ink">{title}</p>
        {desc && <p className="text-caption text-ink-tertiary">{desc}</p>}
      </div>
      {trailing}
    </Comp>
  )
}

const NOTIF_ROWS: { key: keyof UserSettings['notifications']; label: string }[] = [
  { key: 'academic', label: 'Academic updates' },
  { key: 'quiz', label: 'Quizzes' },
  { key: 'result', label: 'Results' },
  { key: 'resource', label: 'Resources' },
  { key: 'support', label: 'Support replies' },
]

export function SettingsPage() {
  const userId = useUserId()
  const navigate = useNavigate()
  const [settings, setSettings] = useState<UserSettings>(() => settingsService.get(userId))

  function update(next: UserSettings) {
    setSettings(next)
    settingsService.set(userId, next) // also applies reduce-motion to <html>
  }

  return (
    <div className="page-x pb-8 pt-6">
      <ToolHeader title="Settings" subtitle="Preferences for notifications, motion and quick actions." icon="toolbox" tone="lav" backTo="/profile" backLabel="Back to profile" />

      {/* Quick links */}
      <Card className="mt-2 divide-y divide-line/70 !p-0">
        <Row icon="bookmark" title="Saved" desc="Your bookmarked content" trailing={<ChevronRight className="size-5 text-ink-tertiary" />} onClick={() => navigate('/saved')} />
        <Row icon="resources" title="Resources" desc="Browse & share study material" trailing={<ChevronRight className="size-5 text-ink-tertiary" />} onClick={() => navigate('/resources')} />
        <Row icon="chat" title="Developer support" desc="Private help & feedback" trailing={<ChevronRight className="size-5 text-ink-tertiary" />} onClick={() => navigate('/support')} />
      </Card>

      {/* Notifications */}
      <h2 className="mb-2 mt-7 text-h3 text-ink">Notifications</h2>
      <Card className="divide-y divide-line/70 !p-0">
        {NOTIF_ROWS.map((n) => (
          <Row
            key={n.key}
            icon="notifications"
            title={n.label}
            trailing={
              <Toggle
                label={n.label}
                checked={settings.notifications[n.key]}
                onChange={(v) =>
                  update({ ...settings, notifications: { ...settings.notifications, [n.key]: v } })
                }
              />
            }
          />
        ))}
      </Card>

      {/* Security */}
      <SecuritySection />

      {/* Experience */}
      <h2 className="mb-2 mt-7 text-h3 text-ink">Experience</h2>
      <Card className="divide-y divide-line/70 !p-0">
        <Row
          icon="sparkle"
          title="Reduce motion"
          desc="Minimise animations across the app"
          trailing={
            <Toggle
              label="Reduce motion"
              checked={settings.reduceMotion}
              onChange={(v) => update({ ...settings, reduceMotion: v })}
            />
          }
        />
      </Card>

      {/* About */}
      <h2 className="mb-2 mt-7 text-h3 text-ink">About</h2>
      <Card className="divide-y divide-line/70 !p-0">
        <Row icon="info" title="About BEU BABA" desc="Version, developer & links" trailing={<ChevronRight className="size-5 text-ink-tertiary" />} onClick={() => navigate('/about')} />
        <Row icon="shield" title="Privacy Policy" desc="BEU BABA does not store your data" trailing={<ChevronRight className="size-5 text-ink-tertiary" />} onClick={() => navigate('/privacy')} />
      </Card>
    </div>
  )
}
