/**
 * Banner / announcement service (spec §34–§39).
 *
 * Students only ever see ONE banner at a time — the single row
 * `next_eligible_banner()` decides they are entitled to. All the hard rules
 * (schedule window, audience targeting, per-user frequency, dismissal) live in
 * SQL, so nothing here can be tampered with to surface a banner that was not
 * meant for this student.
 *
 * An impression is recorded ONLY after the overlay has actually rendered, so a
 * failed image or a dropped connection never burns one of the user's views
 * (spec §37, last rule).
 *
 * In mock mode the whole feature is inert and returns nothing — there is no
 * local banner store, and inventing one would just be fake data.
 */
import { USE_SUPABASE } from '@/services/backend/config'
import { getSupabase } from '@/services/backend/supabaseClient'

export interface BannerButton {
  label: string
  target: string
  is_external?: boolean
  style?: string | null
}

export interface EligibleBanner {
  id: string
  title: string | null
  description: string | null
  supporting_text: string | null
  image_path: string | null
  image_alt: string | null
  kind: string
  priority: number
  buttons: BannerButton[]
}

export interface BannerRow extends EligibleBanner {
  is_active: boolean
  starts_at: string | null
  expires_at: string | null
  frequency: BannerFrequency
  frequency_count: number
  send_notification: boolean
  notification_sent_at: string | null
  created_at: string
}

export type BannerFrequency = 'always' | 'once_ever' | 'n_times' | 'once_per_session'

export interface BannerStat {
  banner_id: string
  seen_by: number
  total_views: number
  dismissed_by: number
}

/**
 * One id per app launch. "Once per session" means once per launch, so this must
 * live in sessionStorage: it survives navigation and refresh within the tab,
 * and is gone when the app is closed and reopened.
 */
const SESSION_KEY = 'beubaba:session-id'

export function sessionId(): string {
  try {
    let v = sessionStorage.getItem(SESSION_KEY)
    if (!v) {
      v = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
      sessionStorage.setItem(SESSION_KEY, v)
    }
    return v
  } catch {
    // Private mode: fall back to a per-page-load id.
    return `s_${Date.now().toString(36)}`
  }
}

export const bannerService = {
  /** The one banner this student should see right now, or null. */
  async next(): Promise<EligibleBanner | null> {
    if (!USE_SUPABASE) return null
    const { data, error } = await getSupabase().rpc('next_eligible_banner', {
      p_session_id: sessionId(),
    })
    if (error) throw new Error(error.message)
    const row = (Array.isArray(data) ? data[0] : data) as EligibleBanner | undefined
    if (!row) return null
    return { ...row, buttons: Array.isArray(row.buttons) ? row.buttons : [] }
  },

  /** Count a view. Call this only once the overlay is really on screen. */
  async recordImpression(bannerId: string): Promise<void> {
    if (!USE_SUPABASE) return
    const { error } = await getSupabase().rpc('record_banner_impression', {
      p_banner: bannerId,
      p_session_id: sessionId(),
    })
    if (error) throw new Error(error.message)
  },

  /** "Don't show again" — permanent for this user. */
  async dismiss(bannerId: string): Promise<void> {
    if (!USE_SUPABASE) return
    const { error } = await getSupabase().rpc('dismiss_banner', { p_banner: bannerId })
    if (error) throw new Error(error.message)
  },

  /* ----------------------------- admin side ----------------------------- */

  async listAll(): Promise<BannerRow[]> {
    if (!USE_SUPABASE) return []
    const { data, error } = await getSupabase()
      .from('banners')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []) as unknown as BannerRow[]
  },

  async stats(): Promise<Record<string, BannerStat>> {
    if (!USE_SUPABASE) return {}
    const { data, error } = await getSupabase().rpc('banner_stats')
    if (error) throw new Error(error.message)
    const out: Record<string, BannerStat> = {}
    for (const r of (data ?? []) as BannerStat[]) out[r.banner_id] = r
    return out
  },

  async create(input: {
    title: string
    description?: string | null
    supporting_text?: string | null
    image_path?: string | null
    kind: string
    frequency: BannerFrequency
    frequency_count?: number
    priority?: number
    is_active?: boolean
    starts_at?: string | null
    expires_at?: string | null
    send_notification?: boolean
    buttons?: BannerButton[]
    targets?: { branch_id?: string | null; semester_number?: number | null }[]
  }): Promise<string> {
    if (!USE_SUPABASE) throw new Error('Banners need the Supabase backend.')
    const sb = getSupabase()
    const { buttons = [], targets = [], ...banner } = input
    const { data, error } = await sb
      .from('banners')
      .insert({
        ...banner,
        frequency_count: banner.frequency === 'n_times' ? (banner.frequency_count ?? 1) : 1,
      })
      .select('id')
      .single()
    if (error) throw new Error(error.message)
    const id = (data as { id: string }).id

    if (buttons.length) {
      const { error: be } = await sb.from('banner_buttons').insert(
        buttons.map((b, i) => ({
          banner_id: id,
          label: b.label,
          target: b.target,
          is_external: /^https?:\/\//i.test(b.target),
          display_order: i,
        })),
      )
      if (be) throw new Error(be.message)
    }
    if (targets.length) {
      const { error: te } = await sb
        .from('banner_targets')
        .insert(targets.map((t) => ({ banner_id: id, ...t })))
      if (te) throw new Error(te.message)
    }
    return id
  },

  async setActive(id: string, active: boolean): Promise<void> {
    if (!USE_SUPABASE) return
    const { error } = await getSupabase()
      .from('banners')
      .update({ is_active: active, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw new Error(error.message)
  },

  async remove(id: string): Promise<void> {
    if (!USE_SUPABASE) return
    const { error } = await getSupabase().from('banners').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },

  /** Fan the banner out to the targeted audience as real notifications (§39). */
  async sendNotification(id: string): Promise<number> {
    if (!USE_SUPABASE) return 0
    const { data, error } = await getSupabase().rpc('publish_banner_notification', {
      p_banner: id,
    })
    if (error) throw new Error(error.message)
    return Number(data ?? 0)
  },
}
