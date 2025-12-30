'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/browser'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Page error:', error)
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-yellow-50 to-blue-50 flex items-center justify-center p-8">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 text-6xl animate-float opacity-20">😅</div>
      <div className="absolute bottom-20 left-10 text-6xl animate-float opacity-20" style={{ animationDelay: '1s' }}>🔧</div>

      <Card className="max-w-lg w-full border-4 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-200 to-yellow-200 flex items-center justify-center shadow-lg">
            <AlertTriangle className="h-12 w-12 text-orange-500" />
          </div>
          <CardTitle className="text-3xl font-bold font-comic bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
            Oops! A Little Hiccup! 🙈
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-lg text-gray-700 font-semibold">
            Something unexpected happened, but don't worry - our magical helpers are on it! ✨
          </p>
          
          <div className="bg-white/60 rounded-2xl p-4 border-2 border-orange-200">
            <p className="text-sm text-gray-600">
              <Bug className="inline h-4 w-4 mr-1" />
              If this keeps happening, try refreshing the page or going back home.
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && error && (
            <details className="text-left bg-gray-100 p-4 rounded-xl text-sm border-2 border-gray-200">
              <summary className="cursor-pointer font-bold text-gray-700 mb-2">
                🔍 Error Details (Dev Only)
              </summary>
              <pre className="overflow-auto text-xs text-red-600 whitespace-pre-wrap mt-2">
                {error.message}
                {error.digest && `\nDigest: ${error.digest}`}
              </pre>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              onClick={reset}
              size="lg"
              className="rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Try Again 🔄
            </Button>
            <Link href="/">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-2 border-purple-300 hover:bg-purple-100 font-bold w-full sm:w-auto"
              >
                <Home className="h-5 w-5 mr-2" />
                Go Home 🏠
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

