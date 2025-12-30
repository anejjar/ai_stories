import { NextRequest, NextResponse } from 'next/server'
import { requireSuperadmin } from '@/lib/auth/admin-middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ApiResponse } from '@/types'
import type { AdminDashboardStats } from '@/types/admin'

/**
 * GET /api/admin/analytics/overview
 * Dashboard overview statistics
 */
export async function GET(request: NextRequest) {
  const { userId, response } = await requireSuperadmin(request)
  if (response) return response

  try {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Run multiple queries in parallel for performance
    const [usersResult, storiesResult, reportsResult, paymentsResult] = await Promise.all([
      // Users query
      supabaseAdmin
        .from('users')
        .select('id, created_at, subscription_tier', { count: 'exact' }),

      // Stories query
      supabaseAdmin
        .from('stories')
        .select('id, created_at, visibility', { count: 'exact' }),

      // Reports query
      supabaseAdmin
        .from('story_reports')
        .select('id, status', { count: 'exact' }),

      // Payments query
      supabaseAdmin
        .from('payments')
        .select('amount, created_at, status')
        .eq('status', 'succeeded')
        .gte('created_at', monthStart.toISOString()),
    ])

    // Process users data
    const totalUsers = usersResult.count || 0
    const newUsersThisWeek =
      usersResult.data?.filter((u) => new Date(u.created_at) >= weekAgo).length || 0

    const subscriptionDistribution = {
      trial: usersResult.data?.filter((u) => u.subscription_tier === 'trial').length || 0,
      pro: usersResult.data?.filter((u) => u.subscription_tier === 'pro').length || 0,
      family: usersResult.data?.filter((u) => u.subscription_tier === 'family').length || 0,
    }

    // Process stories data
    const totalStories = storiesResult.count || 0
    const publicStories =
      storiesResult.data?.filter((s) => s.visibility === 'public').length || 0
    const privateStories =
      storiesResult.data?.filter((s) => s.visibility === 'private').length || 0
    const newStoriesThisWeek =
      storiesResult.data?.filter((s) => new Date(s.created_at) >= weekAgo).length || 0

    // Process reports data
    const pendingReports = reportsResult.data?.filter((r) => r.status === 'pending').length || 0
    const reviewedReports = reportsResult.data?.filter((r) => r.status === 'reviewed').length || 0
    const resolvedReports = reportsResult.data?.filter((r) => r.status === 'resolved').length || 0

    // Process payments data
    const revenueThisMonth =
      paymentsResult.data?.reduce((sum, p) => sum + p.amount / 100, 0) || 0 // Convert cents to dollars

    const stats: AdminDashboardStats = {
      users: {
        total: totalUsers,
        newThisWeek: newUsersThisWeek,
        trial: subscriptionDistribution.trial,
        pro: subscriptionDistribution.pro,
        family: subscriptionDistribution.family,
      },
      stories: {
        total: totalStories,
        public: publicStories,
        private: privateStories,
        newThisWeek: newStoriesThisWeek,
      },
      reports: {
        pending: pendingReports,
        reviewed: reviewedReports,
        resolved: resolvedReports,
      },
      revenue: {
        thisMonth: revenueThisMonth,
      },
      subscriptions: subscriptionDistribution,
    }

    return NextResponse.json<ApiResponse<AdminDashboardStats>>({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error('Admin analytics error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
