import { useCallback, useEffect, useState } from 'react'
import { store } from '@/services/storage'
import { onUpdateReady, applyUpdate } from './registerSW'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const INSTALL_DISMISSED_KEY = 'pwa_install_dismissed_at'

/** Install eligibility + gentle prompt state (spec §7 installation UX). */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    // Already running standalone?
    if (window.matchMedia('(display-mode: standalone)').matches) setInstalled(true)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const dismissedRecently = useCallback(() => {
    const at = store.get<number>(INSTALL_DISMISSED_KEY, 0)
    // snooze for 7 days after a dismissal
    return at > 0 && Date.now() - at < 7 * 24 * 60 * 60 * 1000
  }, [])

  const canPrompt = !!deferred && !installed && !dismissedRecently()

  const promptInstall = useCallback(async () => {
    if (!deferred) return 'unavailable'
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    setDeferred(null)
    return outcome
  }, [deferred])

  const dismiss = useCallback(() => {
    store.set(INSTALL_DISMISSED_KEY, Date.now())
    setDeferred(null)
  }, [])

  return { canPrompt, installed, promptInstall, dismiss }
}

/** "New version available" state driven by the SW update lifecycle. */
export function useAppUpdate() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null)
  useEffect(() => {
    onUpdateReady((w) => setWaiting(w))
  }, [])
  const update = useCallback(() => {
    if (waiting) applyUpdate(waiting)
  }, [waiting])
  return { updateReady: !!waiting, update }
}
