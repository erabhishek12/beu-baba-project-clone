/**
 * Brand mark — generated 3D clay "owl scholar" image (deliberately NOT the
 * over-used cap/book motif, and NOT an inline SVG). The asset ships as a
 * cropped WebP tile so header, sidebar, auth, splash and loader all render
 * the identical premium mark at any size.
 */
export function LogoMark({
  className = 'size-9',
  title = 'BEU BABA',
}: {
  className?: string
  title?: string
}) {
  return (
    <img
      src="/assets/logo.webp"
      alt=""
      aria-label={title}
      className={`shrink-0 rounded-[24%] shadow-[0_6px_16px_rgba(76,60,220,0.28)] ${className}`}
    />
  )
}

/** Typographic half of the brand — display face with the accent "BABA". */
export function Wordmark({ className = 'text-h3' }: { className?: string }) {
  return (
    <span className={`font-display font-extrabold tracking-tight text-ink ${className}`}>
      BEU <span className="text-accent">BABA</span>
    </span>
  )
}

export function LogoLockup({
  className = '',
  markClass = 'size-9',
  wordClass = 'text-h3',
}: {
  className?: string
  markClass?: string
  wordClass?: string
}) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark className={markClass} />
      <Wordmark className={wordClass} />
    </span>
  )
}
