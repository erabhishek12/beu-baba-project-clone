import { AnimatePresence, motion } from 'framer-motion'
import { Download, X, RefreshCw } from 'lucide-react'
import { useInstallPrompt, useAppUpdate } from './usePwa'

/** Gentle, dismissible install prompt + a "new version" pill. Spec §7 / app-update. */
export function InstallBanner() {
  const { canPrompt, promptInstall, dismiss } = useInstallPrompt()
  const { updateReady, update } = useAppUpdate()

  return (
    <div className="pointer-events-none fixed inset-x-0 z-40 flex flex-col items-center gap-2 px-4"
      style={{ bottom: 'calc(var(--nav-height) + env(safe-area-inset-bottom) + 16px)' }}
    >
      <AnimatePresence>
        {updateReady && (
          <motion.button
            key="update"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={update}
            className="glass-elevated pointer-events-auto flex items-center gap-2 rounded-pill px-4 py-2.5 text-body-sm font-semibold text-accent shadow-glass-lg"
          >
            <RefreshCw className="size-4" aria-hidden />
            New version available — tap to update
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {canPrompt && (
          <motion.div
            key="install"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="glass-elevated glass-highlight pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl p-3 shadow-glass-lg"
          >
            <img src="/assets/app-icon-192.png" alt="" aria-hidden className="size-11 rounded-xl" />
            <div className="min-w-0 flex-1">
              <p className="text-body-sm font-semibold text-ink">Install BEU BABA</p>
              <p className="text-caption text-ink-tertiary">Keep your study tools one tap away.</p>
            </div>
            <button
              onClick={promptInstall}
              className="flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-body-sm font-semibold text-white"
            >
              <Download className="size-4" aria-hidden />
              Install
            </button>
            <button onClick={dismiss} aria-label="Not now" className="p-1 text-ink-tertiary">
              <X className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
