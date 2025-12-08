import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ApiResponse, Story } from '@/types'
import { databaseStoryToStory, type DatabaseStory } from '@/types/database'
import { unstable_cache } from 'next/cache'


// Cached story fetch function
const getCachedStory = unstable_cache(
  async (storyId: string, userId: string) => {
    // Fetch story from Supabase
    const { data, error } = await supabaseAdmin
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single()

    if (error || !data) {
      return { error: 'Story not found', status: 404 }
    }

    // Verify story belongs to user
    const storyData = data as DatabaseStory
    if (!storyData || storyData.user_id !== userId) {
      return { error: 'Unauthorized', status: 403 }
    }

    const story: Story = databaseStoryToStory(storyData)
    return { story }
  },
  ['story-fetch'],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: (storyId: string) => [`story-${storyId}`],
  }
)

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { userId, response } = await requireAuth(request)
  if (response) return response

  try {
    const storyId = params.id

    // Use cached fetch
    const result = await getCachedStory(storyId, userId)

    if ('error' in result) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: result.error,
        },
        { status: result.status }
      )
    }

    return NextResponse.json<ApiResponse<Story>>({
      success: true,
      data: result.story,
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

