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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {screen === 'welcome' ? (
          <div className="space-y-6">
            {/* Welcome Screen */}
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-primary blur-2xl opacity-30 rounded-full" />
                  <div className="relative bg-gradient-primary p-4 rounded-2xl">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>
              <DialogTitle className="text-3xl font-comic text-center bg-gradient-primary bg-clip-text text-transparent">
                Welcome to AI Stories!
              </DialogTitle>
              <DialogDescription className="text-center text-lg text-gray-600">
                Create magical, personalized stories for your child with the power of AI
              </DialogDescription>
            </DialogHeader>

            {/* Feature Highlights */}
            <div className="grid gap-4 py-4">
              <FeatureCard
                icon={<BookOpen className="w-6 h-6" />}
                title="Personalized Stories"
                description="Every story features your child as the hero with their unique traits"
              />
              <FeatureCard
                icon={<Palette className="w-6 h-6" />}
                title="25+ Magical Themes"
                description="From adventures to bedtime tales, pick from endless themes"
              />
              <FeatureCard
                icon={<Heart className="w-6 h-6" />}
                title="Safe & Educational"
                description="100% kid-safe content with optional moral lessons"
              />
              <FeatureCard
                icon={<Wand2 className="w-6 h-6" />}
                title="AI-Powered"
                description="Advanced AI creates unique stories every time"
              />
            </div>

            {/* Trial Badge */}
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 text-center">
              <Badge className="bg-purple-500 text-white mb-2">
                Free Trial
              </Badge>
              <p className="text-sm text-purple-700">
                Start with 1 free story to see the magic!
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleGetStarted}
                className="w-full gradient-primary text-white text-lg py-6"
                disabled={isLoading}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Get Started
              </Button>
              <Button
                onClick={handleSkipAll}
                variant="ghost"
                className="w-full text-gray-500"
                disabled={isLoading}
              >
                Skip tour
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Setup Screen */}
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-secondary blur-2xl opacity-30 rounded-full" />
                  <div className="relative bg-gradient-secondary p-4 rounded-2xl">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>
              <DialogTitle className="text-2xl font-comic text-center bg-gradient-secondary bg-clip-text text-transparent">
                Who's the star of the story?
              </DialogTitle>
              <DialogDescription className="text-center text-gray-600">
                Add your child's name to make stories more magical and personal
              </DialogDescription>
            </DialogHeader>

            {/* Quick Profile Form */}
            <QuickProfileForm
              onSuccess={handleProfileCreated}
              onSkip={handleSkipProfile}
              isLoading={isLoading}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Helper component for feature cards
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="bg-gradient-primary p-2 rounded-lg text-white flex-shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  )
}
