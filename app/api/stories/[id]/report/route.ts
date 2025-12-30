import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'
import type { ReportReason } from '@/types/discovery'

interface ReportParams {
  params: Promise<{
    id: string
  }>
}

const VALID_REASONS: ReportReason[] = ['inappropriate', 'spam', 'copyright', 'unwanted_words', 'unwanted_images', 'image_issues', 'other']

/**
 * POST /api/stories/[id]/report
 *
 * Report a public story for inappropriate content
 */
export async function POST(
  request: NextRequest,
  { params }: ReportParams
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
    const { reason, description } = body as {
      reason: ReportReason
      description?: string
    }

    // Validate reason
    if (!reason || !VALID_REASONS.includes(reason)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: `Invalid reason. Must be one of: ${VALID_REASONS.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate description if provided
    if (description && description.length > 500) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Description is too long (max 500 characters)' },
        { status: 400 }
      )
    }

    // Verify story exists (can be public or private)
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

    // Allow reporting both public and private stories
    // Users can report any story they have access to

    // Check if user already reported this story
    const { data: existingReport } = await supabase
      .from('story_reports')
      .select('id, status')
      .eq('story_id', storyId)
      .eq('user_id', user.id)
      .single()

    if (existingReport && existingReport.status === 'pending') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'You have already reported this story. The report is being reviewed.' },
        { status: 400 }
      )
    }

    // Insert report
    const { error: insertError } = await supabase
      .from('story_reports')
      .insert({
        story_id: storyId,
        user_id: user.id,
        reason,
        description: description || null,
        status: 'pending'
      })

    if (insertError) {
      console.error('Error creating report:', insertError)
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to submit report' },
        { status: 500 }
      )
    }

    console.log(`🚨 User ${user.id} reported story ${storyId} for: ${reason}`)

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Thank you for making this app healthy and safe for all children! Our team will review your report shortly.'
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Report API error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
