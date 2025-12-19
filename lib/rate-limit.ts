/**
 * Rate Limiter Middleware
 * Simple in-memory rate limiting for API routes
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for rate limiting
// Note: This resets on server restart. For production, use Redis or similar
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up old entries periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number
  /** Time window in seconds */
  windowSeconds: number
  /** Identifier for the rate limit (e.g., 'story-generation', 'image-upload') */
  identifier?: string
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetIn: number // seconds until reset
  limit: number
}

/**
 * Check if a request should be rate limited
 * @param key - Unique identifier for the client (e.g., userId, IP)
 * @param config - Rate limit configuration
 * @returns RateLimitResult with success status and metadata
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const { limit, windowSeconds, identifier = 'default' } = config
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  const storeKey = `${identifier}:${key}`

  let entry = rateLimitStore.get(storeKey)

  // If no entry or window has expired, create new entry
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + windowMs,
    }
    rateLimitStore.set(storeKey, entry)
    
    return {
      success: true,
      remaining: limit - 1,
      resetIn: windowSeconds,
      limit,
    }
  }

  // Increment count
  entry.count++
  rateLimitStore.set(storeKey, entry)

  const resetIn = Math.ceil((entry.resetTime - now) / 1000)

  // Check if over limit
  if (entry.count > limit) {
    return {
      success: false,
      remaining: 0,
      resetIn,
      limit,
    }
  }

  return {
    success: true,
    remaining: limit - entry.count,
    resetIn,
    limit,
  }
}

/**
 * Preset rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Story generation - expensive AI operation
  storyGeneration: {
    limit: 10,
    windowSeconds: 60, // 10 stories per minute
    identifier: 'story-gen',
  },
  
  // Image generation - very expensive AI operation
  imageGeneration: {
    limit: 5,
    windowSeconds: 60, // 5 image batches per minute
    identifier: 'image-gen',
  },
  
  // Child profile image upload/generation
  profileImageGeneration: {
    limit: 3,
    windowSeconds: 60, // 3 profile image generations per minute
    identifier: 'profile-img',
  },
  
  // General API calls
  general: {
    limit: 100,
    windowSeconds: 60, // 100 requests per minute
    identifier: 'general',
  },
  
  // Authentication attempts
  auth: {
    limit: 10,
    windowSeconds: 60, // 10 auth attempts per minute
    identifier: 'auth',
  },

  // Waitlist signups - protect expensive email provider
  waitlist: {
    limit: 3,
    windowSeconds: 3600, // 3 signups per hour per IP
    identifier: 'waitlist',
  },
} as const

/**
 * Get rate limit headers for API response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetIn.toString(),
  }
}

