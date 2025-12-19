'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, Loader2, Heart, Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { PublicStory } from '@/types/discovery'

interface RelatedStoriesProps {
  storyId: string
  limit?: number
}

export function RelatedStories({ storyId, limit = 6 }: RelatedStoriesProps) {
  const [stories, setStories] = useState<PublicStory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRelatedStories()
  }, [storyId])

  const fetchRelatedStories = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/stories/${storyId}/related?limit=${limit}`)
      const result = await response.json()

      if (result.success) {
        setStories(result.data.stories)
      }
    } catch (error) {
      console.error('Error fetching related stories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (stories.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-bold text-gray-900">More Like This</h3>
      </div>

      <div className="space-y-3">
        {stories.map((story) => (
          <Link key={story.id} href={`/story/${story.id}`}>
            <Card className="p-4 hover:shadow-lg transition-all duration-300 hover:border-purple-200 cursor-pointer group">
              <div className="space-y-2">
                {/* Theme Badge */}
                <Badge
                  variant="outline"
                  className="border-purple-200 bg-purple-50 text-purple-700 text-xs"
                >
                  {story.theme}
                </Badge>

                {/* Title */}
                <h4 className="font-bold text-sm text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                  {story.title}
                </h4>

                {/* Author */}
                <p className="text-xs text-gray-500">
                  by {story.authorName || 'Anonymous'}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {story.averageRating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      <span>{story.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                  {story.likesCount > 0 && (
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3 text-pink-500" />
                      <span>{story.likesCount}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
