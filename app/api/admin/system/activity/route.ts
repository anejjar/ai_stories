import { NextRequest, NextResponse } from 'next/server'
import { requireSuperadmin } from '@/lib/auth/admin-middleware'
import { getAdminActivityLog } from '@/lib/admin/activity-logger'
import type { ApiResponse } from '@/types'
import type { AdminActionType } from '@/types/admin'

/**
 * GET /api/admin/system/activity
 * List admin activity logs with pagination and filters
 */
export async function GET(request: NextRequest) {
  const { userId, response } = await requireSuperadmin(request)
  if (response) return response

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const actionType = searchParams.get('actionType') as AdminActionType | undefined
    const adminId = searchParams.get('adminId') || undefined

    const offset = (page - 1) * limit

    // Get activity logs
    const result = await getAdminActivityLog({
      adminId,
      actionType,
      limit,
      offset,
    })

    // #region agent log
    if (result.data && result.data.length > 0) {
      fetch('http://127.0.0.1:7242/ingest/8e0a82ed-4c15-490d-b8c3-a1f6373be7bf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:25',message:'Raw activity data from DB',data:{firstActivity:result.data[0],hasActionType:!!result.data[0]?.action_type,hasActionTypeCamel:!!result.data[0]?.actionType,allKeys:Object.keys(result.data[0]||{})},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    }
    // #endregion

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        activities: result.data,
        pagination: {
          page,
          limit,
          total: result.pagination.total,
          totalPages: Math.ceil(result.pagination.total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Admin activity log error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch activity log' },
      { status: 500 }
    )
  }
}
