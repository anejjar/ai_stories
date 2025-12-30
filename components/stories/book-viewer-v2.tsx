'use client'

/**
 * Book Viewer V2 - Modern Magazine Layout
 * Features perfect text fitting without scrolling
 * Smart pagination splits long text across multiple pages
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
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
  FileText,
  Settings,
  X,
  Moon,
  Sun,
  Palette,
  Sparkles,
  Type
} from 'lucide-react'
import { useTextPagination, type VirtualPage, type TextPaginationOptions } from '@/hooks/use-text-pagination'
import type { BookPage } from '@/lib/ai/illustrated-book-generator'

type ViewMode = 'story' | 'read'
type ReadingTheme = 'day' | 'sepia' | 'night'
type FontSize = 'small' | 'medium' | 'large'
type FontType = 'serif' | 'sans'

interface BookViewerV2Props {
  bookPages: BookPage[]
  storyId: string
  completedPages: number[]
  onPageComplete?: (pageNumber: number) => void
  title?: string
  theme?: string
}

export function BookViewerV2({
  bookPages,
  storyId,
  completedPages,
  onPageComplete,
  title,
  theme: storyTheme
}: BookViewerV2Props) {
  // Current virtual page index
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('story')
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>('day')
  const [fontSizeType, setFontSizeType] = useState<FontSize>('medium')
  const [fontType, setFontType] = useState<FontType>('serif')
  const [showSettings, setShowSettings] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)

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

  // Calculate font size value based on type
  const fontSize = useMemo(() => {
    switch (fontSizeType) {
      case 'small': return 20
      case 'medium': return 26
      case 'large': return 32
      default: return 26
    }
  }, [fontSizeType])

  // Calculate text pagination options - memoize to prevent infinite loops
  const lineHeight = 1.8 // Comfortable reading
  const containerPadding = 80 // Top + bottom padding
  const decorationHeight = 120 // Ornamental borders + spacing

  const paginationOptions: TextPaginationOptions = useMemo(() => ({
    fontSize,
    lineHeight,
    containerPadding,
    decorationHeight,
    maxHeight: containerHeight
  }), [containerHeight, fontSize])

  // Use text pagination hook
  const { virtualPages, isCalculating, totalVirtualPages } = useTextPagination(
    bookPages,
    paginationOptions,
    // Subtract horizontal padding (px-8 md:px-16) to ensure accurate height measurement
    containerWidth > 768 ? containerWidth - 128 : containerWidth - 64,
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

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('bookViewMode')
    if (savedMode && ['story', 'picture', 'read'].includes(savedMode)) {
      setViewMode(savedMode as ViewMode)
    }

    const savedTheme = localStorage.getItem('bookReadingTheme')
    if (savedTheme && ['day', 'sepia', 'night'].includes(savedTheme)) {
      setReadingTheme(savedTheme as ReadingTheme)
    }

    const savedFontSize = localStorage.getItem('bookFontSize')
    if (savedFontSize && ['small', 'medium', 'large'].includes(savedFontSize)) {
      setFontSizeType(savedFontSize as FontSize)
    }

    const savedFontType = localStorage.getItem('bookFontType')
    if (savedFontType && ['serif', 'sans'].includes(savedFontType)) {
      setFontType(savedFontType as FontType)
    }
  }, [])

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('bookViewMode', viewMode)
  }, [viewMode])

  useEffect(() => {
    localStorage.setItem('bookReadingTheme', readingTheme)
  }, [readingTheme])

  useEffect(() => {
    localStorage.setItem('bookFontSize', fontSizeType)
  }, [fontSizeType])

  useEffect(() => {
    localStorage.setItem('bookFontType', fontType)
  }, [fontType])

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
      // Preload next 2 pages for zero-latency flips
      preloadImage(currentPageIndex + 1)
      preloadImage(currentPageIndex + 2)
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
      
      // Check if this is the last virtual page of the last original page
      if (currentPageIndex === totalVirtualPages - 1 && totalVirtualPages > 0) {
        setShowCompletion(true)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [currentPage, currentPageIndex, completedPages, onPageComplete, isCalculating, totalVirtualPages])

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
      } else if (e.key === ' ') {
        e.preventDefault() // Prevent scrolling
        toggleReading()
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

  /**
   * Filter out AI structural markers from the story text
   */
  const cleanStoryText = (text: string) => {
    if (!text) return ''
    
    // Remove lines starting with structural markers
    return text
      .split('\n')
      .filter(line => {
        const trimmed = line.trim().toLowerCase()
        return !trimmed.startsWith('visual:') && 
               !trimmed.startsWith('scene:') && 
               !trimmed.startsWith('image focus:') &&
               !trimmed.startsWith('illustration:') &&
               !trimmed.startsWith('prompt:') &&
               !trimmed.startsWith('key visual moment:')
      })
      .join('\n')
      .trim()
  }

  // Render text with word highlighting for read-aloud
  const renderText = (text: string, showDropCap: boolean) => {
    // Clean the text first
    const cleanedText = cleanStoryText(text)
    
    // Helper to render special parts (Magic words, interaction cues, sound effects)
    const renderSpecialParts = (content: string) => {
      // Enhanced word replacements from V1 (StoryDisplay)
      const enhancedContent = content
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

      const parts = enhancedContent.split(/(\[.*?\]|\*\*.*?\*\*)/g)
      return parts.map((part, i) => {
        if (part.startsWith('[') && part.endsWith(']')) {
          return (
            <span 
              key={i} 
              className="inline-block bg-amber-100 text-amber-900 px-3 py-1 rounded-xl border-2 border-amber-200 text-base font-bold mx-1 my-1 shadow-sm"
            >
              ✨ {part.slice(1, -1)}
            </span>
          )
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <span 
              key={i} 
              className="inline-block text-orange-600 text-3xl font-black animate-wiggle mx-1"
            >
              {part.slice(2, -2)}
            </span>
          )
        }
        return part
      })
    }

    if (!isReading || currentWordIndex === -1) {
      // Normal text rendering
      if (showDropCap) {
        const firstLetter = cleanedText.charAt(0)
        const restOfFirstWord = cleanedText.substring(1).split(' ')[0]
        const remainingText = cleanedText.substring(firstLetter.length + restOfFirstWord.length)

        return (
          <>
            <span className="float-left text-7xl md:text-8xl font-bold text-amber-800 leading-none pr-3 pt-1 drop-cap">
              {firstLetter}
            </span>
            <span className="font-bold text-amber-800">{restOfFirstWord}</span>
            {renderSpecialParts(remainingText)}
          </>
        )
      }
      return renderSpecialParts(cleanedText)
    }

    // Highlighted word rendering for read-aloud
    const words = cleanedText.split(/\s+/)
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

  // Theme-specific styles
  const themeStyles = useMemo(() => {
    switch (readingTheme) {
      case 'sepia':
        return {
          container: 'bg-[#f4ecd8]',
          page: 'bg-[#fdf6e3]',
          text: 'text-[#5b4636]',
          border: 'border-[#d3c6aa]',
          accent: 'text-[#859900]',
          ornament: 'via-[#b58900]'
        }
      case 'night':
        return {
          container: 'bg-[#1a1a1a]',
          page: 'bg-[#2d2d2d]',
          text: 'text-[#e0e0e0]',
          border: 'border-[#404040]',
          accent: 'text-[#bb86fc]',
          ornament: 'via-[#bb86fc]'
        }
      default: // day
        return {
          container: 'bg-amber-50',
          page: 'bg-[#faf7f0]',
          text: 'text-gray-900',
          border: 'border-amber-200',
          accent: 'text-amber-800',
          ornament: 'via-amber-600'
        }
    }
  }, [readingTheme])

  // Render Story Mode: Side-by-side image and text, or full-width text if no image
  const renderStoryMode = () => {
    if (!hasIllustration) {
      // No image: show full-width text only
      return (
        <div
          className={`relative rounded-lg shadow-2xl overflow-hidden ${
            isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-[75vh]'
          } ${themeStyles.page}`}
        >
          <div
            ref={textContainerRef}
            className="relative h-full flex flex-col"
            style={{
              backgroundImage: readingTheme !== 'night' ? `
                linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, transparent 100%),
                url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
              ` : 'none',
              backgroundBlendMode: 'overlay'
            }}
          >
            {/* Top ornamental border */}
            <div className={`h-14 flex items-center justify-center border-b-2 ${themeStyles.border}`}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-1 bg-gradient-to-r from-transparent ${themeStyles.ornament} to-transparent`} />
                <div className={`w-2 h-2 rounded-full ${readingTheme === 'night' ? 'bg-[#bb86fc]' : 'bg-amber-600'}`} />
                <div className={`w-8 h-1 bg-gradient-to-r from-transparent ${themeStyles.ornament} to-transparent`} />
              </div>
            </div>

            {/* Text content - perfectly fitted, no scrolling */}
            <div className="flex-1 flex items-center justify-center px-8 md:px-16 py-6">
              <div
                className={`story-text-v2 w-full max-w-4xl ${themeStyles.text}`}
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: `${lineHeight}`,
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  wordSpacing: '0.15em',
                  textAlign: 'left',
                  fontFamily: fontType === 'serif' ? 'serif' : 'sans-serif'
                }}
              >
                {currentPage ? renderText(currentPage.text, currentPage.isFirstVirtualPage) : 'Loading...'}
              </div>
            </div>

            {/* Bottom ornamental border */}
            <div className={`h-14 flex items-center justify-center border-t-2 ${themeStyles.border}`}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-1 bg-gradient-to-r from-transparent ${themeStyles.ornament} to-transparent`} />
                <div className={`w-2 h-2 rounded-full ${readingTheme === 'night' ? 'bg-[#bb86fc]' : 'bg-amber-600'}`} />
                <div className={`w-8 h-1 bg-gradient-to-r from-transparent ${themeStyles.ornament} to-transparent`} />
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Has image: side-by-side layout
    return (
      <div
        className={`relative rounded-lg shadow-2xl overflow-hidden ${
          isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-[75vh]'
        } ${themeStyles.page}`}
      >
        <div className="grid md:grid-cols-2 gap-0 h-full">
          {/* Left: Illustration */}
          <div className={`relative h-full ${readingTheme === 'night' ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`}>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className={`w-12 h-12 border-4 ${readingTheme === 'night' ? 'border-[#bb86fc]' : 'border-amber-500'} border-t-transparent rounded-full animate-spin`} />
              </div>
            )}

            <Image
              src={currentPage.illustration_url}
              alt={`Illustration for page ${currentPageIndex + 1}`}
              fill
              className="object-contain"
              priority={currentPageIndex === 0}
              onLoad={() => setImageLoading(false)}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Right: Text content */}
          <div
            ref={textContainerRef}
            className="relative h-full flex flex-col"
            style={{
              backgroundImage: readingTheme !== 'night' ? `
                linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, transparent 100%),
                url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
              ` : 'none',
              backgroundBlendMode: 'overlay'
            }}
          >
            {/* Top ornamental border */}
            <div className={`h-14 flex items-center justify-center border-b-2 ${themeStyles.border}`}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-1 bg-gradient-to-r from-transparent ${themeStyles.ornament} to-transparent`} />
                <div className={`w-2 h-2 rounded-full ${readingTheme === 'night' ? 'bg-[#bb86fc]' : 'bg-amber-600'}`} />
                <div className={`w-8 h-1 bg-gradient-to-r from-transparent ${themeStyles.ornament} to-transparent`} />
              </div>
            </div>

            {/* Text content - perfectly fitted, no scrolling */}
            <div className="flex-1 flex items-center px-8 md:px-12 py-6">
              <div
                className={`story-text-v2 w-full ${themeStyles.text}`}
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: `${lineHeight}`,
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  wordSpacing: '0.15em',
                  textAlign: 'left',
                  fontFamily: fontType === 'serif' ? 'serif' : 'sans-serif'
                }}
              >
                {currentPage ? renderText(currentPage.text, currentPage.isFirstVirtualPage) : 'Loading...'}
              </div>
            </div>

            {/* Bottom ornamental border */}
            <div className={`h-14 flex items-center justify-center border-t-2 ${themeStyles.border}`}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-1 bg-gradient-to-r from-transparent ${themeStyles.ornament} to-transparent`} />
                <div className={`w-2 h-2 rounded-full ${readingTheme === 'night' ? 'bg-[#bb86fc]' : 'bg-amber-600'}`} />
                <div className={`w-8 h-1 bg-gradient-to-r from-transparent ${themeStyles.ornament} to-transparent`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render Read Mode: Just large text, no images
  const renderReadMode = () => {
    return (
      <div
        className={`rounded-lg shadow-2xl overflow-hidden ${
          isFullscreen ? 'h-full overflow-y-auto' : 'min-h-[400px] overflow-y-auto'
        } ${themeStyles.page}`}
      >
        {/* Large text content */}
        <div
          ref={textContainerRef}
          className="p-8 md:p-16"
          style={{
            backgroundImage: readingTheme !== 'night' ? `
              linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, transparent 100%),
              url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
            ` : 'none',
            backgroundBlendMode: 'overlay'
          }}
        >
          <div
            className={`${themeStyles.text} leading-[2.2] font-semibold max-w-4xl mx-auto`}
            style={{
              fontSize: `${fontSize * 1.4}px`, // Slightly larger for read mode
              letterSpacing: '0.02em',
              wordSpacing: '0.15em',
              fontFamily: fontType === 'serif' ? 'serif' : 'sans-serif'
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
      className={`w-full mx-auto space-y-6 relative transition-colors duration-500 ${
        isFullscreen
          ? `${themeStyles.container} h-screen flex flex-col justify-center p-4`
          : 'max-w-7xl p-4'
      } ${!isFullscreen && themeStyles.container} rounded-xl`}
    >
      {/* Loading overlay */}
      {showLoadingOverlay && (
        <div className={`absolute inset-0 z-50 flex items-center justify-center ${themeStyles.container} rounded-xl`}>
          <div className="text-center space-y-4">
            <div className={`w-16 h-16 border-4 ${readingTheme === 'night' ? 'border-[#bb86fc]' : 'border-amber-500'} border-t-transparent rounded-full animate-spin mx-auto`} />
            <p className={`${themeStyles.text} font-medium`}>
              {isCalculating ? 'Preparing pages...' : 'Loading book...'}
            </p>
          </div>
        </div>
      )}
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className={`text-lg md:text-xl font-bold ${themeStyles.text}`}>
            {title || 'Story'}
          </h3>
        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className={`${readingTheme === 'night' ? 'bg-[#404040]' : 'bg-gray-100'} rounded-lg p-1 hidden sm:flex`}>
            <Button
              onClick={() => setViewMode('story')}
              variant={viewMode === 'story' ? 'default' : 'ghost'}
              size="sm"
              className={`gap-2 ${viewMode !== 'story' && themeStyles.text}`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden lg:inline">Story</span>
            </Button>
            <Button
              onClick={() => setViewMode('read')}
              variant={viewMode === 'read' ? 'default' : 'ghost'}
              size="sm"
              className={`gap-2 ${viewMode !== 'read' && themeStyles.text}`}
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
              className={`gap-2 border-2 ${themeStyles.border} ${themeStyles.text}`}
            >
              {isReading ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden sm:inline">
                {isReading ? 'Stop' : 'Read Aloud'}
              </span>
            </Button>
          )}

          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            size="sm"
            className={`gap-2 border-2 ${themeStyles.border} ${themeStyles.text}`}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>

          <Button
            onClick={toggleFullscreen}
            variant="outline"
            size="sm"
            className={`gap-2 border-2 ${themeStyles.border} ${themeStyles.text}`}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            <span className="hidden sm:inline">
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </span>
          </Button>
        </div>
      </div>

      {/* Settings Menu */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`absolute top-20 right-4 z-[60] w-64 p-6 rounded-2xl shadow-2xl border-2 ${themeStyles.border} ${themeStyles.page}`}
          >
            <div className="flex items-center justify-between mb-6">
              <h4 className={`font-bold ${themeStyles.text}`}>Reading Options</h4>
              <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)} className={themeStyles.text}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Font Size Selection */}
              <div className="space-y-3">
                <p className={`text-xs font-bold uppercase tracking-wider opacity-60 ${themeStyles.text}`}>Font Size</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['small', 'medium', 'large'] as FontSize[]).map((size) => (
                    <Button
                      key={size}
                      onClick={() => setFontSizeType(size)}
                      variant={fontSizeType === size ? 'default' : 'outline'}
                      size="sm"
                      className="capitalize"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Theme Selection */}
              <div className="space-y-3">
                <p className={`text-xs font-bold uppercase tracking-wider opacity-60 ${themeStyles.text}`}>Theme</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => setReadingTheme('day')}
                    variant={readingTheme === 'day' ? 'default' : 'outline'}
                    size="sm"
                    className="gap-2"
                  >
                    <Sun className="w-3 h-3" />
                    Day
                  </Button>
                  <Button
                    onClick={() => setReadingTheme('sepia')}
                    variant={readingTheme === 'sepia' ? 'default' : 'outline'}
                    size="sm"
                    className="gap-2"
                  >
                    <Palette className="w-3 h-3" />
                    Sepia
                  </Button>
                  <Button
                    onClick={() => setReadingTheme('night')}
                    variant={readingTheme === 'night' ? 'default' : 'outline'}
                    size="sm"
                    className="gap-2"
                  >
                    <Moon className="w-3 h-3" />
                    Night
                  </Button>
                </div>
              </div>

              {/* Typography Selection */}
              <div className="space-y-3">
                <p className={`text-xs font-bold uppercase tracking-wider opacity-60 ${themeStyles.text}`}>Typography</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => setFontType('serif')}
                    variant={fontType === 'serif' ? 'default' : 'outline'}
                    size="sm"
                    className="gap-2 font-serif"
                  >
                    <Type className="w-3 h-3" />
                    Serif
                  </Button>
                  <Button
                    onClick={() => setFontType('sans')}
                    variant={fontType === 'sans' ? 'default' : 'outline'}
                    size="sm"
                    className="gap-2 font-sans"
                  >
                    <Type className="w-3 h-3" />
                    Sans
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Book container - Multiple view modes */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${viewMode}-${currentPageIndex}-${readingTheme}`}
          initial={{ opacity: 0, scale: 0.95, rotateY: 10 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 1.05, rotateY: -10 }}
          transition={{ duration: 0.5, type: 'spring', damping: 20 }}
          className="relative perspective-1000"
        >
          {viewMode === 'story' && renderStoryMode()}
          {viewMode === 'read' && renderReadMode()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons and progress */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <Button
            onClick={goToPreviousPage}
            disabled={currentPageIndex === 0}
            size="lg"
            className="px-6 py-6 md:px-8 md:py-7 text-base md:text-lg font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
          >
            <ChevronLeft className="w-6 h-6 mr-2" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <div className="text-center">
            <p className={`text-sm md:text-base font-bold ${themeStyles.text} mb-2`}>
              Page {currentPageIndex + 1} of {totalVirtualPages || '...'}
            </p>
            <div className="flex gap-2 justify-center">
              {virtualPages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPageIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentPageIndex
                      ? (readingTheme === 'night' ? 'bg-[#bb86fc] w-8' : 'bg-amber-600 w-8')
                      : (readingTheme === 'night' ? 'bg-[#404040] w-2' : 'bg-amber-200 w-2 hover:bg-amber-300')
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <Button
            onClick={goToNextPage}
            disabled={currentPageIndex === totalVirtualPages - 1}
            size="lg"
            className="px-6 py-6 md:px-8 md:py-7 text-base md:text-lg font-bold rounded-full shadow-lg hover:scale-105 transition-transform bg-gradient-to-r from-amber-500 to-orange-500"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-6 h-6 ml-2" />
          </Button>
        </div>

        {/* Keyboard hints */}
        {!isFullscreen && (
          <div className={`text-center text-xs opacity-60 ${themeStyles.text}`}>
            <p>Use arrow keys ← → to navigate • Press F for fullscreen • Space to toggle reading</p>
          </div>
        )}
      </div>

      {/* Completion Celebration */}
      <AnimatePresence>
        {showCompletion && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white rounded-[3rem] p-8 md:p-12 max-w-md w-full text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />
              
              <Sparkles className="h-20 w-20 text-amber-500 mx-auto mb-6 animate-bounce" />
              
              <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Amazing Reading!</h2>
              
              <p className="text-lg text-gray-600 mb-10 font-medium">
                You've completed the story! You're becoming a master explorer.
              </p>

              <Button
                onClick={() => setShowCompletion(false)}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black py-8 rounded-2xl text-xl shadow-xl hover:scale-[1.02] transition-transform"
              >
                Close & Keep Exploring
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        
        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out infinite;
          display: inline-block;
        }

        .drop-cap {
          font-family: 'Georgia', serif;
          margin-right: 0.5rem;
          color: inherit;
        }
      `}</style>
    </div>
  )
}
