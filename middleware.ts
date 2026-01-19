import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { handleCorsPreflight, addCorsHeaders } from '@/lib/middleware/cors'
// Note: Environment validation and graceful shutdown are not imported here
// because middleware runs in Edge Runtime which doesn't support Node.js APIs

/**
 * App middleware for authentication and session management
 */
export async function middleware(request: NextRequest) {
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflight(request)
  if (corsResponse) {
    return corsResponse
  }

  // Skip middleware for webhook endpoints - they handle their own auth
  if (request.nextUrl.pathname.startsWith('/api/webhooks/')) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Add CORS headers to all responses
  response = addCorsHeaders(request, response)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Define public routes
  // Note: Route groups like (public), (auth), (dashboard), (admin) don't affect URLs
  const isPublicRoute =
    request.nextUrl.pathname === '/' ||
    // Auth routes - (auth) group
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup') ||
    request.nextUrl.pathname.startsWith('/forgot-password') ||
    request.nextUrl.pathname.startsWith('/verify-email') ||
    // Auth callbacks - kept at /auth/* for Supabase compatibility
    request.nextUrl.pathname.startsWith('/auth/callback') ||
    request.nextUrl.pathname.startsWith('/auth/reset-password') ||
    // Public marketing pages - (public) group
    request.nextUrl.pathname.startsWith('/about') ||
    request.nextUrl.pathname.startsWith('/blog') ||
    request.nextUrl.pathname.startsWith('/contact') ||
    request.nextUrl.pathname.startsWith('/features') ||
    request.nextUrl.pathname.startsWith('/how-it-works') ||
    request.nextUrl.pathname.startsWith('/pricing') ||
    request.nextUrl.pathname.startsWith('/privacy') ||
    request.nextUrl.pathname.startsWith('/story-examples') ||
    request.nextUrl.pathname.startsWith('/support') ||
    request.nextUrl.pathname.startsWith('/terms') ||
    // SEO files
    request.nextUrl.pathname === '/sitemap.xml' ||
    request.nextUrl.pathname === '/robots.txt' ||
    // Public access to dashboard features (for sharing)
    request.nextUrl.pathname.startsWith('/discover') ||
    request.nextUrl.pathname.startsWith('/story/') ||
    // API routes
    request.nextUrl.pathname.startsWith('/api/')

  // Check if accessing admin routes
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

  // If the user is not logged in and trying to access a protected route,
  // redirect them to the login page
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // Optionally preserve the original URL to redirect back after login
    url.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Check email verification for protected routes (except auth callback which handles verification)
  if (user && !isPublicRoute && !request.nextUrl.pathname.startsWith('/auth/callback')) {
    // Check if email is verified
    const isEmailVerified = !!user.email_confirmed_at
    
    if (!isEmailVerified) {
      // Redirect to verification page
      const url = request.nextUrl.clone()
      url.pathname = '/verify-email'
      if (user.email) {
        url.searchParams.set('email', user.email)
      }
      return NextResponse.redirect(url)
    }
  }

  // If the user is logged in and trying to access login/signup,
  // redirect them to the dashboard (or their intended destination)
  if (user && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup'))) {
    const url = request.nextUrl.clone()
    // Check if there's a redirectedFrom parameter (from email links or previous redirect)
    const redirectedFrom = request.nextUrl.searchParams.get('redirectedFrom')
    url.pathname = redirectedFrom || '/dashboard'
    url.searchParams.delete('redirectedFrom') // Clean up the URL
    return NextResponse.redirect(url)
  }

  // Check admin access for admin routes
  if (isAdminRoute && user) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || userData.role !== 'superadmin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      url.searchParams.set('error', 'admin_access_required')
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, etc.)
     * - api/webhooks (webhook endpoints handle their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
