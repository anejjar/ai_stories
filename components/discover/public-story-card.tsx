'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { BookOpen, Heart, MessageCircle, Star, Eye, User } from 'lucide-react'
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

  // Determine cover image
  const coverImage = story.imageUrls && story.imageUrls.length > 0 ? story.imageUrls[0] : null

  return (
    <Link href={`/story/${story.id}`}>
      <Card className="group h-full flex flex-col hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white rounded-3xl overflow-hidden shadow-lg cursor-pointer">
        {/* Cover Image Area */}
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          {coverImage ? (
            <OptimizedImage
              src={coverImage}
              alt={story.title}
              fill
              className="transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 flex items-center justify-center p-6">
              <BookOpen className="h-16 w-16 text-white opacity-80" />
            </div>
          )}

          {/* Theme Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-white/90 text-purple-700 border-0 shadow-lg font-bold px-3 py-1">
              {story.theme}
            </Badge>
          </div>

          {/* Liked indicator */}
          {story.isLikedByUser && (
            <div className="absolute top-3 right-3">
              <div className="bg-pink-500 text-white rounded-full p-2 shadow-lg">
                <Heart className="h-4 w-4 fill-current" />
              </div>
            </div>
          )}
        </div>

        <CardContent className="flex-1 pt-5 px-5 pb-4">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 font-comic leading-tight group-hover:text-purple-600 transition-colors mb-3">
            {story.title}
          </h3>

          {/* Author & Time */}
          <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
            <User className="h-3 w-3" />
            <span className="font-medium">{story.authorName || 'Anonymous'}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">{timeAgo}</span>
          </div>

          {/* Preview */}
          <p className="text-sm text-gray-500 line-clamp-3 mb-4 leading-relaxed">
            {preview}...
          </p>

          {/* Social Stats */}
          <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
            {/* Rating */}
            {story.ratingsCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-semibold text-gray-700">
                  {story.averageRating.toFixed(1)}
                </span>
                <span className="text-xs text-gray-500">
                  ({story.ratingsCount})
                </span>
              </div>
            )}

            {/* Likes */}
            <div className="flex items-center gap-1.5">
              <Heart className={`h-4 w-4 ${story.likesCount > 0 ? 'text-pink-500' : 'text-gray-400'}`} />
              <span className="text-sm font-semibold text-gray-700">
                {story.likesCount}
              </span>
            </div>

            {/* Comments */}
            {story.commentsCount > 0 && (
              <div className="flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-semibold text-gray-700">
                  {story.commentsCount}
                </span>
              </div>
            )}

            {/* Views */}
            {story.viewCount > 0 && (
              <div className="flex items-center gap-1.5 ml-auto">
                <Eye className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {story.viewCount}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
