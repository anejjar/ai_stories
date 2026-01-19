'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Star, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { PublicStory } from '@/types/discovery'

interface PublicStoryCardProps {
  story: PublicStory
}

export function PublicStoryCard({ story }: PublicStoryCardProps) {
  const preview = story.content.substring(0, 120).trim()

  // Safely format date
  let timeAgo = 'Recently'
  try {
    const date = story.publishedAt instanceof Date ? story.publishedAt : new Date(story.publishedAt)
    if (date && !isNaN(date.getTime())) {
      timeAgo = formatDistanceToNow(date, { addSuffix: true })
    }
  } catch (error) {
    console.error('Error formatting date:', error)
  }

  return (
    <Link href={`/story/${story.id}`}>
      <Card className="group h-full flex flex-col hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-4 border-gray-100 bg-white rounded-[3rem] overflow-hidden shadow-sm cursor-pointer">
        <CardContent className="flex-1 pt-8 px-8 pb-6 space-y-4">
          {/* Header with Theme Badge and Liked indicator */}
          <div className="flex items-start justify-between gap-4">
            <Badge className="bg-purple-100 text-playwize-purple border-0 shadow-md font-black px-4 py-1.5 rounded-full text-xs uppercase tracking-widest">
              {story.theme}
            </Badge>
            
            {/* Liked indicator */}
            {story.isLikedByUser && (
              <div className="bg-playwize-orange text-white rounded-full p-2.5 shadow-lg animate-pulse flex-shrink-0">
                <Heart className="h-5 w-5 fill-current" />
              </div>
            )}
          </div>
          {/* Title */}
          <h3 className="text-2xl font-black text-gray-900 line-clamp-2 leading-tight group-hover:text-playwize-purple transition-colors mb-3">
            {story.title}
          </h3>

          {/* Published Time */}
          <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
            <span className="text-xs uppercase tracking-widest">{timeAgo}</span>
          </div>

          {/* Preview */}
          <p className="text-gray-500 font-medium line-clamp-3 leading-relaxed">
            {preview}...
          </p>

          {/* Social Stats */}
          <div className="flex items-center gap-6 pt-6 border-t-2 border-gray-50">
            {/* Likes */}
            <div className="flex items-center gap-2">
              <Heart className={`h-5 w-5 ${story.likesCount > 0 ? 'text-pink-500 fill-pink-500' : 'text-gray-300'}`} />
              <span className="text-sm font-black text-gray-700">
                {story.likesCount || 0}
              </span>
            </div>

            {/* Comments */}
            <div className="flex items-center gap-2">
              <MessageCircle className={`h-5 w-5 ${story.commentsCount > 0 ? 'text-blue-400 fill-blue-400' : 'text-gray-300'}`} />
              <span className="text-sm font-black text-gray-700">
                {story.commentsCount || 0}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <Star className={`h-5 w-5 ${story.ratingsCount > 0 ? 'text-playwize-orange fill-playwize-orange' : 'text-gray-200'}`} />
              <span className={`text-sm font-black ${story.ratingsCount > 0 ? 'text-gray-700' : 'text-gray-300'}`}>
                {story.ratingsCount > 0 ? story.averageRating.toFixed(1) : '0'}
              </span>
            </div>

            {/* Views */}
            <div className="flex items-center gap-2 ml-auto">
              <Eye className="h-4 w-4 text-gray-200" />
              <span className="text-xs font-black text-gray-300">
                {story.viewCount || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
