import { NextResponse, type NextRequest } from 'next/server'

/**
 * Pre-launch middleware
 * Only the root landing page (/) is accessible; all other matched routes
 * are redirected back to the waitlist page.
 * API routes and static assets are excluded via the matcher config.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/' || pathname === '') {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = '/'
  url.search = ''
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, etc.)
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
}
