'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-pink-100 via-yellow-100 to-blue-100 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 text-5xl animate-float opacity-30">👋</div>
      <div className="absolute top-40 right-20 text-5xl animate-float opacity-30" style={{ animationDelay: '1s' }}>⭐</div>
      <div className="absolute bottom-40 left-20 text-5xl animate-float opacity-30" style={{ animationDelay: '2s' }}>✨</div>
      <div className="absolute bottom-60 right-10 text-4xl animate-bounce-slow opacity-20">🎈</div>

      <Card className="w-full max-w-md border-4 border-pink-300 shadow-2xl bg-white/95 backdrop-blur-sm relative z-10">
        <CardHeader className="space-y-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-t-lg border-b-4 border-pink-200">
          <div className="flex justify-center mb-2">
            <div className="text-6xl animate-bounce-slow">👋</div>
          </div>
          <CardTitle className="text-4xl font-comic bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent text-center">
            Welcome Back!
          </CardTitle>
          <CardDescription className="text-center text-lg text-gray-700 font-semibold">
            Sign in to your account to continue creating magical stories! ✨
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-100 border-2 border-red-300 rounded-2xl font-bold">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-base font-bold text-gray-700 flex items-center gap-2">
                <span className="text-xl">📧</span>
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com ✨"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="rounded-xl border-2 border-pink-300 focus:border-pink-500 text-lg py-3"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-base font-bold text-gray-700 flex items-center gap-2">
                <span className="text-xl">🔒</span>
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password 🔐"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="rounded-xl border-2 border-purple-300 focus:border-purple-500 text-lg py-3"
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all font-bold text-lg py-6"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In! 🚀
                </>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t-2 border-pink-300" />
            </div>
            <div className="relative flex justify-center text-sm font-bold">
              <span className="bg-white px-3 text-gray-600 rounded-full border-2 border-pink-200">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full border-2 border-blue-400 hover:bg-blue-50 font-bold text-lg py-6 shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
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
            Sign in with Google 🔵
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-b-lg border-t-2 border-blue-200">
          <div className="text-base text-center text-gray-700 font-semibold">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="text-pink-600 hover:text-pink-700 underline font-bold"
            >
              Sign up! 🎉
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
