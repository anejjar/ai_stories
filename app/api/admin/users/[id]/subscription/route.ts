import { NextRequest, NextResponse } from 'next/server'
import { requireSuperadmin, getRequestMetadata } from '@/lib/auth/admin-middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { logAdminActivity } from '@/lib/admin/activity-logger'
import type { ApiResponse, SubscriptionTier } from '@/types'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/admin/users/[id]/subscription
 * Update user subscription tier
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const { userId: adminId, response } = await requireSuperadmin(request)
  if (response) return response

  try {
    const { id: userId } = await context.params
    const body = await request.json()

    const { subscriptionTier } = body

    // Validate subscription tier
    const validTiers: SubscriptionTier[] = ['trial', 'pro', 'family']
    if (!validTiers.includes(subscriptionTier)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid subscription tier' },
        { status: 400 }
      )
    }

    // Get current user data
    const { data: currentUser } = await supabaseAdmin
      .from('users')
      .select('email, subscription_tier')
      .eq('id', userId)
      .single()

    if (!currentUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const oldTier = currentUser.subscription_tier

    // Update subscription tier
    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update({ subscription_tier: subscriptionTier })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Failed to update subscription:', error)
      throw error
    }

    // Log admin activity
    const { ipAddress, userAgent } = getRequestMetadata(request)
    await logAdminActivity({
      adminId,
      actionType: 'subscription_change',
      targetId: userId,
      targetType: 'user',
      details: {
        email: currentUser.email,
        oldTier,
        newTier: subscriptionTier,
      },
      ipAddress,
      userAgent,
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        userId: updatedUser.id,
        email: updatedUser.email,
        subscriptionTier: updatedUser.subscription_tier,
        oldTier,
        newTier: subscriptionTier,
      },
    })
  } catch (error) {
    console.error('Admin subscription update error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}
