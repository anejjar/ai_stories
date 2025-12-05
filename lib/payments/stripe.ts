// Stripe payment integration

import Stripe from 'stripe'
import type { SubscriptionTier } from '@/types'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set. Payment features will not work.')
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20.acacia',
    })
  : null

/**
 * Subscription tier pricing (in cents)
 */
export const SUBSCRIPTION_PRICES: Record<SubscriptionTier, number> = {
  trial: 0,
  pro: 999, // $9.99/month
  pro_max: 1999, // $19.99/month
}

/**
 * Create a Stripe checkout session
 */
export async function createCheckoutSession(
  customerId: string,
  tier: SubscriptionTier,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  const priceId = getPriceIdForTier(tier)
  if (!priceId) {
    throw new Error(`No price ID found for tier: ${tier}`)
  }

  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
  })
}

/**
 * Get Stripe price ID for subscription tier
 * These should be configured in your Stripe dashboard
 */
function getPriceIdForTier(tier: SubscriptionTier): string | null {
  const priceIds: Record<SubscriptionTier, string | null> = {
    trial: null,
    pro: process.env.STRIPE_PRO_PRICE_ID || null,
    pro_max: process.env.STRIPE_PRO_MAX_PRICE_ID || null,
  }
  return priceIds[tier]
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(
  payload: string,
  signature: string
): Promise<Stripe.Event> {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('Stripe webhook secret is not configured')
  }

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  )
}

