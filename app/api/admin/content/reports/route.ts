import { NextRequest, NextResponse } from 'next/server'
import { requireSuperadmin, getRequestMetadata } from '@/lib/auth/admin-middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { logAdminActivity } from '@/lib/admin/activity-logger'
import type { ApiResponse } from '@/types'
import type { PaginationInfo, StoryReport } from '@/types/admin'

/**
 * GET /api/admin/content/reports
 * List all story reports with pagination and filters
 */
export async function GET(request: NextRequest) {
  const { userId, response } = await requireSuperadmin(request)
  if (response) return response

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status') || 'all'
    const reason = searchParams.get('reason') || 'all'
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    const offset = (page - 1) * limit

    // Build query
    let query = supabaseAdmin
      .from('story_reports')
      .select(
        `
        *,
        story:stories(id, title, content, visibility),
        reporter:users!user_id(id, email, display_name),
        reviewer:users!reviewed_by(id, email, display_name)
        `,
        { count: 'exact' }
      )
      .range(offset, offset + limit - 1)
      .order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Apply reason filter
    if (reason && reason !== 'all') {
      query = query.eq('reason', reason)
    }

    const { data: reportsData, error, count } = await query

    if (error) {
      console.error('Failed to fetch reports:', error)
      throw error
    }

    const reports: StoryReport[] = (reportsData || []).map((report: any) => ({
      id: report.id,
      storyId: report.story_id,
      userId: report.user_id,
      reason: report.reason,
      description: report.description || undefined,
      status: report.status,
      reviewedBy: report.reviewed_by || undefined,
      reviewedAt: report.reviewed_at ? new Date(report.reviewed_at) : undefined,
      resolutionNotes: report.resolution_notes || undefined,
      actionTaken: report.action_taken || undefined,
      createdAt: new Date(report.created_at),
      updatedAt: new Date(report.updated_at),
      story: report.story ? {
        id: report.story.id,
        title: report.story.title,
        content: report.story.content,
        visibility: report.story.visibility,
      } : undefined,
      reporter: report.reporter ? {
        id: report.reporter.id,
        email: report.reporter.email,
        displayName: report.reporter.display_name || undefined,
      } : undefined,
      reviewer: report.reviewer ? {
        id: report.reviewer.id,
        email: report.reviewer.email,
        displayName: report.reviewer.display_name || undefined,
      } : undefined,
    } as any))

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
      targetType: 'reports',
      details: { filters: { status, reason, page, limit } },
      ipAddress,
      userAgent,
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        reports,
        pagination,
      },
    })
  } catch (error) {
    console.error('Admin reports list error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}
