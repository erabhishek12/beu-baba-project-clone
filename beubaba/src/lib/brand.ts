/**
 * Brand constants for shared/downloaded images.
 *
 * The public site URL is read from VITE_SITE_URL so it can be set once at
 * deploy time without touching code. Until it is set we fall back to the
 * address the app is actually being served from, so a downloaded card is never
 * stamped with a wrong or placeholder domain.
 */
export const SITE_URL: string =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/+$/, '') ||
  (typeof window !== 'undefined' ? window.location.origin.replace(/^https?:\/\//, '') : 'beubaba.app')

/** Domain only, no scheme — what we print on cards. */
export const SITE_LABEL: string = SITE_URL.replace(/^https?:\/\//, '')

export const BRAND_NAME = 'BEU BABA'
export const BRAND_TAGLINE = 'your campus companion'
export const LOGO_SRC = '/assets/logo.webp'

/**
 * Draw the BEU BABA logo, wordmark and site URL onto a canvas, plus a faint
 * diagonal watermark so a screenshot of the card still carries attribution.
 *
 * Returns a promise because the logo has to load first. It resolves even if the
 * image fails, so a download never silently breaks over a missing asset.
 */
export function stampBrand(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: { footerY?: number } = {},
): Promise<void> {
  const footerY = opts.footerY ?? h - 90

  // Diagonal watermark, drawn under the footer text.
  ctx.save()
  ctx.globalAlpha = 0.05
  ctx.translate(w / 2, h / 2)
  ctx.rotate(-Math.PI / 6)
  ctx.textAlign = 'center'
  ctx.fillStyle = '#37509a'
  ctx.font = 'bold 130px system-ui, sans-serif'
  ctx.fillText(BRAND_NAME, 0, 0)
  ctx.restore()

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    let settled = false
    const finish = (drawLogo: boolean) => {
      if (settled) return
      settled = true
      const size = 84
      const gap = 18
      ctx.save()
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.font = 'bold 40px system-ui, sans-serif'
      const nameW = ctx.measureText(BRAND_NAME).width
      const totalW = (drawLogo ? size + gap : 0) + nameW
      const x0 = (w - totalW) / 2
      if (drawLogo) {
        try {
          ctx.drawImage(img, x0, footerY - size / 2, size, size)
        } catch {
          /* ignore a tainted or broken image */
        }
      }
      ctx.fillStyle = '#37509a'
      ctx.fillText(BRAND_NAME, x0 + (drawLogo ? size + gap : 0), footerY - 8)
      ctx.font = '26px system-ui, sans-serif'
      ctx.fillStyle = '#949cab'
      ctx.fillText(SITE_LABEL, x0 + (drawLogo ? size + gap : 0), footerY + 26)
      ctx.restore()
      resolve()
    }
    img.onload = () => finish(true)
    img.onerror = () => finish(false)
    img.src = LOGO_SRC
  })
}

/**
 * Asset cache-buster. The logo and mascot files were REPLACED at the same
 * paths, so browsers that had already cached the old ones kept showing them.
 * Bump this string whenever a public asset is replaced in place.
 */
export const ASSET_V = "2026-09-06b"
