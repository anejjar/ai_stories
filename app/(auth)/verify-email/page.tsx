'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw, Mail, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isEmailVerified, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    // Get email from URL params or from user object
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    } else if (user?.email) {
      setEmail(user.email)
    }
  }, [searchParams, user])

  // If email is verified, redirect to library
  useEffect(() => {
    if (!authLoading && isEmailVerified) {
      router.push('/library')
    }
  }, [isEmailVerified, authLoading, router])

  const handleResendVerification = async () => {
    if (!email) return

    setResending(true)
    setResendSuccess(false)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) throw error
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 5000)
    } catch (error) {
      console.error('Failed to resend verification email:', error)
    } finally {
      setResending(false)
    }
  }

  const handleCheckVerification = async () => {
    setChecking(true)
    try {
      // Refresh the session to check if email was verified
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.email_confirmed_at) {
        router.push('/library')
      } else {
        // Force a refresh of auth state
        await supabase.auth.refreshSession()
        // Check again after a moment
        setTimeout(() => {
          const { data: { session: newSession } } = supabase.auth.getSession()
          if (newSession?.user?.email_confirmed_at) {
            router.push('/library')
          }
        }, 1000)
      }
    } catch (error) {
      console.error('Error checking verification:', error)
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 playwize-bg relative overflow-hidden selection:bg-playwize-purple selection:text-white">
      {/* Background Ornaments */}
      <div className="absolute top-40 -left-20 w-80 h-80 circle-pattern opacity-30" />
      <div className="absolute top-[60%] -right-20 w-96 h-96 circle-pattern opacity-30" />
      <div className="absolute bottom-[10%] left-[20%] w-[30%] h-[30%] blob-purple blur-3xl opacity-10"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="absolute -inset-4 bg-playwize-orange rounded-[4rem] rotate-1 opacity-5" />
        <Card className="relative border-4 border-gray-100 shadow-2xl bg-white rounded-[3rem] overflow-hidden">
          <div className="h-4 bg-playwize-orange w-full" />
          <CardHeader className="space-y-4 px-10 pt-10 pb-6 text-center">
            <div className="flex justify-center mb-2">
              <div className="h-20 w-20 rounded-[2rem] bg-orange-50 flex items-center justify-center text-5xl">
                <Mail className="h-10 w-10 text-playwize-orange" />
              </div>
            </div>
            <CardTitle className="text-4xl font-black text-gray-900 tracking-tight">
              Verify Your <span className="text-playwize-orange">Email</span>
            </CardTitle>
            <CardDescription className="text-center text-lg text-gray-600 font-medium leading-relaxed">
              Please verify your email address to continue using AI Stories
            </CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-10 space-y-6">
            <div className="p-6 bg-orange-50 border-2 border-orange-100 rounded-[2rem]">
              <p className="text-gray-700 font-medium text-center mb-2">
                We sent a verification link to:
              </p>
              <p className="font-black text-playwize-orange text-center text-lg">
                {email || 'your email address'}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-gray-600 text-sm font-medium text-center">
                Check your inbox and click the verification link to get started!
              </p>
              <p className="text-gray-500 text-xs text-center">
                Don't forget to check your spam folder if you don't see it.
              </p>
            </div>

            {resendSuccess && (
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-[2rem] text-center">
                <p className="text-green-700 font-bold text-sm flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Verification email sent! Check your inbox.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleResendVerification}
                disabled={resending || !email}
                variant="outline"
                className="w-full h-14 rounded-full border-2 border-gray-100 font-bold text-base hover:bg-gray-50 transition-all"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </Button>

              <Button
                onClick={handleCheckVerification}
                disabled={checking}
                className="w-full h-14 rounded-full bg-playwize-purple hover:bg-purple-700 text-white font-black text-base transition-all"
              >
                {checking ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Checking...
                  </span>
                ) : (
                  'I\'ve Verified My Email'
                )}
              </Button>
            </div>

            <div className="pt-4 border-t-2 border-gray-100 text-center">
              <p className="text-gray-500 font-bold text-sm">
                Already verified?{' '}
                <Link
                  href="/login"
                  className="text-playwize-orange hover:underline font-black"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-4 playwize-bg relative overflow-hidden selection:bg-playwize-purple selection:text-white">
        <div className="relative z-10 w-full max-w-md">
          <div className="text-center">
            <div className="animate-spin text-6xl mb-4">⏳</div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
