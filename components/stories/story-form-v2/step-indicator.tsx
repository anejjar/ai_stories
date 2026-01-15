'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WIZARD_STEPS } from './wizard-context'

interface StepIndicatorProps {
  currentStep: number
  completedSteps: number[]
  onStepClick?: (step: number) => void
  disabled?: boolean
}

const stepIcons = ['1', '2', '3', '4']
const stepLabels = ['Child', 'Template', 'Customize', 'Review']

export function StepIndicator({ currentStep, completedSteps, onStepClick, disabled }: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-2">
        {WIZARD_STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(index)
          const isCurrent = index === currentStep
          const isClickable = !disabled && (isCompleted || index <= currentStep)

          return (
            <div key={step} className="flex items-center flex-1">
              {/* Step circle */}
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300',
                  'border-2 shrink-0',
                  isCompleted && 'bg-green-500 border-green-500 text-white',
                  isCurrent && !isCompleted && 'bg-purple-500 border-purple-500 text-white scale-110 shadow-lg shadow-purple-200',
                  !isCompleted && !isCurrent && 'bg-gray-100 border-gray-200 text-gray-400',
                  isClickable && !isCurrent && 'hover:scale-105 cursor-pointer',
                  !isClickable && 'cursor-not-allowed'
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : stepIcons[index]}
              </button>

              {/* Connector line */}
              {index < WIZARD_STEPS.length - 1 && (
                <div className="flex-1 h-1 mx-2">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Step labels */}
      <div className="flex items-center justify-between">
        {WIZARD_STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(index)
          const isCurrent = index === currentStep
          const label = stepLabels[index]

          return (
            <div key={step} className="flex items-center flex-1">
              {/* Step label */}
              <div
                className={cn(
                  'text-xs font-medium transition-colors duration-300 text-center shrink-0',
                  'w-10', // Match circle width
                  isCompleted && 'text-green-600',
                  isCurrent && !isCompleted && 'text-purple-600',
                  !isCompleted && !isCurrent && 'text-gray-600'
                )}
              >
                {label}
              </div>

              {/* Spacer for connector line */}
              {index < WIZARD_STEPS.length - 1 && (
                <div className="flex-1 mx-2" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
