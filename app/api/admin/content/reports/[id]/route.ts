import { NextRequest, NextResponse } from 'next/server'
import { requireSuperadmin, getRequestMetadata } from '@/lib/auth/admin-middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { logAdminActivity } from '@/lib/admin/activity-logger'
import type { ApiResponse } from '@/types'
import type { StoryReport } from '@/types/admin'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/content/reports/[id]
 * Get detailed information about a specific report
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const { userId, response } = await requireSuperadmin(request)
  if (response) return response

  try {
    const { id: reportId } = await context.params

    const { data: reportData, error } = await supabaseAdmin
      .from('story_reports')
      .select(
        `
        *,
        story:stories(id, title, content, visibility, user_id, created_at, has_images, image_urls),
        reporter:users!user_id(id, email, display_name, photo_url),
        reviewer:users!reviewed_by(id, email, display_name)
        `
      )
      .eq('id', reportId)
      .single()

    if (error || !reportData) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Report not found' },
        { status: 404 }
      )
    }

    const reportDataTyped = reportData as any
    const report: StoryReport = {
      id: reportDataTyped.id,
      storyId: reportDataTyped.story_id,
      userId: reportDataTyped.user_id,
      reason: reportDataTyped.reason,
      description: reportDataTyped.description || undefined,
      status: reportDataTyped.status,
      reviewedBy: reportDataTyped.reviewed_by || undefined,
      reviewedAt: reportDataTyped.reviewed_at ? new Date(reportDataTyped.reviewed_at) : undefined,
      resolutionNotes: reportDataTyped.resolution_notes || undefined,
      actionTaken: reportDataTyped.action_taken || undefined,
      createdAt: new Date(reportDataTyped.created_at),
      updatedAt: new Date(reportDataTyped.updated_at),
      story: reportDataTyped.story as any,
      reporter: reportDataTyped.reporter as any,
      reviewer: reportDataTyped.reviewer as any,
    }

    // Log admin activity
    const { ipAddress, userAgent } = getRequestMetadata(request)
    await logAdminActivity({
      adminId: userId,
      actionType: 'report_review',
      targetId: reportId,
      targetType: 'report',
      details: { action: 'view', storyId: reportDataTyped.story_id },
      ipAddress,
      userAgent,
    })

    return NextResponse.json<ApiResponse<StoryReport>>({
      success: true,
      data: report,
    })
  } catch (error) {
    console.error('Admin report detail error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch report details' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/content/reports/[id]
 * Update report status or resolution
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const { userId, response } = await requireSuperadmin(request)
  if (response) return response

  try {
    const { id: reportId } = await context.params
    const body = await request.json()

    const { status, resolutionNotes, actionTaken } = body

    const updates: any = {}
    if (status) updates.status = status
    if (resolutionNotes !== undefined) updates.resolution_notes = resolutionNotes
    if (actionTaken) updates.action_taken = actionTaken

    // If status is being changed to reviewed or resolved, set reviewer
    if (status && (status === 'reviewed' || status === 'resolved')) {
      updates.reviewed_by = userId
      updates.reviewed_at = new Date().toISOString()
    }

    const { data: updatedReport, error } = await (supabaseAdmin
      .from('story_reports') as any)
      .update(updates)
      .eq('id', reportId)
      .select()
      .single()

    if (error || !updatedReport) {
      console.error('Failed to update report:', error)
      throw error || new Error('Failed to update report')
    }

    const updatedReportTyped = updatedReport as any

    // Log admin activity
    const { ipAddress, userAgent } = getRequestMetadata(request)
    await logAdminActivity({
      adminId: userId,
      actionType: 'report_review',
      targetId: reportId,
      targetType: 'report',
      details: { updates, storyId: updatedReportTyped.story_id },
      ipAddress,
      userAgent,
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedReportTyped,
    })
  } catch (error) {
    console.error('Admin report update error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update report' },
      { status: 500 }
    )
  }
}
