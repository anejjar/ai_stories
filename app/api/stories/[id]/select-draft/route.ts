import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ApiResponse, Story } from '@/types'
import { databaseStoryToStory } from '@/types/database'

/**
 * POST /api/stories/[id]/select-draft
 * Mark a draft as the selected/final version
 * This will mark all other drafts in the same parent group as not selected
 */
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { userId, response } = await requireAuth(request)
  if (response) return response

  try {
    const storyId = params.id

    // Get the story to verify ownership and get parent story ID
    const { data: story, error: storyError } = await (supabaseAdmin
      .from('stories') as any)
      .select('*')
      .eq('id', storyId)
      .eq('user_id', userId)
      .single()

    if (storyError || !story) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Story not found or access denied',
        },
        { status: 404 }
      )
    }

    // Determine the parent story ID (either this story if it's the parent, or its parent)
    const parentStoryId = story.parent_story_id || story.id

    // Unselect all drafts in this group
    await (supabaseAdmin
      .from('stories') as any)
      .update({ is_selected_draft: false })
      .or(`parent_story_id.eq.${parentStoryId},id.eq.${parentStoryId}`)

    // Select this draft
    const { data: updatedStory, error: updateError } = await (supabaseAdmin
      .from('stories') as any)
      .update({ is_selected_draft: true })
      .eq('id', storyId)
      .select()
      .single()

    if (updateError || !updatedStory) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Failed to select draft',
        },
        { status: 500 }
      )
    }

    const selectedStory: Story = databaseStoryToStory(updatedStory)

    return NextResponse.json<ApiResponse<Story>>({
      success: true,
      data: selectedStory,
    })
  } catch (error) {
    console.error('Error selecting draft:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to select draft',
      },
      { status: 500 }
    )
  }
}

