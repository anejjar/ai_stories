'use client'

import { ProtectedRoute } from '@/components/auth/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PaymentCancelPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 relative overflow-hidden flex items-center justify-center p-4">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 text-5xl animate-float opacity-30">😊</div>
        <div className="absolute top-40 right-20 text-5xl animate-float opacity-30" style={{ animationDelay: '1s' }}>✨</div>
        <div className="absolute bottom-40 left-20 text-4xl animate-bounce-slow opacity-20">📚</div>
        
        <div className="container mx-auto max-w-2xl relative z-10">
          <Card className="border-4 border-orange-300 shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl">
            <CardHeader className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-t-2xl border-b-4 border-orange-200 text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center shadow-xl animate-bounce-slow">
                    <XCircle className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 text-4xl animate-wiggle">😊</div>
                </div>
              </div>
              <CardTitle className="text-4xl font-comic bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                Payment Cancelled
              </CardTitle>
              <CardDescription className="text-xl text-gray-700 mt-3 font-semibold">
                No charges were made 💳
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              <div className="text-center space-y-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-4 border-blue-200">
                <p className="text-lg text-gray-800 font-bold">
                  No worries! 😊
                </p>
                <p className="text-gray-700 font-semibold">
                  Your payment was cancelled. You can continue using the free trial or try again later! ✨
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/library" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all font-bold text-lg px-8 py-6">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Library 📚
                  </Button>
                </Link>
                <Link href="/create" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full rounded-full border-2 border-pink-400 hover:bg-pink-100 font-bold text-lg px-8 py-6">
                    Create Story 🎨
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

