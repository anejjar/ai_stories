'use client'

import * as Sentry from '@sentry/browser'
import { useEffect } from 'react'

export function GlitchTipProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const dsn = process.env.NEXT_PUBLIC_GLITCHTIP_DSN

    if (dsn) {
      Sentry.init({
        dsn,
        tracesSampleRate: 0.01,
      })
    } else {
      console.warn('GlitchTip DSN not found. Sentry initialization skipped.')
    }
  }, [])

  return <>{children}</>
}

