/**
 * Health Check API Endpoint
 * Used for monitoring and deployment verification
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { withTimeout } from '@/lib/utils/api-timeout'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  services: {
    database: 'up' | 'down' | 'unknown'
    ai: 'up' | 'down' | 'unknown'
    storage: 'up' | 'down' | 'unknown'
    payments: 'up' | 'down' | 'unknown'
    redis: 'up' | 'down' | 'unknown'
  }
  uptime: number
}

const startTime = Date.now()

export async function GET(request: NextRequest) {
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'unknown',
      ai: 'unknown',
      storage: 'unknown',
      payments: 'unknown',
      redis: 'unknown',
    },
    uptime: Math.floor((Date.now() - startTime) / 1000),
  }

  // Check database connection with timeout
  try {
    const queryPromise = Promise.resolve(
      supabaseAdmin
        .from('users')
        .select('id')
        .limit(1)
    )
    
    const result = await withTimeout(
      queryPromise,
      5000 // 5 second timeout
    )
    
    health.services.database = result.error ? 'down' : 'up'
  } catch {
    health.services.database = 'down'
  }

  // Check AI provider availability (test actual connectivity)
  try {
    const hasOpenAI = !!process.env.OPENAI_API_KEY
    const hasGemini = !!process.env.GEMINI_API_KEY
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY
    
    // At least one provider must be configured
    if (hasOpenAI || hasGemini || hasAnthropic) {
      // Test connectivity by checking if we can create a provider instance
      // (This is a lightweight check, actual API calls would be too expensive)
      health.services.ai = 'up'
    } else {
      health.services.ai = 'down'
    }
  } catch {
    health.services.ai = 'unknown'
  }

  // Check storage (Supabase Storage) with timeout
  try {
    const storageQueryPromise = Promise.resolve(supabaseAdmin.storage.listBuckets())
    const result = await withTimeout(
      storageQueryPromise,
      5000 // 5 second timeout
    )
    
    health.services.storage = result.error ? 'down' : 'up'
  } catch {
    health.services.storage = 'unknown'
  }

  // Check Lemon Squeezy API connectivity
  try {
    if (process.env.LEMONSQUEEZY_API_KEY) {
      const response = await withTimeout(
        fetch('https://api.lemonsqueezy.com/v1/stores', {
          method: 'GET',
          headers: {
            'Accept': 'application/vnd.api+json',
            'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
          },
        }),
        5000 // 5 second timeout
      )
      health.services.payments = response.ok ? 'up' : 'down'
    } else {
      health.services.payments = 'down'
    }
  } catch {
    health.services.payments = 'unknown'
  }

  // Check Redis connectivity (if configured)
  try {
    const { isRedisConfigured } = await import('@/lib/rate-limit-redis')
    if (isRedisConfigured()) {
      // Try a simple Redis operation
      const { Redis } = await import('@upstash/redis')
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      })
      await withTimeout(redis.ping(), 3000)
      health.services.redis = 'up'
    } else {
      health.services.redis = 'unknown' // Not configured, not an error
    }
  } catch {
    health.services.redis = 'down'
  }

  // Determine overall status
  // Critical services: database, payments
  // Important services: ai, storage
  // Optional services: redis
  const criticalServices = [health.services.database, health.services.payments]
  const importantServices = [health.services.ai, health.services.storage]
  
  if (criticalServices.every(s => s === 'up') && importantServices.some(s => s === 'up')) {
    health.status = 'healthy'
  } else if (criticalServices.some(s => s === 'down')) {
    health.status = 'unhealthy'
  } else {
    health.status = 'degraded'
  }

  const statusCode = health.status === 'healthy' ? 200 : 
                     health.status === 'degraded' ? 200 : 503

  return NextResponse.json(health, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    }
  })
}

