import { ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/Card'

/**
 * A single external-destination row. Opens a plain, safe URL in a new tab.
 * Communicates clearly that the destination is outside BEU BABA (spec §24:
 * distinguish app content from external content; never fake ownership).
 */
export function LinkRow({
  name,
  url,
  desc,
  leading,
}: {
  name: string
  url: string
  desc?: string
  leading?: React.ReactNode
}) {
  return (
    <Card
      as="glass"
      className="flex cursor-pointer items-center gap-3 transition-transform active:scale-[0.99]"
      role="link"
      tabIndex={0}
      onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
      onKeyDown={(e) =>
        (e.key === 'Enter' || e.key === ' ') &&
        window.open(url, '_blank', 'noopener,noreferrer')
      }
    >
      {leading}
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-semibold text-ink">{name}</p>
        {desc && <p className="mt-0.5 line-clamp-1 text-body-sm text-ink-secondary">{desc}</p>}
        <p className="mt-0.5 truncate text-caption text-ink-tertiary">
          {hostOf(url)}
        </p>
      </div>
      <ExternalLink className="size-4 shrink-0 text-ink-tertiary" aria-hidden />
    </Card>
  )
}

function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return url
  }
}
