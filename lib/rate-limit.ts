/**
 * Rate Limiter Middleware
 * Uses Redis for production, falls back to in-memory for development
 */

import * as RedisRateLimit from './rate-limit-redis'

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for rate limiting (development fallback only)
// Note: This resets on server restart. Production uses Redis.
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
 * In-memory rate limiter (fallback for development)
 */
function checkRateLimitInMemory(
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
 * Check if a request should be rate limited
 * Uses Redis for production, in-memory for development
 *
 * @param key - Unique identifier for the client (e.g., userId, IP)
 * @param config - Rate limit configuration
 * @returns RateLimitResult with success status and metadata
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  // Use Redis if configured, otherwise fall back to in-memory
  if (RedisRateLimit.isRedisConfigured()) {
    return await RedisRateLimit.checkRateLimit(key, config)
  } else {
    console.warn('Redis not configured, using in-memory rate limiting (not suitable for production)')
    return checkRateLimitInMemory(key, config)
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

  // Support contact form - prevent spam
  supportContact: {
    limit: 5,
    windowSeconds: 3600, // 5 tickets per hour per user
    identifier: 'support-contact',
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

