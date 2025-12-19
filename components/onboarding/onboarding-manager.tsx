'use client'

import { useEffect, useState } from 'react'
import { useOnboarding } from '@/hooks/use-onboarding'
import { useAuth } from '@/hooks/use-auth'
import { WelcomeModal } from './welcome-modal'

/**
 * OnboardingManager Component
 * Manages the onboarding flow by showing the welcome modal when appropriate
 * Should be placed in the dashboard layout to handle new users
 */
export function OnboardingManager() {
  const { user, loading: authLoading } = useAuth()
  const { shouldShowWelcome } = useOnboarding()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return

    // Only show for authenticated users who need onboarding
    if (user && shouldShowWelcome) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setShowModal(true)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [user, authLoading, shouldShowWelcome])

  if (!user || authLoading) {
    return null
  }

  return (
    <WelcomeModal
      open={showModal}
      onOpenChange={setShowModal}
    />
  )
}
