import { FileText, LinkIcon, FileImage, StickyNote, File, ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import type { Resource, ResourceType } from '@/types/domain'
import { recentlyViewedService } from '@/services/recentlyViewedService'
import { useUserId } from '@/features/quiz/hooks'

const TYPE_ICON: Record<ResourceType, typeof FileText> = {
  notes: StickyNote,
  pdf: FileText,
  question_paper: File,
  image: FileImage,
  link: LinkIcon,
  other: File,
}

const TYPE_LABEL: Record<ResourceType, string> = {
  notes: 'Notes',
  pdf: 'PDF',
  question_paper: 'Question paper',
  image: 'Image',
  link: 'Link',
  other: 'Resource',
}

export function ResourceCard({ resource }: { resource: Resource }) {
  const Icon = TYPE_ICON[resource.type]
  const href = resource.url ?? resource.attachment?.dataUrl
  const isExternal = !!resource.url
  const userId = useUserId()

  function recordOpen() {
    recentlyViewedService.record(userId, {
      type: 'resource',
      target_id: resource.id,
      title: resource.title,
      subtitle: resource.subject_name || TYPE_LABEL[resource.type],
      url: href ?? '/resources',
    })
  }

  const inner = (
    <Card as="glass" className="flex h-full flex-col gap-3 transition-transform active:scale-[0.99]">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-body font-semibold text-ink">{resource.title}</p>
          <p className="mt-0.5 text-caption text-ink-tertiary">
            {resource.subject_name || TYPE_LABEL[resource.type]}
            {resource.semester ? ` · Sem ${resource.semester}` : ''}
          </p>
        </div>
        {isExternal && <ExternalLink className="size-4 shrink-0 text-ink-tertiary" aria-hidden />}
      </div>
      {resource.description && (
        <p className="line-clamp-2 text-body-sm text-ink-secondary">{resource.description}</p>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-1.5">
        <Pill tone="neutral">{TYPE_LABEL[resource.type]}</Pill>
        {resource.tags.slice(0, 2).map((t) => (
          <Pill key={t} tone="accent">
            {t}
          </Pill>
        ))}
        <span className="ml-auto text-caption text-ink-tertiary">by {resource.owner_name}</span>
      </div>
    </Card>
  )

  if (!href) return inner
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={recordOpen}
      className="block h-full"
    >
      {inner}
    </a>
  )
}
