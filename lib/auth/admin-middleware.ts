// Admin authentication middleware for API routes

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export type AdminRole = 'user' | 'superadmin'

export interface AdminAuthResult {
  userId: string
  role: AdminRole
  response?: NextResponse
}

/**
 * Middleware to require superadmin authentication for API routes
 * Returns userId, role, and optional error response
 *
 * @example
 * ```typescript
 * const { userId, role, response } = await requireSuperadmin(request)
 * if (response) return response // Return early if unauthorized
 *
 * // User is authenticated as superadmin, continue with logic
 * ```
 */
export async function requireSuperadmin(
  request: NextRequest
): Promise<AdminAuthResult> {
  // Use server-side client with user's session (cookies)
  const supabase = await createServerSupabaseClient()

  // Get authenticated user from session
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      userId: '',
      role: 'user',
      response: NextResponse.json(
        { success: false, error: 'Unauthorized - Authentication required' },
        { status: 401 }
      ),
    }
  }

  // Fetch user role from database
  const { data: userData, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !userData) {
    return {
      userId: user.id,
      role: 'user',
      response: NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      ),
    }
  }

  const role = userData.role as AdminRole

  // Check if user has superadmin permissions
  if (role !== 'superadmin') {
    return {
      userId: user.id,
      role,
      response: NextResponse.json(
        { success: false, error: 'Forbidden - Superadmin access required' },
        { status: 403 }
      ),
    }
  }

  return { userId: user.id, role }
}

/**
 * Check if user has superadmin role (client-side helper)
 *
 * @param role - User role string
 * @returns true if user is superadmin
 */
export function hasSuperadminAccess(role: string): boolean {
  return role === 'superadmin'
}

/**
 * Get request metadata for activity logging
 *
 * @param request - Next.js request object
 * @returns Object with IP address and user agent
 */
export function getRequestMetadata(request: NextRequest) {
  const ipAddress = request.ip ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  const userAgent = request.headers.get('user-agent') || 'unknown'

  return { ipAddress, userAgent }
}
