'use client'

import { useState } from 'react'
import { Globe, Lock, Loader2, Users, Heart, Star, MessageCircle, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface PublishToggleProps {
  storyId: string
  initialVisibility: 'public' | 'private'
  isIllustratedBook?: boolean
  onVisibilityChange?: (visibility: 'public' | 'private') => void
  size?: 'sm' | 'md' | 'lg'
}

export function PublishToggle({
  storyId,
  initialVisibility,
  isIllustratedBook = false,
  onVisibilityChange,
  size = 'sm'
}: PublishToggleProps) {
  const [visibility, setVisibility] = useState(initialVisibility)
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const isPublic = visibility === 'public'

  const handleButtonClick = () => {
    // If making public, show confirmation dialog
    if (!isPublic && !isIllustratedBook) {
      setShowConfirmDialog(true)
      return
    }

    // If making private, just do it directly
    if (isPublic) {
      handleToggle('private')
      return
    }

    // Prevent publishing illustrated books
    if (isIllustratedBook) {
      toast.error('Illustrated books cannot be published to Discovery. Only text stories can be shared publicly.')
      return
    }
  }

  const handleToggle = async (newVisibility: 'public' | 'private') => {
    if (isLoading) return

    setIsLoading(true)
    setShowConfirmDialog(false)

    // Optimistic update
    setVisibility(newVisibility)

    try {
      const response = await fetch(`/api/stories/${storyId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: newVisibility })
      })

      const result = await response.json()

      if (!result.success) {
        // Revert on error
        setVisibility(visibility)
        toast.error(result.error || 'Failed to update visibility')
      } else {
        setVisibility(result.data.visibility)
        onVisibilityChange?.(result.data.visibility)

        if (result.data.visibility === 'public') {
          toast.success('Story published! It\'s now visible in Discovery.')
        } else {
          toast.success('Story unpublished. It\'s now private.')
        }
      }
    } catch (error) {
      console.error('Error toggling visibility:', error)
      // Revert on error
      setVisibility(visibility)
      toast.error('Failed to update visibility')
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
    <>
      <Button
        onClick={handleButtonClick}
        disabled={isLoading}
        variant={isPublic ? 'default' : 'outline'}
        className={`
          ${sizeClasses[size]}
          ${isPublic
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }
          rounded-full font-semibold transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isLoading ? (
          <Loader2 className={`${iconSizes[size]} mr-2 animate-spin`} />
        ) : isPublic ? (
          <Globe className={`${iconSizes[size]} mr-2`} />
        ) : (
          <Lock className={`${iconSizes[size]} mr-2`} />
        )}
        {isPublic ? 'Public' : 'Private'}
      </Button>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Globe className="h-5 w-5 text-green-600" />
              Share Your Story with the Community
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Make this story visible in the Discovery page for other parents to enjoy.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* What Happens Section */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                What happens when you make this public?
              </h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-6 list-disc">
                <li>Your story will appear in the Discovery page</li>
                <li>Other parents can read and enjoy it</li>
                <li>It can receive likes, ratings, and comments</li>
              </ul>
            </div>

            {/* Privacy & Safety Section */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-600" />
                Privacy & Safety
              </h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-6 list-disc">
                <li>Only the story text is shared publicly</li>
                <li>Your personal information remains private</li>
                <li>You can make it private again anytime</li>
                <li>Users can report inappropriate content</li>
              </ul>
            </div>

            {/* Community Features Section */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-600" />
                Community Features
              </h4>
              <div className="flex flex-wrap gap-4 ml-6">
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Heart className="h-3.5 w-3.5" />
                  <span>Likes</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Star className="h-3.5 w-3.5" />
                  <span>Ratings</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>Comments</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="border-gray-300"
            >
              Keep Private
            </Button>
            <Button
              onClick={() => handleToggle('public')}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  Make Public
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
