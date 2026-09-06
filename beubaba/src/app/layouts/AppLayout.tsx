import { useCallback, useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { OnboardingFlow, hasOnboarded } from '@/components/onboarding/OnboardingFlow'
import { useLocation } from 'react-router-dom'
import { BottomNav } from '@/components/navigation/BottomNav'
import { FloatingChatButton } from '@/components/navigation/FloatingChatButton'
import { AppHeader } from '@/components/navigation/AppHeader'
import { SideRail } from '@/components/navigation/SideRail'
import { SplashScreen } from '@/features/splash/SplashScreen'
import { useSplash } from '@/features/splash/useSplash'
import { useAuth } from '@/app/providers/AuthProvider'
import { InstallBanner } from '@/app/pwa/InstallBanner'
import { BannerOverlay } from '@/components/banner/BannerOverlay'
import { SharePrompt } from '@/components/share/SharePrompt'
import { settingsService } from '@/services/settingsService'
import { useUserId } from '@/features/quiz/hooks'
import { useAppBackButton } from '@/app/pwa/useAppBackButton'
import { useToast } from '@/components/feedback/Toast'

/**
 * Authenticated student shell: quiet environment + a very subtle faded campus
 * wash (shared visual language with the auth screens) + content + floating nav.
 */
export function AppLayout() {
  const { user } = useAuth()
  const splash = useSplash()
  const userId = useUserId()
  const firstName = user?.profile.full_name.split(' ')[0]
  // True while a quiz attempt is open: /quiz/<id>/attempt/<attemptId>
  const inAttempt = /^\/quiz\/[^/]+\/attempt\//.test(useLocation().pathname)

  // Native-style Back: never closes the installed app on the first press.
  const toast = useToast()
  const exitHint = useCallback(() => toast.info('Press back again to exit'), [toast])
  useAppBackButton(exitHint)
  // First-launch onboarding (reference-matched): shown once per browser.
  const [onboarding, setOnboarding] = useState(() => !hasOnboarded())

  // Honor the persisted "reduce motion" preference for this account/device.
  useEffect(() => {
    settingsService.applyFor(userId)
    // Then pull the server copy so preferences follow the user to a new device.
    void settingsService.hydrate(userId)
  }, [userId])

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <div className="bb-environment" />
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.05]"
        style={{
          backgroundImage: 'url(/assets/university.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
        aria-hidden
      />
      <SideRail />
      <AppHeader />
      {/* Responsive shell: phone column → tablet → desktop. Bottom nav owns
          <md; header pills own md–lg; the SideRail owns lg+. */}
      <div className="lg:pl-60">
      <main className="mx-auto w-full max-w-2xl pb-[calc(var(--nav-height)+40px)] pt-[calc(var(--header-h)+env(safe-area-inset-top))] md:pb-10 lg:max-w-shell lg:px-6 xl:max-w-shell-lg">
        <Outlet />
      </main>
      </div>
      <BottomNav />
      {/* The floating assistant would sit on top of the quiz action bar, so it
          is the only thing hidden during an attempt. The nav stays visible. */}
      {!inAttempt && <FloatingChatButton />}
      <InstallBanner />
      {/* Admin announcement, shown once per the rules set on the banner. */}
      <BannerOverlay />
      {/* Weekly, dismissible nudge to share the app. Hidden during a quiz. */}
      {!inAttempt && <SharePrompt />}

      {splash.visible && !onboarding && (
        <SplashScreen name={firstName} onClose={splash.close} onSkipToday={splash.skipToday} />
      )}
      {onboarding && (
        <OnboardingFlow
          onDone={() => {
            setOnboarding(false)
            splash.close() // first launch already got a full intro
          }}
        />
      )}
    </div>
  )
}
