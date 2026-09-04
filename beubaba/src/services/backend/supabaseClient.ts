/**
 * Supabase browser client (spec 08/11). Created lazily and only when the real
 * backend is configured, so the mock build never instantiates it.
 *
 * Session persistence + auto-refresh are enabled: the session is a real object
 * managed by supabase-js, never a `localStorage.authenticated = true` boolean
 * (spec 11 §11).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, USE_SUPABASE } from './config'

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!USE_SUPABASE || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'Supabase backend requested but not configured. Set VITE_BACKEND=supabase, ' +
        'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    )
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'beubaba.auth',
      },
    })
  }
  return client
}
