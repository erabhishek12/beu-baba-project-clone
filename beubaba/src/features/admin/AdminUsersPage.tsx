/**
 * User management (admin spec §2, §3).
 *
 * Search students, see their roles and status, grant or revoke roles, and
 * disable an account. Every one of those actions is checked AGAIN by the
 * database — the buttons here are a convenience, not the security boundary.
 *
 * Uses the existing Card / Pill / Button primitives.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Search, ShieldCheck, ShieldOff, UserX, UserCheck, Download } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useToast } from '@/components/feedback/Toast'
import { adminService, type AdminUserRow } from '@/services/adminService'
import { useAuth } from '@/app/providers/AuthProvider'
import type { Role } from '@/types/domain'

const GRANTABLE: Role[] = ['admin', 'content_manager', 'moderator', 'support_manager']

/**
 * Export the current list as CSV.
 *
 * Only the rows already on screen are exported, so what you download always
 * matches what you filtered. Fields are quoted and inner quotes doubled, so a
 * name containing a comma cannot break the columns.
 */
function toCsv(rows: AdminUserRow[]): string {
  const head = [
    'Name', 'Email', 'Phone', 'Branch', 'Semester', 'Admission year',
    'College', 'Gender', 'Roles', 'Active', 'Joined',
  ]
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = rows.map((r) =>
    [
      r.full_name, r.email, r.phone, r.branch_name,
      r.semester_number, r.admission_year, r.college_name, r.gender,
      r.roles.join(' | '), r.is_active ? 'yes' : 'no',
      r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : '',
    ].map(esc).join(','),
  )
  return [head.map(esc).join(','), ...lines].join('\n')
}

function downloadCsv(rows: AdminUserRow[]) {
  // A BOM makes Excel open UTF-8 names (Hindi, accents) correctly.
  const blob = new Blob(['\uFEFF' + toCsv(rows)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `beubaba-students-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function AdminUsersPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const qc = useQueryClient()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [term, setTerm] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', term],
    queryFn: () => adminService.listUsers(term),
  })

  const isSuper = (user?.roles ?? []).includes('super_admin')

  async function run(id: string, fn: () => Promise<void>, ok: string) {
    setBusy(id)
    try {
      await fn()
      toast.success(ok)
      await qc.invalidateQueries({ queryKey: ['admin-users'] })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed.')
    }
    setBusy(null)
  }

  return (
    <div className="page-x pb-24 pt-4">
      <button
        onClick={() => navigate('/admin')}
        className="mb-2 flex items-center gap-1 text-label text-ink-secondary"
      >
        <ChevronLeft className="size-4" /> Admin
      </button>
      <h1 className="text-h1 text-ink">Users</h1>
      <p className="mt-1 text-body-sm text-ink-secondary">
        Search students, manage roles and account access.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          setTerm(search)
        }}
        className="mt-4 flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-tertiary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, email or phone…"
            aria-label="Search users"
            className="w-full rounded-xl bg-surface-secondary py-2.5 pl-9 pr-3 text-body text-ink outline-none ring-1 ring-line focus:ring-accent"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-label text-ink-secondary">
          {users?.length ?? 0} shown
        </span>
        <Button
          variant="secondary"
          disabled={!users?.length}
          onClick={() => downloadCsv(users ?? [])}
        >
          <Download className="size-4" /> Export CSV
        </Button>
      </div>

      {isLoading && (
        <div className="mt-4 flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && !users?.length && (
        <Card className="mt-4 px-4 py-6 text-center">
          <p className="text-body text-ink">No users found.</p>
        </Card>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {(users ?? []).map((u) => {
          const isSelf = u.id === user?.auth.id
          return (
            <Card key={u.id} className="px-4 py-4">
              <div className="flex items-start gap-3">
                {u.avatar_url ? (
                  <img
                    src={u.avatar_url}
                    alt=""
                    className="size-12 shrink-0 rounded-full object-cover ring-1 ring-line"
                  />
                ) : (
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-body font-bold text-ink-secondary ring-1 ring-line">
                    {(u.full_name || '?').charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-body font-semibold text-ink">
                      {u.full_name || '(no name)'}
                    </span>
                    {!u.is_active && <Pill>disabled</Pill>}
                    {isSelf && <Pill>you</Pill>}
                  </div>
                  <p className="mt-0.5 truncate text-label text-ink-secondary">{u.email}</p>
                  {u.phone && <p className="text-label text-ink-tertiary">{u.phone}</p>}
                  <p className="mt-1 text-label text-ink-secondary">
                    {u.branch_name ?? 'No branch set'}
                    {u.semester_number ? ` · Semester ${u.semester_number}` : ''}
                    {u.admission_year ? ` · ${u.admission_year}` : ''}
                  </p>
                  {u.college_name && (
                    <p className="text-label text-ink-tertiary">{u.college_name}</p>
                  )}
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {u.roles.map((r) => (
                  <Pill key={r}>{r.replace(/_/g, ' ')}</Pill>
                ))}
              </div>

              {/* Only a super admin may change roles — matches the DB rule. */}
              {isSuper && !isSelf && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {GRANTABLE.map((r) =>
                    u.roles.includes(r) ? (
                      <Button
                        key={r}
                        variant="tertiary"
                        loading={busy === u.id}
                        onClick={() => run(u.id, () => adminService.revokeRole(u.id, r), `Removed ${r}.`)}
                      >
                        <ShieldOff className="size-4" /> {r.replace(/_/g, ' ')}
                      </Button>
                    ) : (
                      <Button
                        key={r}
                        variant="secondary"
                        loading={busy === u.id}
                        onClick={() => run(u.id, () => adminService.grantRole(u.id, r), `Granted ${r}.`)}
                      >
                        <ShieldCheck className="size-4" /> {r.replace(/_/g, ' ')}
                      </Button>
                    ),
                  )}
                </div>
              )}

              {!isSelf && (
                <div className="mt-2">
                  <Button
                    variant={u.is_active ? 'danger' : 'secondary'}
                    loading={busy === u.id}
                    onClick={() =>
                      run(
                        u.id,
                        () => adminService.setActive(u.id, !u.is_active),
                        u.is_active ? 'Account disabled.' : 'Account enabled.',
                      )
                    }
                  >
                    {u.is_active ? <UserX className="size-4" /> : <UserCheck className="size-4" />}
                    {u.is_active ? 'Disable account' : 'Enable account'}
                  </Button>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
