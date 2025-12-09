'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import Image from 'next/image'
import type { BookPage } from '@/types'

interface BookViewerProps {
  title: string
  bookPages: BookPage[]
  theme: string
}

export function BookViewer({ title, bookPages, theme }: BookViewerProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)

  const currentPage = bookPages[currentPageIndex]
  const totalPages = bookPages.length
  const isFirstPage = currentPageIndex === 0
  const isLastPage = currentPageIndex === totalPages - 1

  const goToPreviousPage = () => {
    if (!isFirstPage) {
      setCurrentPageIndex(currentPageIndex - 1)
    }
  }

  const goToNextPage = () => {
    if (!isLastPage) {
      setCurrentPageIndex(currentPageIndex + 1)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPreviousPage()
      } else if (event.key === 'ArrowRight') {
        goToNextPage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPageIndex])

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      {/* Book Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <BookOpen className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{title}</h1>
        </div>
        <p className="text-sm text-gray-500">A {theme} Adventure</p>
      </div>

      {/* Book Page Spread */}
      <Card className="overflow-hidden shadow-2xl border-4 border-purple-200 bg-gradient-to-br from-white to-purple-50">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left Side: Illustration */}
          <div className="relative bg-gradient-to-br from-purple-100 to-pink-100 p-6 md:p-8 flex items-center justify-center min-h-[400px] md:min-h-[600px]">
            {currentPage.illustration_url ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="relative w-full aspect-square max-w-md rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                  <Image
                    src={currentPage.illustration_url}
                    alt={`Illustration for page ${currentPage.pageNumber}`}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            ) : (
              <div className="w-full aspect-square max-w-md bg-gray-200 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl">
                <div className="text-center text-gray-500">
                  <BookOpen className="h-16 w-16 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Illustration not available</p>
                </div>
              </div>
            )}

            {/* Page Number - Bottom Left */}
            <div className="absolute bottom-4 left-4 text-sm font-bold text-purple-700 bg-white/80 px-3 py-1 rounded-full shadow">
              {currentPage.pageNumber}
            </div>
          </div>

          {/* Right Side: Text */}
          <div className="bg-white p-6 md:p-8 flex flex-col min-h-[400px] md:min-h-[600px]">
            <div className="flex-1 overflow-y-auto">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base md:text-lg">
                  {currentPage.text}
                </p>
              </div>
            </div>

            {/* Page Number - Bottom Right */}
            <div className="mt-4 text-right">
              <span className="text-sm font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                {currentPage.pageNumber}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between px-4">
        <Button
          onClick={goToPreviousPage}
          disabled={isFirstPage}
          className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg"
          size="lg"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Previous
        </Button>

        {/* Page Indicator */}
        <div className="text-center">
          <p className="text-sm font-bold text-gray-700">
            Page {currentPageIndex + 1} of {totalPages}
          </p>
          <div className="flex gap-1 mt-2 justify-center">
            {bookPages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentPageIndex
                    ? 'bg-purple-600 w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <Button
          onClick={goToNextPage}
          disabled={isLastPage}
          className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg"
          size="lg"
        >
          Next
          <ChevronRight className="h-5 w-5 ml-1" />
        </Button>
      </div>

      {/* Keyboard Navigation Hint */}
      <p className="text-center text-xs text-gray-500 italic">
        Tip: Use arrow keys ← → to navigate pages
      </p>
    </div>
  )
}
