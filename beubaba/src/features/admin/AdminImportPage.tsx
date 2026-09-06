import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, FileJson, ShieldCheck, AlertTriangle, CopyCheck } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { cn } from '@/lib/cn'
import {
  validateImport,
  commitImport,
  listAudit,
  type ImportKind,
  type PreviewResult,
} from '@/services/importService'
import { USE_SUPABASE } from '@/services/backend/config'
import {
  syncContent,
  detectSyncKind,
  type SyncResult,
  type SyncKind,
} from '@/services/backend/supabaseContentSync'

const KINDS: { key: ImportKind; label: string; hint: string }[] = [
  { key: 'bank', label: 'Question bank', hint: '[{id, stem, options[], correct_index, …}]' },
  { key: 'quiz', label: 'Quiz', hint: '[{title, subject_code, question_ids[], pick_count}]' },
  { key: 'syllabus', label: 'Syllabus', hint: '[{subject_code, units:[{title, topics[]}]}]' },
  { key: 'calendar', label: 'Calendar', hint: '[{title, date, type?}]' },
]

/** Inline correction editor for a flagged row (Phase 6 correction editor). */
function RowEditor({
  kind,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  data,
  onPatch,
}: {
  kind: ImportKind
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  data: any
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  onPatch: (patch: Record<string, any>) => void
}) {
  const field = (key: string, label: string, wide = false) => (
    <label className="flex min-w-0 flex-1 flex-col gap-1 text-caption font-semibold text-ink-tertiary">
      {label}
      <input
        defaultValue={String(data[key] ?? '')}
        onBlur={(e) => onPatch({ [key]: e.target.value })}
        className={cn(
          'rounded-lg bg-surface-secondary px-2.5 py-1.5 text-body-sm font-normal text-ink ring-1 ring-line focus:ring-2 focus:ring-accent',
          wide && 'col-span-2',
        )}
      />
    </label>
  )
  return (
    <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl bg-surface-secondary/60 p-2.5">
      {kind === 'bank' && (
        <>
          {field('stem', 'Stem', true)}
          {field('correct_index', 'correct_index')}
          {field('difficulty', 'difficulty')}
        </>
      )}
      {kind === 'quiz' && (
        <>
          {field('title', 'Title', true)}
          {field('pick_count', 'pick_count')}
          {field('duration_sec', 'duration_sec')}
        </>
      )}
      {kind === 'syllabus' && (
        <>
          {field('subject_code', 'subject_code')}
          {field('subject_id', 'subject_id')}
        </>
      )}
      {kind === 'calendar' && (
        <>
          {field('title', 'Title')}
          {field('date', 'date (YYYY-MM-DD)')}
        </>
      )}
    </div>
  )
}

/**
 * Phase 6 — JSON Import Center: validate → preview → correct → transactional
 * commit, with duplicate detection, search sync and an audit trail.
 */
export function AdminImportPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [kind, setKind] = useState<ImportKind>('bank')
  const [fileName, setFileName] = useState('')
  const [preview, setPreview] = useState<PreviewResult | null>(null)
  const [skipInvalid, setSkipInvalid] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [auditTick, setAuditTick] = useState(0)
  // Server-sync path (syllabus / pyq / calendar against the real database).
  const [syncKind, setSyncKind] = useState<SyncKind | null>(null)
  const [syncPayload, setSyncPayload] = useState<unknown>(null)
  const [syncPreview, setSyncPreview] = useState<SyncResult | null>(null)
  const [allowMassDelete, setAllowMassDelete] = useState(false)
  const audit = listAudit().slice(0, 8)
  void auditTick

  const invalidateAll = () => {
    qc.invalidateQueries()
  }

  const onFile = async (file: File) => {
    setBusy(true)
    setMessage('')
    setFileName(file.name)
    try {
      const raw = JSON.parse(await file.text())

      // A file tagged {"type":"syllabus"|"pyq"|"calendar"} goes to the database
      // sync (migration 0016) instead of the local mock importer. Dry run
      // first — the admin sees the numbers before anything is written.
      const sk = USE_SUPABASE ? detectSyncKind(raw) : null
      if (sk) {
        setPreview(null)
        setSyncKind(sk)
        setSyncPayload(raw)
        setAllowMassDelete(false)
        const dry = await syncContent(sk, raw, true)
        setSyncPreview(dry)
        setBusy(false)
        return
      }
      setSyncKind(null)
      setSyncPayload(null)
      setSyncPreview(null)
      const result = await validateImport(kind, raw)
      setPreview(result)
    } catch {
      setPreview(null)
      setMessage('Could not parse that file as JSON.')
    }
    setBusy(false)
  }

  const patchRow = (index: number, patch: Record<string, unknown>) => {
    if (!preview) return
    const rows = preview.rows.map((r) =>
      r.index === index ? { ...r, data: { ...r.data, ...patch } } : r,
    )
    // re-validate just the patched row cheaply by re-running full validation
    void (async () => {
      const rebuilt = await validateImport(
        preview.kind,
        rows.map((r) => r.data),
      )
      setPreview(rebuilt)
    })()
  }

  const commit = async () => {
    if (!preview) return
    setBusy(true)
    try {
      const res = await commitImport(preview, { file: fileName, skipInvalid })
      setMessage(`Imported ${res.imported} · skipped ${res.skipped}. Search re-indexed.`)
      setPreview(null)
      setAuditTick((t) => t + 1)
      invalidateAll()
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Import failed — nothing was written.')
    }
    setBusy(false)
  }

  const applySync = async () => {
    if (!syncKind || !syncPayload) return
    setBusy(true)
    setMessage('')
    try {
      const res = await syncContent(syncKind, syncPayload, false, allowMassDelete)
      setMessage(
        `Synced: ${res.inserted ?? 0} added · ${res.updated ?? 0} updated · ${res.deleted ?? 0} removed.`,
      )
      setSyncPreview(null)
      setSyncKind(null)
      setSyncPayload(null)
      invalidateAll()
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Sync failed — nothing was written.')
    }
    setBusy(false)
  }

  const kindMeta = KINDS.find((k) => k.key === kind)!

  return (
    <div className="page-x pb-10 pt-6">
      <button
        onClick={() => navigate('/admin')}
        className="mb-4 inline-flex items-center gap-1.5 text-body-sm font-semibold text-accent"
      >
        <ChevronLeft className="size-4" aria-hidden /> Admin
      </button>
      <h1 className="font-heading text-h2 font-extrabold tracking-tight text-ink">Import center</h1>
      <p className="mt-1 text-body-sm text-ink-secondary">
        Validate, preview, correct and commit JSON content — transactionally.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button
            key={k.key}
            onClick={() => {
              setKind(k.key)
              setPreview(null)
            }}
            className={cn(
              'rounded-pill px-4 py-2 text-caption font-bold transition-colors',
              kind === k.key
                ? 'bg-accent text-white shadow-[0_8px_18px_rgba(91,110,240,0.35)]'
                : 'bg-surface text-ink-secondary ring-1 ring-line hover:text-ink',
            )}
          >
            {k.label}
          </button>
        ))}
      </div>
      <p className="mt-2 font-mono text-caption text-ink-tertiary">{kindMeta.hint}</p>

      <Card as="glass" className="glass-highlight mt-3">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line px-4 py-8 text-body-sm font-semibold text-ink-secondary transition-colors hover:border-accent/50 hover:text-accent">
          <FileJson className="size-6" aria-hidden />
          {busy ? 'Validating…' : `Choose a ${kindMeta.label.toLowerCase()} .json file`}
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void onFile(f)
              e.target.value = ''
            }}
          />
        </label>
      </Card>

      {preview && (
        <Card className="mt-3">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="success">{preview.ok} ok</Pill>
            <Pill tone="warning">{preview.duplicate} duplicates</Pill>
            <Pill tone="danger">{preview.error} errors</Pill>
            <span className="ml-auto text-caption text-ink-tertiary">{fileName}</span>
          </div>

          <ul className="mt-3 flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
            {preview.rows.slice(0, 60).map((r) => (
              <li key={r.index} className="rounded-xl bg-surface-secondary/60 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="tnum w-8 shrink-0 text-caption text-ink-tertiary">#{r.index + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-body-sm font-semibold text-ink">
                    {String(r.data?.title ?? r.data?.stem ?? r.data?.subject_code ?? 'row')}
                  </span>
                  {r.status === 'ok' && <Pill tone="success">ok</Pill>}
                  {r.status === 'duplicate' && (
                    <span className="flex items-center gap-1">
                      <CopyCheck className="size-3.5 text-warning" aria-hidden />
                      <Pill tone="warning">dup</Pill>
                    </span>
                  )}
                  {r.status === 'error' && (
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="size-3.5 text-danger" aria-hidden />
                      <Pill tone="danger">error</Pill>
                    </span>
                  )}
                </div>
                {r.message && <p className="mt-1 text-caption text-ink-tertiary">{r.message}</p>}
                {r.status === 'error' && (
                  <RowEditor kind={preview.kind} data={r.data} onPatch={(p) => patchRow(r.index, p)} />
                )}
              </li>
            ))}
            {preview.rows.length > 60 && (
              <li className="text-caption text-ink-tertiary">
                … {preview.rows.length - 60} more rows in preview
              </li>
            )}
          </ul>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-caption font-semibold text-ink-secondary">
              <input
                type="checkbox"
                checked={skipInvalid}
                onChange={(e) => setSkipInvalid(e.target.checked)}
                className="size-4 accent-[var(--color-accent)]"
              />
              Skip invalid & duplicate rows
            </label>
            <button
              onClick={commit}
              disabled={busy || preview.ok === 0}
              className="ml-auto inline-flex items-center gap-1.5 rounded-pill bg-accent px-5 py-2.5 text-caption font-bold text-white shadow-[0_8px_18px_rgba(91,110,240,0.35)] disabled:opacity-50"
            >
              <ShieldCheck className="size-4" aria-hidden /> Import {preview.ok} rows
            </button>
          </div>
        </Card>
      )}


      {/* Database sync preview — syllabus / PYQ / calendar against the real DB.
          Nothing is written until "Apply" is pressed. */}
      {syncPreview && syncKind && (
        <Card className="mt-4 p-4">
          <p className="text-body font-bold text-ink">
            {syncKind === 'syllabus' ? 'Syllabus' : syncKind === 'pyq' ? 'Previous year papers' : 'Calendar'} sync
            {syncPreview.branch ? ` · ${syncPreview.branch}` : ''}
            {syncPreview.year ? ` · ${syncPreview.year}` : ''}
          </p>
          <p className="mt-1 text-body-sm text-ink-secondary">
            Preview only — nothing has been changed yet.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              ['Add', syncPreview.would_insert ?? 0],
              ['Update', syncPreview.would_update ?? 0],
              ['Remove', syncPreview.would_delete ?? 0],
            ].map(([label, n]) => (
              <div key={label as string} className="rounded-xl bg-surface-secondary px-3 py-2">
                <div className="text-h3 text-ink">{Number(n).toLocaleString()}</div>
                <div className="text-label text-ink-secondary">{label as string}</div>
              </div>
            ))}
          </div>

          {!!(syncPreview.would_delete_codes || []).length && (
            <div className="mt-3 rounded-xl bg-surface-secondary px-3 py-2">
              <p className="text-label text-ink-secondary">These will be removed:</p>
              <p className="mt-1 break-words text-caption text-ink">
                {(syncPreview.would_delete_codes || []).slice(0, 40).join(', ')}
                {(syncPreview.would_delete_codes || []).length > 40 ? ' …' : ''}
              </p>
            </div>
          )}

          {(syncPreview.would_delete ?? 0) > 0 && (
            <label className="mt-3 flex items-start gap-2 text-body-sm text-ink">
              <input
                type="checkbox"
                checked={allowMassDelete}
                onChange={(e) => setAllowMassDelete(e.target.checked)}
                className="mt-1"
              />
              <span>
                I understand {syncPreview.would_delete} item(s) will be permanently removed.
                Tick this also if the sync was refused for deleting too much.
              </span>
            </label>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSyncPreview(null)
                setSyncKind(null)
                setSyncPayload(null)
              }}
              className="rounded-pill bg-surface px-4 py-2 text-caption font-bold text-ink-secondary ring-1 ring-line"
            >
              Cancel
            </button>
            <button
              disabled={busy || ((syncPreview.would_delete ?? 0) > 0 && !allowMassDelete)}
              onClick={applySync}
              className="inline-flex items-center gap-1.5 rounded-pill bg-accent px-4 py-2 text-caption font-bold text-white disabled:opacity-50"
            >
              <ShieldCheck className="size-4" aria-hidden /> Apply to database
            </button>
          </div>
        </Card>
      )}

      {message && (
        <p className="mt-3 rounded-2xl bg-surface p-3.5 text-body-sm font-semibold text-ink ring-1 ring-line">
          {message}
        </p>
      )}

      <h2 className="mb-2 mt-7 text-h3 font-extrabold tracking-tight text-ink">Audit trail</h2>
      <div className="flex flex-col gap-2">
        {audit.length === 0 && (
          <p className="rounded-2xl bg-surface p-4 text-body-sm text-ink-secondary ring-1 ring-line">
            No imports yet this device.
          </p>
        )}
        {audit.map((a) => (
          <Card key={a.id} className="flex items-center gap-3">
            <Pill tone="accent">{a.kind}</Pill>
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-sm font-semibold text-ink">{a.file}</p>
              <p className="text-caption text-ink-tertiary">
                {new Date(a.at).toLocaleString('en-IN')} · {a.total} rows
              </p>
            </div>
            <span className="tnum text-caption font-bold text-success">+{a.imported}</span>
            <span className="tnum text-caption text-ink-tertiary">−{a.skipped}</span>
          </Card>
        ))}
      </div>
    </div>
  )
}
