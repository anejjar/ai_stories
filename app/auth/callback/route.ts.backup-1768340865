import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type') // 'signup' or 'recovery' etc.
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/library'

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
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}

