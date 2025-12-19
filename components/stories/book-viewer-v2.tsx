'use client'

/**
 * Book Viewer V2 - Modern Magazine Layout
 * Features perfect text fitting without scrolling
 * Smart pagination splits long text across multiple pages
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Star,
  BookOpen,
  Image as ImageIcon,
  FileText
} from 'lucide-react'
import { useTextPagination, type VirtualPage, type TextPaginationOptions } from '@/hooks/use-text-pagination'
import type { BookPage } from '@/lib/ai/illustrated-book-generator'

type ViewMode = 'story' | 'picture' | 'read'

interface BookViewerV2Props {
  bookPages: BookPage[]
  storyId: string
  completedPages: number[]
  onPageComplete?: (pageNumber: number) => void
}

export function BookViewerV2({
  bookPages,
  storyId,
  completedPages,
  onPageComplete
}: BookViewerV2Props) {
  // Current virtual page index
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('story')

  // Read-aloud state
  const [isReading, setIsReading] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(-1)
  const [readingSupported, setReadingSupported] = useState(false)

  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const textContainerRef = useRef<HTMLDivElement>(null)
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Measure container width for pagination
  const [containerWidth, setContainerWidth] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)

  // Calculate text pagination options - memoize to prevent infinite loops
  const fontSize = 26 // Medium size (24-28px range)
  const lineHeight = 1.8 // Comfortable reading
  const containerPadding = 80 // Top + bottom padding
  const decorationHeight = 120 // Ornamental borders + spacing

  const paginationOptions: TextPaginationOptions = useMemo(() => ({
    fontSize,
    lineHeight,
    containerPadding,
    decorationHeight,
    maxHeight: containerHeight
  }), [containerHeight])

  // Use text pagination hook
  const { virtualPages, isCalculating, totalVirtualPages } = useTextPagination(
    bookPages,
    paginationOptions,
    containerWidth,
    true // enabled
  )

  // Current virtual page
  const currentPage = virtualPages[currentPageIndex]

  // Measure container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (textContainerRef.current) {
        const width = textContainerRef.current.offsetWidth
        const height = textContainerRef.current.offsetHeight

        if (width > 0) {
          setContainerWidth(width)
        }

        if (height > 0) {
          setContainerHeight(height)
        } else {
          // Fallback: Calculate available height based on viewport
          const viewportHeight = window.innerHeight
          const availableHeight = isFullscreen
            ? viewportHeight - 200 // Account for controls in fullscreen
            : viewportHeight * 0.75 // 75vh in normal mode

          setContainerHeight(availableHeight)
        }
      }
    }

    // Use requestAnimationFrame to ensure DOM is ready
    const rafId = requestAnimationFrame(() => {
      updateDimensions()
    })

    // Also update after a small delay to catch any late layout
    const timeoutId = setTimeout(updateDimensions, 100)

    // Update on resize
    window.addEventListener('resize', updateDimensions)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(timeoutId)
      window.removeEventListener('resize', updateDimensions)
    }
  }, [isFullscreen])

  // Check speech synthesis support
  useEffect(() => {
    setReadingSupported(
      'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
    )
  }, [])

  // Load saved view mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bookViewMode')
    if (saved && ['story', 'picture', 'read'].includes(saved)) {
      setViewMode(saved as ViewMode)
    }
  }, [])

  // Save view mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('bookViewMode', viewMode)
  }, [viewMode])

  // Preload adjacent images
  useEffect(() => {
    const preloadImage = (index: number) => {
      if (index >= 0 && index < virtualPages.length) {
        const page = virtualPages[index]
        if (page?.illustration_url) {
          const img = new window.Image()
          img.src = page.illustration_url
        }
      }
    }

    if (virtualPages.length > 0) {
      // Preload next and previous pages
      preloadImage(currentPageIndex + 1)
      preloadImage(currentPageIndex - 1)
    }
  }, [currentPageIndex, virtualPages])

  // Mark page as completed after viewing
  useEffect(() => {
    if (!currentPage || isCalculating) return

    const timer = setTimeout(() => {
      if (onPageComplete && !completedPages.includes(currentPage.originalPageIndex)) {
        onPageComplete(currentPage.originalPageIndex)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [currentPage, currentPageIndex, completedPages, onPageComplete, isCalculating])

  // Navigation handlers
  const goToNextPage = useCallback(() => {
    if (currentPageIndex < totalVirtualPages - 1) {
      setCurrentPageIndex(prev => prev + 1)
      setImageLoading(true)
      stopReading()
    }
  }, [currentPageIndex, totalVirtualPages])

  const goToPreviousPage = useCallback(() => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1)
      setImageLoading(true)
      stopReading()
    }
  }, [currentPageIndex])

  // Fullscreen handlers
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await containerRef.current?.requestFullscreen()
        setIsFullscreen(true)
      } catch (err) {
        console.error('Error enabling fullscreen:', err)
      }
    } else {
      try {
        await document.exitFullscreen()
        setIsFullscreen(false)
      } catch (err) {
        console.error('Error exiting fullscreen:', err)
      }
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPreviousPage()
      } else if (e.key === 'ArrowRight') {
        goToNextPage()
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen()
      } else if (e.key === 'Escape' && isFullscreen) {
        document.exitFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNextPage, goToPreviousPage, isFullscreen])

  // Read-aloud functionality
  const stopReading = useCallback(() => {
    if (speechRef.current) {
      window.speechSynthesis.cancel()
      speechRef.current = null
    }
    setIsReading(false)
    setCurrentWordIndex(-1)
  }, [])

  const startReading = useCallback(() => {
    if (!currentPage || !readingSupported) return

    stopReading()

    const utterance = new SpeechSynthesisUtterance(currentPage.text)
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.volume = 1.0

    const words = currentPage.text.split(/\s+/)
    let wordIndex = 0

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setCurrentWordIndex(wordIndex)
        wordIndex++
      }
    }

    utterance.onend = () => {
      setIsReading(false)
      setCurrentWordIndex(-1)

      // Auto-advance to next page if available
      if (currentPageIndex < totalVirtualPages - 1) {
        setTimeout(() => {
          goToNextPage()
        }, 500)
      }
    }

    utterance.onerror = () => {
      stopReading()
    }

    speechRef.current = utterance
    setIsReading(true)
    window.speechSynthesis.speak(utterance)
  }, [currentPage, currentPageIndex, totalVirtualPages, goToNextPage, stopReading, readingSupported])

  const toggleReading = () => {
    if (isReading) {
      stopReading()
    } else {
      startReading()
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopReading()
    }
  }, [stopReading])

  // Render text with word highlighting for read-aloud
  const renderText = (text: string, showDropCap: boolean) => {
    if (!isReading || currentWordIndex === -1) {
      // Normal text rendering
      if (showDropCap) {
        const firstLetter = text.charAt(0)
        const restOfFirstWord = text.substring(1).split(' ')[0]
        const remainingText = text.substring(firstLetter.length + restOfFirstWord.length)

        return (
          <>
            <span className="float-left text-7xl md:text-8xl font-bold text-amber-800 leading-none pr-3 pt-1 drop-cap">
              {firstLetter}
            </span>
            <span className="font-bold text-amber-800">{restOfFirstWord}</span>
            {remainingText}
          </>
        )
      }
      return text
    }

    // Highlighted word rendering for read-aloud
    const words = text.split(/\s+/)
    return words.map((word, index) => {
      const isCurrentWord = index === currentWordIndex
      return (
        <span
          key={index}
          className={`${
            isCurrentWord
              ? 'bg-yellow-200 font-bold scale-105 inline-block transition-transform'
              : ''
          }`}
        >
          {word}{' '}
        </span>
      )
    })
  }

  // Check if current page has an illustration
  const hasIllustration = currentPage && currentPage.illustration_url && currentPage.illustration_url.trim() !== ''

  // Render Story Mode: Side-by-side image and text, or full-width text if no image
  const renderStoryMode = () => {
    if (!hasIllustration) {
      // No image: show full-width text only
      return (
        <div
          className={`relative bg-white rounded-lg shadow-2xl overflow-hidden ${
            isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-[75vh]'
          }`}
        >
          <div
            ref={textContainerRef}
            className="relative bg-[#faf7f0] h-full flex flex-col"
            style={{
              backgroundImage: `
                linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, transparent 100%),
                url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
              `,
              backgroundBlendMode: 'overlay'
            }}
          >
            {/* Top ornamental border */}
            <div className="h-14 flex items-center justify-center border-b-2 border-amber-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
                <div className="w-2 h-2 rounded-full bg-amber-600" />
                <div className="w-8 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
              </div>
            </div>

            {/* Text content - perfectly fitted, no scrolling */}
            <div className="flex-1 flex items-center justify-center px-8 md:px-16 py-6">
              <div
                className="text-gray-900 story-text-v2 w-full max-w-4xl"
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: `${lineHeight}`,
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  wordSpacing: '0.15em',
                  textAlign: 'left'
                }}
              >
                {currentPage ? renderText(currentPage.text, currentPage.isFirstVirtualPage) : 'Loading...'}
              </div>
            </div>

            {/* Bottom ornamental border */}
            <div className="h-14 flex items-center justify-center border-t-2 border-amber-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
                <div className="w-2 h-2 rounded-full bg-amber-600" />
                <div className="w-8 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Has image: side-by-side layout
    return (
      <div
        className={`relative bg-white rounded-lg shadow-2xl overflow-hidden ${
          isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-[75vh]'
        }`}
      >
        <div className="grid md:grid-cols-2 gap-0 h-full">
          {/* Left: Illustration */}
          <div className="relative bg-gray-100 h-full">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            <Image
              src={currentPage.illustration_url}
              alt={`Illustration for page ${currentPageIndex + 1}`}
              fill
              className="object-cover"
              priority={currentPageIndex === 0}
              onLoad={() => setImageLoading(false)}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Right: Text content */}
          <div
            ref={textContainerRef}
            className="relative bg-[#faf7f0] h-full flex flex-col"
            style={{
              backgroundImage: `
                linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, transparent 100%),
                url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
              `,
              backgroundBlendMode: 'overlay'
            }}
          >
            {/* Top ornamental border */}
            <div className="h-14 flex items-center justify-center border-b-2 border-amber-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
                <div className="w-2 h-2 rounded-full bg-amber-600" />
                <div className="w-8 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
              </div>
            </div>

            {/* Text content - perfectly fitted, no scrolling */}
            <div className="flex-1 flex items-center px-8 md:px-12 py-6">
              <div
                className="text-gray-900 story-text-v2 w-full"
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: `${lineHeight}`,
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  wordSpacing: '0.15em',
                  textAlign: 'left'
                }}
              >
                {currentPage ? renderText(currentPage.text, currentPage.isFirstVirtualPage) : 'Loading...'}
              </div>
            </div>

            {/* Bottom ornamental border */}
            <div className="h-14 flex items-center justify-center border-t-2 border-amber-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
                <div className="w-2 h-2 rounded-full bg-amber-600" />
                <div className="w-8 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render Picture Mode: Full-screen image with text overlay
  const renderPictureMode = () => {
    return (
      <div
        className={`relative bg-white rounded-lg shadow-2xl overflow-hidden ${
          isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-[70vh]'
        }`}
      >
        {hasIllustration ? (
          <>
            {/* Full-screen illustration */}
            <div className="relative h-full">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                  <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              <Image
                src={currentPage.illustration_url}
                alt={`Illustration for page ${currentPageIndex + 1}`}
                fill
                className="object-contain"
                priority={currentPageIndex === 0}
                onLoad={() => setImageLoading(false)}
                sizes="100vw"
              />

              {/* Text overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 md:p-10">
                <div
                  ref={textContainerRef}
                  className="text-white text-xl md:text-2xl leading-relaxed font-semibold"
                  style={{
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}
                >
                  {currentPage ? renderText(currentPage.text, currentPage.isFirstVirtualPage) : 'Loading...'}
                </div>
              </div>
            </div>
          </>
        ) : (
          // No image: show centered text
          <div
            ref={textContainerRef}
            className="h-full flex items-center justify-center p-8 md:p-16 bg-gradient-to-br from-amber-50 via-white to-amber-50"
          >
            <div
              className="text-gray-900 text-2xl md:text-3xl leading-relaxed font-semibold text-center max-w-4xl"
            >
              {currentPage ? renderText(currentPage.text, currentPage.isFirstVirtualPage) : 'Loading...'}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Render Read Mode: Small thumbnail + large text
  const renderReadMode = () => {
    return (
      <div
        className={`bg-white rounded-lg shadow-2xl overflow-hidden ${
          isFullscreen ? 'h-full overflow-y-auto' : 'min-h-[400px] overflow-y-auto'
        }`}
      >
        {hasIllustration && (
          // Small thumbnail at top
          <div className="relative h-48 md:h-64 bg-gray-100">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            <Image
              src={currentPage.illustration_url}
              alt={`Illustration for page ${currentPageIndex + 1}`}
              fill
              className="object-cover"
              priority={currentPageIndex === 0}
              onLoad={() => setImageLoading(false)}
              sizes="100vw"
            />
          </div>
        )}

        {/* Large text content */}
        <div
          ref={textContainerRef}
          className="bg-[#faf7f0] p-8 md:p-12"
          style={{
            backgroundImage: `
              linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, transparent 100%),
              url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
            `,
            backgroundBlendMode: 'overlay'
          }}
        >
          <div
            className="text-gray-900 text-3xl md:text-4xl leading-[2.2] font-semibold"
            style={{
              letterSpacing: '0.02em',
              wordSpacing: '0.15em'
            }}
          >
            {currentPage ? renderText(currentPage.text, currentPage.isFirstVirtualPage) : 'Loading...'}
          </div>
        </div>
      </div>
    )
  }

  // Show loading overlay while calculating, but still render container for measurement
  const showLoadingOverlay = !currentPage || isCalculating

  return (
    <div
      ref={containerRef}
      className={`w-full mx-auto space-y-6 relative ${
        isFullscreen
          ? 'bg-amber-50 h-screen flex flex-col justify-center p-4'
          : 'max-w-7xl p-4'
      }`}
    >
      {/* Loading overlay */}
      {showLoadingOverlay && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-amber-50">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-600 font-medium">
              {isCalculating ? 'Preparing pages...' : 'Loading book...'}
            </p>
          </div>
        </div>
      )}
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800">
            Page {currentPageIndex + 1} of {totalVirtualPages || '...'}
          </h3>

          {/* Progress indicators */}
          <div className="hidden md:flex items-center gap-2">
            {bookPages.map((_, index) => (
              <Star
                key={index}
                className={`w-5 h-5 ${
                  completedPages.includes(index)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <Button
              onClick={() => setViewMode('story')}
              variant={viewMode === 'story' ? 'default' : 'ghost'}
              size="sm"
              className="gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden lg:inline">Story</span>
            </Button>
            <Button
              onClick={() => setViewMode('picture')}
              variant={viewMode === 'picture' ? 'default' : 'ghost'}
              size="sm"
              className="gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Picture</span>
            </Button>
            <Button
              onClick={() => setViewMode('read')}
              variant={viewMode === 'read' ? 'default' : 'ghost'}
              size="sm"
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden lg:inline">Read</span>
            </Button>
          </div>

          {readingSupported && (
            <Button
              onClick={toggleReading}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              {isReading ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden sm:inline">
                {isReading ? 'Stop' : 'Read Aloud'}
              </span>
            </Button>
          )}

          <Button
            onClick={toggleFullscreen}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            <span className="hidden sm:inline">
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </span>
          </Button>
        </div>
      </div>

      {/* Book container - Multiple view modes */}
      {viewMode === 'story' && renderStoryMode()}
      {viewMode === 'picture' && renderPictureMode()}
      {viewMode === 'read' && renderReadMode()}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          onClick={goToPreviousPage}
          disabled={currentPageIndex === 0}
          size="lg"
          className="px-6 py-6 md:px-8 md:py-7 text-base md:text-lg font-semibold"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {/* Mobile progress */}
        <div className="flex md:hidden items-center gap-2">
          {bookPages.map((_, index) => (
            <Star
              key={index}
              className={`w-4 h-4 ${
                completedPages.includes(index)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={goToNextPage}
          disabled={currentPageIndex === totalVirtualPages - 1}
          size="lg"
          className="px-6 py-6 md:px-8 md:py-7 text-base md:text-lg font-semibold"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      {/* Keyboard hints */}
      {!isFullscreen && (
        <div className="text-center text-sm text-gray-500">
          <p>Use arrow keys to navigate • Press F for fullscreen</p>
        </div>
      )}
    </div>
  )
}
