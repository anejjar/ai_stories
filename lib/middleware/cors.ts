/**
 * CORS Middleware
 * Provides CORS headers for API routes
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean) as string[]

/**
 * Get CORS headers for a request
 */
export function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin')
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.startsWith(allowed.replace('https://', 'http://localhost:'))
  )

  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : ALLOWED_ORIGINS[0] || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  }
}

/**
 * Handle OPTIONS request for CORS preflight
 */
export function handleCorsPreflight(request: NextRequest): NextResponse | null {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: getCorsHeaders(request),
    })
  }
  return null
}

/**
 * Add CORS headers to a response
 */
export function addCorsHeaders(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const headers = getCorsHeaders(request)
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}
