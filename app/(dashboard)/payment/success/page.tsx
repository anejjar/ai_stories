'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Sparkles, Crown } from 'lucide-react'
import Link from 'next/link'

import { Suspense } from 'react'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [upgradeTier, setUpgradeTier] = useState<'pro' | 'family' | null>(null)

  useEffect(() => {
    // In a real app, you'd verify the session_id with Stripe
    // For now, we'll just show a success message
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      // You could fetch session details to determine tier
      // For MVP, we'll just show a generic success
    }
  }, [searchParams])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-blue-50 relative overflow-hidden flex items-center justify-center p-4">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 text-5xl animate-float opacity-30">🎉</div>
        <div className="absolute top-40 right-20 text-5xl animate-float opacity-30" style={{ animationDelay: '1s' }}>✨</div>
        <div className="absolute bottom-40 left-20 text-5xl animate-float opacity-30" style={{ animationDelay: '2s' }}>⭐</div>
        <div className="absolute bottom-60 right-10 text-4xl animate-bounce-slow opacity-20">👑</div>

        <div className="container mx-auto max-w-2xl relative z-10">
          <Card className="border-4 border-green-300 shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl">
            <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-t-2xl border-b-4 border-green-200 text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl animate-bounce-slow">
                    <CheckCircle className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 text-4xl animate-wiggle">🎉</div>
                  <div className="absolute -bottom-2 -left-2 text-4xl animate-wiggle" style={{ animationDelay: '0.5s' }}>✨</div>
                </div>
              </div>
              <CardTitle className="text-5xl font-comic bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Payment Successful! 🎊
              </CardTitle>
              <CardDescription className="text-xl text-gray-700 mt-3 font-semibold">
                Thank you for your subscription! 💝
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              <div className="text-center space-y-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-4 border-blue-200">
                <p className="text-lg text-gray-800 font-bold">
                  🚀 Your subscription has been activated!
                </p>
                <p className="text-gray-700 font-semibold">
                  You now have access to all premium features! Start creating unlimited magical stories! ✨
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/create" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all font-bold text-lg px-8 py-6">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Create Your First Story! 🎨
                  </Button>
                </Link>
                <Link href="/library" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full rounded-full border-2 border-purple-400 hover:bg-purple-100 font-bold text-lg px-8 py-6">
                    View Library 📚
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}

