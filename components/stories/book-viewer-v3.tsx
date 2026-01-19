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
  Flag,
  BookOpen,
  ZoomIn,
  Maximize2
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
  const [showTOC, setShowTOC] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  
  // Track if completion modal has been dismissed to prevent showing again
  const completionDismissedRef = useRef(false)

  // Read-aloud state
  const [isReading, setIsReading] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(-1)
  const [readingSupported, setReadingSupported] = useState(false)
  const [readingPageIndex, setReadingPageIndex] = useState(0)
  const [readingSpeed, setReadingSpeed] = useState(0.9) // 0.5 to 2.0

  // Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Scroll to section - defined early to avoid temporal dead zone
  const scrollToSection = useCallback((index: number) => {
    const section = sectionRefs.current[index]
    if (section && scrollContainerRef.current) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

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

    const savedReadingSpeed = localStorage.getItem('bookReadingSpeed')
    if (savedReadingSpeed) {
      const speed = parseFloat(savedReadingSpeed)
      if (speed >= 0.5 && speed <= 2.0) {
        setReadingSpeed(speed)
      }
    }

    // Load saved reading position
    const savedPosition = localStorage.getItem(`bookReadingPosition_${storyId}`)
    if (savedPosition && totalVirtualPages > 0) {
      const position = parseInt(savedPosition, 10)
      if (position >= 0 && position < totalVirtualPages) {
        setTimeout(() => {
          scrollToSection(position)
        }, 500)
      }
    }
  }, [storyId, totalVirtualPages, scrollToSection])

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

  useEffect(() => {
    localStorage.setItem('bookReadingSpeed', readingSpeed.toString())
  }, [readingSpeed])

  // Save reading position
  useEffect(() => {
    if (currentVisibleIndex >= 0 && totalVirtualPages > 0) {
      localStorage.setItem(`bookReadingPosition_${storyId}`, currentVisibleIndex.toString())
    }
  }, [currentVisibleIndex, storyId, totalVirtualPages])

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

  // Image preloading for next 2-3 sections
  useEffect(() => {
    if (virtualPages.length === 0) return

    const preloadImages = () => {
      const preloadRange = 2
      for (let i = Math.max(0, currentVisibleIndex - 1); i <= Math.min(totalVirtualPages - 1, currentVisibleIndex + preloadRange); i++) {
        const page = virtualPages[i]
        if (page?.illustration_url && !imageLoadingStates[i]) {
          const img = new window.Image()
          img.src = page.illustration_url
        }
      }
    }

    preloadImages()
  }, [currentVisibleIndex, virtualPages, totalVirtualPages, imageLoadingStates])

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere if user is typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'j' || e.key === 'J') {
        e.preventDefault()
        if (currentVisibleIndex < totalVirtualPages - 1) {
          scrollToSection(currentVisibleIndex + 1)
        }
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'k' || e.key === 'K') {
        e.preventDefault()
        if (currentVisibleIndex > 0) {
          scrollToSection(currentVisibleIndex - 1)
        }
      } else if (e.key === 'Home') {
        e.preventDefault()
        scrollToSection(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        scrollToSection(totalVirtualPages - 1)
      } else if (e.key === ' ') {
        e.preventDefault()
        toggleReading()
      } else if (e.key === 'Escape') {
        if (lightboxImage) {
          setLightboxImage(null)
          setLightboxIndex(null)
        } else if (showSettings) {
          setShowSettings(false)
        } else if (showTOC) {
          setShowTOC(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentVisibleIndex, totalVirtualPages, scrollToSection, lightboxImage, showSettings, showTOC])

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
    utterance.rate = readingSpeed
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
  }, [virtualPages, currentVisibleIndex, totalVirtualPages, scrollToSection, stopReading, readingSupported, readingSpeed])

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

  // Helper function to determine image position based on aspect ratio
  const getImagePosition = (aspectRatio: 'square' | 'portrait' | 'landscape' | undefined, index: number): 'left' | 'right' => {
    // Default to portrait for backward compatibility
    const ratio = aspectRatio || 'portrait'
    
    // Portrait images prefer left side, landscape prefer right, square alternates
    switch (ratio) {
      case 'portrait':
        return 'left'
      case 'landscape':
        return 'right'
      case 'square':
        return index % 2 === 0 ? 'left' : 'right'
      default:
        return index % 2 === 0 ? 'left' : 'right'
    }
  }

  // Helper function to get aspect ratio class
  const getAspectRatioClass = (aspectRatio: 'square' | 'portrait' | 'landscape' | undefined): string => {
    // Default to portrait for backward compatibility
    const ratio = aspectRatio || 'portrait'
    
    switch (ratio) {
      case 'square':
        return 'aspect-square'
      case 'portrait':
        return 'aspect-[9/16]'
      case 'landscape':
        return 'aspect-[16/9]'
      default:
        return 'aspect-[4/5]' // Fallback to original
    }
  }

  // Helper function to get grid columns based on aspect ratio
  const getGridColumns = (aspectRatio: 'square' | 'portrait' | 'landscape' | undefined, imagePosition: 'left' | 'right'): string => {
    // Default to portrait for backward compatibility
    const ratio = aspectRatio || 'portrait'
    
    if (imagePosition === 'left') {
      switch (ratio) {
        case 'portrait':
          return 'grid-cols-1 md:grid-cols-[35%_65%]'
        case 'landscape':
          return 'grid-cols-1 md:grid-cols-[50%_50%]'
        case 'square':
          return 'grid-cols-1 md:grid-cols-[40%_60%]'
        default:
          return 'grid-cols-1 md:grid-cols-[35%_65%]'
      }
    } else {
      switch (ratio) {
        case 'portrait':
          return 'grid-cols-1 md:grid-cols-[65%_35%]'
        case 'landscape':
          return 'grid-cols-1 md:grid-cols-[50%_50%]'
        case 'square':
          return 'grid-cols-1 md:grid-cols-[60%_40%]'
        default:
          return 'grid-cols-1 md:grid-cols-[65%_35%]'
      }
    }
  }

  // Render a single section
  const renderSection = (virtualPage: VirtualPage, index: number) => {
    const hasIllustration = virtualPage.illustration_url && virtualPage.illustration_url.trim() !== ''
    const aspectRatio = virtualPage.aspectRatio
    const imagePosition = getImagePosition(aspectRatio, index)
    const aspectRatioClass = getAspectRatioClass(aspectRatio)
    const gridColumns = hasIllustration ? getGridColumns(aspectRatio, imagePosition) : 'grid-cols-1'
    const isLoading = imageLoadingStates[index] ?? false

    return (
      <div
        key={index}
        ref={(el) => {
          sectionRefs.current[index] = el
        }}
        data-section-index={index}
        className={`min-h-screen scroll-snap-align-start scroll-snap-stop-always flex items-center justify-center relative ${themeStyles.page}`}
        role="article"
        aria-label={`Section ${index + 1} of ${totalVirtualPages}`}
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
          <div className={`grid gap-8 items-center ${gridColumns}`}>
            {/* Image on left */}
            {hasIllustration && imagePosition === 'left' && (
              <div className={`relative w-full ${aspectRatioClass} overflow-hidden rounded-lg shadow-lg group cursor-pointer`} onClick={() => {
                setLightboxImage(virtualPage.illustration_url)
                setLightboxIndex(index)
              }}>
                {isLoading && (
                  <div className="absolute inset-0 z-10 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full bg-gray-300 rounded" />
                    </div>
                  </div>
                )}
                <Image
                  src={virtualPage.illustration_url}
                  alt={`Illustration for section ${index + 1}`}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  priority={index === 0}
                  onLoad={() => setImageLoadingStates(prev => ({ ...prev, [index]: false }))}
                  sizes="(max-width: 768px) 100vw, 35vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <ZoomIn className={`w-8 h-8 ${readingTheme === 'night' ? 'text-[#bb86fc]' : 'text-amber-500'} drop-shadow-lg`} />
                </div>
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

            {/* Image on right */}
            {hasIllustration && imagePosition === 'right' && (
              <div className={`relative w-full ${aspectRatioClass} overflow-hidden rounded-lg shadow-lg group cursor-pointer`} onClick={() => {
                setLightboxImage(virtualPage.illustration_url)
                setLightboxIndex(index)
              }}>
                {isLoading && (
                  <div className="absolute inset-0 z-10 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full bg-gray-300 rounded" />
                    </div>
                  </div>
                )}
                <Image
                  src={virtualPage.illustration_url}
                  alt={`Illustration for section ${index + 1}`}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  priority={index < 2}
                  onLoad={() => setImageLoadingStates(prev => ({ ...prev, [index]: false }))}
                  sizes="(max-width: 768px) 100vw, 35vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <ZoomIn className={`w-8 h-8 ${readingTheme === 'night' ? 'text-[#bb86fc]' : 'text-amber-500'} drop-shadow-lg`} />
                </div>
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
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b-2 border-gray-200 shadow-sm" role="banner">
        <div className="container mx-auto px-4 py-3 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className={`text-lg md:text-xl font-bold ${themeStyles.text}`}>
                {title || 'Story'}
              </h3>
              <div className={`text-sm ${themeStyles.text} opacity-70`}>
                Section {currentVisibleIndex + 1} of {totalVirtualPages || '...'}
              </div>
              {/* Reading Progress Bar */}
              {totalVirtualPages > 0 && (
                <div className="hidden md:flex items-center gap-2 min-w-[120px]">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        readingTheme === 'night' ? 'bg-[#bb86fc]' : 'bg-amber-600'
                      }`}
                      style={{ width: `${((currentVisibleIndex + 1) / totalVirtualPages) * 100}%` }}
                      aria-label={`Reading progress: ${Math.round(((currentVisibleIndex + 1) / totalVirtualPages) * 100)}%`}
                    />
                  </div>
                  <span className={`text-xs ${themeStyles.text} opacity-60`}>
                    {Math.round(((currentVisibleIndex + 1) / totalVirtualPages) * 100)}%
                  </span>
                </div>
              )}
              {/* Table of Contents Button */}
              <Button
                onClick={() => setShowTOC(!showTOC)}
                variant="outline"
                size="sm"
                className={`gap-2 border-2 ${themeStyles.border} ${themeStyles.text}`}
                aria-label="Open table of contents"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">TOC</span>
              </Button>
            </div>

            {/* Control buttons */}
            <div className="flex items-center gap-2">
              {readingSupported && (
                <Button
                  onClick={toggleReading}
                  variant="outline"
                  size="sm"
                  className={`gap-2 border-2 ${themeStyles.border} ${themeStyles.text}`}
                  aria-label={isReading ? 'Stop reading aloud' : 'Start reading aloud'}
                  aria-pressed={isReading}
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
                aria-label="Open reading settings"
                aria-expanded={showSettings}
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
      </header>

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

              {/* Reading Speed Control */}
              {readingSupported && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-bold uppercase tracking-wider opacity-60 ${themeStyles.text}`}>Reading Speed</p>
                    <span className={`text-sm font-medium ${themeStyles.text}`}>{readingSpeed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={readingSpeed}
                    onChange={(e) => setReadingSpeed(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    aria-label={`Reading speed: ${readingSpeed.toFixed(1)}x`}
                  />
                  <div className="flex justify-between text-xs opacity-60">
                    <span className={themeStyles.text}>0.5x</span>
                    <span className={themeStyles.text}>1.0x</span>
                    <span className={themeStyles.text}>2.0x</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table of Contents Dropdown */}
      <AnimatePresence>
        {showTOC && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 left-4 z-[60] w-80 max-h-[70vh] overflow-y-auto p-6 rounded-2xl shadow-2xl border-2 ${themeStyles.border} ${themeStyles.page}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className={`font-bold ${themeStyles.text}`}>Table of Contents</h4>
              <Button variant="ghost" size="icon" onClick={() => setShowTOC(false)} className={themeStyles.text}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {virtualPages.map((page, index) => {
                const previewText = cleanStoryText(page.text).substring(0, 60) + '...'
                return (
                  <button
                    key={index}
                    onClick={() => {
                      scrollToSection(index)
                      setShowTOC(false)
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      index === currentVisibleIndex
                        ? readingTheme === 'night' ? 'bg-[#bb86fc]/20 border-2 border-[#bb86fc]' : 'bg-amber-100 border-2 border-amber-500'
                        : `${themeStyles.border} border hover:bg-gray-100 dark:hover:bg-gray-800`
                    }`}
                    aria-label={`Go to section ${index + 1}`}
                    aria-current={index === currentVisibleIndex ? 'page' : undefined}
                  >
                    <div className={`font-bold ${themeStyles.text} mb-1`}>
                      Section {index + 1}
                    </div>
                    <div className={`text-xs ${themeStyles.text} opacity-70 line-clamp-2`}>
                      {previewText}
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Lightbox */}
      <AnimatePresence>
        {lightboxImage && lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            onClick={() => {
              setLightboxImage(null)
              setLightboxIndex(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightboxImage}
                alt={`Full-size illustration for section ${lightboxIndex + 1}`}
                width={1200}
                height={1500}
                className="object-contain max-w-full max-h-full rounded-lg shadow-2xl"
                priority
              />
              <Button
                onClick={() => {
                  setLightboxImage(null)
                  setLightboxIndex(null)
                }}
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-900"
                aria-label="Close image lightbox"
              >
                <X className="w-6 h-6" />
              </Button>
              {/* Navigation arrows */}
              {lightboxIndex > 0 && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    const prevIndex = lightboxIndex - 1
                    const prevPage = virtualPages[prevIndex]
                    if (prevPage?.illustration_url) {
                      setLightboxImage(prevPage.illustration_url)
                      setLightboxIndex(prevIndex)
                    }
                  }}
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900"
                  aria-label="Previous image"
                >
                  <ChevronDown className="w-6 h-6 rotate-90" />
                </Button>
              )}
              {lightboxIndex < totalVirtualPages - 1 && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    const nextIndex = lightboxIndex + 1
                    const nextPage = virtualPages[nextIndex]
                    if (nextPage?.illustration_url) {
                      setLightboxImage(nextPage.illustration_url)
                      setLightboxIndex(nextIndex)
                    }
                  }}
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900"
                  aria-label="Next image"
                >
                  <ChevronDown className="w-6 h-6 -rotate-90" />
                </Button>
              )}
            </motion.div>
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
        role="main"
        aria-label="Story content"
      >
        {virtualPages.map((virtualPage, index) => renderSection(virtualPage, index))}
      </div>

      {/* Progress indicator */}
      <nav className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30" aria-label="Section navigation">
        <div className={`bg-white/90 backdrop-blur-xl rounded-full px-6 py-3 shadow-lg border-2 ${themeStyles.border}`}>
          <div className="flex gap-2 items-center" role="list">
            {virtualPages.map((_, index) => {
              const previewText = cleanStoryText(virtualPages[index]?.text || '').substring(0, 40)
              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(index)}
                  className={`h-2 rounded-full transition-all min-w-[8px] ${
                    index === currentVisibleIndex
                      ? (readingTheme === 'night' ? 'bg-[#bb86fc] w-8' : 'bg-amber-600 w-8')
                      : (readingTheme === 'night' ? 'bg-[#404040] w-2 hover:bg-[#505050]' : 'bg-amber-200 w-2 hover:bg-amber-300')
                  }`}
                  aria-label={`Go to section ${index + 1}${previewText ? `: ${previewText}` : ''}`}
                  title={`Section ${index + 1}${previewText ? `: ${previewText}` : ''}`}
                />
              )
            })}
          </div>
        </div>
      </nav>

      {/* Completion Celebration */}
      <AnimatePresence>
        {showCompletion && !completionDismissedRef.current && (
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
                onClick={() => {
                  setShowCompletion(false)
                  completionDismissedRef.current = true // Mark as dismissed to prevent showing again
                }}
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

        /* Skeleton loader animation */
        @keyframes skeleton-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .skeleton-loader {
          animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}

