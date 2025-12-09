'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/toaster'
import { useAuth } from '@/hooks/use-auth'
import { StoryEnhancement } from '@/components/stories/story-enhancement'
import { PDFExportButton } from '@/components/stories/pdf-export-button'
import { PrintStoryButton } from '@/components/stories/print-story-button'
import { AudioPlayer } from '@/components/stories/audio-player'
import { BookViewer } from '@/components/stories/book-viewer'
import { Share2, ArrowLeft, BookOpen, Image as ImageIcon, Loader2, Crown } from 'lucide-react'
import Link from 'next/link'
import { ShareDialog } from '@/components/stories/share-dialog'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'
import { getThemeStyles } from '@/lib/theme-config'
import type { Story } from '@/types'

interface StoryDisplayProps {
  story: Story
  onBack?: () => void
}

export function StoryDisplay({ story, onBack }: StoryDisplayProps) {
  const { userProfile, getAccessToken } = useAuth()
  const [readingProgress, setReadingProgress] = useState(0)
  const [copied, setCopied] = useState(false)
  const [generatingImages, setGeneratingImages] = useState(false)
  const [storyImages, setStoryImages] = useState<string[]>(story.imageUrls || [])
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<number, boolean>>({})
  const [imageErrorStates, setImageErrorStates] = useState<Record<number, boolean>>({})
  const [backgroundFloaters, setBackgroundFloaters] = useState<{ emoji: string, style: React.CSSProperties }[]>([])
  const isProMax = userProfile?.subscriptionTier === 'pro_max'
  const isPro = userProfile?.subscriptionTier === 'pro' || isProMax
  const isIllustratedBook = story.isIllustratedBook && story.bookPages && story.bookPages.length > 0

  const themeStyles = getThemeStyles(story.theme)

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
    if (!isProMax) {
      toast.warning('PRO MAX Required', 'Upgrade to PRO MAX to generate illustrations!')
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
    <div className={`min-h-screen ${themeStyles.background} ${themeStyles.cursor || ''} relative transition-colors duration-500`}>
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {backgroundFloaters.map((floater, idx) => (
          <div
            key={idx}
            className={`absolute animate-float select-none ${themeStyles.interaction || ''} pointer-events-auto`}
            style={floater.style}
          >
            {floater.emoji}
          </div>
        ))}
      </div>

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-2 bg-white/20 z-50">
        <div
          className={`h-full ${themeStyles.button} transition-all duration-150 shadow-lg`}
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Header */}
      <div className={`sticky top-0 bg-white/90 backdrop-blur-md border-b-4 ${themeStyles.navBorder} z-40 shadow-lg transition-colors duration-500`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack ? (
                <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-pink-100 border-2 border-transparent hover:border-pink-300">
                  <ArrowLeft className="h-5 w-5 text-purple-600" />
                </Button>
              ) : (
                <Link href="/library">
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-pink-100 border-2 border-transparent hover:border-pink-300">
                    <ArrowLeft className="h-5 w-5 text-purple-600" />
                  </Button>
                </Link>
              )}
              <div>
                <h1 className={`text-xl font-bold font-comic ${themeStyles.titleGradient} bg-clip-text text-transparent`}>
                  📖 Story
                </h1>
                <p className="text-xs text-gray-600 font-semibold">
                  {formatDate(story.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PrintStoryButton story={story} />
              <PDFExportButton story={story} />
              <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-full border-2 border-purple-300 hover:bg-purple-100 font-bold"
                  >
                    <Share2 className="h-4 w-4" />
                    Share 📤
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-3xl border-4 border-purple-300 p-0">
                  <ShareDialog storyId={story.id} storyTitle={story.title} onClose={() => setShowShareDialog(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Story Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl relative z-10">
        {/* Story Metadata */}
        <div className={`mb-8 space-y-4 bg-white/80 backdrop-blur-sm p-6 rounded-3xl border-4 ${themeStyles.cardBorder} ${themeStyles.cardTexture || ''} shadow-xl transition-colors duration-500`}>
          <div>
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 font-comic ${themeStyles.titleGradient} bg-clip-text text-transparent`}>
              {story.title} {themeStyles.emoji}
            </h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={`${themeStyles.badge} font-bold border-2 rounded-full px-3 py-1 shadow-sm`}>
                {themeStyles.emoji} {story.theme}
              </Badge>
              {/* Show children info for multi-child stories */}
              {story.children && story.children.length > 0 ? (
                <>
                  {story.children.map((child: any, idx: number) => (
                    <div key={idx} className="flex flex-wrap gap-2">
                      <Badge className="bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-bold border-2 border-blue-500 rounded-full px-3 py-1">
                        <span className="text-lg mr-1">👶</span>
                        {child.name}
                      </Badge>
                      {child.adjectives.map((adj: string) => (
                        <Badge key={adj} className="bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold border-2 border-pink-500 rounded-full px-3 py-1">
                          {adj}
                        </Badge>
                      ))}
                    </div>
                  ))}
                </>
              ) : (
                /* Single-child story (backward compatible) */
                story.adjectives.map((adj) => (
                  <Badge key={adj} className="bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold border-2 border-pink-500 rounded-full px-3 py-1">
                    {adj}
                  </Badge>
                ))
              )}
            </div>
            {story.moral && (
              <div className={`bg-white/50 border-2 ${themeStyles.cardBorder} rounded-2xl p-4 mt-4`}>
                <p className="text-base text-gray-800 font-semibold">
                  <span className="text-2xl mr-2">💡</span>
                  Lesson: {story.moral}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Audio Player */}
        <div className="mb-8">
          <AudioPlayer text={story.content} title={story.title} bedtimeMode={false} />
        </div>

        {/* Conditional Rendering: Illustrated Book vs Regular Story */}
        {isIllustratedBook ? (
          /* Illustrated Book Viewer (PRO MAX) */
          <BookViewer
            title={story.title}
            bookPages={story.bookPages!}
            theme={story.theme}
          />
        ) : (
          <>
            {/* Story Enhancement Tools (PRO) - Only for regular stories */}
            <StoryEnhancement storyId={story.id} />

            {/* Generate Images Button (PRO MAX) - Only for regular stories */}
            {isProMax && !storyImages.length && (
          <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-4 border-yellow-300 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-4xl">🎨</div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-1">
                    Add Magical Illustrations! ✨
                  </h3>
                  <p className="text-sm text-gray-700 font-semibold">
                    Generate beautiful AI illustrations for your story
                  </p>
                </div>
              </div>
              <Button
                onClick={handleGenerateImages}
                disabled={generatingImages}
                className="rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all font-bold"
              >
                {generatingImages ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Generate Images 🎨
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Story Images (if available) */}
        {storyImages.length > 0 && (
          <div className="mb-8 space-y-6">
            {storyImages.map((imageUrl, index) => {
              const isLoading = imageLoadingStates[index] !== false
              const hasError = imageErrorStates[index] === true

              return (
                <div
                  key={index}
                  className="bg-white/90 backdrop-blur-sm rounded-3xl border-4 border-purple-300 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="relative w-full aspect-square bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100">
                    {/* Loading State */}
                    {isLoading && !hasError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="relative">
                          <Loader2 className="h-16 w-16 animate-spin text-purple-500" />
                          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl animate-bounce-slow">
                            🎨
                          </span>
                        </div>
                        <p className="mt-4 text-lg font-bold text-gray-700 animate-pulse">
                          Creating magic... ✨
                        </p>
                        <div className="mt-2 flex gap-2">
                          <span className="text-2xl animate-bounce" style={{ animationDelay: '0s' }}>⭐</span>
                          <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</span>
                          <span className="text-2xl animate-bounce" style={{ animationDelay: '0.4s' }}>🌟</span>
                        </div>
                      </div>
                    )}

                    {/* Error State */}
                    {hasError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                        <div className="text-6xl mb-4 animate-bounce-slow">😅</div>
                        <p className="text-lg font-bold text-gray-700 mb-2 text-center">
                          Oops! Image couldn't load
                        </p>
                        <p className="text-sm text-gray-600 text-center font-semibold">
                          Don't worry, the story is still amazing! 📖
                        </p>
                      </div>
                    )}

                    {/* Image */}
                    {!hasError && (
                      <img
                        src={imageUrl}
                        alt={`Story illustration ${index + 1} for ${story.children && story.children.length > 0 ? story.children.map((c: any) => c.name).join(' and ') : story.childName}`}
                        className={`w-full h-full object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'
                          }`}
                        onLoad={() => {
                          setImageLoadingStates((prev) => ({ ...prev, [index]: false }))
                        }}
                        onError={() => {
                          setImageLoadingStates((prev) => ({ ...prev, [index]: false }))
                          setImageErrorStates((prev) => ({ ...prev, [index]: true }))
                        }}
                      />
                    )}

                    {/* Decorative overlay when loaded */}
                    {!isLoading && !hasError && (
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 border-2 border-purple-400 shadow-lg animate-in zoom-in">
                        <span className="text-2xl">✨</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 text-center bg-gradient-to-r from-purple-50 to-pink-50">
                    <p className="text-sm text-gray-600 font-semibold">
                      Illustration {index + 1} 🎨
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Story Text - Fun & Engaging for Kids */}
        <div className={`max-w-none bg-gradient-to-br from-white via-pink-50 to-purple-50 backdrop-blur-sm p-8 md:p-12 rounded-3xl border-4 border-blue-300 ${themeStyles.cardTexture || ''} shadow-2xl`}>
          <div className="text-2xl md:text-3xl leading-relaxed md:leading-loose text-gray-900 whitespace-pre-wrap font-comic">
            {story.content.split('\n').map((paragraph, index) => {
              if (!paragraph.trim()) {
                return <div key={index} className="h-6" />
              }

              // Add decorative elements for first paragraph
              const isFirstParagraph = index === 0
              const isLastParagraph = index === story.content.split('\n').filter(p => p.trim()).length - 1

              return (
                <div
                  key={index}
                  className={`mb-8 md:mb-10 relative ${isFirstParagraph ? 'animate-in fade-in slide-in-from-bottom-4' : ''
                    }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Decorative elements for first paragraph */}
                  {isFirstParagraph && (
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-4xl animate-bounce-slow">📖</div>
                      <div className="h-1 flex-1 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-full"></div>
                      <div className="text-4xl animate-bounce-slow" style={{ animationDelay: '0.5s' }}>✨</div>
                    </div>
                  )}

                  <p className="text-gray-900 font-bold leading-relaxed md:leading-loose text-2xl md:text-3xl drop-shadow-sm">
                    {paragraph.split('.').map((sentence, sentenceIndex, sentences) => {
                      const trimmedSentence = sentence.trim()
                      if (!trimmedSentence) return null

                      // Add emoji after certain words for fun
                      const enhancedSentence = trimmedSentence
                        .replace(/\b(Once upon a time|Once|Long ago)\b/gi, (match) => `${match} 🎭`)
                        .replace(/\b(happily ever after|The end|The end\.)\b/gi, (match) => `${match} 🎉`)
                        .replace(/\b(magic|magical|wonderful|amazing)\b/gi, (match) => `${match} ✨`)
                        .replace(/\b(friend|friends|friendship)\b/gi, (match) => `${match} 👫`)
                        .replace(/\b(adventure|journey|quest)\b/gi, (match) => `${match} 🗺️`)
                        .replace(/\b(dragon|dragon's)\b/gi, (match) => `${match} 🐉`)
                        .replace(/\b(star|stars|star's)\b/gi, (match) => `${match} ⭐`)
                        .replace(/\b(ocean|sea|water)\b/gi, (match) => `${match} 🌊`)
                        .replace(/\b(forest|tree|trees)\b/gi, (match) => `${match} 🌳`)
                        .replace(/\b(flower|flowers)\b/gi, (match) => `${match} 🌸`)
                        .replace(/\b(animal|animals)\b/gi, (match) => `${match} 🐾`)
                        .replace(/\b(bird|birds)\b/gi, (match) => `${match} 🐦`)
                        .replace(/\b(cat|cats)\b/gi, (match) => `${match} 🐱`)
                        .replace(/\b(dog|dogs)\b/gi, (match) => `${match} 🐶`)
                        .replace(/\b(rabbit|rabbits|bunny)\b/gi, (match) => `${match} 🐰`)
                        .replace(/\b(butterfly|butterflies)\b/gi, (match) => `${match} 🦋`)
                        .replace(/\b(castle|kingdom|palace)\b/gi, (match) => `${match} 🏰`)
                        .replace(/\b(princess|prince|king|queen)\b/gi, (match) => `${match} 👑`)
                        .replace(/\b(heart|love|loved)\b/gi, (match) => `${match} ❤️`)
                        .replace(/\b(smile|smiled|happy|happily)\b/gi, (match) => `${match} 😊`)
                        .replace(/\b(laugh|laughed|funny)\b/gi, (match) => `${match} 😄`)
                        .replace(/\b(surprise|surprised|amazing)\b/gi, (match) => `${match} 😲`)

                      return (
                        <span key={sentenceIndex}>
                          {enhancedSentence}
                          {sentenceIndex < sentences.length - 1 && sentence.trim() && '.'}
                          {sentenceIndex < sentences.length - 1 && ' '}
                        </span>
                      )
                    })}
                    {paragraph.trim() && !paragraph.endsWith('.') && !paragraph.endsWith('!') && !paragraph.endsWith('?') && '.'}
                  </p>

                  {/* Decorative elements for last paragraph */}
                  {isLastParagraph && (
                    <div className="flex items-center gap-3 mt-6">
                      <div className="text-4xl animate-bounce-slow">🎉</div>
                      <div className="h-1 flex-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 rounded-full"></div>
                      <div className="text-4xl animate-bounce-slow" style={{ animationDelay: '0.5s' }}>✨</div>
                    </div>
                  )}

                  {/* Small decorative stars between paragraphs */}
                  {!isFirstParagraph && !isLastParagraph && index % 2 === 0 && (
                    <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 text-2xl opacity-30 animate-sparkle">
                      ⭐
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Story ending decoration */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-yellow-100 to-pink-100 rounded-full px-8 py-4 border-4 border-yellow-300 shadow-lg">
              <span className="text-4xl animate-bounce-slow">📚</span>
              <span className={`text-2xl font-comic font-bold ${themeStyles.titleGradient} bg-clip-text text-transparent`}>
                The End!
              </span>
              <span className="text-4xl animate-bounce-slow" style={{ animationDelay: '0.3s' }}>✨</span>
            </div>
          </div>
        </div>
          </>
        )}

        {/* Footer */}
        <div className={`mt-12 pt-8 border-t-4 ${themeStyles.navBorder} bg-white/80 backdrop-blur-sm p-6 rounded-3xl border-4 ${themeStyles.cardBorder} shadow-lg transition-colors duration-500`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-lg font-bold text-gray-700">
              <span className="text-2xl mr-2">👶</span>
              A story for {story.childName}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleShare} className="rounded-full border-2 border-purple-400 hover:bg-purple-100 font-bold">
                <Share2 className="h-4 w-4 mr-2" />
                Share Story 📤
              </Button>
              <Link href="/library">
                <Button variant="outline" className={`rounded-full border-2 hover:bg-white font-bold ${themeStyles.primaryColor} ${themeStyles.cardBorder}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Library 📚
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

