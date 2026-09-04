import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/feedback/Skeleton'
import { ToolHeader } from '@/features/tools/ToolHeader'
import { LinkRow } from '@/features/tools/LinkRow'
import { toolsService } from '@/services/toolsService'
import { AppIcon, type AppIconName } from '@/components/ui/AppIcon'

const GROUP_ICON: Record<string, AppIconName> = {
  results: 'results',
  official: 'colleges',
  learning: 'courses',
  scholarship: 'medal',
}


export function PortalsPage() {
  const { data: groups, isLoading } = useQuery({
    queryKey: ['portals'],
    queryFn: () => toolsService.listPortals(),
  })

  // Results has its own dedicated page; skip it here.
  const shown = groups?.filter((g) => g.key !== 'results')

  return (
    <div className="page-x pb-8 pt-6">
      <ToolHeader
        title="Important Portals" icon="portals" tone="lav"
        subtitle="Official BEU services, learning platforms and scholarships."
      />

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {shown?.map((g) => {
        const iconName: AppIconName = GROUP_ICON[g.key] ?? 'colleges'
        return (
          <section key={g.key} className="mb-6">
            <h2 className="mb-3 px-1 text-label uppercase tracking-wide text-ink-tertiary">
              {g.title}
            </h2>
            <div className="flex flex-col gap-3">
              {g.items.map((item) => (
                <LinkRow
                  key={item.url}
                  name={item.name}
                  url={item.url}
                  desc={item.desc}
                  leading={<AppIcon name={iconName} className="size-10 shrink-0" />}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
