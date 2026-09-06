/**
 * 404 page.
 *
 * Previously any unknown URL silently redirected to Home, which hid typos and
 * dead links — a student tapping a stale bookmark just landed somewhere else
 * with no explanation. Now we say what happened and offer a way back.
 */
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, ArrowLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Lottie } from '@/components/feedback/Lottie'

export function NotFoundPage() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div className="page-x flex min-h-[70dvh] flex-col items-center justify-center pb-24 pt-6 text-center">
      <Lottie name="not-found" className="w-full max-w-[300px]" ariaLabel="Page not found" />

      <h1 className="mt-2 text-h1 text-ink">Page not found</h1>
      <p className="mt-1 max-w-sm text-body-sm text-ink-secondary">
        We could not find <span className="font-semibold text-ink">{pathname}</span>. The link may
        be old, or the page may have moved.
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Button onClick={() => navigate('/')}>
          <Home className="size-4" /> Go home
        </Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4" /> Go back
        </Button>
        <Button variant="tertiary" onClick={() => navigate('/search')}>
          <Search className="size-4" /> Search
        </Button>
      </div>
    </div>
  )
}
