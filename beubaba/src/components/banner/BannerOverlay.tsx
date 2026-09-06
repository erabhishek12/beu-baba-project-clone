/**
 * Banner overlay (spec §34–§39).
 *
 * Shows at most ONE banner, right after the app opens. The database decides
 * which banner (schedule, audience targeting, per-user frequency, dismissal) —
 * this component only renders it.
 *
 * Spec rules honoured here:
 *  - always has a close button, and Escape / backdrop also close it
 *  - never permanently blocks the app: closing returns straight to the screen
 *  - once closed it does not obstruct anything
 *  - the impression is recorded ONLY after the overlay is really on screen,
 *    so a failed fetch or a broken image never burns one of the user's views
 *  - "Don't show again" marks it dismissed for this user, permanently
 *
 * Every field is optional (spec §34): text only, image only, image + text, or
 * image + text + buttons all render correctly.
 *
 * Uses the existing Modal / Button primitives — no new design language.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Modal } from '@/components/glass/Modal'
import { Button } from '@/components/ui/Button'
import { bannerService, type EligibleBanner } from '@/services/bannerService'
import { useAuth } from '@/app/providers/AuthProvider'
import { registerBackGuard } from '@/app/pwa/useAppBackButton'

/**
 * Banners closed during this app session, remembered across page reloads.
 *
 * Without this, a hard refresh (or opening a deep link) re-showed a banner the
 * student had just closed — caught in testing. sessionStorage is the right
 * scope: it survives reloads inside one app session and clears when the app is
 * closed, which matches how "once per session" is defined.
 */
const CLOSED_KEY = 'beubaba:banner-closed'

function readClosed(): string[] {
  try {
    const raw = sessionStorage.getItem(CLOSED_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function markClosed(id: string) {
  try {
    const all = new Set(readClosed())
    all.add(id)
    sessionStorage.setItem(CLOSED_KEY, JSON.stringify([...all]))
  } catch {
    /* private mode — in-memory state still hides it for this page */
  }
}

export function BannerOverlay() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [closed, setClosed] = useState(false)
  const recorded = useRef<string | null>(null)

  const close = useCallback((id: string) => {
    markClosed(id)
    setClosed(true)
  }, [])

  const { data: banner } = useQuery({
    queryKey: ['banner-next', user?.auth.id],
    queryFn: () => bannerService.next(),
    enabled: !!user,
    // One decision per app open — do not re-poll and re-pop while the student
    // is using the app.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const open = !!banner && !closed && !readClosed().includes(banner.id)

  // Count the view only once the overlay is actually showing.
  useEffect(() => {
    if (!open || !banner) return
    if (recorded.current === banner.id) return
    recorded.current = banner.id
    void bannerService.recordImpression(banner.id).catch(() => undefined)
  }, [open, banner])

  // Android back should close the banner, not leave the screen.
  useEffect(() => {
    if (!open || !banner) return
    const id = banner.id
    return registerBackGuard(() => {
      close(id)
      return true
    })
  }, [open, banner, close])

  if (!banner) return null

  const b: EligibleBanner = banner

  function handleButton(target: string, external?: boolean) {
    close(b.id)
    if (external || /^https?:\/\//i.test(target)) {
      window.open(target, '_blank', 'noopener,noreferrer')
    } else {
      navigate(target)
    }
  }

  async function dontShowAgain() {
    close(b.id)
    await bannerService.dismiss(b.id).catch(() => undefined)
  }

  return (
    <Modal open={open} onClose={() => close(b.id)} title={b.title ?? undefined}>
      <div className="flex flex-col gap-3">
        {b.image_path && (
          <img
            src={b.image_path}
            alt={b.image_alt ?? ''}
            className="w-full rounded-2xl object-cover"
            loading="eager"
            // A broken image must not leave an empty grey box.
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        )}

        {b.description && <p className="text-body text-ink">{b.description}</p>}

        {b.supporting_text && (
          <p className="text-body-sm text-ink-secondary">{b.supporting_text}</p>
        )}

        {!!b.buttons.length && (
          <div className="mt-1 flex flex-wrap gap-2">
            {b.buttons.map((btn, i) => (
              <Button
                key={`${btn.label}-${i}`}
                variant={i === 0 ? 'primary' : 'secondary'}
                onClick={() => handleButton(btn.target, btn.is_external)}
              >
                {btn.label}
              </Button>
            ))}
          </div>
        )}

        <div className="mt-1 flex items-center justify-between gap-2">
          <button
            onClick={dontShowAgain}
            className="text-label text-ink-tertiary underline underline-offset-2"
          >
            Don&apos;t show again
          </button>
          <Button variant="tertiary" onClick={() => close(b.id)}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}
