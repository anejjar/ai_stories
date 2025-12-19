import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'
import type { LikeStoryResponse } from '@/types/discovery'

interface LikeParams {
  params: Promise<{
    id: string
  }>
}

/**
 * POST /api/stories/[id]/like
 *
 * Toggle like/unlike on a public story
 * Automatically increments/decrements the likes_count via database trigger
 */
export async function POST(
  request: NextRequest,
  { params }: LikeParams
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

    // Verify story exists and is public
    const { data: story, error: fetchError } = await supabase
      .from('stories')
      .select('id, visibility, likes_count')
      .eq('id', storyId)
      .single()

    if (fetchError || !story) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Story not found' },
        { status: 404 }
      )
    }

    if (story.visibility !== 'public') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Can only like public stories' },
        { status: 400 }
      )
    }

    // Check if user already liked this story
    const { data: existingLike } = await supabase
      .from('story_likes')
      .select('id')
      .eq('story_id', storyId)
      .eq('user_id', user.id)
      .single()

    let isLiked: boolean
    let likesCount: number

    if (existingLike) {
      // Unlike: Remove the like
      const { error: deleteError } = await supabase
        .from('story_likes')
        .delete()
        .eq('story_id', storyId)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Error removing like:', deleteError)
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Failed to unlike story' },
          { status: 500 }
        )
      }

      isLiked = false
      console.log(`👎 User ${user.id} unliked story ${storyId}`)

    } else {
      // Like: Add the like
      const { error: insertError } = await supabase
        .from('story_likes')
        .insert({
          story_id: storyId,
          user_id: user.id
        })

      if (insertError) {
        console.error('Error adding like:', insertError)
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Failed to like story' },
          { status: 500 }
        )
      }

      isLiked = true
      console.log(`👍 User ${user.id} liked story ${storyId}`)
    }

    // Fetch updated likes count (updated by database trigger)
    const { data: updatedStory } = await supabase
      .from('stories')
      .select('likes_count')
      .eq('id', storyId)
      .single()

    likesCount = updatedStory?.likes_count || 0

    const response: LikeStoryResponse = {
      isLiked,
      likesCount
    }

    return NextResponse.json<ApiResponse<LikeStoryResponse>>(
      {
        success: true,
        data: response,
        message: isLiked ? 'Story liked' : 'Story unliked'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Like API error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
