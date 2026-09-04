import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { CircleButton } from '@/components/ui/CircleButton'
import { PageHero, type HeroTone } from '@/components/ui/PageHero'

/**
 * Standard sub-page header: circular soft back button + gradient banner
 * (reference-matched) carrying the page title and a one-line guide.
 */
export function ToolHeader({
  title,
  subtitle,
  tone = 'lav',
  icon,
  backTo = '/tools',
  backLabel = 'Back to tools',
}: {
  title: string
  subtitle?: string
  tone?: HeroTone
  icon?: string
  backTo?: string
  backLabel?: string
}) {
  const navigate = useNavigate()
  return (
    <header className="mb-4">
      <div className="mb-3 flex items-center justify-between">
        <CircleButton label={backLabel} onClick={() => navigate(backTo)}>
          <ChevronLeft className="size-5" aria-hidden />
        </CircleButton>
        <span className="size-11" aria-hidden />
      </div>
      <PageHero tone={tone} title={title} subtitle={subtitle} icon={icon} />
    </header>
  )
}
