/**
 * AI assistant management (admin spec §17).
 *
 * Two things matter here: seeing which intents exist, and — more useful —
 * seeing the questions students asked that the assistant could NOT answer.
 * That list is how the catalogue grows from real usage instead of guesswork.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, Search, MessageCircleQuestion, Bot } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/feedback/Skeleton'
import { adminService } from '@/services/adminService'

export function AdminAssistantPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'intents' | 'unanswered'>('intents')
  const [search, setSearch] = useState('')
  const [term, setTerm] = useState('')

  const { data: intents, isLoading: li } = useQuery({
    queryKey: ['admin-intents', term],
    queryFn: () => adminService.intents(term),
    enabled: tab === 'intents',
  })
  const { data: unans, isLoading: lu } = useQuery({
    queryKey: ['admin-unanswered'],
    queryFn: () => adminService.unanswered(),
    enabled: tab === 'unanswered',
  })

  const chip = (a: boolean) =>
    `rounded-pill px-3 py-1.5 text-caption font-bold ${
      a ? 'bg-accent text-white' : 'bg-surface text-ink-secondary ring-1 ring-line'
    }`

  // Group intents by category so 500 rows are navigable.
  const grouped = (intents ?? []).reduce<Record<string, Record<string, unknown>[]>>((acc, i) => {
    const c = String(i.category ?? 'other')
    acc[c] = [...(acc[c] ?? []), i]
    return acc
  }, {})

  return (
    <div className="page-x pb-24 pt-4">
      <button
        onClick={() => navigate('/admin')}
        className="mb-2 flex items-center gap-1 text-label text-ink-secondary"
      >
        <ChevronLeft className="size-4" /> Admin
      </button>
      <h1 className="text-h1 text-ink">AI assistant</h1>
      <p className="mt-1 text-body-sm text-ink-secondary">
        What the assistant knows, and what students asked that it could not answer.
      </p>

      <div className="mt-3 flex gap-2">
        <button onClick={() => setTab('intents')} className={chip(tab === 'intents')}>
          <Bot className="mr-1 inline size-3.5" /> Intents
        </button>
        <button onClick={() => setTab('unanswered')} className={chip(tab === 'unanswered')}>
          <MessageCircleQuestion className="mr-1 inline size-3.5" /> Unanswered
        </button>
      </div>

      {tab === 'intents' && (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setTerm(search)
            }}
            className="mt-3 flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-tertiary" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search intents…"
                aria-label="Search intents"
                className="w-full rounded-xl bg-surface-secondary py-2.5 pl-9 pr-3 text-body text-ink outline-none ring-1 ring-line focus:ring-accent"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          <p className="mt-3 text-label text-ink-secondary">
            {(intents ?? []).length} intent{(intents ?? []).length === 1 ? '' : 's'} shown
          </p>

          {li && <Skeleton className="mt-3 h-24 w-full rounded-2xl" />}

          <div className="mt-3 flex flex-col gap-3">
            {Object.entries(grouped).map(([cat, rows]) => (
              <Card key={cat} className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-body font-semibold text-ink capitalize">{cat}</span>
                  <Pill>{rows.length}</Pill>
                </div>
                <div className="mt-2 flex flex-col gap-1">
                  {rows.slice(0, 12).map((i) => (
                    <div
                      key={String(i.id)}
                      className="flex items-center justify-between text-body-sm"
                    >
                      <span className="truncate text-ink">{String(i.title)}</span>
                      <span className="ml-2 shrink-0 text-label text-ink-tertiary">
                        {String(i.action_type)}
                      </span>
                    </div>
                  ))}
                  {rows.length > 12 && (
                    <p className="text-label text-ink-tertiary">+{rows.length - 12} more</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {tab === 'unanswered' && (
        <>
          <p className="mt-3 text-body-sm text-ink-secondary">
            Questions the assistant refused rather than guessed at. Each is a candidate for a new
            intent.
          </p>
          {lu && <Skeleton className="mt-3 h-24 w-full rounded-2xl" />}
          {!lu && !unans?.length && (
            <Card className="mt-3 px-4 py-6 text-center text-body-sm text-ink-secondary">
              Nothing unanswered yet.
            </Card>
          )}
          <div className="mt-3 flex flex-col gap-2">
            {(unans ?? []).map((u) => (
              <Card key={String(u.id)} className="px-4 py-3">
                <p className="text-body-sm text-ink">{String(u.question)}</p>
                <p className="mt-1 text-label text-ink-tertiary">
                  {u.context ? `on ${String(u.context)} · ` : ''}
                  {new Date(String(u.created_at)).toLocaleDateString()}
                </p>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
