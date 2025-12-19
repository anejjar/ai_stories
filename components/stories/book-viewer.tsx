'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  BookOpenText,
  Image as ImageIcon,
  BookText,
  Star,
  Sparkles
} from 'lucide-react'
import Image from 'next/image'
import type { BookPage } from '@/types'

interface BookViewerProps {
  title: string
  bookPages: BookPage[]
  theme: string
}

type ViewMode = 'story' | 'picture' | 'read'

export function BookViewer({ title, bookPages, theme }: BookViewerProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(-1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('story')
  const [completedPages, setCompletedPages] = useState<Set<number>>(new Set())
  const [showCompletion, setShowCompletion] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const currentPage = bookPages[currentPageIndex]
  const totalPages = bookPages.length
  const words = currentPage?.text?.split(/(\s+)/).filter(w => w.trim()) || []
  const isFirstPage = currentPageIndex === 0
  const isLastPage = currentPageIndex === totalPages - 1

  // Preload next and previous images
  useEffect(() => {
    const preloadImage = (index: number) => {
      if (index >= 0 && index < bookPages.length && bookPages[index].illustration_url) {
        const img = new window.Image()
        img.src = bookPages[index].illustration_url
      }
    }

    // Preload next page
    if (currentPageIndex + 1 < bookPages.length) {
      preloadImage(currentPageIndex + 1)
    }
    // Preload previous page
    if (currentPageIndex - 1 >= 0) {
      preloadImage(currentPageIndex - 1)
    }
  }, [currentPageIndex, bookPages])

  // Load view mode preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bookViewMode')
    if (saved && ['story', 'picture', 'read'].includes(saved)) {
      setViewMode(saved as ViewMode)
    }
  }, [])

  // Save view mode preference
  const changeViewMode = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem('bookViewMode', mode)
  }

  // Mark page as completed when viewed for 3+ seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setCompletedPages(prev => new Set(prev).add(currentPageIndex))
    }, 3000)

    return () => clearTimeout(timer)
  }, [currentPageIndex])

  const goToPreviousPage = () => {
    if (!isFirstPage && !isFlipping) {
      setIsFlipping(true)
      setImageLoading(true)
      stopReading()
      setTimeout(() => {
        setCurrentPageIndex(currentPageIndex - 1)
        setIsFlipping(false)
      }, 600)
    }
  }

  const goToNextPage = () => {
    if (!isLastPage && !isFlipping) {
      setIsFlipping(true)
      setImageLoading(true)
      stopReading()
      setTimeout(() => {
        setCurrentPageIndex(currentPageIndex + 1)
        setIsFlipping(false)
        // Check if book is completed
        if (currentPageIndex + 1 === totalPages - 1) {
          setTimeout(() => setShowCompletion(true), 800)
        }
      }, 600)
    }
  }

  // Stop reading when changing pages
  useEffect(() => {
    stopReading()
    setCurrentWordIndex(-1)
  }, [currentPageIndex])

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Read-aloud functionality with word-by-word highlighting
  const toggleReadAloud = () => {
    if (isReading) {
      stopReading()
    } else {
      startReading()
    }
  }

  const startReading = () => {
    if (!window.speechSynthesis) {
      alert('Sorry, your browser does not support text-to-speech.')
      return
    }

    setIsReading(true)
    setCurrentWordIndex(0)

    const utterance = new SpeechSynthesisUtterance(currentPage.text)
    utterance.rate = 0.85 // Slightly slower for children
    utterance.pitch = 1.1 // Slightly higher pitch for friendly tone
    utterance.volume = 1

    // Track word-by-word progress
    let charIndex = 0
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        charIndex = event.charIndex
        // Find which word index we're at
        let currentIndex = 0
        let runningLength = 0
        for (let i = 0; i < words.length; i++) {
          runningLength += words[i].length
          if (runningLength > charIndex) {
            currentIndex = i
            break
          }
        }
        setCurrentWordIndex(currentIndex)
      }
    }

    utterance.onend = () => {
      setIsReading(false)
      setCurrentWordIndex(-1)
      // Auto-advance to next page if not last page
      if (!isLastPage) {
        setTimeout(() => {
          goToNextPage()
        }, 1000)
      }
    }

    utterance.onerror = () => {
      setIsReading(false)
      setCurrentWordIndex(-1)
    }

    speechSynthesisRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const stopReading = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setIsReading(false)
    setCurrentWordIndex(-1)
  }

  // Fullscreen functionality
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await containerRef.current?.requestFullscreen()
        setIsFullscreen(true)
      } catch (err) {
        console.error('Error attempting to enable fullscreen:', err)
      }
    } else {
      try {
        await document.exitFullscreen()
        setIsFullscreen(false)
      } catch (err) {
        console.error('Error attempting to exit fullscreen:', err)
      }
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPreviousPage()
      } else if (event.key === 'ArrowRight') {
        goToNextPage()
      } else if (event.key === 'f' || event.key === 'F') {
        toggleFullscreen()
      } else if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPageIndex, isFlipping, isFullscreen])

  if (!currentPage) {
    return (
      <div className="text-center p-8 text-amber-800">
        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No pages available for this book.</p>
      </div>
    )
  }

  // Extract first letter for drop cap
  const firstLetter = currentPage.text.charAt(0)
  const restOfFirstWord = currentPage.text.substring(1).split(' ')[0]
  const remainingText = currentPage.text.substring(firstLetter.length + restOfFirstWord.length)

  // Calculate progress
  const progress = Math.round(((currentPageIndex + 1) / totalPages) * 100)

  return (
    <div
      ref={containerRef}
      className={`w-full mx-auto p-4 space-y-6 ${isFullscreen ? 'bg-amber-50 h-screen flex flex-col justify-center' : 'max-w-7xl'}`}
    >
      {/* Book Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2 relative">
          <BookOpen className="h-8 w-8 text-amber-700" />
          <h1 className="text-3xl md:text-4xl font-bold text-amber-900 font-serif">{title}</h1>

          {/* Fullscreen Button */}
          <Button
            onClick={toggleFullscreen}
            variant="ghost"
            size="sm"
            className="absolute right-0 text-amber-700 hover:text-amber-900 hover:bg-amber-100/50"
            title={isFullscreen ? 'Exit Fullscreen (F or ESC)' : 'Enter Fullscreen (F)'}
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-sm text-amber-700 italic font-serif">A {theme} Adventure</p>

        {/* View Mode Selector with Fullscreen */}
        <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
          <button
            onClick={() => changeViewMode('story')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'story'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              }`}
          >
            <BookOpenText className="h-4 w-4" />
            <span>Story Mode</span>
          </button>
          <button
            onClick={() => changeViewMode('picture')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'picture'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Picture Mode</span>
          </button>
          <button
            onClick={() => changeViewMode('read')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'read'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              }`}
          >
            <BookText className="h-4 w-4" />
            <span>Read Mode</span>
          </button>

          {/* Fullscreen Button - More Prominent */}
          <button
            onClick={toggleFullscreen}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border-2 ${
              isFullscreen
                ? 'bg-purple-600 text-white border-purple-700 shadow-md'
                : 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200'
            }`}
            title={isFullscreen ? 'Exit Fullscreen (F or ESC)' : 'Enter Fullscreen (F)'}
          >
            {isFullscreen ? (
              <>
                <Minimize className="h-4 w-4" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize className="h-4 w-4" />
                <span>Fullscreen</span>
              </>
            )}
          </button>
        </div>

        {/* Progress Bar with Stars */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {bookPages.map((_, index) => (
            <Star
              key={index}
              className={`h-5 w-5 transition-all ${completedPages.has(index) || index <= currentPageIndex
                ? 'fill-amber-500 text-amber-500'
                : 'text-amber-300'
                }`}
            />
          ))}
        </div>
      </div>

      {/* Book Page Spread - Different layouts based on view mode */}
      {viewMode === 'story' && (
        <Card className={`overflow-hidden shadow-2xl border-none relative book-container ${isFullscreen ? 'h-[calc(100vh-280px)]' : 'max-h-[60vh]'}`}>
          <div className="grid md:grid-cols-2 gap-0 relative h-full">
            {/* Left Side: Full-Bleed Illustration - Wider aspect ratio */}
            <div
              className={`relative bg-gray-50 flex items-center justify-center ${isFullscreen ? 'min-h-full' : 'min-h-[300px] max-h-[60vh]'} overflow-hidden ${isFlipping ? 'animate-page-flip' : 'animate-page-entry'
                }`}
            >
              {currentPage.illustration_url ? (
                <div className="relative w-full h-full">
                  {/* Loading spinner */}
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                      <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <Image
                    key={`illustration-${currentPageIndex}`}
                    src={currentPage.illustration_url}
                    alt={`Illustration for page ${currentPage.pageNumber}`}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    onLoadingComplete={() => setImageLoading(false)}
                    onLoad={() => setImageLoading(false)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 pointer-events-none" />
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <BookOpen className="h-16 w-16 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Illustration not available</p>
                  </div>
                </div>
              )}

              <div className="absolute bottom-6 left-6 text-xs font-serif font-semibold text-white/70 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                {currentPage.pageNumber}
              </div>
            </div>

            {/* Right Side: Storybook Text */}
            <div
              className={`relative bg-[#faf7f0] p-6 md:p-10 flex flex-col ${isFullscreen ? 'min-h-full' : 'min-h-[300px] max-h-[60vh]'} book-page ${isFlipping ? 'animate-text-fade-out' : 'animate-text-fade-in'
                }`}
              style={{
                backgroundImage: `
                  linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, transparent 100%),
                  url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")
                `,
                backgroundBlendMode: 'overlay'
              }}
            >
              {/* Decorative Corner Ornaments */}
              <svg className="absolute top-4 left-4 w-12 h-12 text-amber-800/20" viewBox="0 0 100 100" fill="currentColor">
                <path d="M0,0 Q25,0 25,25 L25,0 Z M0,0 Q0,25 25,25 L0,25 Z" />
              </svg>
              <svg className="absolute top-4 right-4 w-12 h-12 text-amber-800/20 transform rotate-90" viewBox="0 0 100 100" fill="currentColor">
                <path d="M0,0 Q25,0 25,25 L25,0 Z M0,0 Q0,25 25,25 L0,25 Z" />
              </svg>
              <svg className="absolute bottom-4 left-4 w-12 h-12 text-amber-800/20 transform -rotate-90" viewBox="0 0 100 100" fill="currentColor">
                <path d="M0,0 Q25,0 25,25 L25,0 Z M0,0 Q0,25 25,25 L0,25 Z" />
              </svg>
              <svg className="absolute bottom-4 right-4 w-12 h-12 text-amber-800/20 transform rotate-180" viewBox="0 0 100 100" fill="currentColor">
                <path d="M0,0 Q25,0 25,25 L25,0 Z M0,0 Q0,25 25,25 L0,25 Z" />
              </svg>

              <div className="absolute inset-6 border-2 border-amber-800/10 rounded-sm pointer-events-none" />

              <div className="flex-1 overflow-y-auto px-4 scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-transparent">
                <div className="max-w-prose mx-auto">
                  {/* Text Content with Drop Cap and Word-by-Word Highlighting */}
                  <p className="text-gray-900 leading-loose text-2xl md:text-3xl story-text">
                    <span className="float-left text-6xl md:text-7xl font-bold text-amber-800 leading-none pr-3 pt-1 drop-cap">
                      {firstLetter}
                    </span>
                    <span className="text-amber-900 font-medium">{restOfFirstWord}</span>
                    {remainingText.split(/(\s+)/).map((part, idx) => {
                      const wordIdx = Math.floor(idx / 2) + 1
                      const isHighlighted = isReading && wordIdx === currentWordIndex
                      const isSpace = /\s/.test(part)

                      return (
                        <span
                          key={idx}
                          className={`transition-all duration-200 ${isHighlighted && !isSpace
                            ? 'bg-amber-300 text-amber-900 font-bold px-1 rounded shadow-sm scale-110 inline-block'
                            : ''
                            }`}
                        >
                          {part}
                        </span>
                      )
                    })}
                  </p>
                </div>
              </div>

              {/* Read-Aloud Button - Larger for easier access */}
              <div className="mt-6 flex items-center justify-between">
                <Button
                  onClick={toggleReadAloud}
                  size="lg"
                  className={`font-serif font-bold px-8 py-6 rounded-full shadow-lg transition-all ${isReading
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800'
                    }`}
                >
                  {isReading ? (
                    <>
                      <VolumeX className="h-5 w-5 mr-2" />
                      Stop Reading
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-5 w-5 mr-2" />
                      Read Aloud
                    </>
                  )}
                </Button>

                <span className="text-sm font-serif font-semibold text-amber-800/70 bg-amber-100/30 px-3 py-1 rounded-full">
                  {currentPage.pageNumber}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Picture Mode - Full-screen illustration with text overlay */}
      {viewMode === 'picture' && (
        <Card className={`overflow-hidden shadow-2xl border-none relative book-container ${isFullscreen ? 'h-[calc(100vh-280px)]' : 'max-h-[70vh]'}`}>
          <div className={`relative ${isFullscreen ? 'h-full' : 'min-h-[400px] h-[60vh]'}`}>
            {currentPage.illustration_url ? (
              <>
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                    <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <Image
                  key={`picture-${currentPageIndex}`}
                  src={currentPage.illustration_url}
                  alt={`Illustration for page ${currentPage.pageNumber}`}
                  fill
                  className="object-contain"
                  priority
                  onLoadingComplete={() => setImageLoading(false)}
                  onLoad={() => setImageLoading(false)}
                />
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <BookOpen className="h-24 w-24 text-gray-400 opacity-30" />
              </div>
            )}

            {/* Text Overlay at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-8 md:p-12">
              <p className="text-white text-xl md:text-2xl leading-relaxed text-center font-semibold drop-shadow-lg">
                {currentPage.text}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Read Mode - Text-focused with small illustration */}
      {viewMode === 'read' && (
        <Card className={`overflow-hidden shadow-2xl border-none relative book-container ${isFullscreen ? 'h-[calc(100vh-280px)]' : 'max-h-[80vh]'}`}>
          <div className={`bg-[#faf7f0] p-8 md:p-12 ${isFullscreen ? 'h-full overflow-y-auto' : 'min-h-[400px] overflow-y-auto'}`}>
            {/* Small illustration thumbnail at top */}
            {currentPage.illustration_url && (
              <div className="relative w-full h-48 md:h-64 mb-8 rounded-lg overflow-hidden">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                    <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <Image
                  key={`read-${currentPageIndex}`}
                  src={currentPage.illustration_url}
                  alt={`Illustration for page ${currentPage.pageNumber}`}
                  fill
                  className="object-cover"
                  priority
                  onLoadingComplete={() => setImageLoading(false)}
                  onLoad={() => setImageLoading(false)}
                />
              </div>
            )}

            {/* Large text area */}
            <div className="max-w-3xl mx-auto">
              <p className="text-gray-900 leading-[2.2] text-3xl md:text-4xl font-semibold story-text">
                <span className="float-left text-7xl md:text-8xl font-bold text-amber-800 leading-none pr-4 pt-2 drop-cap">
                  {firstLetter}
                </span>
                <span className="text-amber-900 font-bold">{restOfFirstWord}</span>
                {remainingText.split(/(\s+)/).map((part, idx) => {
                  const wordIdx = Math.floor(idx / 2) + 1
                  const isHighlighted = isReading && wordIdx === currentWordIndex
                  const isSpace = /\s/.test(part)

                  return (
                    <span
                      key={idx}
                      className={`transition-all duration-200 ${isHighlighted && !isSpace
                        ? 'bg-amber-300 text-amber-900 font-bold px-1 rounded shadow-sm scale-110 inline-block'
                        : ''
                        }`}
                    >
                      {part}
                    </span>
                  )
                })}
              </p>

              {/* Read Aloud Button */}
              <div className="mt-12 flex justify-center">
                <Button
                  onClick={toggleReadAloud}
                  size="lg"
                  className={`font-serif font-bold px-8 py-6 rounded-full shadow-lg transition-all ${isReading
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800'
                    }`}
                >
                  {isReading ? (
                    <>
                      <VolumeX className="h-5 w-5 mr-2" />
                      Stop Reading
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-5 w-5 mr-2" />
                      Read Aloud
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Navigation Controls - Larger for toddlers */}
      <div className="flex items-center justify-between px-4">
        <Button
          onClick={goToPreviousPage}
          disabled={isFirstPage || isFlipping}
          className="rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:opacity-40 disabled:cursor-not-allowed font-serif font-bold shadow-lg transition-all px-6 py-6 md:px-8 md:py-7"
          size="lg"
        >
          <ChevronLeft className="h-6 w-6 mr-1" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {/* Page Indicator with Larger Dots */}
        <div className="text-center">
          <p className="text-sm md:text-base font-bold text-amber-900 font-serif mb-2">
            Page {currentPageIndex + 1} of {totalPages}
          </p>
          <div className="flex gap-2.5 justify-center">
            {bookPages.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isFlipping && index !== currentPageIndex) {
                    setIsFlipping(true)
                    stopReading()
                    setTimeout(() => {
                      setCurrentPageIndex(index)
                      setIsFlipping(false)
                    }, 600)
                  }
                }}
                className={`h-4 rounded-full transition-all touch-target ${index === currentPageIndex
                  ? 'bg-amber-700 w-12'
                  : 'bg-amber-300 hover:bg-amber-400 w-4'
                  }`}
                aria-label={`Go to page ${index + 1}`}
                style={{ minWidth: '16px', minHeight: '16px', padding: '4px' }}
              />
            ))}
          </div>
        </div>

        <Button
          onClick={goToNextPage}
          disabled={isLastPage || isFlipping}
          className="rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:opacity-40 disabled:cursor-not-allowed font-serif font-bold shadow-lg transition-all px-6 py-6 md:px-8 md:py-7"
          size="lg"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-6 w-6 ml-1" />
        </Button>
      </div>

      {/* Keyboard Navigation Hint */}
      <p className="text-center text-xs text-amber-700/70 italic">
        {isFullscreen
          ? 'Tip: Press F or ESC to exit fullscreen • Use arrow keys ← → to navigate'
          : 'Tip: Press F for fullscreen • Use arrow keys ← → to navigate pages'}
      </p>

      {/* Completion Celebration */}
      {showCompletion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 md:p-12 max-w-md text-center shadow-2xl animate-in zoom-in duration-500">
            <Sparkles className="h-16 w-16 text-amber-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-3xl font-bold text-amber-900 mb-2">Great Job!</h2>
            <p className="text-lg text-gray-700 mb-6">
              You finished the story! {completedPages.size} of {totalPages} pages read.
            </p>
            <div className="flex gap-2 justify-center mb-6">
              {bookPages.map((_, index) => (
                <Star
                  key={index}
                  className="h-8 w-8 fill-amber-500 text-amber-500 animate-bounce"
                  style={{ animationDelay: `${index * 100}ms` }}
                />
              ))}
            </div>
            <Button
              onClick={() => setShowCompletion(false)}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 font-bold px-8 py-6 rounded-full"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Open+Sans:wght@600;700;800&display=swap');

        .book-page {
          font-family: 'Open Sans', 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .story-text {
          text-indent: 0;
          hyphens: none;
          text-align: left;
          line-height: 2.2;
          word-spacing: 0.15em;
          letter-spacing: 0.02em;
          font-weight: 600;
        }

        .drop-cap {
          font-family: 'Georgia', 'Times New Roman', serif;
          line-height: 0.85;
          margin-top: 0.1em;
        }

        .touch-target {
          min-width: 44px;
          min-height: 44px;
        }

        @keyframes pageFlip {
          0% {
            transform: perspective(1000px) rotateY(0deg);
            opacity: 1;
          }
          50% {
            transform: perspective(1000px) rotateY(-90deg);
            opacity: 0.5;
          }
          100% {
            transform: perspective(1000px) rotateY(0deg);
            opacity: 1;
          }
        }

        @keyframes pageEntry {
          0% {
            opacity: 0;
            transform: scale(0.98);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes textFadeOut {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes textFadeIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-page-flip {
          animation: pageFlip 0.6s ease-in-out;
        }

        .animate-page-entry {
          animation: pageEntry 0.5s ease-out;
        }

        .animate-text-fade-out {
          animation: textFadeOut 0.3s ease-out;
        }

        .animate-text-fade-in {
          animation: textFadeIn 0.5s ease-out 0.3s both;
        }

        .book-container {
          box-shadow:
            0 0 0 1px rgba(0,0,0,0.05),
            0 20px 40px -10px rgba(0,0,0,0.3),
            0 0 100px -20px rgba(0,0,0,0.15);
        }

        /* Scrollbar styling */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgb(252 211 77 / 0.5);
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgb(252 211 77 / 0.7);
        }
      `}</style>
    </div>
  )
}
