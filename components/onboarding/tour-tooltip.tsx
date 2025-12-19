'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { X, ArrowRight, ArrowLeft } from 'lucide-react'
import type { TourTooltipConfig } from '@/types'

interface TourTooltipProps {
  config: TourTooltipConfig
  onNext?: () => void
  onPrevious?: () => void
  onSkip?: () => void
  onComplete?: () => void
}

export function TourTooltip({
  config,
  onNext,
  onPrevious,
  onSkip,
  onComplete,
}: TourTooltipProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const [visible, setVisible] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const isFirst = config.step === 1
  const isLast = config.step === config.totalSteps

  useEffect(() => {
    // Find the target element and calculate position
    const updatePosition = () => {
      const targetElement = document.querySelector(config.target)
      if (!targetElement || !tooltipRef.current) {
        setVisible(false)
        return
      }

      const targetRect = targetElement.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const padding = 16

      let top = 0
      let left = 0

      switch (config.placement) {
        case 'top':
          top = targetRect.top + window.scrollY - tooltipRect.height - padding
          left = targetRect.left + window.scrollX + targetRect.width / 2 - tooltipRect.width / 2
          break
        case 'bottom':
          top = targetRect.bottom + window.scrollY + padding
          left = targetRect.left + window.scrollX + targetRect.width / 2 - tooltipRect.width / 2
          break
        case 'left':
          top = targetRect.top + window.scrollY + targetRect.height / 2 - tooltipRect.height / 2
          left = targetRect.left + window.scrollX - tooltipRect.width - padding
          break
        case 'right':
          top = targetRect.top + window.scrollY + targetRect.height / 2 - tooltipRect.height / 2
          left = targetRect.right + window.scrollX + padding
          break
      }

      // Ensure tooltip stays within viewport
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      if (left < padding) left = padding
      if (left + tooltipRect.width > viewportWidth - padding) {
        left = viewportWidth - tooltipRect.width - padding
      }
      if (top < padding) top = padding
      if (top + tooltipRect.height > viewportHeight + window.scrollY - padding) {
        top = viewportHeight + window.scrollY - tooltipRect.height - padding
      }

      setPosition({ top, left })
      setVisible(true)

      // Add highlight to target element
      targetElement.classList.add('tour-highlight')
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    // Wait for DOM to be ready
    const timer = setTimeout(updatePosition, 100)

    // Update on resize/scroll
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition)

      // Remove highlight from all elements
      document.querySelectorAll('.tour-highlight').forEach((el) => {
        el.classList.remove('tour-highlight')
      })
    }
  }, [config.target, config.placement])

  const handleNext = () => {
    if (isLast && onComplete) {
      onComplete()
    } else if (onNext) {
      onNext()
    }
  }

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998] pointer-events-none tour-backdrop" />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`
          fixed z-[9999] bg-white rounded-xl shadow-2xl border-2 border-purple-300
          max-w-sm p-5 transition-all duration-300
          ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
        style={
          position
            ? { top: `${position.top}px`, left: `${position.left}px` }
            : { visibility: 'hidden' }
        }
      >
        {/* Close button */}
        <button
          onClick={onSkip}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Skip tour"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        {/* Progress indicator */}
        <div className="flex gap-1 mb-3">
          {Array.from({ length: config.totalSteps }, (_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full flex-1 ${
                i + 1 <= config.step ? 'bg-purple-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="font-comic text-lg font-bold text-gray-900 mb-2">
            {config.title}
          </h3>
          <p className="text-sm text-gray-600">{config.description}</p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-gray-500">
            Step {config.step} of {config.totalSteps}
          </div>
          <div className="flex gap-2">
            {!isFirst && onPrevious && (
              <Button
                onClick={onPrevious}
                variant="outline"
                size="sm"
                className="border-gray-300"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              size="sm"
              className="gradient-primary text-white"
            >
              {isLast ? 'Got it!' : 'Next'}
              {!isLast && <ArrowRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Add CSS for tour highlight */}
      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 9997 !important;
          box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.4), 0 0 0 8px rgba(168, 85, 247, 0.2) !important;
          border-radius: 0.5rem !important;
          transition: all 0.3s ease !important;
        }

        .tour-backdrop {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}

// Tour Wrapper Component - Manages multiple tooltip steps
interface TourWrapperProps {
  steps: TourTooltipConfig[]
  onComplete: () => void
  onSkip: () => void
}

export function TourWrapper({ steps, onComplete, onSkip }: TourWrapperProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (steps.length === 0) return null

  return (
    <TourTooltip
      config={steps[currentStep]}
      onNext={handleNext}
      onPrevious={currentStep > 0 ? handlePrevious : undefined}
      onSkip={onSkip}
      onComplete={onComplete}
    />
  )
}
