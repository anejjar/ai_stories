'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, BookOpen, Trophy, Star, ArrowRight } from 'lucide-react'
import { useOnboarding } from '@/hooks/use-onboarding'
import { useAuth } from '@/hooks/use-auth'
import Confetti from 'react-confetti'

interface SuccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storyId?: string
  storyTitle?: string
}

export function SuccessModal({ open, onOpenChange, storyId, storyTitle }: SuccessModalProps) {
  const router = useRouter()
  const { completeStep, completeChecklist } = useOnboarding()
  const { profile } = useAuth()
  const [showConfetti, setShowConfetti] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isTrial = profile?.subscriptionTier === 'trial'

  useEffect(() => {
    if (open) {
      setShowConfetti(true)
      // Stop confetti after 5 seconds
      const timer = setTimeout(() => setShowConfetti(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [open])

  const handleContinue = async () => {
    setIsLoading(true)
    try {
      // Complete first story step and checklist item
      await completeStep('first_story')
      await completeChecklist('first_story')

      onOpenChange(false)

      // Navigate to the story if we have an ID
      if (storyId) {
        router.push(`/story/${storyId}`)
      } else {
        router.push('/library')
      }
    } catch (error) {
      console.error('Error completing success:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgrade = () => {
    router.push('/pricing')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <DialogContent className="sm:max-w-[500px]">
        <div className="space-y-6">
          <DialogHeader>
            {/* Animated Trophy Icon */}
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-40 rounded-full animate-pulse" />
                <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-3xl animate-bounce">
                  <Trophy className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>

            <DialogTitle className="text-3xl font-comic text-center">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Amazing!
              </span>
            </DialogTitle>

            <DialogDescription className="text-center text-lg text-gray-700">
              You've created your first magical story!
            </DialogDescription>
          </DialogHeader>

          {/* Achievement Badge */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-2xl p-6 text-center">
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg px-4 py-2 mb-3">
              <Star className="w-5 h-5 mr-2" />
              Achievement Unlocked
            </Badge>
            <h3 className="font-comic text-xl font-bold text-gray-900 mb-2">
              First Story Created!
            </h3>
            {storyTitle && (
              <p className="text-gray-600 italic">"{storyTitle}"</p>
            )}
          </div>

          {/* Trial Reminder (if applicable) */}
          {isTrial && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-1">
                    Want to create more stories?
                  </h4>
                  <p className="text-sm text-blue-700">
                    Upgrade to PRO for unlimited text stories, themes, templates, and audio narration!
                  </p>
                </div>
              </div>
              <Button
                onClick={handleUpgrade}
                variant="outline"
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                View Upgrade Options
              </Button>
            </div>
          )}

          {/* Next Steps */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-center">What's next?</h4>
            <div className="grid gap-2">
              <NextStepCard
                icon={<BookOpen className="w-5 h-5" />}
                text="Read your story"
              />
              <NextStepCard
                icon={<Sparkles className="w-5 h-5" />}
                text="Try different themes & templates"
              />
              {!isTrial && (
                <NextStepCard
                  icon={<Star className="w-5 h-5" />}
                  text="Explore AI-illustrated stories"
                />
              )}
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleContinue}
            disabled={isLoading}
            className="w-full gradient-primary text-white text-lg py-6"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Loading...
              </>
            ) : (
              <>
                {storyId ? 'Read My Story' : 'Go to Library'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Helper component for next steps
function NextStepCard({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
      <div className="bg-white p-2 rounded-lg text-purple-600 border border-purple-200">
        {icon}
      </div>
      <p className="text-sm text-gray-700">{text}</p>
    </div>
  )
}
