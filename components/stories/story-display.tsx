'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/toaster'
import { useAuth } from '@/hooks/use-auth'
import { StoryEnhancement } from '@/components/stories/story-enhancement'
import { PDFExportButton } from '@/components/stories/pdf-export-button'
import { PrintStoryButton } from '@/components/stories/print-story-button'
import { EnhancedAudioPlayer } from '@/components/stories/enhanced-audio-player'
import { BookViewer } from '@/components/stories/book-viewer'
import { BookViewerV2 } from '@/components/stories/book-viewer-v2'
import { BookViewerV3 } from '@/components/stories/book-viewer-v3'
import { AchievementUnlockModal } from '@/components/achievements/achievement-unlock-modal'
import { Share2, ArrowLeft, BookOpen, Image as ImageIcon, Loader2, Crown, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { ShareDialog } from '@/components/stories/share-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'
import { getThemeStyles } from '@/lib/theme-config'
import type { Story } from '@/types'
import type { Achievement } from '@/lib/achievements/types'

import { LikeButton } from '@/components/stories/like-button'
import { CommentsSection } from '@/components/stories/comments-section'
import { ReportModal } from '@/components/stories/report-modal'
import { Plus, Flag } from 'lucide-react'

interface StoryDisplayProps {
  story: Story
  onBack?: () => void
  viewerVersion?: 'v1' | 'v2' | 'v3' // Choose book viewer version (default: v3)
}

export function StoryDisplay({ story, onBack, viewerVersion = 'v3' }: StoryDisplayProps) {
  const { user, userProfile, getAccessToken } = useAuth()
  const [readingProgress, setReadingProgress] = useState(0)
  const [copied, setCopied] = useState(false)
  const [generatingImages, setGeneratingImages] = useState(false)
  const [storyImages, setStoryImages] = useState<string[]>(story.imageUrls || [])
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<number, boolean>>({})
  const [imageErrorStates, setImageErrorStates] = useState<Record<number, boolean>>({})
  const [backgroundFloaters, setBackgroundFloaters] = useState<{ emoji: string, style: React.CSSProperties }[]>([])
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([])
  const [currentAchievementIndex, setCurrentAchievementIndex] = useState(0)
  const [completedPages, setCompletedPages] = useState<number[]>([])
  const isFamily = userProfile?.subscriptionTier === 'family'
  const isPro = userProfile?.subscriptionTier === 'pro' || isFamily
  const isIllustratedBook = story.isIllustratedBook && story.bookPages && story.bookPages.length > 0

  const isOwner = user?.id === story.userId
  const isPublic = story.visibility === 'public'
  const showSocialActions = isPublic // Show likes/comments if story is public
  const showCreatorActions = isOwner // Only owner can print/share (as requested)

  const themeStyles = getThemeStyles(story.theme)
  const currentAchievement = unlockedAchievements[currentAchievementIndex] || null

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100
      setReadingProgress(Math.min(100, Math.max(0, progress)))
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Generate random positions for floaters
  useEffect(() => {
    if (themeStyles.floaters) {
      const floaters = themeStyles.floaters.flatMap(emoji =>
        // Create 3 instances of each floater for better coverage
        Array(3).fill(emoji).map(() => ({
          emoji,
          style: {
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
            fontSize: `${2 + Math.random() * 2}rem`,
            opacity: 0.1 + Math.random() * 0.2
          } as React.CSSProperties
        }))
      )
      setBackgroundFloaters(floaters)
    }
  }, [themeStyles.floaters])

  // Initialize loading states for existing images
  useEffect(() => {
    if (storyImages.length > 0) {
      const loadingStates: Record<number, boolean> = {}
      storyImages.forEach((_, idx) => {
        loadingStates[idx] = true
      })
      setImageLoadingStates(loadingStates)
    }
  }, [storyImages.length])

  // Track if we've already recorded a session for this story
  const sessionRecordedRef = useRef<string | null>(null)
  const isRecordingRef = useRef<boolean>(false) // Prevent concurrent calls

  // Record reading session and check for achievements
  useEffect(() => {
    // Triple-check: Skip if already recorded OR currently recording
    const sessionKey = `reading_session_${story.id}`
    const alreadyRecorded = sessionRecordedRef.current === story.id ||
      (typeof window !== 'undefined' && sessionStorage.getItem(sessionKey) === 'true')

    if (alreadyRecorded || isRecordingRef.current) {
      return
    }

    async function recordSession() {
      // Set recording flag immediately to block concurrent calls
      isRecordingRef.current = true
      try {
        const response = await fetch('/api/reading-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Include cookies for authentication
          body: JSON.stringify({
            storyId: story.id,
            completed: true,
          }),
        })

        if (response.ok) {
          const data = await response.json()

          // Mark this session as recorded (double protection)
          sessionRecordedRef.current = story.id
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(sessionKey, 'true')
          }

          // Show achievements if any were unlocked
          if (data.newAchievements && data.newAchievements.length > 0) {
            setUnlockedAchievements(data.newAchievements)
            setCurrentAchievementIndex(0)
          }

          // Show streak update if available
          if (data.streak && data.streak.current > 0) {
            const isNewStreak = data.streak.current === 1
            const message = isNewStreak
              ? '🔥 Started a reading streak!'
              : `🔥 ${data.streak.current} day streak!`
            toast.success('Reading tracked!', message)
          }
        }
      } catch (error) {
        console.error('Failed to record reading session:', error)
        // Reset flag on error so it can retry later
        isRecordingRef.current = false
        // Don't show error to user, this is background tracking
      }
    }

    // Record session when story is opened
    recordSession()
  }, [story.id])

  // Handle closing achievement modal
  function handleCloseAchievement() {
    if (currentAchievementIndex < unlockedAchievements.length - 1) {
      // Show next achievement
      setCurrentAchievementIndex(currentAchievementIndex + 1)
    } else {
      // All achievements shown, clear state
      setUnlockedAchievements([])
      setCurrentAchievementIndex(0)
    }
  }

  const handlePageComplete = (pageNumber: number) => {
    if (!completedPages.includes(pageNumber)) {
      setCompletedPages([...completedPages, pageNumber])
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/story/${story.id}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied! 📋', 'Share your story with friends!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
      toast.error('Failed to copy', 'Please try again')
    }
  }

  const handleGenerateImages = async () => {
    if (!isFamily) {
      toast.warning('Family Plan Required', 'Upgrade to Family Plan to generate illustrations!')
      return
    }

    setGeneratingImages(true)
    try {
      const token = await getAccessToken()
      if (!token) {
        throw new Error('Failed to get access token')
      }

      const response = await fetch(`/api/stories/${story.id}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          style: 'natural',
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate images')
      }

      if (result.success && result.data?.imageUrls) {
        // Initialize loading states for new images
        const loadingStates: Record<number, boolean> = {}
        result.data.imageUrls.forEach((_: string, idx: number) => {
          loadingStates[idx] = true
        })
        setImageLoadingStates(loadingStates)
        setImageErrorStates({})
        setStoryImages(result.data.imageUrls)
        toast.success('Images generated! 🎨', 'Your story now has beautiful illustrations!')
      }
    } catch (error) {
      console.error('Error generating images:', error)
      toast.error(
        'Failed to generate images',
        error instanceof Error ? error.message : 'Please try again'
      )
    } finally {
      setGeneratingImages(false)
    }
  }

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date

      // Check if date is valid
      if (!dateObj || isNaN(dateObj.getTime())) {
        return 'Recently'
      }

      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(dateObj)
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Recently'
    }
  }

  return (
    <div className={`min-h-screen ${themeStyles.background} ${themeStyles.cursor || ''} relative transition-colors duration-500 overflow-hidden`}>
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-40 -left-20 w-80 h-80 circle-pattern opacity-30" />
        <div className="absolute top-[60%] -right-20 w-96 h-96 circle-pattern opacity-30" />
        {backgroundFloaters.map((floater, idx) => (
          <div
            key={idx}
            className={`absolute animate-float select-none ${themeStyles.interaction || ''} pointer-events-auto`}
            style={floater.style}
          >
            {floater.emoji}
          </div>
        ))}
        
        {/* Theme-specific magic overlays */}
        {story.theme === 'Ocean' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-blue-400/5 mix-blend-overlay animate-pulse" />
            <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-200/20 to-transparent" />
          </div>
        )}
        {story.theme === 'Space' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[url('/stars-pattern.png')] opacity-10 animate-pulse" />
            <div className="absolute inset-0 bg-purple-900/5 mix-blend-color-dodge" />
          </div>
        )}
        {story.theme === 'Fantasy' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-200/10 via-purple-200/10 to-blue-200/10 animate-gradient-x" />
          </div>
        )}
      </div>

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-3 bg-white/20 z-50">
        <div
          className="h-full bg-playwize-purple transition-all duration-150 shadow-lg rounded-r-full"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b-4 border-gray-100 z-40 shadow-sm transition-colors duration-500">
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack ? (
                <Button variant="ghost" size="icon" onClick={onBack} className="h-12 w-12 rounded-2xl hover:bg-gray-100 border-2 border-transparent">
                  <ArrowLeft className="h-6 w-6 text-playwize-purple" />
                </Button>
              ) : (
                <Link href="/library">
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-gray-100 border-2 border-transparent">
                    <ArrowLeft className="h-6 w-6 text-playwize-purple" />
                  </Button>
                </Link>
              )}
              <div className="hidden sm:block">
                <h1 className="text-xl font-black text-gray-900 tracking-tight">
                  {story.title}
                </h1>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {formatDate(story.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {showCreatorActions && (
                <>
                  <PrintStoryButton story={story} />
                  <PDFExportButton story={story} />
                  <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-12 px-6 gap-2 rounded-full border-2 border-gray-100 hover:border-playwize-purple font-black text-sm transition-all"
                      >
                        <Share2 className="h-4 w-4" />
                        SHARE
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-[3rem] border-4 border-gray-100 p-0 overflow-hidden shadow-2xl">
                      <ShareDialog storyId={story.id} storyTitle={story.title} onClose={() => setShowShareDialog(false)} />
                    </DialogContent>
                  </Dialog>
                </>
              )}
              {showSocialActions && (
                <LikeButton
                  storyId={story.id}
                  initialLikesCount={story.likesCount || 0}
                  initialIsLiked={story.isLikedByUser || false}
                  size="md"
                />
              )}
              {/* Report button - available for all stories (public and private) */}
              <ReportModal
                storyId={story.id}
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-12 px-4 gap-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 font-medium text-sm transition-all"
                  >
                    <Flag className="h-4 w-4" />
                    <span className="hidden sm:inline">Report</span>
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Story Content - Using BookViewerV2/V3 for both illustrated and text stories */}
      {viewerVersion === 'v3' ? (
        <div className="relative z-10">
          <BookViewerV3
            bookPages={story.isIllustratedBook && story.bookPages ? story.bookPages : [{
              pageNumber: 1,
              text: story.content,
              illustration_url: story.imageUrls?.[0] || ''
            }]}
            storyId={story.id}
            completedPages={completedPages}
            onPageComplete={handlePageComplete}
            title={story.title}
            theme={story.theme}
          />
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
          <BookViewerV2
            bookPages={story.isIllustratedBook && story.bookPages ? story.bookPages : [{
              pageNumber: 1,
              text: story.content,
              illustration_url: story.imageUrls?.[0] || ''
            }]}
            storyId={story.id}
            completedPages={completedPages}
            onPageComplete={handlePageComplete}
            title={story.title}
            theme={story.theme}
          />
        </div>
      )}

      {/* Social Section & Actions */}
      <div className="container mx-auto px-4 pb-20 max-w-3xl relative z-10 space-y-8">
        {/* Community Section */}
        {showSocialActions && (
          <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border-4 border-gray-100 shadow-sm space-y-10">
            <div className="flex items-center justify-between border-b-2 border-gray-50 pb-6">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-gray-900">Community Love</h3>
                <p className="text-gray-500 font-bold">Share your thoughts with the community!</p>
              </div>
              <div className="flex items-center gap-4">
                <LikeButton
                  storyId={story.id}
                  initialLikesCount={story.likesCount || 0}
                  initialIsLiked={story.isLikedByUser || false}
                  size="lg"
                />
              </div>
            </div>
            
            <CommentsSection 
              storyId={story.id} 
              initialCommentsCount={story.commentsCount || 0} 
            />
          </div>
        )}

        {/* Footer Navigation */}
        <div className="bg-white p-8 md:p-10 rounded-[3rem] border-4 border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center text-3xl">👶</div>
            <p className="font-black text-gray-900 text-lg">A story for {story.childName}</p>
          </div>
          <Link href={isOwner ? "/library" : "/discover"}>
            <Button className="h-14 px-8 rounded-full bg-playwize-purple hover:bg-purple-700 text-white font-black text-lg shadow-lg shadow-purple-100 transition-all hover:scale-105 active:scale-95">
              <ArrowLeft className="h-5 w-5 mr-2" />
              {isOwner ? "LIBRARY 📚" : "BACK TO DISCOVER 🧭"}
            </Button>
          </Link>
        </div>
      </div>

      <AchievementUnlockModal
        achievement={currentAchievement}
        isOpen={!!currentAchievement}
        onClose={handleCloseAchievement}
      />
    </div>
  )
}

