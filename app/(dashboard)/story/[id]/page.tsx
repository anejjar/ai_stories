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
  const { user, userProfile, getAccessToken, loading: authLoading } = useAuth()
  const { isTrialCompleted, storiesGenerated, isFirstStory } = useTrial()
  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [hasShownModal, setHasShownModal] = useState(() => {
    // Check sessionStorage to see if modal was already shown this session
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('upgrade_modal_shown_session') === 'true'
    }
    return false
  })

  const storyId = params.id as string

  useEffect(() => {
    async function fetchStory() {
      if (!storyId) {
        setLoading(false)
        return
      }

      // Wait for auth to be ready before fetching
      // This prevents the race condition where we fetch without a token
      if (authLoading) {
        return // Don't fetch yet, wait for auth to finish loading
      }

      // Skip if we already have this story loaded (prevents duplicate fetches)
      if (story && story.id === storyId) {
        setLoading(false)
        return
      }

      // Reset states when starting fetch
      setLoading(true)
      setError('')

      try {
        // Try to get token if user is logged in, but don't require it
        let token: string | null = null
        if (user) {
          token = await getAccessToken()
        }

        // Build headers - only include Authorization if we have a token
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        }
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(`/api/stories/${storyId}`, {
          headers,
        })

        if (!response.ok) {
          if (response.status === 404) {
            setError('Story not found')
          } else if (response.status === 403) {
            setError('You do not have permission to view this story')
          } else {
            setError('Failed to load story')
          }
          setLoading(false)
          return
        }

        const result = await response.json()
        if (result.success && result.data) {
          setStory(result.data)
          setLoading(false) // Only set loading false after story is set

          // Show upgrade modal after first story completion (emotional moment)
          // Only show once per session and only if trial was just completed
          // Only show if user is logged in
          if (
            user &&
            userProfile?.subscriptionTier === 'trial' &&
            isTrialCompleted &&
            storiesGenerated === 1 &&
            !hasShownModal
          ) {
            // Small delay to let user read the story first
            setTimeout(() => {
              setShowUpgradeModal(true)
              setHasShownModal(true)
              // Persist to sessionStorage so it won't show again this session
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('upgrade_modal_shown_session', 'true')
              }
            }, 3000) // Show after 3 seconds
          }
        } else {
          setError('Invalid story data')
          setLoading(false)
        }
      } catch (err) {
        console.error('Error fetching story:', err)
        setError('Failed to load story')
        setLoading(false)
      }
    }

    fetchStory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id, storyId]) // Wait for auth, then re-fetch when user ID or story ID changes

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-[2rem] bg-purple-50 animate-pulse" />
            <Loader2 className="h-12 w-12 animate-spin text-playwize-purple absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-xl font-black text-gray-400 uppercase tracking-widest">Loading magic... ✨</p>
        </div>
      </div>
    )
  }

  if (!loading && (error || !story)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-xl w-full">
          <div className="bg-white rounded-[4rem] border-4 border-dashed border-gray-100 p-12 text-center space-y-8">
            <div className="text-8xl animate-bounce-slow">😅</div>
            <div className="p-6 text-lg text-red-600 bg-red-50 border-2 border-red-100 rounded-[2.5rem] font-black">
              {error || 'Story not found'}
            </div>
            <Button
              onClick={() => router.push('/library')}
              className="h-16 px-10 rounded-full bg-playwize-purple hover:bg-purple-700 text-white font-black text-xl shadow-xl shadow-purple-100 transition-all hover:scale-105 active:scale-95"
            >
              Back to Library 📚
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="relative pb-20">
        <StoryDisplay story={story} />
      </div>
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        tier="pro"
      />
    </>
  )
}
