import { Info, ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { AppIcon } from '@/components/ui/AppIcon'
import { ToolHeader } from '@/features/tools/ToolHeader'
import { useAuth } from '@/app/providers/AuthProvider'
import { useAcademicLabels } from '@/features/profile/hooks'

/** Official BEU results portal — the single working destination. */
const BEU_RESULTS_URL = 'https://beu-bih.ac.in/result-one'
const BEU_OFFICIAL_URL = 'https://beu-bih.ac.in/'

function openResults() {
  window.open(BEU_RESULTS_URL, '_blank', 'noopener,noreferrer')
}

export function ResultsPage() {
  const { user } = useAuth()
  const { branchName, semesterName } = useAcademicLabels(
    user?.student?.branch_id,
    user?.student?.current_semester_id,
  )

  return (
    <div className="page-x pb-8 pt-6">
      <ToolHeader title="Check Result" icon="results" tone="mint" subtitle="Open your official BEU B.Tech result." />

      {/* Primary result card */}
      <Card as="strong" className="glass-sheen text-center">
        <span className="glass-highlight mx-auto flex size-16 items-center justify-center rounded-2xl bg-cat-teal-soft shadow-soft">
          <AppIcon name="results" className="size-10" />
        </span>
        <h2 className="mt-4 text-h2 text-ink">Bihar Engineering University</h2>
        <p className="mt-1 text-body-sm text-ink-secondary">
          Results open on the official BEU portal. Select your semester there and enter your
          registration number.
        </p>

        {(branchName || semesterName) && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {branchName && (
              <span className="rounded-pill bg-surface-secondary px-3 py-1 text-caption font-semibold text-ink-secondary">
                {branchName}
              </span>
            )}
            {semesterName && (
              <span className="rounded-pill bg-gold-soft px-3 py-1 text-caption font-semibold text-gold-ink">
                {semesterName}
              </span>
            )}
          </div>
        )}

        <button
          onClick={openResults}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-body font-semibold text-white transition-colors hover:bg-accent-strong"
        >
          Open BEU Result Portal
          <ExternalLink className="size-4" aria-hidden />
        </button>
      </Card>

      {/* How-to */}
      <Card className="mt-4 flex items-start gap-3">
        <Info className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
        <div>
          <p className="text-body-sm font-semibold text-ink">How to check</p>
          <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-body-sm text-ink-secondary">
            <li>Open the BEU result portal above.</li>
            <li>Choose your B.Tech semester.</li>
            <li>Enter your registration number and view your result.</li>
          </ol>
        </div>
      </Card>

      {/* Secondary link */}
      <button
        onClick={() => window.open(BEU_OFFICIAL_URL, '_blank', 'noopener,noreferrer')}
        className="mt-4 flex w-full items-center justify-between rounded-xl border border-line/70 bg-surface-secondary/60 px-4 py-3 text-left transition-colors hover:bg-surface-secondary"
      >
        <span>
          <span className="block text-body-sm font-semibold text-ink">BEU Official Website</span>
          <span className="text-caption text-ink-tertiary">beu-bih.ac.in</span>
        </span>
        <ExternalLink className="size-4 shrink-0 text-ink-tertiary" aria-hidden />
      </button>

      <p className="mt-4 px-1 text-caption text-ink-tertiary">
        BEU BABA links you to the official portal. It does not host or control result data.
      </p>
    </div>
  )
}
