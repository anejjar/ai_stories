'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { StoryFormV2 } from '@/components/stories/story-form-v2'
import { UpgradeModal } from '@/components/modals/upgrade-modal'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/components/ui/toaster'
import { Wand2 } from 'lucide-react'
import type { StoryInput, Story } from '@/types'
import { CreatePageTour } from '@/components/onboarding/create-page-tour'
import { SuccessModal } from '@/components/onboarding/success-modal'
import { useOnboarding } from '@/hooks/use-onboarding'
import { EmailVerificationRequired } from '@/components/auth/email-verification-required'
import { supabase } from '@/lib/supabase/client'

function CreateContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, userProfile, getAccessToken, isEmailVerified } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeTier, setUpgradeTier] = useState<'pro' | 'family'>('pro')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdStory, setCreatedStory] = useState<Story | null>(null)
  const { onboardingStep } = useOnboarding()
  const isFirstStory = onboardingStep === 'tour_active' || onboardingStep === 'first_story'

  const handleSubmit = async (data: StoryInput) => {
    if (!user) {
      setError('You must be logged in to create a story')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Get Supabase access token
      const token = await getAccessToken()
      if (!token) {
        throw new Error('Failed to get access token')
      }

      // Regular single story creation
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.data?.requiresUpgrade) {
          // Trial limit reached - show upgrade modal
          setError(result.error || 'Trial limit reached')
          setUpgradeTier('pro')
          setShowUpgradeModal(true)
          setLoading(false)
          return
        }
        throw new Error(result.error || 'Failed to create story')
      }

      if (result.success && result.data) {
        const story = result.data as Story

        // Show success modal for first-time users
        if (isFirstStory) {
          setCreatedStory(story)
          setShowSuccessModal(true)
        } else {
          toast.success('Story created!', 'Your magical story is ready!')
          router.push(`/story/${story.id}`)
        }
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      console.error('Error creating story:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create story. Please try again.'
      setError(errorMessage)
      toast.error('Oops! Something went wrong', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!user?.email) return

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      })

      if (error) throw error
      toast.success('Email sent!', 'Check your inbox for the verification link.')
    } catch (error) {
      toast.error('Failed to resend', 'Please try again later.')
    }
  }

  // Show upgrade modal if coming from story completion
  useEffect(() => {
    if (searchParams.get('upgrade') === 'true') {
      setShowUpgradeModal(true)
      setUpgradeTier('pro')
    }
  }, [searchParams])

  // Check email verification
  if (user && !isEmailVerified) {
    return (
      <div className="py-12 px-4 max-w-3xl mx-auto space-y-12">
        <EmailVerificationRequired
          email={user.email}
          onResend={handleResendVerification}
        />
      </div>
    )
  }

  return (
    <>
      <div className="py-8 px-4 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-playwize-orange text-sm font-bold border border-orange-200">
            <Wand2 className="h-4 w-4" />
            <span>AI Story Generator</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            Create a New <span className="text-playwize-purple">Story</span>
          </h1>
          <p className="text-gray-600 text-lg font-medium max-w-xl mx-auto">
            Follow the steps to create a personalized magical story
          </p>
        </div>

        {/* Main form card */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-[4rem] rotate-1 opacity-5" />
          <Card className="relative border-4 border-gray-100 shadow-2xl bg-white rounded-[3rem] overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 w-full" />
            <CardContent className="p-6 md:p-10">
              {error && (
                <div className="mb-6 p-4 text-sm text-red-700 bg-red-50 border-2 border-red-200 rounded-2xl font-semibold flex items-center gap-3">
                  <span className="text-xl">⚠️</span>
                  {error}
                </div>
              )}

              <StoryFormV2
                onSubmit={handleSubmit}
                disabled={loading}
                loading={loading}
                onShowUpgrade={(tier) => {
                  setUpgradeTier(tier)
                  setShowUpgradeModal(true)
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        tier={upgradeTier}
      />
      <CreatePageTour />
      <SuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        storyId={createdStory?.id}
        storyTitle={createdStory?.title}
      />
    </>
  )
}

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen bg-gradient-hero">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      }
    >
      <CreateContent />
    </Suspense>
  )
}
