/**
 * Supabase content sync (spec phase 6 — Import Center, real backend path).
 *
 * WHY
 * ---
 * The Import Center UI already did upload → validate → preview → confirm, but
 * `commitImport` only wrote to the in-browser mock store. With the real backend
 * that meant an admin could "import" a syllabus and nothing reached the
 * database.
 *
 * These wrap the SQL functions from migration 0016. The database does the real
 * work — insert new rows, update changed ones, delete rows the file no longer
 * contains — inside one transaction, with its own safety rules:
 *   * deletes are scoped (a CSE file cannot touch Civil)
 *   * a run deleting >60% of rows in scope is refused unless overridden
 *   * admin only; every run is written to audit_logs
 *
 * Dry run is the default everywhere, so the UI can always show the numbers
 * BEFORE anything changes.
 */
import { getSupabase } from './supabaseClient'

export interface SyncResult {
  dry_run: boolean
  inserted?: number
  updated?: number
  deleted?: number
  would_insert?: number
  would_update?: number
  would_delete?: number
  would_delete_codes?: string[]
  existing?: number
  branch?: string
  year?: number
}

export type SyncKind = 'syllabus' | 'pyq' | 'calendar'

const FN: Record<SyncKind, string> = {
  syllabus: 'sync_syllabus',
  pyq: 'sync_pyqs',
  calendar: 'sync_calendar',
}

/**
 * Run a content sync.
 *
 * @param dryRun  true (default) reports what WOULD change and touches nothing.
 * @param allowMassDelete  bypass the >60% deletion guard. Only pass true after
 *                         a human has read the dry-run numbers.
 */
export async function syncContent(
  kind: SyncKind,
  payload: unknown,
  dryRun = true,
  allowMassDelete = false,
): Promise<SyncResult> {
  const { data, error } = await getSupabase().rpc(FN[kind], {
    p_payload: payload,
    p_dry_run: dryRun,
    p_allow_mass_delete: allowMassDelete,
  })
  if (error) throw new Error(error.message)
  return (Array.isArray(data) ? data[0] : data) as SyncResult
}

/** Detect which sync a pasted/uploaded file is for, from its `type` field. */
export function detectSyncKind(payload: unknown): SyncKind | null {
  const t = (payload as { type?: string } | null)?.type
  if (t === 'syllabus') return 'syllabus'
  if (t === 'pyq') return 'pyq'
  if (t === 'calendar') return 'calendar'
  return null
}
