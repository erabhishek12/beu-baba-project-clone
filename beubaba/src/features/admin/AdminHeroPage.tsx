import { useState } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import { ToolHeader } from '@/features/tools/ToolHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { heroService, HERO_DEFAULT, type HeroContent } from '@/services/heroService'

/**
 * Admin CMS for the student home hero banner (title, subtitle, CTA label and
 * destination). Persisted via heroService; students see changes immediately.
 */
export function AdminHeroPage() {
  const [draft, setDraft] = useState<HeroContent>(() => heroService.get())
  const [saved, setSaved] = useState(false)

  const set = (patch: Partial<HeroContent>) => {
    setDraft((d) => ({ ...d, ...patch }))
    setSaved(false)
  }

  return (
    <div className="page-x pb-10 pt-6">
      <ToolHeader
        title="Home hero"
        subtitle="Control the banner students see on the home page."
        icon="star"
        tone="violet"
        backTo="/admin"
        backLabel="Back to admin"
      />

      {/* Live preview */}
      <div className="bb-hero relative mb-4 overflow-hidden rounded-[28px] p-5 pr-24 shadow-[0_18px_38px_rgba(114,92,240,0.35)]">
        <h2 className="font-display max-w-[16ch] text-h2 leading-snug text-white">{draft.title}</h2>
        <p className="mt-1.5 max-w-[26ch] text-body-sm text-white/85">{draft.subtitle}</p>
        <span className="mt-4 inline-flex items-center gap-2 rounded-pill bg-canvas px-4 py-2 text-body-sm font-bold text-ink">
          {draft.cta}
        </span>
      </div>

      <Card className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-label font-semibold uppercase tracking-wide text-ink-tertiary">
            Title
          </span>
          <input
            value={draft.title}
            onChange={(e) => set({ title: e.target.value })}
            maxLength={60}
            className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-body text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-label font-semibold uppercase tracking-wide text-ink-tertiary">
            Subtitle
          </span>
          <input
            value={draft.subtitle}
            onChange={(e) => set({ subtitle: e.target.value })}
            maxLength={90}
            className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-body text-ink outline-none focus:border-accent"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-label font-semibold uppercase tracking-wide text-ink-tertiary">
              Button label
            </span>
            <input
              value={draft.cta}
              onChange={(e) => set({ cta: e.target.value })}
              maxLength={24}
              className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-body text-ink outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-label font-semibold uppercase tracking-wide text-ink-tertiary">
              Button links to
            </span>
            <input
              value={draft.to}
              onChange={(e) => set({ to: e.target.value })}
              maxLength={40}
              className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-body text-ink outline-none focus:border-accent"
            />
          </label>
        </div>
        <div className="flex items-center gap-3">
          <Button
            iconLeft={<Check className="size-4" />}
            onClick={() => {
              heroService.save(draft)
              setSaved(true)
            }}
          >
            Save hero
          </Button>
          <Button
            variant="secondary"
            iconLeft={<RotateCcw className="size-4" />}
            onClick={() => {
              heroService.reset()
              setDraft(HERO_DEFAULT)
              setSaved(false)
            }}
          >
            Reset
          </Button>
          {saved && <span className="text-body-sm font-semibold text-success">Saved ✓</span>}
        </div>
      </Card>
    </div>
  )
}
