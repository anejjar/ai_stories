'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { toast } from 'sonner'

interface RatingInputProps {
  storyId: string
  initialRating?: number
  onRatingChange?: (rating: number, averageRating: number, ratingsCount: number) => void
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

export function RatingInput({
  storyId,
  initialRating = 0,
  onRatingChange,
  size = 'md',
  disabled = false
}: RatingInputProps) {
  const [rating, setRating] = useState(initialRating)
  const [hoverRating, setHoverRating] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  const handleRate = async (newRating: number) => {
    if (isLoading || disabled) return

    setIsLoading(true)
    setRating(newRating) // Optimistic update

    try {
      const response = await fetch(`/api/stories/${storyId}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: newRating })
      })

      const result = await response.json()

      if (!result.success) {
        setRating(initialRating) // Revert on error
        toast.error(result.error || 'Failed to submit rating')
      } else {
        setRating(result.data.userRating)
        onRatingChange?.(
          result.data.userRating,
          result.data.averageRating,
          result.data.ratingsCount
        )
        toast.success(`Rated ${newRating} star${newRating !== 1 ? 's' : ''}!`)
      }
    } catch (error) {
      console.error('Error rating story:', error)
      setRating(initialRating) // Revert on error
      toast.error('Failed to submit rating')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => {
          const starValue = i + 1
          const isFilled = starValue <= (hoverRating || rating)

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleRate(starValue)}
              onMouseEnter={() => !disabled && setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(0)}
              disabled={disabled || isLoading}
              className={`
                transition-all duration-200 transform
                ${!disabled && !isLoading ? 'hover:scale-125 cursor-pointer' : 'cursor-not-allowed opacity-50'}
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              aria-label={`Rate ${starValue} stars`}
            >
              <Star
                className={`
                  ${iconSizes[size]}
                  transition-all duration-200
                  ${isFilled
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                  }
                  ${isLoading ? 'animate-pulse' : ''}
                `}
              />
            </button>
          )
        })}
      </div>
      <p className="text-xs text-gray-500">
        {hoverRating ? `${hoverRating} star${hoverRating !== 1 ? 's' : ''}` : rating ? `You rated ${rating} star${rating !== 1 ? 's' : ''}` : 'Click to rate'}
      </p>
    </div>
  )
}
