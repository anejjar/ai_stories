'use client'

import { useEffect } from 'react'
import { useOnboarding } from '@/hooks/use-onboarding'
import { TourWrapper } from './tour-tooltip'
import type { TourTooltipConfig } from '@/types'

const TOUR_STEPS: TourTooltipConfig[] = [
  {
    id: 'theme-select',
    target: '[data-tour="theme-select"]',
    title: 'Choose a Theme',
    description: 'Pick from 25+ magical themes like Adventure, Fantasy, or Pirates! Each theme shapes your story in unique ways.',
    placement: 'bottom',
    step: 1,
    totalSteps: 4,
  },
  {
    id: 'template-section',
    target: '[data-tour="template-section"]',
    title: 'Use Story Templates',
    description: 'Try our pre-made templates for quick story creation! Templates give you a head start with storylines.',
    placement: 'bottom',
    step: 2,
    totalSteps: 4,
  },
  {
    id: 'trial-badge',
    target: '[data-tour="trial-badge"]',
    title: 'Your Free Trial',
    description: 'You have 1 free story to try! Upgrade to PRO anytime for unlimited stories and premium features.',
    placement: 'left',
    step: 3,
    totalSteps: 4,
  },
  {
    id: 'generate-button',
    target: '[data-tour="generate-button"]',
    title: 'Generate Your Story',
    description: 'Click here when you\'re ready! Our AI will create a unique, personalized story in seconds.',
    placement: 'top',
    step: 4,
    totalSteps: 4,
  },
]

export function CreatePageTour() {
  const { shouldShowTour, completeStep } = useOnboarding()

  const handleTourComplete = async () => {
    await completeStep('tour_active')
  }

  const handleTourSkip = async () => {
    await completeStep('tour_active')
  }

  if (!shouldShowTour) {
    return null
  }

  return (
    <TourWrapper
      steps={TOUR_STEPS}
      onComplete={handleTourComplete}
      onSkip={handleTourSkip}
    />
  )
}
