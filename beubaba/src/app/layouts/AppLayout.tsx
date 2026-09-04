import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { OnboardingFlow, hasOnboarded } from '@/components/onboarding/OnboardingFlow'
import { BottomNav } from '@/components/navigation/BottomNav'
import { FloatingChatButton } from '@/components/navigation/FloatingChatButton'
import { AppHeader } from '@/components/navigation/AppHeader'
import { SideRail } from '@/components/navigation/SideRail'
import { SplashScreen } from '@/features/splash/SplashScreen'
import { useSplash } from '@/features/splash/useSplash'
import { useAuth } from '@/app/providers/AuthProvider'
import { InstallBanner } from '@/app/pwa/InstallBanner'
import { settingsService } from '@/services/settingsService'
import { useUserId } from '@/features/quiz/hooks'

/**
 * Authenticated student shell: quiet environment + a very subtle faded campus
 * wash (shared visual language with the auth screens) + content + floating nav.
 */
export function AppLayout() {
  const { user } = useAuth()
  const splash = useSplash()
  const userId = useUserId()
  const firstName = user?.profile.full_name.split(' ')[0]
  // First-launch onboarding (reference-matched): shown once per browser.
  const [onboarding, setOnboarding] = useState(() => !hasOnboarded())

  // Honor the persisted "reduce motion" preference for this account/device.
  useEffect(() => {
    settingsService.applyFor(userId)
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
      <FloatingChatButton />
      <InstallBanner />

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
