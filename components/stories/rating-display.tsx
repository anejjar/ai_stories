'use client'

import { Star } from 'lucide-react'

interface RatingDisplayProps {
  rating: number
  maxRating?: number
  showValue?: boolean
  showCount?: boolean
  count?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function RatingDisplay({
  rating,
  maxRating = 5,
  showValue = true,
  showCount = false,
  count,
  size = 'md',
  className = ''
}: RatingDisplayProps) {
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* Stars */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, i) => {
          const starValue = i + 1
          const fillPercentage = Math.min(Math.max(rating - i, 0), 1) * 100

          return (
            <div key={i} className="relative">
              {/* Background star (empty) */}
              <Star className={`${iconSizes[size]} text-gray-300`} />
              {/* Filled star overlay */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercentage}%` }}
              >
                <Star className={`${iconSizes[size]} text-yellow-400 fill-yellow-400`} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Rating value */}
      {showValue && (
        <span className={`${textSizes[size]} font-semibold text-gray-700`}>
          {rating.toFixed(1)}
        </span>
      )}

      {/* Rating count */}
      {showCount && count !== undefined && (
        <span className={`${textSizes[size]} text-gray-500`}>
          ({count})
        </span>
      )}
    </div>
  )
}
