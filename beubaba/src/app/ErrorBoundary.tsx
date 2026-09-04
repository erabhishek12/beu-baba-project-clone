import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

interface State {
  hasError: boolean
}

/** Top-level error boundary: friendly, non-technical recovery UI. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production this would report to an observability sink.
    console.error('App error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="relative flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="bb-environment" />
          <h1 className="text-h2 text-ink">Something went wrong</h1>
          <p className="max-w-sm text-body text-ink-secondary">
            An unexpected error occurred. Reloading usually fixes this.
          </p>
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </div>
      )
    }
    return this.props.children
  }
}
