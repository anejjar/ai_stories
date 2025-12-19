'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface LikeButtonProps {
  storyId: string
  initialLikesCount: number
  initialIsLiked: boolean
  onLikeChange?: (isLiked: boolean, newCount: number) => void
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
}

export function LikeButton({
  storyId,
  initialLikesCount,
  initialIsLiked,
  onLikeChange,
  size = 'md',
  showCount = true
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [isLoading, setIsLoading] = useState(false)

  const handleLike = async () => {
    if (isLoading) return

    setIsLoading(true)

    // Optimistic update
    const newIsLiked = !isLiked
    const newCount = newIsLiked ? likesCount + 1 : likesCount - 1

    setIsLiked(newIsLiked)
    setLikesCount(newCount)

    try {
      const response = await fetch(`/api/stories/${storyId}/like`, {
        method: 'POST'
      })

      const result = await response.json()

      if (!result.success) {
        // Revert on error
        setIsLiked(!newIsLiked)
        setLikesCount(likesCount)
        toast.error(result.error || 'Failed to update like')
      } else {
        // Update with actual server values
        setIsLiked(result.data.isLiked)
        setLikesCount(result.data.likesCount)
        onLikeChange?.(result.data.isLiked, result.data.likesCount)

        // Optional feedback
        if (result.data.isLiked) {
          toast.success('Added to favorites!')
        }
      }
    } catch (error) {
      console.error('Error liking story:', error)
      // Revert on error
      setIsLiked(!newIsLiked)
      setLikesCount(likesCount)
      toast.error('Failed to update like')
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <Button
      onClick={handleLike}
      disabled={isLoading}
      variant={isLiked ? 'default' : 'outline'}
      className={`
        ${sizeClasses[size]}
        ${isLiked
          ? 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white border-0'
          : 'border-2 border-pink-200 text-pink-600 hover:bg-pink-50'
        }
        rounded-full font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
      `}
    >
      <Heart
        className={`
          ${iconSizes[size]}
          ${isLiked ? 'fill-current' : ''}
          ${isLoading ? 'animate-pulse' : 'animate-none'}
          mr-2 transition-all duration-300
        `}
      />
      {showCount && (
        <span className="font-bold">
          {likesCount}
        </span>
      )}
    </Button>
  )
}
