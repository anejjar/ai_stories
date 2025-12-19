'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { BookOpen, Eye, Crown, Clock, Sparkles, User, Calendar } from 'lucide-react'
import type { Story } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { PublishToggle } from './publish-toggle'
import { useState } from 'react'

interface StoryCardProps {
  story: Story
}

export function StoryCard({ story }: StoryCardProps) {
  const preview = story.content.substring(0, 120).trim()

  const [visibility, setVisibility] = useState<'public' | 'private'>(
    story.visibility || 'private'
  )

  // Safely format date
  let timeAgo = 'Recently'
  try {
    const date = story.createdAt instanceof Date ? story.createdAt : new Date(story.createdAt)
    if (date && !isNaN(date.getTime())) {
      timeAgo = formatDistanceToNow(date, { addSuffix: true })
    }
  } catch (error) {
    console.error('Error formatting date:', error)
  }

  // Determine cover image
  // Use first generated image if available, otherwise a thematic gradient
  const coverImage = story.imageUrls && story.imageUrls.length > 0 ? story.imageUrls[0] : null

  // Get child name(s) to display
  const childNames = story.children && story.children.length > 0
    ? story.children.map(c => c.name).join(', ')
    : story.childName || 'Child'

  return (
    <Card className="group h-full flex flex-col hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white rounded-3xl overflow-hidden shadow-lg">
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

        {/* Floating Badges */}
        <div className="absolute top-3 right-3 flex gap-2">
          {story.hasImages && (
            <Badge className="bg-yellow-400 text-yellow-900 border-2 border-white shadow-lg font-bold px-2 py-1">
              <Crown className="h-3 w-3 mr-1" /> FAMILY PLAN
            </Badge>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
          <div className="flex items-center text-white/90 text-xs font-medium">
            <Clock className="h-3 w-3 mr-1" />
            {timeAgo}
          </div>
        </div>
      </div>

      <CardContent className="flex-1 pt-5 px-5 pb-2">
        <div className="mb-3">
          <Badge variant="outline" className="mb-2 border-purple-200 bg-purple-50 text-purple-700 rounded-full px-2 py-0.5 text-xs font-semibold tracking-wide uppercase">
            {story.theme}
          </Badge>
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 font-comic leading-tight group-hover:text-purple-600 transition-colors">
            {story.title}
          </h3>
        </div>

        {/* Child Info */}
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 font-medium bg-gray-50 p-2 rounded-lg border border-gray-100">
          <div className="bg-white p-1 rounded-full shadow-sm">
            <User className="h-3 w-3 text-purple-500" />
          </div>
          <span className="truncate">For: {childNames}</span>
        </div>

        <p className="text-sm text-gray-500 line-clamp-3 mb-4 leading-relaxed">
          {preview}...
        </p>
      </CardContent>

      <div className="px-5 pb-2">
        <div className="flex flex-wrap gap-1.5">
          {story.adjectives.slice(0, 3).map((adj) => (
            <span key={adj} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-pink-50 text-pink-700 border border-pink-100">
              <Sparkles className="h-2 w-2 mr-1" />
              {adj}
            </span>
          ))}
          {story.adjectives.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-gray-100">
              +{story.adjectives.length - 3}
            </span>
          )}
        </div>
      </div>

      <CardFooter className="p-5 pt-4 border-t border-gray-100 bg-gray-50/50 mt-auto">
        {!story.isIllustratedBook && (
          <div className="w-full mb-3">
            <PublishToggle
              storyId={story.id}
              initialVisibility={visibility}
              isIllustratedBook={story.isIllustratedBook || false}
              onVisibilityChange={setVisibility}
              size="sm"
            />
          </div>
        )}
        <Link href={`/story/${story.id}`} className="w-full">
          <Button className="w-full rounded-xl bg-white border-2 border-purple-100 text-purple-700 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-800 shadow-sm hover:shadow transition-all font-bold group-hover:bg-purple-600 group-hover:border-purple-600 group-hover:text-white">
            <Eye className="h-4 w-4 mr-2" />
            Read Story
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
