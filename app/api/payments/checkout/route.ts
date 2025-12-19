import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { stripe, SUBSCRIPTION_PRICES } from '@/lib/payments/stripe'
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

// Get Stripe price ID for subscription tier
function getPriceIdForTier(tier: SubscriptionTier): string | null {
  const priceIds: Record<SubscriptionTier, string | null> = {
    trial: null,
    pro: process.env.STRIPE_PRO_PRICE_ID || null,
    family: process.env.STRIPE_FAMILY_PRICE_ID || null,
  }
  return priceIds[tier]
}

export async function POST(request: NextRequest) {
  const { userId, response } = await requireAuth(request)
  if (response) return response

  try {
    if (!stripe) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Stripe is not configured',
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

    // Get or create Stripe customer
    let customerId = userProfile.stripe_customer_id

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: userProfile.email,
        metadata: {
          userId,
        },
      })
      customerId = customer.id

      // Save customer ID to user profile
      await (supabaseAdmin
        .from('users') as any)
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    // Get price ID for tier
    const priceId = getPriceIdForTier(tier as SubscriptionTier)
    if (!priceId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Price ID not configured for tier: ${tier}`,
        },
        { status: 500 }
      )
    }

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment/cancel`,
      metadata: {
        userId,
        tier,
      },
    })

    return NextResponse.json<ApiResponse<{ checkoutUrl: string }>>({
      success: true,
      data: {
        checkoutUrl: session.url || '',
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

