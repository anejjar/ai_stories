import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'
import type { SocialStats } from '@/types/discovery'

interface SocialStatsParams {
  params: Promise<{
    id: string
  }
}

/**
 * GET /api/stories/[id]/social-stats
 *
 * Get combined social statistics for a story
 */
export async function GET(
  request: NextRequest,
  { params }: SocialStatsParams
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

    // Fetch story with social stats
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, visibility, likes_count, comments_count, average_rating, ratings_count, view_count')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Story not found' },
        { status: 404 }
      )
    }

    // Check if story is accessible (public or owned by user)
    // For private stories, only the owner can see stats
    if (story.visibility !== 'public') {
      const { data: ownerCheck } = await supabase
        .from('stories')
        .select('user_id')
        .eq('id', storyId)
        .eq('user_id', user.id)
        .single()

      if (!ownerCheck) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'You do not have permission to view these stats' },
          { status: 403 }
        )
      }
    }

    // Check if user liked this story
    const { data: userLike } = await supabase
      .from('story_likes')
      .select('id')
      .eq('story_id', storyId)
      .eq('user_id', user.id)
      .single()

    // Get user's rating for this story
    const { data: userRating } = await supabase
      .from('story_ratings')
      .select('rating')
      .eq('story_id', storyId)
      .eq('user_id', user.id)
      .single()

    const stats: SocialStats = {
      likesCount: story.likes_count || 0,
      commentsCount: story.comments_count || 0,
      averageRating: parseFloat(story.average_rating) || 0,
      ratingsCount: story.ratings_count || 0,
      viewCount: story.view_count || 0,
      isLikedByUser: !!userLike,
      userRating: userRating?.rating
    }

    return NextResponse.json<ApiResponse<SocialStats>>(
      { success: true, data: stats },
      { status: 200 }
    )

  } catch (error) {
    console.error('Social stats API error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
