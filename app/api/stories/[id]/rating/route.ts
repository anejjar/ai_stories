import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'
import type { RateStoryResponse } from '@/types/discovery'

interface RatingParams {
  params: Promise<{
    id: string
  }
}

/**
 * POST /api/stories/[id]/rating
 *
 * Rate a public story (1-5 stars)
 * Updates existing rating if user already rated
 */
export async function POST(
  request: NextRequest,
  { params }: RatingParams
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
    const { rating } = body as { rating: number }

    // Validate rating
    if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      )
    }

    // Verify story exists and is public
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, visibility')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Story not found' },
        { status: 404 }
      )
    }

    if (story.visibility !== 'public') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Can only rate public stories' },
        { status: 400 }
      )
    }

    // Check if user already rated this story
    const { data: existingRating } = await supabase
      .from('story_ratings')
      .select('id')
      .eq('story_id', storyId)
      .eq('user_id', user.id)
      .single()

    if (existingRating) {
      // Update existing rating
      const { error: updateError } = await supabase
        .from('story_ratings')
        .update({
          rating,
          updated_at: new Date().toISOString()
        })
        .eq('story_id', storyId)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating rating:', updateError)
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Failed to update rating' },
          { status: 500 }
        )
      }

      console.log(`⭐ User ${user.id} updated rating for story ${storyId} to ${rating}`)

    } else {
      // Insert new rating
      const { error: insertError } = await supabase
        .from('story_ratings')
        .insert({
          story_id: storyId,
          user_id: user.id,
          rating
        })

      if (insertError) {
        console.error('Error creating rating:', insertError)
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Failed to create rating' },
          { status: 500 }
        )
      }

      console.log(`⭐ User ${user.id} rated story ${storyId} with ${rating} stars`)
    }

    // Fetch updated story statistics (updated by database trigger)
    const { data: updatedStory } = await supabase
      .from('stories')
      .select('average_rating, ratings_count')
      .eq('id', storyId)
      .single()

    const response: RateStoryResponse = {
      averageRating: parseFloat(updatedStory?.average_rating || '0'),
      ratingsCount: updatedStory?.ratings_count || 0,
      userRating: rating
    }

    return NextResponse.json<ApiResponse<RateStoryResponse>>(
      {
        success: true,
        data: response,
        message: 'Rating submitted successfully'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Rating API error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
