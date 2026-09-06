/**
 * External study collaboration (spec §22).
 *
 * A dedicated section for study sites that live OUTSIDE BEU BABA. The spec is
 * firm that these must be "clearly labelled as external destinations", so every
 * card says so, shows the real domain, and opens in a new tab with
 * `rel="noopener noreferrer"`.
 *
 * The links are managed centrally in the `external_links` table (spec: "must be
 * centrally managed where practical"), so they can be changed without a
 * release. The three required sites are used as a fallback if the table cannot
 * be read, so the section is never empty.
 */
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ExternalLink, ShieldAlert } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Skeleton } from '@/components/feedback/Skeleton'
import { USE_SUPABASE } from '@/services/backend/config'
import { getSupabase } from '@/services/backend/supabaseClient'

interface Link {
  key: string
  label: string
  url: string
  description: string | null
  category: string | null
}

/** The three sites the spec names, used when the table is unavailable. */
const FALLBACK: Link[] = [
  {
    key: 'doubt_desk',
    label: 'Doubt Desk',
    url: 'https://doubt-desk.onrender.com',
    description: 'Ask academic doubts and get help from others.',
    category: 'study',
  },
  {
    key: 'javasourcecode',
    label: 'JavaSourceCode',
    url: 'http://javasourcecode.in/',
    description: 'B.Tech resources, notes, programming material and previous papers.',
    category: 'study',
  },
  {
    key: 'study_hub',
    label: 'Study Hub',
    url: 'https://erabhi.in/studyHub/',
    description: 'Extra study material and resources.',
    category: 'study',
  },
]

/** Real logos pulled from each partner site, normalised to square tiles. */
const LOGOS: Record<string, string> = {
  doubt_desk: '/assets/partners/doubt-desk.webp',
  javasourcecode: '/assets/partners/javasourcecode.webp',
  study_hub: '/assets/partners/study-hub.webp',
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function CollaboratePage() {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['external-links', 'study'],
    queryFn: async (): Promise<Link[]> => {
      if (!USE_SUPABASE) return FALLBACK
      const { data, error } = await getSupabase()
        .from('external_links')
        .select('key,label,url,description,category')
        .eq('is_active', true)
        .eq('category', 'study')
        .order('display_order', { ascending: true })
      if (error || !data?.length) return FALLBACK
      return data as Link[]
    },
  })

  const links = data ?? []

  return (
    <div className="page-x pb-24 pt-4">
      <button
        onClick={() => navigate('/tools')}
        className="mb-2 flex items-center gap-1 text-label text-ink-secondary"
      >
        <ChevronLeft className="size-4" /> Tools
      </button>

      <h1 className="text-h1 text-ink">Study collaboration</h1>
      <p className="mt-1 text-body-sm text-ink-secondary">
        Helpful study websites run outside BEU BABA. Each one opens in a new tab.
      </p>

      <Card className="mt-4 flex items-start gap-2 px-4 py-3">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning" />
        <p className="text-body-sm text-ink-secondary">
          These are <span className="font-semibold text-ink">external sites</span>. BEU BABA does
          not control their content, and your BEU BABA account is not shared with them.
        </p>
      </Card>

      {isLoading && (
        <div className="mt-4 flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {links.map((l) => (
          <a
            key={l.key}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Card className="flex items-center gap-3 px-4 py-4">
              {LOGOS[l.key] ? (
                <img
                  src={LOGOS[l.key]}
                  alt=""
                  className="size-12 shrink-0 rounded-2xl bg-surface-secondary object-contain p-1.5 ring-1 ring-line"
                />
              ) : (
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-surface-secondary ring-1 ring-line">
                  <ExternalLink className="size-5 text-ink-tertiary" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-body font-semibold text-ink">{l.label}</span>
                  <Pill>External</Pill>
                </div>
                {l.description && (
                  <p className="mt-0.5 line-clamp-2 text-body-sm text-ink-secondary">
                    {l.description}
                  </p>
                )}
                <p className="mt-1 truncate text-label text-ink-tertiary">{domainOf(l.url)}</p>
              </div>
              <ExternalLink className="size-4 shrink-0 text-ink-tertiary" />
            </Card>
          </a>
        ))}
      </div>
    </div>
  )
}
