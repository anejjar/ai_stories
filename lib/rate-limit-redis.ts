/**
 * Redis-based Rate Limiter using Upstash Redis
 * Production-ready rate limiting with persistence across server restarts
 */

import { Redis } from '@upstash/redis'

// Initialize Redis client (lazy initialization)
let redis: Redis | null = null

function getRedisClient(): Redis {
  if (redis) {
    return redis
  }

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    throw new Error(
      'Redis not configured. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.'
    )
  }

  redis = new Redis({
    url,
    token,
  })

  return redis
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
 * Check if a request should be rate limited using Redis
 * Uses sliding window log algorithm for accurate rate limiting
 *
 * @param key - Unique identifier for the client (e.g., userId, IP)
 * @param config - Rate limit configuration
 * @returns RateLimitResult with success status and metadata
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  try {
    const client = getRedisClient()
    const { limit, windowSeconds, identifier = 'default' } = config
    const now = Date.now()
    const windowMs = windowSeconds * 1000
    const storeKey = `ratelimit:${identifier}:${key}`

    // Use Redis pipeline for atomic operations
    const pipeline = client.pipeline()

    // Remove old entries outside the window
    pipeline.zremrangebyscore(storeKey, 0, now - windowMs)

    // Count entries in current window
    pipeline.zcard(storeKey)

    // Add current request timestamp
    pipeline.zadd(storeKey, { score: now, member: `${now}-${Math.random()}` })

    // Set expiry on the key
    pipeline.expire(storeKey, windowSeconds * 2) // 2x window for cleanup

    const results = await pipeline.exec()

    // Extract count (index 1 in results)
    const count = (results[1] as number) || 0

    // Check if over limit (count includes current request)
    if (count >= limit) {
      return {
        success: false,
        remaining: 0,
        resetIn: windowSeconds,
        limit,
      }
    }

    return {
      success: true,
      remaining: limit - count - 1,
      resetIn: windowSeconds,
      limit,
    }
  } catch (error) {
    console.error('Rate limit check failed:', error)

    // Fail open in case of Redis errors to prevent blocking all requests
    // Log the error for monitoring but allow the request through
    console.warn('Rate limiting failed, allowing request through')

    return {
      success: true,
      remaining: config.limit - 1,
      resetIn: config.windowSeconds,
      limit: config.limit,
    }
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

/**
 * Check if Redis is configured
 */
export function isRedisConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}
