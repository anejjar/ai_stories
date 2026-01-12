import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import {
  createCheckoutSession,
  getVariantIdForTier,
  SUBSCRIPTION_PRICES,
} from '@/lib/payments/lemonsqueezy'
import { logger } from '@/lib/logger'
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

  let tier: SubscriptionTier | undefined
  let variantId: string | null = null

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
    tier = body.tier

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
    variantId = getVariantIdForTier(tier as SubscriptionTier)
    if (!variantId) {
      logger.error(
        'Variant ID not configured',
        new Error(`Variant ID not configured for tier: ${tier}`),
        {
          endpoint: '/api/payments/checkout',
          userId,
          tier,
          envVar: tier === 'pro' ? 'LEMONSQUEEZY_PRO_VARIANT_ID' : 'LEMONSQUEEZY_FAMILY_VARIANT_ID',
        }
      )
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Variant ID not configured for tier: ${tier}. Please check your environment variables.`,
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
    // Log full error details for debugging
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    const errorName = error instanceof Error ? error.name : 'UnknownError'
    
    // Extract additional error details if available
    const errorDetails: any = {}
    if (error instanceof Error) {
      const enhancedError = error as any
      if (enhancedError.status) errorDetails.status = enhancedError.status
      if (enhancedError.endpoint) errorDetails.endpoint = enhancedError.endpoint
      if (enhancedError.errorBody) errorDetails.errorBody = enhancedError.errorBody
      if (enhancedError.originalError) errorDetails.originalError = enhancedError.originalError
    }

    // Log with structured logger
    logger.error(
      'Error creating checkout session',
      error instanceof Error ? error : new Error(errorMessage),
      {
        endpoint: '/api/payments/checkout',
        userId,
        tier: tier || 'unknown',
        variantId: variantId || 'not-found',
        errorName,
        errorMessage,
        ...errorDetails,
      }
    )

    // Determine user-friendly error message
    let userErrorMessage = 'Failed to create checkout session'
    const isDevelopment = process.env.NODE_ENV === 'development'

    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes('LEMONSQUEEZY_STORE_ID')) {
        userErrorMessage = 'Payment service configuration error'
      } else if (error.message.includes('LEMONSQUEEZY_API_KEY')) {
        userErrorMessage = 'Payment service authentication error'
      } else if (error.message.includes('timeout')) {
        userErrorMessage = 'Payment service request timed out. Please try again.'
      } else if (error.message.includes('status')) {
        // Lemon Squeezy API error with status code
        const statusMatch = error.message.match(/\((\d+)\s+\w+\)/)
        if (statusMatch) {
          const statusCode = parseInt(statusMatch[1])
          if (statusCode === 401) {
            userErrorMessage = 'Payment service authentication failed'
          } else if (statusCode === 404) {
            // 404 usually means variant doesn't exist
            userErrorMessage = `Product variant not found. Please verify that the ${tier || 'subscription'} tier variant ID is correct in your Lemon Squeezy dashboard.`
            if (isDevelopment) {
              userErrorMessage += ` (Variant ID: ${variantId || 'not configured'})`
            }
          } else if (statusCode === 422) {
            userErrorMessage = 'Invalid checkout configuration'
          } else if (statusCode >= 500) {
            userErrorMessage = 'Payment service temporarily unavailable. Please try again later.'
          }
        }
        // Include more details in development
        if (isDevelopment) {
          userErrorMessage += `: ${error.message}`
        }
      } else if (isDevelopment) {
        // In development, show the actual error message
        userErrorMessage = error.message
      }
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: userErrorMessage,
        // Include error details in development mode for debugging
        ...(isDevelopment && {
          debug: {
            errorName,
            errorMessage,
            ...errorDetails,
          },
        }),
      },
      { status: 500 }
    )
  }
}

