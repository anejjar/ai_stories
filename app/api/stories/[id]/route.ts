import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ApiResponse, Story } from '@/types'
import { databaseStoryToStory, type DatabaseStory } from '@/types/database'
import { unstable_noStore as noStore } from 'next/cache'

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { userId, response } = await requireAuth(request)
  if (response) return response

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
    if (!storyData || storyData.user_id !== userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const story: Story = databaseStoryToStory(storyData)

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

