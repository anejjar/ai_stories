import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const { searchParams } = requestUrl
  const code = searchParams.get('code')
  const type = searchParams.get('type') // 'signup' or 'recovery' etc.
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/library'

  // Get the production URL from environment variable
  // This MUST be set in your production environment (Vercel/Dokploy/Docker)
  const productionUrl = process.env.NEXT_PUBLIC_APP_URL

  // Get the redirect_to parameter from Supabase callback
  const redirectTo = searchParams.get('redirect_to')

  // Determine the base URL for redirects
  let origin: string

  // Priority 1: Use production URL if set
  if (productionUrl && !productionUrl.includes('localhost') && !productionUrl.includes('0.0.0.0')) {
    origin = productionUrl
  }
  // Priority 2: Use redirect_to if it looks like a valid production URL
  else if (redirectTo && !redirectTo.includes('localhost') && !redirectTo.includes('0.0.0.0') && !redirectTo.includes(':3000')) {
    try {
      const redirectUrl = new URL(redirectTo)
      origin = redirectUrl.origin
    } catch {
      origin = 'https://tales.anejjar.com' // Fallback to production domain
    }
  }
  // Priority 3: Check X-Forwarded-Host header (for reverse proxies)
  else if (request.headers.get('x-forwarded-host')) {
    const forwardedHost = request.headers.get('x-forwarded-host')
    const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
    origin = `${forwardedProto}://${forwardedHost}`
  }
  // Priority 4: Check Host header
  else if (request.headers.get('host') && !request.headers.get('host')?.includes('localhost')) {
    const host = request.headers.get('host')
    // If host doesn't look like a domain (e.g., Docker container ID), use fallback
    if (host && !host.match(/^[a-f0-9]{12}/) && host.includes('.')) {
      const proto = request.headers.get('x-forwarded-proto') || 'https'
      origin = `${proto}://${host}`
    } else {
      origin = 'https://tales.anejjar.com' // Fallback to production domain
    }
  }
  // Final fallback: Use production domain
  else {
    origin = 'https://tales.anejjar.com'
  }

  // Log for debugging (remove in production if needed)
  console.log('Auth callback redirect determination:', {
    productionUrl,
    redirectTo,
    forwardedHost: request.headers.get('x-forwarded-host'),
    host: request.headers.get('host'),
    finalOrigin: origin
  })

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    // Log detailed error information for debugging
    if (error) {
      console.error('Auth callback error:', {
        error: error.message,
        code: error.name,
        status: error.status,
        type,
        timestamp: new Date().toISOString()
      })
    }

    // Check if this is a Google OAuth login
    if (!error && data?.user) {
      const isGoogleUser = data.user.app_metadata?.provider === 'google'

      if (isGoogleUser) {
        // Sign out the user immediately
        await supabase.auth.signOut()

        // Redirect to login with error message
        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent('Google sign-in is currently disabled. Please use email/password to sign in.')}`
        )
      }

      // Check if this is email verification
      // If email_confirmed_at exists and type is 'signup', it's likely a new verification
      // We'll let the API route check if welcome email was already sent to avoid duplicates
      const isEmailVerification = type === 'signup' && data.user.email_confirmed_at

      if (isEmailVerification && data.user.email) {
        // Send welcome email asynchronously (don't wait for it)
        // Use fetch to call our API route - it will check if already sent
        fetch(`${origin}/api/auth/send-welcome-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: data.user.id,
            email: data.user.email,
          }),
        }).catch((err) => {
          // Log error but don't block the redirect
          console.error('Failed to send welcome email:', err)
        })
      }
    }

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    // Handle specific error cases with better messages
    let errorMessage = 'Could not authenticate user'

    if (error) {
      if (error.message?.includes('expired')) {
        errorMessage = 'Verification link has expired. Please request a new one.'
      } else if (error.message?.includes('already been used') || error.message?.includes('invalid')) {
        errorMessage = 'This verification link has already been used or is invalid. Please check your email for the latest link.'
      } else if (error.message?.includes('not found')) {
        errorMessage = 'Verification link is invalid. Please sign up again.'
      } else {
        // Include the actual error for debugging
        errorMessage = `Authentication failed: ${error.message}`
      }
    }

    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMessage)}`)
  }

  // No code parameter provided
  console.error('Auth callback called without code parameter', {
    searchParams: Object.fromEntries(searchParams.entries()),
    timestamp: new Date().toISOString()
  })

  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Invalid authentication link. Please try signing in again.')}`)
}
