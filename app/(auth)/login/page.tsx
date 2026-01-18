'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signInWithEmail, signInWithGoogle } from '@/lib/auth/client-helpers'
import { createUserProfile } from '@/lib/auth/user-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FEATURES } from '@/lib/config/features'
import { ChevronDown } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)

  // Check for error in URL params (from OAuth callback)
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    const { user, error: authError } = await signInWithEmail(email, password)

    if (authError) {
      setError(authError)
      setLoading(false)
      return
    }

    if (user) {
      // Wait a moment for session to be fully established
      // This prevents middleware from redirecting back to login
      await new Promise(resolve => setTimeout(resolve, 500))

      // Use window.location.href for full page reload
      window.location.href = '/library'
    } else {
      setError('Login failed. Please try again.')
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)

    const { user, error: authError } = await signInWithGoogle()

    if (authError) {
      setError(authError)
      setLoading(false)
      return
    }

    if (user) {
      try {
        // Create or update user profile
        await createUserProfile(user, 'trial')
        router.push('/library')
      } catch (profileError) {
        console.error('Error creating user profile:', profileError)
        setError('Sign-in successful but profile setup failed. Please try again.')
        setLoading(false)
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 playwize-bg relative overflow-hidden selection:bg-playwize-purple selection:text-white">
      {/* Background Ornaments */}
      <div className="absolute top-40 -left-20 w-80 h-80 circle-pattern opacity-30" />
      <div className="absolute top-[60%] -right-20 w-96 h-96 circle-pattern opacity-30" />
      <div className="absolute bottom-[10%] left-[20%] w-[30%] h-[30%] blob-purple blur-3xl opacity-10"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="absolute -inset-4 bg-playwize-purple rounded-[4rem] rotate-1 opacity-5" />
        <Card className="relative border-4 border-gray-100 shadow-2xl bg-white rounded-[3rem] overflow-hidden">
          <div className="h-4 bg-playwize-purple w-full" />
          <CardHeader className="space-y-4 px-10 pt-10 pb-6">
            <div className="flex justify-center mb-2">
              <div className="h-20 w-20 rounded-[2rem] bg-purple-50 flex items-center justify-center text-5xl animate-bounce-slow">
                👋
              </div>
            </div>
            <CardTitle className="text-4xl font-black text-gray-900 text-center tracking-tight">
              Welcome <span className="text-playwize-purple">Back!</span>
            </CardTitle>
            <CardDescription className="text-center text-lg text-gray-500 font-bold leading-relaxed">
              Sign in to your account to continue creating magical stories! ✨
            </CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-8">
            {error && (
              <div className="p-5 text-sm text-red-700 bg-red-50 border-2 border-red-200 rounded-[2rem] font-black flex items-center gap-3 mb-6">
                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shrink-0">⚠️</div>
                {error}
              </div>
            )}

            {FEATURES.GOOGLE_AUTH_ENABLED && (
              <Button
                type="button"
                className="w-full h-16 rounded-full bg-white border-2 border-gray-200 font-black text-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-3 shadow-sm"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
            )}

            <button
              type="button"
              onClick={() => setShowEmailForm(!showEmailForm)}
              className="relative w-full my-8 group cursor-pointer"
            >
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t-2 border-gray-100 group-hover:border-gray-200 transition-colors" />
              </div>
              <div className="relative flex justify-center text-xs font-black uppercase tracking-widest">
                <span className="bg-white px-4 text-gray-400 group-hover:text-gray-600 transition-colors flex items-center gap-2">
                  Or sign in with email
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showEmailForm ? 'rotate-180' : ''}`} />
                </span>
              </div>
            </button>

            {showEmailForm && (
              <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-3">
                  <label htmlFor="email" className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <span>📧 Email Address</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    className="rounded-2xl text-lg h-14 border-2 border-gray-100 focus:border-playwize-purple bg-gray-50/50 font-bold transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <span>🔒 Password</span>
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-bold text-playwize-purple hover:underline"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="rounded-2xl text-lg h-14 border-2 border-gray-100 focus:border-playwize-purple bg-gray-50/50 font-bold transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-16 rounded-full bg-playwize-purple hover:bg-purple-700 text-white font-black text-xl shadow-xl shadow-purple-100 transition-all hover:scale-[1.02] active:scale-95"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin text-2xl">⏳</span>
                      SIGNING IN...
                    </span>
                  ) : (
                    "SIGN IN! 🚀"
                  )}
                </Button>
              </form>
            )}

            <div className="mt-8 pt-8 border-t-2 border-gray-100 text-center">
              <p className="text-gray-500 font-bold">
                Don't have an account?{' '}
                <Link
                  href="/signup"
                  className="text-playwize-purple hover:underline font-black"
                >
                  SIGN UP! 🎉
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
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
      <LoginForm />
    </Suspense>
  )
}
