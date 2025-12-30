import { NextRequest, NextResponse } from 'next/server'
import { requireSuperadmin, getRequestMetadata } from '@/lib/auth/admin-middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { logAdminActivity } from '@/lib/admin/activity-logger'
import type { ApiResponse } from '@/types'
import type { PaginationInfo, AdminUserListItem } from '@/types/admin'

/**
 * GET /api/admin/users
 * List all users with pagination and filters
 */
export async function GET(request: NextRequest) {
  const { userId, response } = await requireSuperadmin(request)
  if (response) return response

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const tier = searchParams.get('tier') || 'all'
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    const offset = (page - 1) * limit

    // Build query
    let query = supabaseAdmin
      .from('users')
      .select('id, email, display_name, photo_url, subscription_tier, role, created_at, admin_notes', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply search filter
    if (search) {
      query = query.or(`email.ilike.%${search}%,display_name.ilike.%${search}%`)
    }

    // Apply tier filter
    if (tier && tier !== 'all') {
      query = query.eq('subscription_tier', tier)
    }

    const { data: usersData, error, count } = await query

    if (error) {
      console.error('Failed to fetch users:', error)
      throw error
    }

    // Get stories count for each user
    const userIds = usersData?.map(u => u.id) || []
    const { data: storiesCounts } = await supabaseAdmin
      .from('stories')
      .select('user_id')
      .in('user_id', userIds)

    const storiesCountMap = (storiesCounts || []).reduce((acc, story) => {
      acc[story.user_id] = (acc[story.user_id] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const users: AdminUserListItem[] = (usersData || []).map(user => ({
      id: user.id,
      email: user.email,
      displayName: user.display_name || undefined,
      photoURL: user.photo_url || undefined,
      subscriptionTier: user.subscription_tier as any,
      role: user.role as any,
      createdAt: new Date(user.created_at),
      storiesCount: storiesCountMap[user.id] || 0,
      adminNotes: user.admin_notes || undefined,
    }))

    const pagination: PaginationInfo = {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    }

    // Log admin activity
    const { ipAddress, userAgent } = getRequestMetadata(request)
    await logAdminActivity({
      adminId: userId,
      actionType: 'user_view',
      details: { filters: { search, tier, page, limit } },
      ipAddress,
      userAgent,
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        users,
        pagination,
      },
    })
  } catch (error) {
    console.error('Admin users list error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
