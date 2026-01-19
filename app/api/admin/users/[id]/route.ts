import { NextRequest, NextResponse } from 'next/server'
import { requireSuperadmin, getRequestMetadata } from '@/lib/auth/admin-middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { logAdminActivity } from '@/lib/admin/activity-logger'
import type { ApiResponse } from '@/types'
import type { AdminUserDetail } from '@/types/admin'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/users/[id]
 * Get detailed information about a specific user
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const { userId: adminId, response } = await requireSuperadmin(request)
  if (response) return response

  try {
    const { id: userId } = await context.params

    // Get user details
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Get stories count
    const { count: storiesCount } = await supabaseAdmin
      .from('stories')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get child profiles count
    const { count: childProfilesCount } = await supabaseAdmin
      .from('child_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get recent stories (last 10)
    const { data: recentStories } = await supabaseAdmin
      .from('stories')
      .select('id, title, created_at, visibility, has_images')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Construct detailed user object
    const userData = user as any
    const userDetail: AdminUserDetail = {
      id: userData.id,
      email: userData.email,
      displayName: userData.display_name || undefined,
      photoURL: userData.photo_url || userData.avatar_url || undefined,
      subscriptionTier: userData.subscription_tier,
      role: userData.role,
      createdAt: new Date(userData.created_at),
      updatedAt: new Date(userData.updated_at),
      lemonsqueezyCustomerId: userData.lemonsqueezy_customer_id || undefined,
      lemonsqueezySubscriptionId: userData.lemonsqueezy_subscription_id || undefined,
      adminNotes: userData.admin_notes || undefined,
      lastAdminActionAt: userData.last_admin_action_at ? new Date(userData.last_admin_action_at) : undefined,
      totalStories: storiesCount || 0,
      readingStreak: {
        current: userData.reading_streak_current || 0,
        longest: userData.reading_streak_longest || 0,
      },
      totalPoints: userData.total_points || 0,
      readerLevel: userData.reader_level || 'bronze',
      childProfilesCount: childProfilesCount || 0,
      recentStories: (recentStories || []).map((story: any) => ({
        id: story.id,
        title: story.title,
        createdAt: new Date(story.created_at),
        visibility: story.visibility,
        hasImages: story.has_images,
      })) as any,
    }

    // Log admin activity
    const { ipAddress, userAgent } = getRequestMetadata(request)
    await logAdminActivity({
      adminId,
      actionType: 'user_view',
      targetId: userId,
      targetType: 'user',
      details: { email: userData.email },
      ipAddress,
      userAgent,
    })

    return NextResponse.json<ApiResponse<AdminUserDetail>>({
      success: true,
      data: userDetail,
    })
  } catch (error) {
    console.error('Admin user detail error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch user details' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Update user details (admin notes, display name, etc.)
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const { userId: adminId, response } = await requireSuperadmin(request)
  if (response) return response

  try {
    const { id: userId } = await context.params
    const body = await request.json()

    const { displayName, adminNotes } = body

    const updates: Record<string, any> = {}
    if (displayName !== undefined) updates.display_name = displayName
    if (adminNotes !== undefined) updates.admin_notes = adminNotes

    const query = (supabaseAdmin
      .from('users') as any)
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    const { data: updatedUser, error } = await query

    if (error) {
      console.error('Failed to update user:', error)
      throw error
    }

    // Log admin activity
    const { ipAddress, userAgent } = getRequestMetadata(request)
    await logAdminActivity({
      adminId,
      actionType: 'user_edit',
      targetId: userId,
      targetType: 'user',
      details: { updates, email: updatedUser.email },
      ipAddress,
      userAgent,
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedUser,
    })
  } catch (error) {
    console.error('Admin user update error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete user account (use with caution)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { userId: adminId, response } = await requireSuperadmin(request)
  if (response) return response

  try {
    const { id: userId } = await context.params

    // Get user email for logging before deletion
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    const userEmail = (user as any)?.email || 'unknown'

    // Delete user (CASCADE will delete related data)
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) {
      console.error('Failed to delete user:', error)
      throw error
    }

    // Log admin activity
    const { ipAddress, userAgent } = getRequestMetadata(request)
    await logAdminActivity({
      adminId,
      actionType: 'user_edit',
      targetId: userId,
      targetType: 'user',
      details: { action: 'delete', email: userEmail },
      ipAddress,
      userAgent,
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { deleted: true },
    })
  } catch (error) {
    console.error('Admin user delete error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
