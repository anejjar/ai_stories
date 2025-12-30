'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/browser'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 flex items-center justify-center p-8">
          <div className="max-w-lg w-full text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-200 to-orange-200 flex items-center justify-center shadow-lg">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Something Went Wrong! 😢
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              We're sorry, but something unexpected happened. Please try again.
            </p>
            
            <Button
              onClick={reset}
              size="lg"
              className="rounded-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 font-bold shadow-lg"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}

