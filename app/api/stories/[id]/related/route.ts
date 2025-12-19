import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'
import type { PublicStory, RelatedStoriesResponse } from '@/types/discovery'
import { databaseStoryToStory, type DatabaseStory } from '@/types/database'

interface RelatedParams {
  params: Promise<{
    id: string
  }
}

/**
 * GET /api/stories/[id]/related
 *
 * Get stories related to the specified story (by theme and popularity)
 */
export async function GET(
  request: NextRequest,
  { params }: RelatedParams
) {
  try {
    const supabase = await createServerSupabaseClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: storyId } = await params

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '6', 10), 12)

    // Fetch the source story to get its theme
    const { data: sourceStory, error: sourceError } = await supabase
      .from('stories')
      .select('id, theme, visibility')
      .eq('id', storyId)
      .single()

    if (sourceError || !sourceStory) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Story not found' },
        { status: 404 }
      )
    }

    // Find related stories with the same theme
    // Prioritize by: same theme, high ratings, popular (likes)
    const { data, error } = await supabase
      .from('stories')
      .select('*, users!inner(email, display_name)')
      .eq('visibility', 'public')
      .eq('theme', sourceStory.theme)
      .neq('id', storyId) // Exclude the current story
      .or('is_illustrated_book.is.null,is_illustrated_book.eq.false') // Only text stories
      .order('average_rating', { ascending: false })
      .order('likes_count', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching related stories:', error)
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to fetch related stories' },
        { status: 500 }
      )
    }

    // Get user's likes for these stories
    const storyIds = data.map(story => story.id)
    const { data: userLikes } = await supabase
      .from('story_likes')
      .select('story_id')
      .eq('user_id', user.id)
      .in('story_id', storyIds)

    const likedStoryIds = new Set(userLikes?.map(like => like.story_id) || [])

    // Get user's ratings for these stories
    const { data: userRatings } = await supabase
      .from('story_ratings')
      .select('story_id, rating')
      .eq('user_id', user.id)
      .in('story_id', storyIds)

    const ratingsMap = new Map(
      userRatings?.map(rating => [rating.story_id, rating.rating]) || []
    )

    // Transform to PublicStory objects
    const relatedStories: PublicStory[] = data.map((dbStory: any) => {
      const story = databaseStoryToStory(dbStory as DatabaseStory)

      // Extract author name from joined users table
      const authorName = dbStory.users?.display_name ||
        dbStory.users?.email?.split('@')[0] ||
        'Anonymous'

      return {
        ...story,
        visibility: 'public' as const,
        viewCount: dbStory.view_count || 0,
        likesCount: dbStory.likes_count || 0,
        commentsCount: dbStory.comments_count || 0,
        averageRating: parseFloat(dbStory.average_rating) || 0,
        ratingsCount: dbStory.ratings_count || 0,
        publishedAt: new Date(dbStory.published_at || dbStory.created_at),
        isLikedByUser: likedStoryIds.has(story.id),
        userRating: ratingsMap.get(story.id),
        authorName
      }
    })

    const response: RelatedStoriesResponse = {
      stories: relatedStories
    }

    console.log(`✅ Found ${relatedStories.length} related stories for story ${storyId}`)

    return NextResponse.json<ApiResponse<RelatedStoriesResponse>>(
      { success: true, data: response },
      { status: 200 }
    )

  } catch (error) {
    console.error('Related stories API error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
