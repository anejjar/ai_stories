/**
 * CSRF Protection Middleware
 * Provides CSRF token generation and validation
 */

import { cookies } from 'next/headers'
import crypto from 'crypto'

const CSRF_TOKEN_COOKIE = 'csrf-token'
const CSRF_TOKEN_HEADER = 'x-csrf-token'
const CSRF_TOKEN_EXPIRY = 60 * 60 * 24 // 24 hours

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Get or create CSRF token for the current session
 */
export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies()
  let token = cookieStore.get(CSRF_TOKEN_COOKIE)?.value

  if (!token) {
    token = generateCsrfToken()
    cookieStore.set(CSRF_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: CSRF_TOKEN_EXPIRY,
      path: '/',
    })
  }

  return token
}

/**
 * Validate CSRF token from request
 */
export async function validateCsrfToken(request: Request): Promise<boolean> {
  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(CSRF_TOKEN_COOKIE)?.value
  const headerToken = request.headers.get(CSRF_TOKEN_HEADER)

  if (!cookieToken || !headerToken) {
    return false
  }

  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(cookieToken),
    Buffer.from(headerToken)
  )
}

/**
 * CSRF protection middleware for API routes
 * Use this for state-changing operations (POST, PUT, DELETE, PATCH)
 */
export async function requireCsrfToken(request: Request): Promise<{ valid: boolean; error?: string }> {
  // Skip CSRF check for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return { valid: true }
  }

  // Skip CSRF check for webhook endpoints (they use signature verification instead)
  const url = new URL(request.url)
  if (url.pathname.includes('/webhook')) {
    return { valid: true }
  }

  const isValid = await validateCsrfToken(request)
  
  if (!isValid) {
    return {
      valid: false,
      error: 'Invalid or missing CSRF token',
    }
  }

  return { valid: true }
}
