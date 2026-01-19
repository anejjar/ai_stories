'use client'

import { useState } from 'react'
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
import { Sparkles, BookOpen, Heart, Wand2, Users, Palette } from 'lucide-react'
import { useOnboarding } from '@/hooks/use-onboarding'
import { QuickProfileForm } from './quick-profile-form'

interface WelcomeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WelcomeModal({ open, onOpenChange }: WelcomeModalProps) {
  const router = useRouter()
  const { completeStep, skipOnboarding } = useOnboarding()
  const [screen, setScreen] = useState<'welcome' | 'profile'>('welcome')
  const [isLoading, setIsLoading] = useState(false)

  const handleGetStarted = () => {
    setScreen('profile')
  }

  const handleSkipProfile = async () => {
    setIsLoading(true)
    try {
      // Complete welcome step and go to create page with tour
      await completeStep('profile_setup')
      onOpenChange(false)
      router.push('/create')
    } catch (error) {
      console.error('Error skipping profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileCreated = async () => {
    setIsLoading(true)
    try {
      // Profile created, move to tour
      await completeStep('profile_setup')
      onOpenChange(false)
      router.push('/create')
    } catch (error) {
      console.error('Error completing profile step:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkipAll = async () => {
    setIsLoading(true)
    try {
      await skipOnboarding()
      onOpenChange(false)
      router.push('/library')
    } catch (error) {
      console.error('Error skipping onboarding:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-0 bg-transparent shadow-none ring-0 focus:ring-0 focus-visible:ring-0 max-h-[95vh]">
        <div className="bg-white rounded-[4rem] border-8 border-gray-50 shadow-2xl overflow-hidden relative flex flex-col max-h-[95vh]">
          {/* Top Decorative Header */}
          <div className={`h-32 w-full shrink-0 relative overflow-hidden ${
            screen === 'welcome' ? 'bg-playwize-purple' : 'bg-playwize-orange'
          }`}>
            <div className="absolute inset-0 playwize-bg opacity-20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center space-y-1">
                <div className="flex items-center justify-center gap-2 mb-1">
                  {screen === 'welcome' ? (
                    <Sparkles className="h-6 w-6 text-white animate-pulse" />
                  ) : (
                    <Users className="h-6 w-6 text-white animate-bounce-slow" />
                  )}
                  <span className="text-xs font-black uppercase tracking-[0.3em] opacity-90">
                    {screen === 'welcome' ? 'WELCOME' : 'GET PERSONAL'}
                  </span>
                </div>
                <DialogTitle className="text-3xl font-black tracking-tight">
                  {screen === 'welcome' ? 'Welcome to AI Stories!' : 'Meet the Star!'}
                </DialogTitle>
              </div>
            </div>

            {/* Hidden description for accessibility */}
            <DialogDescription className="sr-only">
              {screen === 'welcome' 
                ? 'Introduction to AI Stories features and onboarding' 
                : 'Setup your childs profile to personalize their stories'}
            </DialogDescription>

            {/* Floating Elements */}
            <div className="absolute top-4 right-4 animate-float-gentle opacity-50 text-xl">✨</div>
            <div className="absolute bottom-4 left-6 animate-bounce-slow opacity-30 text-xl">⭐</div>
          </div>

          {/* Scrollable Content Area */}
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <div className="p-8 md:p-10 space-y-8">
              {screen === 'welcome' ? (
                <>
                  <div className="text-center space-y-4">
                    <p className="text-gray-500 font-bold text-lg leading-relaxed px-4">
                      Create magical, personalized stories for your child with the power of AI ✨
                    </p>
                  </div>

                  {/* Feature Highlights Grid */}
                  <div className="grid gap-3">
                    <FeatureCard
                      icon={<BookOpen className="w-5 h-5" />}
                      title="Personalized Stories"
                      description="Every story features your child as the hero"
                      color="bg-purple-50"
                      iconColor="text-playwize-purple"
                    />
                    <FeatureCard
                      icon={<Palette className="w-5 h-5" />}
                      title="25+ Magical Themes"
                      description="From space adventures to jungle tales"
                      color="bg-orange-50"
                      iconColor="text-playwize-orange"
                    />
                    <FeatureCard
                      icon={<Heart className="w-5 h-5" />}
                      title="Safe & Educational"
                      description="100% kid-safe content with moral lessons"
                      color="bg-pink-50"
                      iconColor="text-pink-500"
                    />
                    <FeatureCard
                      icon={<Wand2 className="w-5 h-5" />}
                      title="AI Magic"
                      description="Advanced AI creates unique stories instantly"
                      color="bg-blue-50"
                      iconColor="text-blue-500"
                    />
                  </div>

                  {/* Trial Badge */}
                  <div className="bg-gray-50 border-2 border-gray-100 rounded-[2rem] p-6 text-center shadow-sm">
                    <Badge className="bg-playwize-purple text-white mb-2 font-black px-4 py-1 rounded-full text-xs tracking-widest">
                      FREE TRIAL
                    </Badge>
                    <p className="text-sm font-bold text-gray-600">
                      Start with 1 free story to see the magic!
                    </p>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="text-center space-y-4">
                    <p className="text-gray-500 font-bold text-lg leading-relaxed px-4">
                      Add your child's name to make stories more magical and personal
                    </p>
                  </div>
                  
                  {/* Quick Profile Form */}
                  <QuickProfileForm
                    onSuccess={handleProfileCreated}
                    onSkip={handleSkipProfile}
                    isLoading={isLoading}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions - Fixed at bottom */}
          {screen === 'welcome' && (
            <div className="p-8 md:p-10 pt-4 bg-white border-t-2 border-gray-50 shrink-0">
              <Button
                onClick={handleGetStarted}
                disabled={isLoading}
                className="w-full h-16 rounded-full bg-playwize-purple hover:bg-purple-700 text-white font-black text-xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-6 h-6 mr-3" />
                GET STARTED
              </Button>
              <button
                onClick={handleSkipAll}
                disabled={isLoading}
                className="w-full mt-4 text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors"
              >
                Skip tour
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Helper component for feature cards
function FeatureCard({
  icon,
  title,
  description,
  color,
  iconColor
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: string
  iconColor: string
}) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-[2rem] border-2 border-white shadow-sm ${color}`}>
      <div className={`h-10 w-10 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm ${iconColor}`}>
        {icon}
      </div>
      <div>
        <h4 className="font-black text-gray-900 leading-tight">{title}</h4>
        <p className="text-sm font-bold text-gray-500">{description}</p>
      </div>
    </div>
  )
}
