import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'

interface PublishParams {
  params: Promise<{
    id: string
  }>
}

/**
 * POST /api/stories/[id]/publish
 *
 * Toggle story visibility between public and private
 * Only text stories can be published (no illustrated books)
 */
export async function POST(
  request: NextRequest,
  { params }: PublishParams
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

    // Parse request body
    const body = await request.json()
    const { visibility } = body as { visibility: 'public' | 'private' }

    // Validate visibility value
    if (!visibility || !['public', 'private'].includes(visibility)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid visibility value. Must be "public" or "private"' },
        { status: 400 }
      )
    }

    // Check if story exists and belongs to user
    const { data: story, error: fetchError } = await supabase
      .from('stories')
      .select('id, user_id, is_illustrated_book, visibility')
      .eq('id', storyId)
      .single()

    if (fetchError || !story) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Story not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    const storyData = story as any
    if (storyData.user_id !== user.id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'You do not have permission to publish this story' },
        { status: 403 }
      )
    }

    // Prevent publishing illustrated books
    if (storyData.is_illustrated_book && visibility === 'public') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Illustrated books cannot be made public. Only text stories can be shared in Discovery.' },
        { status: 400 }
      )
    }

    // Update visibility
    const updateData: any = {
      visibility,
      updated_at: new Date().toISOString()
    }

    // Set published_at timestamp when making public for the first time
    if (visibility === 'public' && storyData.visibility !== 'public') {
      updateData.published_at = new Date().toISOString()
    }

    const { data: updatedStory, error: updateError } = await (supabase
      .from('stories') as any)
      .update(updateData)
      .eq('id', storyId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating story visibility:', updateError)
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to update story visibility' },
        { status: 500 }
      )
    }

    console.log(`✅ Story ${storyId} visibility updated to: ${visibility}`)
    const updatedStoryData = updatedStory as any

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          id: updatedStoryData.id,
          visibility: updatedStoryData.visibility,
          publishedAt: updatedStoryData.published_at
        },
        message: `Story ${visibility === 'public' ? 'published' : 'unpublished'} successfully`
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Publish API error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
