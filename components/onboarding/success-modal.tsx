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
  const { userProfile } = useAuth()
  const [showConfetti, setShowConfetti] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isTrial = userProfile?.subscriptionTier === 'trial'

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
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-0 bg-transparent shadow-none ring-0 focus:ring-0 focus-visible:ring-0 max-h-[95vh]">
        {showConfetti && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={500}
            gravity={0.3}
          />
        )}

        <div className="bg-white rounded-[4rem] border-8 border-gray-50 shadow-2xl overflow-hidden relative flex flex-col max-h-[95vh]">
          {/* Top Decorative Header */}
          <div className="h-40 w-full shrink-0 relative overflow-hidden bg-playwize-purple">
            <div className="absolute inset-0 playwize-bg opacity-20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center space-y-1">
                <div className="relative inline-block mb-2">
                  <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-40 rounded-full animate-pulse" />
                  <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-3xl animate-bounce shadow-lg">
                    <Trophy className="w-10 h-10 text-white" />
                  </div>
                </div>
                <DialogTitle className="text-4xl font-black tracking-tight">Amazing! 🎉</DialogTitle>
                <p className="text-white/90 font-bold uppercase tracking-[0.2em] text-xs">
                  First Adventure Complete
                </p>
              </div>
            </div>

            {/* Hidden description for accessibility */}
            <DialogDescription className="sr-only">
              Congratulations on creating your first magical story!
            </DialogDescription>

            {/* Floating Elements */}
            <div className="absolute top-4 right-4 animate-float-gentle opacity-50 text-2xl">✨</div>
            <div className="absolute bottom-4 left-6 animate-bounce-slow opacity-30 text-2xl">⭐</div>
          </div>

          {/* Scrollable Content Area */}
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <div className="p-8 md:p-10 space-y-8">
              <div className="text-center space-y-4">
                <p className="text-gray-500 font-bold text-lg leading-relaxed">
                  You've created your first magical story!
                </p>
              </div>

              {/* Achievement Badge */}
              <div className="bg-purple-50 border-4 border-white rounded-[2.5rem] p-8 text-center shadow-sm relative group">
                <div className="absolute -top-4 -right-4 bg-playwize-orange text-white h-12 w-12 rounded-full flex items-center justify-center shadow-lg rotate-12 group-hover:rotate-0 transition-transform">
                  <Star className="w-6 h-6 fill-white" />
                </div>
                <Badge className="bg-playwize-purple text-white mb-4 font-black px-6 py-2 rounded-full text-sm tracking-widest uppercase shadow-md">
                  NEW BADGE!
                </Badge>
                <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight">
                  "First Story Created"
                </h3>
                {storyTitle && (
                  <p className="text-gray-500 font-bold italic text-lg px-4 truncate">
                    {storyTitle}
                  </p>
                )}
              </div>

              {/* Trial Reminder (if applicable) */}
              {isTrial && (
                <div className="bg-blue-50 border-2 border-white rounded-[2rem] p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-blue-500">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-gray-900 leading-tight">Want more stories?</h4>
                      <p className="text-sm font-bold text-gray-500">Upgrade for unlimited magic! 🚀</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleUpgrade}
                    className="w-full h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-black text-sm shadow-lg shadow-blue-100 transition-all"
                  >
                    VIEW UPGRADE OPTIONS
                  </Button>
                </div>
              )}

              {/* Next Steps Grid */}
              <div className="grid gap-3">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest text-center mb-1">
                  What's Next?
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  <NextStepCard
                    icon={<BookOpen className="w-5 h-5" />}
                    text="Read your story"
                    color="bg-purple-50"
                    iconColor="text-playwize-purple"
                  />
                  <NextStepCard
                    icon={<Sparkles className="w-5 h-5" />}
                    text="Try new themes"
                    color="bg-orange-50"
                    iconColor="text-playwize-orange"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions - Fixed at bottom */}
          <div className="p-8 md:p-10 pt-4 bg-white border-t-2 border-gray-50 shrink-0">
            <Button
              onClick={handleContinue}
              disabled={isLoading}
              className="w-full h-16 rounded-full bg-playwize-purple hover:bg-purple-700 text-white font-black text-xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
              ) : (
                <span className="flex items-center gap-3">
                  {storyId ? 'READ MY STORY' : 'GO TO LIBRARY'}
                  <ArrowRight className="w-6 h-6" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Helper component for next steps
function NextStepCard({ 
  icon, 
  text,
  color,
  iconColor
}: { 
  icon: React.ReactNode; 
  text: string;
  color: string;
  iconColor: string;
}) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 border-white shadow-sm ${color}`}>
      <div className={`h-10 w-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm ${iconColor}`}>
        {icon}
      </div>
      <p className="text-sm font-black text-gray-700 leading-tight">{text}</p>
    </div>
  )
}
