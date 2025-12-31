'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updatePassword } from '@/lib/auth/client-helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
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
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      setError(passwordError)
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const { error: updateError } = await updatePassword(newPassword)

    if (updateError) {
      setError(updateError)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)

    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 playwize-bg relative overflow-hidden selection:bg-playwize-purple selection:text-white">
        {/* Background Ornaments */}
        <div className="absolute top-40 -left-20 w-80 h-80 circle-pattern opacity-30" />
        <div className="absolute top-[60%] -right-20 w-96 h-96 circle-pattern opacity-30" />
        <div className="absolute bottom-[10%] left-[20%] w-[30%] h-[30%] blob-purple blur-3xl opacity-10"></div>

        <div className="relative z-10 w-full max-w-md">
          <div className="absolute -inset-4 bg-green-500 rounded-[4rem] rotate-1 opacity-5" />
          <Card className="relative border-4 border-gray-100 shadow-2xl bg-white rounded-[3rem] overflow-hidden">
            <div className="h-4 bg-green-500 w-full" />
            <CardHeader className="space-y-4 px-10 pt-10 pb-6 text-center">
              <div className="flex justify-center mb-2">
                <div className="h-20 w-20 rounded-[2rem] bg-green-50 flex items-center justify-center text-5xl">
                  ✅
                </div>
              </div>
              <CardTitle className="text-4xl font-black text-gray-900 tracking-tight">
                Password <span className="text-green-600">Updated!</span>
              </CardTitle>
              <CardDescription className="text-center text-lg text-gray-600 font-medium leading-relaxed">
                Your password has been successfully reset. Redirecting to login...
              </CardDescription>
            </CardHeader>
            <CardContent className="px-10 pb-10">
              <Link href="/login">
                <Button
                  className="w-full h-16 rounded-full bg-green-600 hover:bg-green-700 text-white font-black text-xl shadow-xl shadow-green-100 transition-all"
                >
                  GO TO LOGIN
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
                🔐
              </div>
            </div>
            <CardTitle className="text-4xl font-black text-gray-900 text-center tracking-tight">
              Reset <span className="text-playwize-purple">Password</span>
            </CardTitle>
            <CardDescription className="text-center text-lg text-gray-500 font-bold leading-relaxed">
              Enter your new password below.
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
                <label htmlFor="newPassword" className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <span>🔒 New Password</span>
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="rounded-2xl text-lg h-14 border-2 border-gray-100 focus:border-playwize-purple bg-gray-50/50 font-bold transition-all"
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="confirmPassword" className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <span>✅ Confirm Password</span>
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                    UPDATING...
                  </span>
                ) : (
                  "RESET PASSWORD! 🔐"
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
