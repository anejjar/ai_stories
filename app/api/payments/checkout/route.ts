import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import {
  createCheckoutSession,
  getVariantIdForTier,
  SUBSCRIPTION_PRICES,
} from '@/lib/payments/lemonsqueezy'
import type { ApiResponse, SubscriptionTier } from '@/types'

// Helper to get user profile from Supabase (server-side)
async function getUserProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export async function POST(request: NextRequest) {
  const { userId, response } = await requireAuth(request)
  if (response) return response

  // CSRF protection for payment operations
  // Note: SameSite cookies provide basic CSRF protection
  // For enhanced security, implement CSRF token validation here
  // const { requireCsrfToken } = await import('@/lib/middleware/csrf')
  // const csrfCheck = await requireCsrfToken(request)
  // if (!csrfCheck.valid) {
  //   return NextResponse.json<ApiResponse>(
  //     { success: false, error: 'CSRF validation failed' },
  //     { status: 403 }
  //   )
  // }

  try {
    if (!process.env.LEMONSQUEEZY_API_KEY) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Lemon Squeezy is not configured',
        },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { tier } = body

    if (!tier || (tier !== 'pro' && tier !== 'family')) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Invalid tier. Must be "pro" or "family"',
        },
        { status: 400 }
      )
    }

    // Get user profile
    const userProfile = (await getUserProfile(userId)) as any
    if (!userProfile) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User profile not found',
        },
        { status: 404 }
      )
    }

    // Get variant ID for tier
    const variantId = getVariantIdForTier(tier as SubscriptionTier)
    if (!variantId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Variant ID not configured for tier: ${tier}`,
        },
        { status: 500 }
      )
    }

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const checkout = await createCheckoutSession(
      variantId,
      userId,
      userProfile.email,
      tier as SubscriptionTier,
      `${baseUrl}/payment/success`,
      `${baseUrl}/payment/cancel`
    )

    // Extract checkout URL from Lemon Squeezy response
    const checkoutUrl = checkout.data?.attributes?.url
    if (!checkoutUrl) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Failed to get checkout URL from Lemon Squeezy',
        },
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse<{ checkoutUrl: string }>>({
      success: true,
      data: {
        checkoutUrl,
      },
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to create checkout session',
      },
      { status: 500 }
    )
  }
}

