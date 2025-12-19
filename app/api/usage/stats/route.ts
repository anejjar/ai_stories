import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { getUserUsageStats } from '@/lib/usage/daily-limits'
import type { ApiResponse, UsageStats } from '@/types'

/**
 * GET /api/usage/stats
 * Returns detailed usage statistics for the authenticated user
 */
export async function GET(request: NextRequest) {
  const { userId, response } = await requireAuth(request)
  if (response) return response

  try {
    const stats = await getUserUsageStats(userId)

    return NextResponse.json<ApiResponse<UsageStats>>({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error('[UsageStats API] Error fetching usage stats:', error)

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch usage statistics',
      },
      { status: 500 }
    )
  }
}
