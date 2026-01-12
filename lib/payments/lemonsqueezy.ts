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
      // Try to parse error response
      let errorBody: any
      let errorText: string | null = null
      
      try {
        errorText = await response.text()
        errorBody = errorText ? JSON.parse(errorText) : { error: 'Unknown error' }
      } catch (parseError) {
        errorBody = { error: 'Failed to parse error response', raw: errorText }
      }

      // Log full error details for debugging
      console.error('Lemon Squeezy API Error:', {
        endpoint,
        method: options.method || 'GET',
        status: response.status,
        statusText: response.statusText,
        error: errorBody,
        url,
      })

      // Create a more descriptive error message
      const errorMessage = errorBody.errors
        ? errorBody.errors.map((err: any) => err.detail || err.title || JSON.stringify(err)).join('; ')
        : errorBody.error || errorBody.message || JSON.stringify(errorBody)
      
      const enhancedError = new Error(
        `Lemon Squeezy API error (${response.status} ${response.statusText}) on ${endpoint}: ${errorMessage}`
      )
      
      // Attach additional error details for debugging
      ;(enhancedError as any).status = response.status
      ;(enhancedError as any).endpoint = endpoint
      ;(enhancedError as any).errorBody = errorBody
      
      throw enhancedError
    }

    return response
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError = new Error(
        `Lemon Squeezy API request timeout after ${timeoutMs}ms on ${endpoint}`
      )
      ;(timeoutError as any).endpoint = endpoint
      throw timeoutError
    }
    
    // If it's already our enhanced error, re-throw it
    if (error instanceof Error && (error as any).endpoint) {
      throw error
    }
    
    // For other errors, enhance them with context
    if (error instanceof Error) {
      const enhancedError = new Error(
        `Lemon Squeezy API request failed on ${endpoint}: ${error.message}`
      )
      ;(enhancedError as any).endpoint = endpoint
      ;(enhancedError as any).originalError = error
      throw enhancedError
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

  // Build attributes object
  const attributes: any = {
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
  }

  // Add redirect URL to product_options if successUrl is provided
  if (successUrl) {
    attributes.product_options = {
      redirect_url: successUrl,
    }
  }

  const response = await lemonsqueezyRequest('/checkouts', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes,
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
  const variantId = variantIds[tier]
  
  // Log warning if variant ID is missing
  if (tier !== 'trial' && !variantId) {
    console.warn(`⚠️ LEMONSQUEEZY_${tier.toUpperCase()}_VARIANT_ID is not configured`)
  }
  
  return variantId
}

/**
 * Validate that a variant ID exists in Lemon Squeezy
 * This can be used to verify configuration before creating checkouts
 * Returns the variant data if valid, null if not found
 */
export async function validateVariantId(variantId: string): Promise<{ valid: boolean; data?: any; error?: string }> {
  try {
    const response = await lemonsqueezyRequest(`/variants/${variantId}`, {
      method: 'GET',
    })
    
    if (response.ok) {
      const data = await response.json()
      return { valid: true, data }
    } else {
      return { valid: false, error: `Variant not found (${response.status})` }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { valid: false, error: errorMessage }
  }
}

/**
 * Get variant details for debugging
 */
export async function getVariantDetails(variantId: string): Promise<any> {
  try {
    const response = await lemonsqueezyRequest(`/variants/${variantId}`, {
      method: 'GET',
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch variant: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching variant details:', error)
    throw error
  }
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
