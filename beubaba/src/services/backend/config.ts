/**
 * Backend selector — the single switch between the LOCAL MOCK data layer and
 * the real Supabase backend (spec 07 §adapter boundary).
 *
 * Feature code NEVER imports Supabase or the mock directly for its data; it goes
 * through the service layer, and the service layer asks here which implementation
 * to use. Flip the backend by setting env vars — no UI changes required.
 *
 *   VITE_BACKEND=supabase
 *   VITE_SUPABASE_URL=https://<project>.supabase.co
 *   VITE_SUPABASE_ANON_KEY=<anon key>
 *
 * If VITE_BACKEND is unset (or 'mock'), or the Supabase env vars are missing,
 * the app runs entirely on the mock so the preview always works.
 */
const raw = (import.meta.env.VITE_BACKEND ?? 'mock').toLowerCase()

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** True when the real Supabase backend is configured AND requested. */
export const USE_SUPABASE =
  raw === 'supabase' && Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY)

export type BackendKind = 'mock' | 'supabase'
export const BACKEND: BackendKind = USE_SUPABASE ? 'supabase' : 'mock'
