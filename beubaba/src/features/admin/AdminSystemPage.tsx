/**
 * Audit log + system health (admin spec §21, §23, §25).
 *
 * The audit log is read straight from `audit_logs`, which every privileged RPC
 * already writes to — so this reflects real actions, not a separate log the app
 * maintains for show.
 *
 * Health checks perform an ACTUAL query per subsystem. A green light means that
 * subsystem answered just now; it is not a hardcoded status.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, Activity, ScrollText, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/feedback/Skeleton'
import { adminService } from '@/services/adminService'

function timeAgo(iso: string): string {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.round(s / 60)}m ago`
  if (s < 86400) return `${Math.round(s / 3600)}h ago`
  return `${Math.round(s / 86400)}d ago`
}

export function AdminSystemPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('')

  const { data: health, isLoading: lh, refetch } = useQuery({
    queryKey: ['admin-health'],
    queryFn: () => adminService.health(),
  })
  const { data: audit, isLoading: la } = useQuery({
    queryKey: ['admin-audit', filter],
    queryFn: () => adminService.auditLog(100, filter || undefined),
  })

  const actions = [...new Set((audit ?? []).map((a) => a.action))].slice(0, 8)

  return (
    <div className="page-x pb-24 pt-4">
      <button
        onClick={() => navigate('/admin')}
        className="mb-2 flex items-center gap-1 text-label text-ink-secondary"
      >
        <ChevronLeft className="size-4" /> Admin
      </button>
      <h1 className="text-h1 text-ink">System</h1>
      <p className="mt-1 text-body-sm text-ink-secondary">
        Live health checks and a record of every privileged action.
      </p>

      {/* Health */}
      <div className="mt-4 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-h3 text-ink">
          <Activity className="size-4 text-accent" /> Health
        </h2>
        <Button variant="tertiary" onClick={() => void refetch()}>
          <RefreshCw className="size-4" /> Re-check
        </Button>
      </div>

      {lh && <Skeleton className="mt-2 h-32 w-full rounded-2xl" />}
      {!lh && (
        <Card className="mt-2 flex flex-col gap-2 px-4 py-3">
          {(health ?? []).map((h) => (
            <div key={h.name} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-body-sm text-ink">
                <span
                  className={`size-2.5 rounded-full ${h.ok ? 'bg-success' : 'bg-danger'}`}
                  aria-hidden
                />
                {h.name}
              </span>
              <span className="text-label text-ink-secondary">{h.detail}</span>
            </div>
          ))}
        </Card>
      )}

      {/* Audit */}
      <h2 className="mt-6 flex items-center gap-1.5 text-h3 text-ink">
        <ScrollText className="size-4 text-accent" /> Audit log
      </h2>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('')}
          className={`rounded-pill px-3 py-1.5 text-caption font-bold ${
            !filter ? 'bg-accent text-white' : 'bg-surface text-ink-secondary ring-1 ring-line'
          }`}
        >
          All
        </button>
        {actions.map((a) => (
          <button
            key={a}
            onClick={() => setFilter(a)}
            className={`rounded-pill px-3 py-1.5 text-caption font-bold ${
              filter === a ? 'bg-accent text-white' : 'bg-surface text-ink-secondary ring-1 ring-line'
            }`}
          >
            {a.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {la && (
        <div className="mt-3 flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {!la && !audit?.length && (
        <Card className="mt-3 px-4 py-5 text-center text-body-sm text-ink-secondary">
          No audit entries yet.
        </Card>
      )}

      <div className="mt-3 flex flex-col gap-2">
        {(audit ?? []).map((a) => (
          <Card key={a.id} className="px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <Pill>{a.action.replace(/_/g, ' ')}</Pill>
              {a.entity_type && (
                <span className="text-label text-ink-secondary">{a.entity_type}</span>
              )}
              <span className="ml-auto text-label text-ink-tertiary">{timeAgo(a.created_at)}</span>
            </div>
            {a.metadata && Object.keys(a.metadata).length > 0 && (
              <p className="mt-1 break-words text-label text-ink-secondary">
                {Object.entries(a.metadata)
                  .slice(0, 4)
                  .map(([k, v]) => `${k}: ${String(v).slice(0, 40)}`)
                  .join(' · ')}
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
