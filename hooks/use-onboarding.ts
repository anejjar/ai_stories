import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './use-auth'
import type {
  OnboardingStep,
  OnboardingState,
  OnboardingChecklist,
  OnboardingUpdateRequest,
} from '@/types'

interface UseOnboardingReturn {
  // State
  onboardingCompleted: boolean
  onboardingStep: OnboardingStep
  onboardingDismissedAt: Date | null
  onboardingChecklist: OnboardingChecklist | null
  isLoading: boolean

  // Computed
  shouldShowWelcome: boolean
  shouldShowTour: boolean
  shouldShowChecklist: boolean
  checklistProgress: {
    completed: number
    total: number
    percentage: number
  }

  // Actions
  completeStep: (step: OnboardingStep) => Promise<void>
  skipOnboarding: () => Promise<void>
  resumeOnboarding: () => Promise<void>
  completeChecklist: (itemId: string) => Promise<void>
  dismissChecklist: () => Promise<void>
  resetOnboarding: () => Promise<void>
}

export function useOnboarding(): UseOnboardingReturn {
  const { user, userProfile: profile, refreshProfile, getAccessToken } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  // Extract onboarding state from profile
  const onboardingCompleted = profile?.onboardingCompleted ?? false
  const onboardingStep = profile?.onboardingStep ?? 'welcome'
  const onboardingDismissedAt = profile?.onboardingDismissedAt ?? null
  const onboardingChecklist = profile?.onboardingChecklist ?? null

  // Computed values
  const now = new Date()
  const oneDayInMs = 24 * 60 * 60 * 1000
  const isDismissedRecently = onboardingDismissedAt && (now.getTime() - onboardingDismissedAt.getTime() < oneDayInMs)
  
  const shouldShowWelcome = !onboardingCompleted && !isDismissedRecently && onboardingStep === 'welcome'
  const shouldShowTour = !onboardingCompleted && onboardingStep === 'tour_active'
  const shouldShowChecklist = !onboardingChecklist?.dismissed && !onboardingCompleted

  const checklistProgress = onboardingChecklist
    ? {
        completed: onboardingChecklist.items.filter((item: any) => item.completed).length,
        total: onboardingChecklist.items.length,
        percentage: Math.round(
          (onboardingChecklist.items.filter((item: any) => item.completed).length /
            onboardingChecklist.items.length) *
            100
        ),
      }
    : { completed: 0, total: 0, percentage: 0 }

  // Update onboarding state via API
  const updateOnboarding = useCallback(
    async (updates: OnboardingUpdateRequest) => {
      if (!user) return

      setIsLoading(true)
      try {
        const token = await getAccessToken()
        if (!token) {
          throw new Error('No access token found')
        }

        const response = await fetch('/api/users/onboarding', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('Onboarding API error:', errorData)
          throw new Error(errorData.error || 'Failed to update onboarding')
        }

        const data = await response.json()

        // Refresh user profile to get updated onboarding state
        await refreshProfile()

        return data
      } catch (error) {
        console.error('Error updating onboarding:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [user, refreshProfile]
  )

  // Complete a specific onboarding step
  const completeStep = useCallback(
    async (step: OnboardingStep) => {
      let nextStep: OnboardingStep = 'completed'

      // Determine next step
      switch (step) {
        case 'welcome':
          nextStep = 'profile_setup'
          break
        case 'profile_setup':
          nextStep = 'tour_active'
          break
        case 'tour_active':
          nextStep = 'first_story'
          break
        case 'first_story':
          nextStep = 'completed'
          break
      }

      await updateOnboarding({
        step: nextStep,
        completed: nextStep === 'completed',
      })

      // Auto-complete first story checklist item when completing first_story step
      if (step === 'first_story') {
        await updateOnboarding({
          checklistUpdate: {
            itemId: 'first_story',
            completed: true,
          },
        })
      }
    },
    [updateOnboarding]
  )

  // Skip the entire onboarding
  const skipOnboarding = useCallback(async () => {
    await updateOnboarding({
      dismissed: true,
      completed: false,
    })
  }, [updateOnboarding])

  // Resume onboarding (if previously dismissed)
  const resumeOnboarding = useCallback(async () => {
    await updateOnboarding({
      dismissed: false,
      step: onboardingStep === 'completed' ? 'welcome' : onboardingStep,
    })
  }, [updateOnboarding, onboardingStep])

  // Complete a checklist item
  const completeChecklist = useCallback(
    async (itemId: string) => {
      await updateOnboarding({
        checklistUpdate: {
          itemId,
          completed: true,
        },
      })
    },
    [updateOnboarding]
  )

  // Dismiss the checklist widget
  const dismissChecklist = useCallback(async () => {
    if (!onboardingChecklist) return

    // Update the checklist with dismissed flag
    const updatedChecklist = {
      ...onboardingChecklist,
      dismissed: true,
    }

    await updateOnboarding({
      checklistUpdate: { itemId: '_dismiss', completed: true }, // Special marker for dismissal
    })
  }, [updateOnboarding, onboardingChecklist])

  // Reset onboarding (useful for testing)
  const resetOnboarding = useCallback(async () => {
    await updateOnboarding({
      step: 'welcome',
      completed: false,
      dismissed: false,
    })
  }, [updateOnboarding])

  return {
    // State
    onboardingCompleted,
    onboardingStep,
    onboardingDismissedAt,
    onboardingChecklist,
    isLoading,

    // Computed
    shouldShowWelcome,
    shouldShowTour,
    shouldShowChecklist,
    checklistProgress,

    // Actions
    completeStep,
    skipOnboarding,
    resumeOnboarding,
    completeChecklist,
    dismissChecklist,
    resetOnboarding,
  }
}
