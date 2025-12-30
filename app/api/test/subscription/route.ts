/**
 * TESTING ONLY - Manual subscription tier update endpoint
 * This should be removed before production deployment
 * 
 * Allows developers to test PRO and Family Plan features without Stripe checkout
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ApiResponse, SubscriptionTier } from '@/types'

export async function POST(request: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'This endpoint is only available in development mode',
      },
      { status: 403 }
    )
  }

  const { userId, response } = await requireAuth(request)
  if (response) return response

  try {
    const body = await request.json()
    const { tier }: { tier: SubscriptionTier } = body

    // Validate tier
    if (!['trial', 'pro', 'family'].includes(tier)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Invalid subscription tier. Must be: trial, pro, or family',
        },
        { status: 400 }
      )
    }

    // Update user subscription tier
    const updateData: Record<string, any> = { subscription_tier: tier }
    const { error: updateError } = await (supabaseAdmin
      .from('users') as any)
      .update(updateData)
      .eq('id', userId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json<ApiResponse<{ tier: SubscriptionTier }>>({
      success: true,
      message: `Subscription tier updated to ${tier.toUpperCase()}`,
      data: { tier },
    })
  } catch (error) {
    console.error('Error updating subscription tier:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to update subscription tier',
      },
      { status: 500 }
    )
  }
}

