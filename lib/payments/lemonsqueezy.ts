// Lemon Squeezy payment integration

import type { SubscriptionTier } from '@/types'
import crypto from 'crypto'

const LEMONSQUEEZY_API_URL = 'https://api.lemonsqueezy.com/v1'

if (!process.env.LEMONSQUEEZY_API_KEY) {
  console.warn('LEMONSQUEEZY_API_KEY is not set. Payment features will not work.')
}

/**
 * Subscription tier pricing (in cents)
 */
export const SUBSCRIPTION_PRICES: Record<SubscriptionTier, number> = {
  trial: 0,
  pro: 999, // $9.99/month
  family: 2499, // $24.99/month
}

/**
 * Lemon Squeezy API client with timeout support
 */
async function lemonsqueezyRequest(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = 30000 // 30 seconds default
): Promise<Response> {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY
  if (!apiKey) {
    throw new Error('LEMONSQUEEZY_API_KEY is not configured')
  }

  const url = `${LEMONSQUEEZY_API_URL}${endpoint}`
  
  // Create AbortController for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${apiKey}`,
        ...options.headers,
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(`Lemon Squeezy API error: ${JSON.stringify(error)}`)
    }

    return response
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Lemon Squeezy API request timeout after ${timeoutMs}ms`)
    }
    
    throw error
  }
}

/**
 * Create a Lemon Squeezy checkout session
 */
export interface CheckoutSession {
  data: {
    id: string
    type: string
    attributes: {
      url: string
      [key: string]: any
    }
  }
}

export async function createCheckoutSession(
  variantId: string,
  userId: string,
  userEmail: string,
  tier: SubscriptionTier,
  successUrl: string,
  cancelUrl: string
): Promise<CheckoutSession> {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID
  if (!storeId) {
    throw new Error('LEMONSQUEEZY_STORE_ID is not configured')
  }

  const response = await lemonsqueezyRequest('/checkouts', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_options: {
            button_color: '#7047EB',
          },
          checkout_data: {
            custom: {
              user_id: userId,
              tier: tier,
            },
            email: userEmail,
          },
          expires_at: null,
          preview: false,
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: storeId,
            },
          },
          variant: {
            data: {
              type: 'variants',
              id: variantId,
            },
          },
        },
      },
    }),
  })

  return response.json()
}

/**
 * Get Lemon Squeezy variant ID for subscription tier
 * These should be configured in your Lemon Squeezy dashboard
 */
export function getVariantIdForTier(tier: SubscriptionTier): string | null {
  const variantIds: Record<SubscriptionTier, string | null> = {
    trial: null,
    pro: process.env.LEMONSQUEEZY_PRO_VARIANT_ID || null,
    family: process.env.LEMONSQUEEZY_FAMILY_VARIANT_ID || null,
  }
  return variantIds[tier]
}

/**
 * Get tier name for display purposes
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
  const names: Record<SubscriptionTier, string> = {
    trial: 'Free Trial',
    pro: 'Pro',
    family: 'Family Plan',
  }
  return names[tier]
}

/**
 * Get tier features for display
 */
export function getTierFeatures(tier: SubscriptionTier): string[] {
  const features: Record<SubscriptionTier, string[]> = {
    trial: [
      '1 free story',
      'Save & view stories',
      '100% kid-safe content',
      'Personalized with child\'s name',
    ],
    pro: [
      'Unlimited text stories',
      'Multiple story drafts (3 per request)',
      'Rewrite & enhance tools',
      '25+ story themes',
      '10 story templates',
      'Text-to-Speech audio',
      'Unlimited storage',
      'Ad-free',
    ],
    family: [
      'Everything in Pro',
      'Up to 3 child profiles',
      '2 AI-illustrated stories per day',
      '10 text stories per day',
      'High-resolution picture books',
      'Child appearance customization',
      'PDF export',
      'Advanced art styles',
      'Family dashboard',
    ],
  }
  return features[tier]
}

/**
 * Verify Lemon Squeezy webhook signature
 * Lemon Squeezy uses HMAC-SHA256 with the raw request body
 * The signature in the X-Signature header is a hex string
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (!webhookSecret) {
    throw new Error('LEMONSQUEEZY_WEBHOOK_SECRET is not configured')
  }

  // Compute HMAC-SHA256 hash of the payload
  const hmac = crypto.createHmac('sha256', webhookSecret)
  const digest = hmac.update(payload).digest('hex')

  // Compare signatures using constant-time comparison to prevent timing attacks
  // Both signature and digest are hex strings, so compare as buffers
  if (signature.length !== digest.length) {
    return false
  }

  try {
    const signatureBuffer = Buffer.from(signature, 'hex')
    const digestBuffer = Buffer.from(digest, 'hex')
    return crypto.timingSafeEqual(signatureBuffer, digestBuffer)
  } catch {
    // If signature is not valid hex, return false
    return false
  }
}

/**
 * Parse Lemon Squeezy webhook event
 */
export interface LemonSqueezyWebhookEvent {
  meta: {
    event_name: string
  }
  data: {
    type: string
    id: string
    attributes: {
      [key: string]: any
    }
    relationships?: {
      [key: string]: any
    }
  }
}

export function parseWebhookEvent(payload: string): LemonSqueezyWebhookEvent {
  try {
    return JSON.parse(payload) as LemonSqueezyWebhookEvent
  } catch (error) {
    throw new Error('Invalid webhook payload')
  }
}
