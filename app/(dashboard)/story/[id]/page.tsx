'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { StoryDisplay } from '@/components/stories/story-display'
import { UpgradeModal } from '@/components/modals/upgrade-modal'
import { useAuth } from '@/hooks/use-auth'
import { useTrial } from '@/hooks/use-trial'
import { Button } from '@/components/ui/button'

import { Loader2 } from 'lucide-react'
import type { Story } from '@/types'

export default function StoryPage() {
  const params = useParams()
  const router = useRouter()
  const { user, userProfile, getAccessToken } = useAuth()
  const { isTrialCompleted, storiesGenerated, isFirstStory } = useTrial()
  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [hasShownModal, setHasShownModal] = useState(false)

  const storyId = params.id as string

  useEffect(() => {
    async function fetchStory() {
      if (!user || !storyId) {
        setLoading(false)
        return
      }

      try {
        const token = await getAccessToken()
        if (!token) {
          throw new Error('Failed to get access token')
        }
        const response = await fetch(`/api/stories/${storyId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          if (response.status === 404) {
            setError('Story not found')
          } else {
            setError('Failed to load story')
          }
          setLoading(false)
          return
        }

        const result = await response.json()
        if (result.success && result.data) {
          setStory(result.data)
          
          // Show upgrade modal after first story completion (emotional moment)
          // Only show once per session and only if trial was just completed
          if (
            userProfile?.subscriptionTier === 'trial' &&
            isTrialCompleted &&
            storiesGenerated === 1 &&
            !hasShownModal
          ) {
            // Small delay to let user read the story first
            setTimeout(() => {
              setShowUpgradeModal(true)
              setHasShownModal(true)
            }, 3000) // Show after 3 seconds
          }
        } else {
          setError('Invalid story data')
        }
      } catch (err) {
        console.error('Error fetching story:', err)
        setError('Failed to load story')
      } finally {
        setLoading(false)
      }
    }

    fetchStory()
  }, [user, storyId, isTrialCompleted, storiesGenerated, hasShownModal, userProfile])

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-pink-500" />
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">📚</span>
            </div>
            <p className="text-lg font-semibold text-gray-700">Loading your magical story... ✨</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !story) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50 flex items-center justify-center p-4">
          <div className="container mx-auto max-w-2xl">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl border-4 border-red-300 shadow-xl p-8 text-center">
              <div className="text-6xl mb-4 animate-bounce-slow">😅</div>
              <div className="p-5 text-lg text-red-700 bg-red-100 border-2 border-red-300 rounded-2xl font-bold mb-6">
                ⚠️ {error || 'Story not found'}
              </div>
              <Button
                onClick={() => router.push('/library')}
                className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 font-bold text-lg px-8 py-6"
              >
                Back to Library 📚
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="relative">
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in" />
        )}
        <StoryDisplay story={story} />
      </div>
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        tier="pro"
      />
    </ProtectedRoute>
  )
}
