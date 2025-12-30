import { NextRequest, NextResponse } from 'next/server'
import { optionalAuth } from '@/lib/auth/middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ApiResponse, Story } from '@/types'
import { databaseStoryToStory, type DatabaseStory } from '@/types/database'
import { unstable_noStore as noStore } from 'next/cache'

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const userId = await optionalAuth(request)

  try {
    // Do not cache this endpoint; large payloads (stories + images) can exceed Next.js cache size limits
    noStore()

    const storyId = params.id

    // Fetch story directly (no caching to avoid 2MB data cache limits)
    const { data, error } = await supabaseAdmin
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single()

    if (error || !data) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Story not found' },
        { status: 404 }
      )
    }

    const storyData = data as DatabaseStory
    if (!storyData || (storyData.user_id !== userId && storyData.visibility !== 'public')) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const story: Story = databaseStoryToStory(storyData)

    // Increment view count using RPC function (safe from race conditions)
    // We do this after verifying access
    await supabaseAdmin.rpc('increment_story_view_count', { story_id: storyId })

    // Add social stats if public
    if (story.visibility === 'public') {
      // Get likes count
      const { count: likesCount } = await supabaseAdmin
        .from('story_likes')
        .select('*', { count: 'exact', head: true })
        .eq('story_id', storyId)

      // Get comments count
      const { count: commentsCount } = await supabaseAdmin
        .from('story_comments')
        .select('*', { count: 'exact', head: true })
        .eq('story_id', storyId)

      // Check if liked by current user
      let isLikedByUser = false
      if (userId) {
        const { data: likeData } = await supabaseAdmin
          .from('story_likes')
          .select('id')
          .eq('story_id', storyId)
          .eq('user_id', userId)
          .single()
        
        isLikedByUser = !!likeData
      }

      story.likesCount = likesCount || 0
      story.commentsCount = commentsCount || 0
      story.isLikedByUser = isLikedByUser
    }

    return NextResponse.json<ApiResponse<Story>>({
      success: true,
      data: story,
    })
  } catch (error) {
    console.error('Error fetching story:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch story',
      },
      { status: 500 }
    )
  }
}

