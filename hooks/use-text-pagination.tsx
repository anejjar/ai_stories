/**
 * Text Pagination Hook
 * Intelligently splits book page text into multiple virtual pages
 * that fit perfectly without scrolling
 */

import { useState, useEffect, useRef, useCallback } from 'react'

export interface VirtualPage {
  originalPageIndex: number // Index of original book page
  virtualPageNumber: number // Sequential number across all virtual pages
  text: string // Text content for this virtual page
  illustration_url: string // Image URL from original page
  isFirstVirtualPage: boolean // True if first split of original page
  isLastVirtualPage: boolean // True if last split of original page
}

export interface TextPaginationOptions {
  fontSize: number // Font size in pixels (e.g., 26)
  lineHeight: number // Line height multiplier (e.g., 1.8)
  containerPadding: number // Total padding in pixels
  decorationHeight: number // Height reserved for decorations
  maxHeight: number // Maximum available height for text
}

/**
 * Split text at sentence boundaries
 */
function splitAtSentence(text: string, maxLength: number): [string, string] {
  // If text is short enough, return as-is
  if (text.length <= maxLength) {
    return [text, '']
  }

  // Find sentence endings (., !, ?) within the max length
  const sentenceEndings = /[.!?]\s+/g
  let lastValidIndex = -1
  let match

  while ((match = sentenceEndings.exec(text)) !== null) {
    if (match.index + match[0].length <= maxLength) {
      lastValidIndex = match.index + match[0].length
    } else {
      break
    }
  }

  // If we found a sentence boundary, split there
  if (lastValidIndex > 0) {
    return [
      text.substring(0, lastValidIndex).trim(),
      text.substring(lastValidIndex).trim()
    ]
  }

  // Fallback: split at last space within maxLength
  const lastSpace = text.lastIndexOf(' ', maxLength)
  if (lastSpace > 0) {
    return [
      text.substring(0, lastSpace).trim(),
      text.substring(lastSpace).trim()
    ]
  }

  // Last resort: hard split at maxLength
  return [
    text.substring(0, maxLength),
    text.substring(maxLength)
  ]
}

/**
 * Simple cache for text height measurements
 */
const measurementCache: Record<string, number> = {}

/**
 * Measure text height using a hidden div
 */
function measureTextHeight(
  text: string,
  options: TextPaginationOptions,
  containerWidth: number
): number {
  const cacheKey = `${text.length}-${options.fontSize}-${options.lineHeight}-${containerWidth}`
  if (measurementCache[cacheKey] !== undefined) {
    return measurementCache[cacheKey]
  }

  // Create temporary measuring div
  const measuringDiv = document.createElement('div')
  measuringDiv.style.position = 'absolute'
  measuringDiv.style.visibility = 'hidden'
  measuringDiv.style.width = `${containerWidth}px`
  measuringDiv.style.fontSize = `${options.fontSize}px`
  measuringDiv.style.lineHeight = `${options.lineHeight}`
  measuringDiv.style.fontWeight = '600'
  measuringDiv.style.letterSpacing = '0.02em'
  measuringDiv.style.wordSpacing = '0.15em'
  measuringDiv.style.whiteSpace = 'normal'
  measuringDiv.style.wordBreak = 'normal'
  measuringDiv.style.padding = '0'
  measuringDiv.textContent = text

  document.body.appendChild(measuringDiv)
  const height = measuringDiv.offsetHeight
  document.body.removeChild(measuringDiv)

  measurementCache[cacheKey] = height
  return height
}

/**
 * Paginate a single piece of text into multiple pages
 */
function paginateText(
  text: string,
  options: TextPaginationOptions,
  containerWidth: number
): string[] {
  const pages: string[] = []
  let remainingText = text.trim()

  const safetyBuffer = 60 // Increased buffer to prevent cropping/overflow
  const availableHeight = options.maxHeight - options.containerPadding - options.decorationHeight - safetyBuffer

  // Binary search approach to find optimal text length per page
  while (remainingText.length > 0) {
    let low = 0
    let high = remainingText.length
    let bestLength = 0

    // Binary search for maximum text that fits
    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const testText = remainingText.substring(0, mid)
      const height = measureTextHeight(testText, options, containerWidth)

      if (height <= availableHeight) {
        bestLength = mid
        low = mid + 1
      } else {
        high = mid - 1
      }
    }

    // If we couldn't fit even one character, something is wrong
    if (bestLength === 0) {
      console.error('Text pagination failed: container too small')
      pages.push(remainingText)
      break
    }

    // Split at sentence boundary near the best length
    const [currentPage, rest] = splitAtSentence(remainingText, bestLength)

    if (currentPage.length === 0) {
      // Fallback: take what we calculated
      pages.push(remainingText.substring(0, bestLength))
      remainingText = remainingText.substring(bestLength).trim()
    } else {
      pages.push(currentPage)
      remainingText = rest
    }
  }

  return pages.filter(page => page.length > 0)
}

export function useTextPagination(
  bookPages: Array<{ text: string; illustration_url: string }>,
  options: TextPaginationOptions,
  containerWidth: number,
  enabled: boolean = true
) {
  const [virtualPages, setVirtualPages] = useState<VirtualPage[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const prevBookPagesRef = useRef<string>('')

  const calculatePagination = useCallback(() => {
    if (!enabled || bookPages.length === 0 || containerWidth === 0) {
      // Don't update state - this prevents infinite loops
      return
    }

    setIsCalculating(true)

    // Use setTimeout to avoid blocking UI
    setTimeout(() => {
      const newVirtualPages: VirtualPage[] = []
      let virtualPageCounter = 0

      bookPages.forEach((bookPage, originalIndex) => {
        // Paginate this book page's text
        const textPages = paginateText(bookPage.text, options, containerWidth)

        // Create virtual pages
        textPages.forEach((pageText, textPageIndex) => {
          newVirtualPages.push({
            originalPageIndex: originalIndex,
            virtualPageNumber: virtualPageCounter++,
            text: pageText,
            illustration_url: bookPage.illustration_url,
            isFirstVirtualPage: textPageIndex === 0,
            isLastVirtualPage: textPageIndex === textPages.length - 1
          })
        })
      })

      setVirtualPages(newVirtualPages)
      setIsCalculating(false)
    }, 0)
  }, [bookPages, options, containerWidth, enabled])

  // Single useEffect to handle all recalculation triggers
  useEffect(() => {
    const currentBookPagesKey = JSON.stringify(bookPages.map(p => p.text))
    const bookPagesChanged = currentBookPagesKey !== prevBookPagesRef.current

    // Only recalculate if:
    // 1. Book pages changed OR
    // 2. We have valid dimensions (containerWidth > 0)
    if (bookPagesChanged || containerWidth > 0) {
      if (bookPagesChanged) {
        prevBookPagesRef.current = currentBookPagesKey
      }
      calculatePagination()
    }
  }, [bookPages, options.fontSize, options.lineHeight, options.maxHeight, containerWidth, enabled, calculatePagination])

  return {
    virtualPages,
    isCalculating,
    totalVirtualPages: virtualPages.length,
    recalculate: calculatePagination
  }
}
