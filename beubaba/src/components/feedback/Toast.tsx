import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, TriangleAlert, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/cn'

type ToastTone = 'success' | 'error' | 'warning' | 'info'
interface Toast {
  id: number
  tone: ToastTone
  title: string
  description?: string
}

interface ToastContextValue {
  show: (t: Omit<Toast, 'id'>) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const ICON: Record<ToastTone, ReactNode> = {
  success: <CheckCircle2 className="size-5 text-success" />,
  error: <XCircle className="size-5 text-danger" />,
  warning: <TriangleAlert className="size-5 text-warning" />,
  info: <Info className="size-5 text-accent" />,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const seq = useRef(0)

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = ++seq.current
      setToasts((prev) => [...prev, { ...t, id }])
      window.setTimeout(() => remove(id), 4200)
    },
    [remove],
  )

  const value: ToastContextValue = {
    show,
    success: (title, description) => show({ tone: 'success', title, description }),
    error: (title, description) => show({ tone: 'error', title, description }),
    info: (title, description) => show({ tone: 'info', title, description }),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-toast flex flex-col items-center gap-2 p-4 safe-b"
        role="region"
        aria-label="Notifications"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'glass-modal glass-highlight pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg p-3.5',
              )}
              role="status"
            >
              <span className="mt-0.5 shrink-0">{ICON[t.tone]}</span>
              <div className="min-w-0 flex-1">
                <p className="text-body font-semibold text-ink">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-body-sm text-ink-secondary">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => remove(t.id)}
                aria-label="Dismiss"
                className="shrink-0 rounded-md p-1 text-ink-tertiary hover:text-ink-secondary"
              >
                <X className="size-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
