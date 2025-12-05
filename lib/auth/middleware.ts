// Authentication middleware for API routes

import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from './helpers'

export interface AuthenticatedRequest extends NextRequest {
  userId: string
}

/**
 * Middleware to require authentication for API routes
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ userId: string; response?: NextResponse }> {
  const userId = await getUserIdFromRequest(request.headers)

  if (!userId) {
    return {
      userId: '',
      response: NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      ),
    }
  }

  return { userId }
}

/**
 * Middleware to optionally get user ID (doesn't fail if not authenticated)
 */
export async function optionalAuth(
  request: NextRequest
): Promise<string | null> {
  return getUserIdFromRequest(request.headers)
}

