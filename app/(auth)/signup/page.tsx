'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUpWithEmail, signInWithGoogle } from '@/lib/auth/client-helpers'
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

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 6) {
      return 'Password must be at least 6 characters'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Basic validation
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Sign up with Supabase Auth
    const { user, error: authError } = await signUpWithEmail(email, password)

    if (authError) {
      setError(authError)
      setLoading(false)
      return
    }

    if (user) {
      // Wait for session to be fully established
      await new Promise(resolve => setTimeout(resolve, 500))

      // Database trigger automatically creates user profile
      // Redirect to library
      window.location.href = '/library'
    } else {
      // Email confirmation required
      setError('✅ Account created! Please check your email to confirm your account before signing in.')
      setLoading(false)
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  }

  const handleGoogleSignUp = async () => {
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
        // Create user profile in Firestore
        await createUserProfile(user, 'trial')
        // Redirect to story creation page
        router.push('/create')
      } catch (profileError) {
        console.error('Error creating user profile:', profileError)
        setError('Account created but profile setup failed. Please try logging in.')
        setLoading(false)
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-hero relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 text-5xl animate-float opacity-30">🎉</div>
      <div className="absolute top-40 right-20 text-5xl animate-float opacity-30" style={{ animationDelay: '1s' }}>⭐</div>
      <div className="absolute bottom-40 left-20 text-5xl animate-float opacity-30" style={{ animationDelay: '2s' }}>✨</div>
      <div className="absolute bottom-60 right-10 text-4xl animate-bounce-slow opacity-20">🎈</div>
      <div className="absolute top-1/2 left-20 text-4xl animate-bounce-slow opacity-20">🎨</div>

      <Card className="w-full max-w-md border-4 border-primary shadow-2xl bg-card backdrop-blur-sm relative z-10">
        <CardHeader className="space-y-2 bg-gradient-primary rounded-t-lg border-b-4 border-primary">
          <div className="flex justify-center mb-2">
            <div className="text-6xl animate-bounce-slow">🎉</div>
          </div>
          <CardTitle className="text-4xl font-comic text-gradient-primary text-center">
            Create Account!
          </CardTitle>
          <CardDescription className="text-center text-lg text-muted-foreground font-semibold">
            Sign up to start creating magical stories for your child! ✨
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
              <label htmlFor="email" className="text-base font-bold text-foreground flex items-center gap-2">
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
                className="rounded-xl text-lg py-3"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-base font-bold text-foreground flex items-center gap-2">
                <span className="text-xl">🔒</span>
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters 🔐"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                minLength={6}
                className="rounded-xl text-lg py-3"
              />
              <p className="text-sm text-muted-foreground font-semibold">
                Password must be at least 6 characters long
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-base font-bold text-foreground flex items-center gap-2">
                <span className="text-xl">✅</span>
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password 🔐"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
                minLength={6}
                className="rounded-xl text-lg py-3"
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-full bg-gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all font-bold text-lg py-6"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Creating account...
                </>
              ) : (
                <>
                  Sign Up! 🎉
                </>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t-2 border-border" />
            </div>
            <div className="relative flex justify-center text-sm font-bold">
              <span className="bg-card px-3 text-muted-foreground rounded-full border-2 border-border">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full font-bold text-lg py-6 shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
            onClick={handleGoogleSignUp}
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
            Sign up with Google 🔵
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 bg-gradient-secondary rounded-b-lg border-t-2 border-border">
          <div className="text-base text-center text-foreground font-semibold">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-primary hover:opacity-80 underline font-bold"
            >
              Sign in! 👋
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
