'use client'

/**
 * Book Viewer V3 - Scrollable Sections Layout
 * Features full-viewport scrollable sections with wide images
 * Each section fills the viewport with scroll-snap behavior
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Volume2,
  VolumeX,
  Settings,
  X,
  Moon,
  Sun,
  Palette,
  Sparkles,
  Type,
  ChevronDown,
  Flag
} from 'lucide-react'
import { useTextPagination, type VirtualPage, type TextPaginationOptions } from '@/hooks/use-text-pagination'
import type { BookPage } from '@/lib/ai/illustrated-book-generator'
import { ReportModal } from '@/components/stories/report-modal'

type ReadingTheme = 'day' | 'sepia' | 'night'
type FontSize = 'small' | 'medium' | 'large'
type FontType = 'serif' | 'sans'

interface BookViewerV3Props {
  bookPages: BookPage[]
  storyId: string
  completedPages: number[]
  onPageComplete?: (pageNumber: number) => void
  title?: string
  theme?: string
}

export function BookViewerV3({
  bookPages,
  storyId,
  completedPages,
  onPageComplete,
  title,
  theme: storyTheme
}: BookViewerV3Props) {
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0)
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<number, boolean>>({})
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>('day')
  const [fontSizeType, setFontSizeType] = useState<FontSize>('medium')
  const [fontType, setFontType] = useState<FontType>('serif')
  const [showSettings, setShowSettings] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)

  // Read-aloud state
  const [isReading, setIsReading] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(-1)
  const [readingSupported, setReadingSupported] = useState(false)
  const [readingPageIndex, setReadingPageIndex] = useState(0)

  // Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Measure container width for pagination
  const [containerWidth, setContainerWidth] = useState(0)

  // Calculate font size value based on type
  const fontSize = useMemo(() => {
    switch (fontSizeType) {
      case 'small': return 20
      case 'medium': return 26
      case 'large': return 32
      default: return 26
    }
  }, [fontSizeType])

  // Calculate text pagination options
  const lineHeight = 1.8
  const containerPadding = 60 // Reduced padding to allow more text
  const decorationHeight = 100 // Reduced decoration height
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800

  const paginationOptions: TextPaginationOptions = useMemo(() => ({
    fontSize,
    lineHeight,
    containerPadding,
    decorationHeight,
    maxHeight: viewportHeight * 0.55 // Text area takes ~55% of viewport (increased from 40%)
  }), [viewportHeight, fontSize])

  // Use text pagination hook - use more width for text (65% of container width for text area)
  const { virtualPages, isCalculating, totalVirtualPages } = useTextPagination(
    bookPages,
    paginationOptions,
    containerWidth > 768 ? (containerWidth * 0.65) - 64 : (containerWidth * 0.65) - 32,
    true
  )

  // Measure container width
  useEffect(() => {
    const updateDimensions = () => {
      if (scrollContainerRef.current) {
        const width = scrollContainerRef.current.offsetWidth
        if (width > 0) {
          setContainerWidth(width)
        }
      }
    }

    const rafId = requestAnimationFrame(() => {
      updateDimensions()
    })

    const timeoutId = setTimeout(updateDimensions, 100)
    window.addEventListener('resize', updateDimensions)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(timeoutId)
      window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  // Check speech synthesis support
  useEffect(() => {
    setReadingSupported(
      'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
    )
  }, [])

  // Load saved preferences from localStorage
  useEffect(() => {
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
    localStorage.setItem('bookReadingTheme', readingTheme)
  }, [readingTheme])

  useEffect(() => {
    localStorage.setItem('bookFontSize', fontSizeType)
  }, [fontSizeType])

  useEffect(() => {
    localStorage.setItem('bookFontType', fontType)
  }, [fontType])

  // Initialize image loading states
  useEffect(() => {
    const loadingStates: Record<number, boolean> = {}
    virtualPages.forEach((page, index) => {
      if (page.illustration_url) {
        loadingStates[index] = true
      }
    })
    setImageLoadingStates(loadingStates)
  }, [virtualPages])

  // Intersection Observer for tracking visible sections
  useEffect(() => {
    if (sectionRefs.current.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const index = parseInt(entry.target.getAttribute('data-section-index') || '0')
            setCurrentVisibleIndex(index)
          }
        })
      },
      {
        threshold: 0.5,
        rootMargin: '-20% 0px -20% 0px'
      }
    )

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => {
      sectionRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref)
      })
    }
  }, [virtualPages.length])

  // Mark page as completed after viewing
  useEffect(() => {
    if (virtualPages.length === 0 || isCalculating) return

    const currentPage = virtualPages[currentVisibleIndex]
    if (!currentPage) return

    const timer = setTimeout(() => {
      if (onPageComplete && !completedPages.includes(currentPage.originalPageIndex)) {
        onPageComplete(currentPage.originalPageIndex)
      }

      // Check if this is the last virtual page
      if (currentVisibleIndex === totalVirtualPages - 1 && totalVirtualPages > 0) {
        setShowCompletion(true)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [currentVisibleIndex, virtualPages, completedPages, onPageComplete, isCalculating, totalVirtualPages])

  // Scroll to section
  const scrollToSection = useCallback((index: number) => {
    const section = sectionRefs.current[index]
    if (section && scrollContainerRef.current) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        if (currentVisibleIndex < totalVirtualPages - 1) {
          scrollToSection(currentVisibleIndex + 1)
        }
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        if (currentVisibleIndex > 0) {
          scrollToSection(currentVisibleIndex - 1)
        }
      } else if (e.key === ' ') {
        e.preventDefault()
        toggleReading()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentVisibleIndex, totalVirtualPages, scrollToSection])

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
    const currentPage = virtualPages[currentVisibleIndex]
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

      // Auto-advance to next section if available
      if (currentVisibleIndex < totalVirtualPages - 1) {
        setTimeout(() => {
          scrollToSection(currentVisibleIndex + 1)
          // Auto-start reading next section
          setTimeout(() => {
            startReading()
          }, 500)
        }, 500)
      }
    }

    utterance.onerror = () => {
      stopReading()
    }

    speechRef.current = utterance
    setIsReading(true)
    setReadingPageIndex(currentVisibleIndex)
    window.speechSynthesis.speak(utterance)
  }, [virtualPages, currentVisibleIndex, totalVirtualPages, scrollToSection, stopReading, readingSupported])

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

  // Filter out AI structural markers from the story text
  const cleanStoryText = (text: string) => {
    if (!text) return ''
    
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
  const renderText = (text: string, showDropCap: boolean, pageIndex: number) => {
    const cleanedText = cleanStoryText(text)
    
    // Helper to render special parts
    const renderSpecialParts = (content: string) => {
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

    const isCurrentlyReading = isReading && readingPageIndex === pageIndex

    if (!isCurrentlyReading || currentWordIndex === -1) {
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

  // Render a single section
  const renderSection = (virtualPage: VirtualPage, index: number) => {
    const hasIllustration = virtualPage.illustration_url && virtualPage.illustration_url.trim() !== ''
    const imagePosition = index % 2 === 0 ? 'left' : 'right'
    const isLoading = imageLoadingStates[index] ?? false

    return (
      <div
        key={index}
        ref={(el) => {
          sectionRefs.current[index] = el
        }}
        data-section-index={index}
        className={`min-h-screen scroll-snap-align-start scroll-snap-stop-always flex items-center justify-center relative ${themeStyles.page}`}
        style={{
          backgroundImage: readingTheme !== 'night' ? `
            linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, transparent 100%),
            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
          ` : 'none',
          backgroundBlendMode: 'overlay'
        }}
      >
        {/* Container with 80% width */}
        <div className="w-[80%] max-w-7xl mx-auto px-4">
          <div className={`grid gap-8 items-center ${hasIllustration ? (imagePosition === 'left' ? 'grid-cols-1 md:grid-cols-[35%_65%]' : 'grid-cols-1 md:grid-cols-[65%_35%]') : 'grid-cols-1'}`}>
            {/* Image on left (even indices) */}
            {hasIllustration && imagePosition === 'left' && (
              <div className="relative w-full aspect-[4/5] overflow-hidden rounded-lg shadow-lg">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-100">
                    <div className={`w-12 h-12 border-4 ${readingTheme === 'night' ? 'border-[#bb86fc]' : 'border-amber-500'} border-t-transparent rounded-full animate-spin`} />
                  </div>
                )}
                <Image
                  src={virtualPage.illustration_url}
                  alt={`Illustration for section ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  onLoad={() => setImageLoadingStates(prev => ({ ...prev, [index]: false }))}
                  sizes="(max-width: 768px) 100vw, 35vw"
                />
              </div>
            )}

            {/* Text content */}
            <div className="flex flex-col justify-center py-8">
              {/* Top ornamental border */}
              <div className={`h-14 flex items-center justify-center border-b-2 ${themeStyles.border} mb-8`}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-1 bg-gradient-to-r from-transparent ${themeStyles.ornament} to-transparent`} />
                  <div className={`w-2 h-2 rounded-full ${readingTheme === 'night' ? 'bg-[#bb86fc]' : 'bg-amber-600'}`} />
                  <div className={`w-8 h-1 bg-gradient-to-r from-transparent ${themeStyles.ornament} to-transparent`} />
                </div>
              </div>

              {/* Text content */}
              <div
                className={`story-text-v3 w-full ${themeStyles.text}`}
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
                {renderText(virtualPage.text, virtualPage.isFirstVirtualPage, index)}
              </div>

              {/* Bottom ornamental border */}
              <div className={`h-14 flex items-center justify-center border-t-2 ${themeStyles.border} mt-8`}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-1 bg-gradient-to-r from-transparent ${themeStyles.ornament} to-transparent`} />
                  <div className={`w-2 h-2 rounded-full ${readingTheme === 'night' ? 'bg-[#bb86fc]' : 'bg-amber-600'}`} />
                  <div className={`w-8 h-1 bg-gradient-to-r from-transparent ${themeStyles.ornament} to-transparent`} />
                </div>
              </div>
            </div>

            {/* Image on right (odd indices) */}
            {hasIllustration && imagePosition === 'right' && (
              <div className="relative w-full aspect-[4/5] overflow-hidden rounded-lg shadow-lg">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-100">
                    <div className={`w-12 h-12 border-4 ${readingTheme === 'night' ? 'border-[#bb86fc]' : 'border-amber-500'} border-t-transparent rounded-full animate-spin`} />
                  </div>
                )}
                <Image
                  src={virtualPage.illustration_url}
                  alt={`Illustration for section ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index < 2}
                  onLoad={() => setImageLoadingStates(prev => ({ ...prev, [index]: false }))}
                  sizes="(max-width: 768px) 100vw, 35vw"
                />
              </div>
            )}
          </div>
        </div>

        {/* Scroll indicator (not on last section) */}
        {index < totalVirtualPages - 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className={`w-8 h-8 ${themeStyles.text} opacity-60`} />
          </div>
        )}
      </div>
    )
  }

  const showLoadingOverlay = virtualPages.length === 0 || isCalculating

  return (
    <div className={`w-full relative transition-colors duration-500 ${themeStyles.container}`}>
      {/* Loading overlay */}
      {showLoadingOverlay && (
        <div className={`absolute inset-0 z-50 flex items-center justify-center ${themeStyles.container} min-h-screen`}>
          <div className="text-center space-y-4">
            <div className={`w-16 h-16 border-4 ${readingTheme === 'night' ? 'border-[#bb86fc]' : 'border-amber-500'} border-t-transparent rounded-full animate-spin mx-auto`} />
            <p className={`${themeStyles.text} font-medium`}>
              {isCalculating ? 'Preparing pages...' : 'Loading story...'}
            </p>
          </div>
        </div>
      )}

      {/* Fixed header with controls */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b-2 border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className={`text-lg md:text-xl font-bold ${themeStyles.text}`}>
                {title || 'Story'}
              </h3>
              <div className={`text-sm ${themeStyles.text} opacity-70`}>
                Section {currentVisibleIndex + 1} of {totalVirtualPages || '...'}
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex items-center gap-2">
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

              {/* Report button - available for all stories */}
              <ReportModal
                storyId={storyId}
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className={`gap-2 border-2 ${themeStyles.border} text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50`}
                  >
                    <Flag className="w-4 h-4" />
                    <span className="hidden sm:inline">Report</span>
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Settings Menu */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-4 z-[60] w-64 p-6 rounded-2xl shadow-2xl border-2 ${themeStyles.border} ${themeStyles.page}`}
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

      {/* Scrollable container with all sections */}
      <div
        ref={scrollContainerRef}
        className="scroll-container"
        style={{
          scrollSnapType: 'y mandatory',
          overflowY: 'scroll',
          height: 'calc(100vh - 73px)' // Account for header height
        }}
      >
        {virtualPages.map((virtualPage, index) => renderSection(virtualPage, index))}
      </div>

      {/* Progress indicator */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className={`bg-white/90 backdrop-blur-xl rounded-full px-6 py-3 shadow-lg border-2 ${themeStyles.border}`}>
          <div className="flex gap-2 items-center">
            {virtualPages.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToSection(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentVisibleIndex
                    ? (readingTheme === 'night' ? 'bg-[#bb86fc] w-8' : 'bg-amber-600 w-8')
                    : (readingTheme === 'night' ? 'bg-[#404040] w-2 hover:bg-[#505050]' : 'bg-amber-200 w-2 hover:bg-amber-300')
                }`}
                aria-label={`Go to section ${index + 1}`}
              />
            ))}
          </div>
        </div>
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
        .scroll-container {
          scroll-snap-type: y mandatory;
          overflow-y: scroll;
        }

        .scroll-snap-align-start {
          scroll-snap-align: start;
        }

        .scroll-snap-stop-always {
          scroll-snap-stop: always;
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

