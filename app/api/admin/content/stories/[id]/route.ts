import { NextRequest, NextResponse } from 'next/server'
import { requireSuperadmin, getRequestMetadata } from '@/lib/auth/admin-middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { logAdminActivity } from '@/lib/admin/activity-logger'
import type { ApiResponse } from '@/types'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/content/stories/[id]
 * Get detailed information about a specific story
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const { userId, response } = await requireSuperadmin(request)
  if (response) return response

  try {
    const { id: storyId } = await context.params

    const { data: story, error } = await supabaseAdmin
      .from('stories')
      .select(
        `
        *,
        author:users!user_id(id, email, display_name, photo_url, subscription_tier)
        `
      )
      .eq('id', storyId)
      .single()

    if (error || !story) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Story not found' },
        { status: 404 }
      )
    }

    const storyTyped = story as any

    // Log admin activity
    const { ipAddress, userAgent } = getRequestMetadata(request)
    await logAdminActivity({
      adminId: userId,
      actionType: 'story_review',
      targetId: storyId,
      targetType: 'story',
      details: { title: storyTyped.title, authorEmail: storyTyped.author?.email },
      ipAddress,
      userAgent,
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: story,
    })
  } catch (error) {
    console.error('Admin story detail error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch story details' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/content/stories/[id]
 * Delete a story (for moderation purposes)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { userId, response } = await requireSuperadmin(request)
  if (response) return response

  try {
    const { id: storyId } = await context.params

    // Get story details before deletion
    const { data: story, error: storyError } = await supabaseAdmin
      .from('stories')
      .select('title, user_id')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Story not found' },
        { status: 404 }
      )
    }

    const storyTyped = story as { title: string; user_id: string }

    // Delete the story
    const { error } = await supabaseAdmin
      .from('stories')
      .delete()
      .eq('id', storyId)

    if (error) {
      console.error('Failed to delete story:', error)
      throw error
    }

    // Log admin activity
    const { ipAddress, userAgent } = getRequestMetadata(request)
    await logAdminActivity({
      adminId: userId,
      actionType: 'story_delete',
      targetId: storyId,
      targetType: 'story',
      details: { title: storyTyped.title, userId: storyTyped.user_id },
      ipAddress,
      userAgent,
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { deleted: true },
    })
  } catch (error) {
    console.error('Admin story delete error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete story' },
      { status: 500 }
    )
  }
}
