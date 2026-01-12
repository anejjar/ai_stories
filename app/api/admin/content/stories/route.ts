import { NextRequest, NextResponse } from 'next/server'
import { requireSuperadmin, getRequestMetadata } from '@/lib/auth/admin-middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { logAdminActivity } from '@/lib/admin/activity-logger'
import { sanitizeSearchQuery, escapeLikePattern } from '@/lib/validation/input-sanitizer'
import type { ApiResponse } from '@/types'
import type { PaginationInfo, AdminStoryListItem } from '@/types/admin'

/**
 * GET /api/admin/content/stories
 * List all stories with pagination and filters
 */
export async function GET(request: NextRequest) {
  const { userId, response } = await requireSuperadmin(request)
  if (response) return response

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const visibility = searchParams.get('visibility') || 'all'
    const type = searchParams.get('type') || 'all'
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    const offset = (page - 1) * limit

    // Build query
    let query = supabaseAdmin
      .from('stories')
      .select(
        `
        *,
        author:users!user_id(email, display_name)
        `,
        { count: 'exact' }
      )
      .range(offset, offset + limit - 1)
      .order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply visibility filter
    if (visibility && visibility !== 'all') {
      query = query.eq('visibility', visibility)
    }

    // Apply type filter (text vs illustrated)
    if (type === 'text') {
      query = query.eq('has_images', false)
    } else if (type === 'illustrated') {
      query = query.eq('has_images', true)
    }

    // Apply search filter
    if (search) {
      const sanitized = sanitizeSearchQuery(search)
      if (sanitized.length > 0) {
        const escapedTerm = escapeLikePattern(sanitized)
        query = query.or(`title.ilike.%${escapedTerm}%`)
      }
    }

    const { data: storiesData, error, count } = await query

    if (error) {
      console.error('Failed to fetch stories:', error)
      throw error
    }

    const stories: AdminStoryListItem[] = (storiesData || []).map((story: any) => ({
      id: story.id,
      userId: story.user_id,
      title: story.title,
      content: story.content,
      childName: story.child_name,
      adjectives: story.adjectives || [],
      theme: story.theme,
      moral: story.moral,
      hasImages: story.has_images,
      imageUrls: story.image_urls || [],
      visibility: story.visibility,
      createdAt: new Date(story.created_at),
      updatedAt: new Date(story.updated_at),
      viewCount: story.view_count || 0,
      likesCount: story.likes_count || 0,
      commentsCount: story.comments_count || 0,
      authorEmail: story.author?.email,
      authorName: story.author?.display_name,
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
      actionType: 'story_review',
      details: { filters: { visibility, type, search, page, limit } },
      ipAddress,
      userAgent,
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        stories,
        pagination,
      },
    })
  } catch (error) {
    console.error('Admin stories list error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch stories' },
      { status: 500 }
    )
  }
}
