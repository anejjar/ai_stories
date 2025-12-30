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
    <Card className="group h-full flex flex-col hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-4 border-gray-100 bg-white rounded-[3rem] overflow-hidden shadow-sm">
      {/* Cover Image Area */}
      <div className="relative h-56 w-full overflow-hidden bg-gray-50 border-b-4 border-gray-100">
        {coverImage ? (
          <OptimizedImage
            src={coverImage}
            alt={story.title}
            fill
            className="transition-transform duration-700 group-hover:scale-110 object-cover"
          />
        ) : (
          <div className="w-full h-full bg-purple-50 flex items-center justify-center p-6 relative">
            <div className="absolute inset-0 circle-pattern opacity-20" />
            <BookOpen className="h-20 w-20 text-playwize-purple opacity-30 relative z-10" />
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-4 right-4 flex gap-2">
          {story.hasImages && (
            <Badge className="bg-playwize-orange text-white border-0 shadow-lg font-black px-4 py-1.5 rounded-full text-xs">
              <Crown className="h-3 w-3 mr-2" /> FAMILY PLAN
            </Badge>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 pt-16">
          <div className="flex items-center text-white/90 text-xs font-black uppercase tracking-widest">
            <Clock className="h-3 w-3 mr-2" />
            {timeAgo}
          </div>
        </div>
      </div>

      <CardContent className="flex-1 pt-8 px-8 pb-4 space-y-4">
        <div className="space-y-3">
          <Badge className="bg-orange-100 text-playwize-orange border-0 rounded-full px-4 py-1 text-[10px] font-black tracking-widest uppercase">
            {story.theme}
          </Badge>
          <h3 className="text-2xl font-black text-gray-900 line-clamp-2 leading-tight group-hover:text-playwize-purple transition-colors">
            {story.title}
          </h3>
        </div>

        {/* Child Info */}
        <div className="flex items-center gap-3 text-sm font-bold text-gray-600 bg-gray-50 p-4 rounded-[1.5rem] border-2 border-white">
          <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
            <User className="h-4 w-4 text-playwize-purple" />
          </div>
          <span className="truncate">For: {childNames}</span>
        </div>

        <p className="text-gray-500 font-medium line-clamp-3 leading-relaxed">
          {preview}...
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          {story.adjectives.slice(0, 3).map((adj) => (
            <span key={adj} className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-50 text-playwize-purple">
              <Sparkles className="h-2 w-2 mr-1.5" />
              {adj}
            </span>
          ))}
          {story.adjectives.length > 3 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-400">
              +{story.adjectives.length - 3}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-8 pt-4 bg-gray-50/50 mt-auto border-t-2 border-white">
        <div className="w-full space-y-4">
          {!story.isIllustratedBook && (
            <PublishToggle
              storyId={story.id}
              initialVisibility={visibility}
              isIllustratedBook={story.isIllustratedBook || false}
              onVisibilityChange={setVisibility}
              size="sm"
            />
          )}
          <Link href={`/story/${story.id}`} className="block">
            <Button className="w-full h-14 rounded-full bg-white border-2 border-playwize-purple text-playwize-purple hover:bg-playwize-purple hover:text-white font-black text-lg shadow-sm hover:shadow-xl transition-all">
              <Eye className="h-5 w-5 mr-2" />
              Read Story
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
