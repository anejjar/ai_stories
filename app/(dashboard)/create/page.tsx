'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { StoryForm } from '@/components/stories/story-form'
import { DraftComparison } from '@/components/stories/draft-comparison'
import { UpgradeModal } from '@/components/modals/upgrade-modal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/components/ui/toaster'
import { Sparkles, ArrowLeft } from 'lucide-react'
import type { StoryInput, Story } from '@/types'

function CreateContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, userProfile, getAccessToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeTier, setUpgradeTier] = useState<'pro' | 'pro_max'>('pro')
  const [drafts, setDrafts] = useState<Story[]>([])
  const [parentStoryId, setParentStoryId] = useState<string | undefined>(undefined)
  const [generateDrafts, setGenerateDrafts] = useState(false)

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

      // If generating drafts, use the drafts endpoint
      if (generateDrafts && (userProfile?.subscriptionTier === 'pro' || userProfile?.subscriptionTier === 'pro_max')) {
        const response = await fetch('/api/stories/drafts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...data,
            numberOfDrafts: 3,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          if (result.data?.requiresUpgrade) {
            setError(result.error || 'Draft generation requires PRO subscription')
            setUpgradeTier('pro')
            setShowUpgradeModal(true)
            setLoading(false)
            return
          }
          throw new Error(result.error || 'Failed to generate drafts')
        }

        if (result.success && result.data) {
          setDrafts(result.data.drafts || [])
          setParentStoryId(result.data.parentStoryId)
          toast.success('Drafts generated! 🎉', `We've created ${result.data.drafts?.length || 0} different versions for you to choose from!`)
        } else {
          throw new Error('Invalid response from server')
        }
      } else {
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
          toast.success('Story created! 🎉', 'Your magical story is ready!')
          // Redirect to story viewer
          router.push(`/story/${story.id}`)
        } else {
          throw new Error('Invalid response from server')
        }
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

  const handleDraftSelected = (story: Story) => {
    // Navigate to the selected story
    router.push(`/story/${story.id}`)
  }

  const handleBackToForm = () => {
    setDrafts([])
    setParentStoryId(undefined)
    setGenerateDrafts(false)
  }

  // Show upgrade modal if coming from story completion
  useEffect(() => {
    if (searchParams.get('upgrade') === 'true') {
      setShowUpgradeModal(true)
      setUpgradeTier('pro')
    }
  }, [searchParams])

  // Check if user is on trial and has reached limit
  useEffect(() => {
    if (userProfile?.subscriptionTier === 'trial') {
      // Check trial status - this would ideally come from a hook
      // For now, we'll show modal when they try to create
    }
  }, [userProfile])

  return (
    <>
      <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 text-5xl animate-float opacity-30">📚</div>
        <div className="absolute bottom-20 left-10 text-5xl animate-float opacity-30" style={{ animationDelay: '1s' }}>✨</div>
        <div className="absolute top-1/2 left-20 text-4xl animate-bounce-slow opacity-20">🎨</div>

        <div className="container mx-auto px-4 py-8 max-w-2xl relative z-10">
          <Card className="border-4 border-primary shadow-2xl bg-card backdrop-blur-sm">
            <CardHeader className="bg-gradient-primary rounded-t-lg border-b-4 border-primary">
              <div className="flex items-center gap-3">
                <div className="text-5xl animate-bounce-slow">🎭</div>
                <div>
                  <CardTitle className="text-4xl font-comic text-gradient-primary">
                    Create a New Story
                  </CardTitle>
                  <CardDescription className="text-lg text-muted-foreground mt-2">
                    Fill in the details below to generate a magical story for your child! ✨
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {error && (
                <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 border-2 border-red-300 rounded-2xl font-semibold">
                  ⚠️ {error}
                </div>
              )}

              {drafts.length > 0 ? (
                <div className="space-y-4">
                  <Button
                    onClick={handleBackToForm}
                    variant="outline"
                    className="mb-4 rounded-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Form
                  </Button>
                  <DraftComparison
                    drafts={drafts}
                    parentStoryId={parentStoryId}
                    onDraftSelected={handleDraftSelected}
                  />
                </div>
              ) : (
                <>
                  {(userProfile?.subscriptionTier === 'pro' || userProfile?.subscriptionTier === 'pro_max') && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-card to-accent/10 rounded-xl border-2 border-accent">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={generateDrafts}
                          onChange={(e) => setGenerateDrafts(e.target.checked)}
                          className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-primary"
                        />
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-accent" />
                          <span className="font-bold text-foreground">
                            Generate Multiple Drafts (PRO Feature) ✨
                          </span>
                        </div>
                      </label>
                      <p className="text-sm text-muted-foreground mt-2 ml-8 font-semibold">
                        Get 3 different versions of your story and choose your favorite! Perfect for finding the perfect bedtime tale. 🌙
                      </p>
                    </div>
                  )}
                  <StoryForm
                    onSubmit={handleSubmit}
                    disabled={loading}
                    loading={loading}
                    onShowUpgrade={(tier) => {
                      setUpgradeTier(tier)
                      setShowUpgradeModal(true)
                    }}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        tier={upgradeTier}
      />
    </>
  )
}

export default function CreatePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen bg-gradient-hero">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <CreateContent />
    </Suspense>
  )
}
