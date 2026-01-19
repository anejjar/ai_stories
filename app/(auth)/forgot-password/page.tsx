'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { sendPasswordResetEmail } from '@/lib/auth/client-helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Basic validation
    if (!email) {
      setError('Please enter your email address')
      setLoading(false)
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    const { error: resetError } = await sendPasswordResetEmail(email)

    if (resetError) {
      setError(resetError)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
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
            <CardHeader className="space-y-4 px-10 pt-10 pb-6 text-center">
              <div className="flex justify-center mb-2">
                <div className="h-20 w-20 rounded-[2rem] bg-purple-50 flex items-center justify-center text-5xl">
                  ✉️
                </div>
              </div>
              <CardTitle className="text-4xl font-black text-gray-900 tracking-tight">
                Check Your <span className="text-playwize-purple">Email!</span>
              </CardTitle>
              <CardDescription className="text-center text-lg text-gray-600 font-medium leading-relaxed">
                We've sent password reset instructions to your email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-10 pb-10 space-y-6">
              <div className="p-6 bg-purple-50 border-2 border-purple-100 rounded-[2rem]">
                <p className="text-gray-700 font-medium text-center">
                  Check your inbox at:<br />
                  <span className="font-black text-playwize-purple">{email}</span>
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-gray-600 text-sm font-medium text-center">
                  Click the link in the email to reset your password.
                </p>
                <p className="text-gray-500 text-xs text-center">
                  Don't forget to check your spam folder!
                </p>
              </div>

              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full h-14 rounded-full border-2 border-gray-100 font-bold text-base hover:bg-gray-50 transition-all"
                >
                  Back to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
              <div className="h-20 w-20 rounded-[2rem] bg-purple-50 flex items-center justify-center text-5xl">
                🔑
              </div>
            </div>
            <CardTitle className="text-4xl font-black text-gray-900 text-center tracking-tight">
              Forgot <span className="text-playwize-purple">Password?</span>
            </CardTitle>
            <CardDescription className="text-center text-lg text-gray-500 font-bold leading-relaxed">
              No worries! Enter your email and we'll send you reset instructions.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-5 text-sm text-red-700 bg-red-50 border-2 border-red-200 rounded-[2rem] font-black flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shrink-0">⚠️</div>
                  {error}
                </div>
              )}

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

              <Button
                type="submit"
                className="w-full h-16 rounded-full bg-playwize-purple hover:bg-purple-700 text-white font-black text-xl shadow-xl shadow-purple-100 transition-all hover:scale-[1.02] active:scale-95"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin text-2xl">⏳</span>
                    SENDING...
                  </span>
                ) : (
                  "SEND RESET LINK! 📧"
                )}
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t-2 border-gray-100 text-center">
              <p className="text-gray-500 font-bold">
                Remember your password?{' '}
                <Link
                  href="/login"
                  className="text-playwize-purple hover:underline font-black"
                >
                  SIGN IN! 👋
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
