/**
 * Health Check API Endpoint
 * Used for monitoring and deployment verification
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  services: {
    database: 'up' | 'down' | 'unknown'
    ai: 'up' | 'down' | 'unknown'
    storage: 'up' | 'down' | 'unknown'
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
    },
    uptime: Math.floor((Date.now() - startTime) / 1000),
  }

  // Check database connection
  try {
    const { error } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1)
    
    health.services.database = error ? 'down' : 'up'
  } catch {
    health.services.database = 'down'
  }

  // Check AI provider availability
  try {
    const hasOpenAI = !!process.env.OPENAI_API_KEY
    const hasGemini = !!process.env.GEMINI_API_KEY
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY
    
    health.services.ai = (hasOpenAI || hasGemini || hasAnthropic) ? 'up' : 'down'
  } catch {
    health.services.ai = 'unknown'
  }

  // Check storage (Supabase Storage)
  try {
    const { error } = await supabaseAdmin
      .storage
      .listBuckets()
    
    health.services.storage = error ? 'down' : 'up'
  } catch {
    health.services.storage = 'unknown'
  }

  // Determine overall status
  const serviceValues = Object.values(health.services)
  if (serviceValues.every(s => s === 'up')) {
    health.status = 'healthy'
  } else if (serviceValues.some(s => s === 'down')) {
    health.status = health.services.database === 'down' ? 'unhealthy' : 'degraded'
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

