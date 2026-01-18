'use client'

import { useMemo, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { WizardProvider, useWizard, WIZARD_STEPS } from './wizard-context'
import { StepIndicator } from './step-indicator'
import { StepChild } from './steps/step-child'
import { StepTemplate } from './steps/step-template'
import { StepCustomize } from './steps/step-customize'
import { StepReview } from './steps/step-review'
import type { StoryInput } from '@/types'

interface StoryFormV2Props {
  onSubmit: (data: StoryInput) => Promise<void>
  disabled?: boolean
  loading?: boolean
  onShowUpgrade?: (tier: 'pro' | 'family') => void
}

function StoryFormV2Inner({ onSubmit, disabled, loading, onShowUpgrade }: StoryFormV2Props) {
  const { currentStep, goToStep, validateStep, getStoryInput, clearDraft } = useWizard()

  // Clear any existing draft on mount (modal is disabled)
  useEffect(() => {
    clearDraft()
  }, [clearDraft])

  // Calculate completed steps
  const completedSteps = useMemo(() => {
    const completed: number[] = []
    for (let i = 0; i < currentStep; i++) {
      if (validateStep(i)) {
        completed.push(i)
      }
    }
    return completed
  }, [currentStep, validateStep])

  const handleSubmit = async () => {
    const storyInput = getStoryInput()
    await onSubmit(storyInput)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepChild disabled={disabled || loading} />
      case 1:
        return <StepTemplate disabled={disabled || loading} />
      case 2:
        return <StepCustomize disabled={disabled || loading} onShowUpgrade={onShowUpgrade} />
      case 3:
        return (
          <StepReview
            disabled={disabled}
            loading={loading}
            onSubmit={handleSubmit}
            onShowUpgrade={onShowUpgrade}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      <div className="w-full max-w-2xl mx-auto">
        {/* Step indicator */}
        <div className="mb-8 px-4">
          <StepIndicator
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={goToStep}
            disabled={loading}
          />
        </div>

        {/* Step content with animations */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        </div>
      </div>
    </>
  )
}

export function StoryFormV2(props: StoryFormV2Props) {
  return (
    <WizardProvider>
      <StoryFormV2Inner {...props} />
    </WizardProvider>
  )
}

export { WizardProvider, useWizard } from './wizard-context'
