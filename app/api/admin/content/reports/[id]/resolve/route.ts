import { NextRequest, NextResponse } from 'next/server'
import { requireSuperadmin, getRequestMetadata } from '@/lib/auth/admin-middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { logAdminActivity } from '@/lib/admin/activity-logger'
import type { ApiResponse } from '@/types'
import type { StoryReportAction } from '@/types/admin'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * POST /api/admin/content/reports/[id]/resolve
 * Resolve a story report with action taken
 */
export async function POST(request: NextRequest, context: RouteContext) {
  const { userId, response } = await requireSuperadmin(request)
  if (response) return response

  try {
    const { id: reportId } = await context.params
    const body = await request.json()

    const { actionTaken, resolutionNotes } = body as {
      actionTaken: StoryReportAction
      resolutionNotes?: string
    }

    // Validate action taken
    const validActions: StoryReportAction[] = [
      'no_action',
      'warning_sent',
      'story_hidden',
      'story_deleted',
      'user_warned',
      'user_suspended',
    ]
    if (!validActions.includes(actionTaken)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid action type' },
        { status: 400 }
      )
    }

    // Get report details
    const { data: report } = await supabaseAdmin
      .from('story_reports')
      .select('story_id')
      .eq('id', reportId)
      .single()

    if (!report) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Report not found' },
        { status: 404 }
      )
    }

    // Update report status to resolved
    const { data: updatedReport, error: updateError } = await supabaseAdmin
      .from('story_reports')
      .update({
        status: 'resolved',
        action_taken: actionTaken,
        resolution_notes: resolutionNotes || null,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', reportId)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to resolve report:', updateError)
      throw updateError
    }

    // Take action on the story if needed
    if (actionTaken === 'story_hidden') {
      await supabaseAdmin
        .from('stories')
        .update({ visibility: 'private' })
        .eq('id', report.story_id)
    } else if (actionTaken === 'story_deleted') {
      await supabaseAdmin.from('stories').delete().eq('id', report.story_id)
    }

    // Log admin activity
    const { ipAddress, userAgent } = getRequestMetadata(request)
    await logAdminActivity({
      adminId: userId,
      actionType: 'report_review',
      targetId: reportId,
      targetType: 'report',
      details: {
        action: 'resolve',
        actionTaken,
        storyId: report.story_id,
      },
      ipAddress,
      userAgent,
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        reportId: updatedReport.id,
        status: updatedReport.status,
        actionTaken: updatedReport.action_taken,
      },
    })
  } catch (error) {
    console.error('Admin report resolve error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to resolve report' },
      { status: 500 }
    )
  }
}
