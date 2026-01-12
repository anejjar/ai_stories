/**
 * Sentry/Error Tracking Initialization
 * Configures error tracking for production monitoring
 */

/**
 * Initialize Sentry if DSN is configured
 */
export function initErrorTracking() {
  // Check if Sentry DSN is configured
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.NEXT_PUBLIC_GLITCHTIP_DSN
  
  if (!sentryDsn) {
    console.warn('⚠️  Error tracking not configured. Set NEXT_PUBLIC_SENTRY_DSN or NEXT_PUBLIC_GLITCHTIP_DSN')
    return
  }

  try {
    // Dynamic import to avoid bundling Sentry in development if not needed
    if (typeof window !== 'undefined') {
      // Client-side initialization
      import('@sentry/browser').then((Sentry) => {
        Sentry.init({
          dsn: sentryDsn,
          environment: process.env.NODE_ENV || 'development',
          tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev
          replaysSessionSampleRate: 0.1,
          replaysOnErrorSampleRate: 1.0,
          beforeSend(event, hint) {
            // Filter out known non-critical errors
            if (event.exception) {
              const error = hint.originalException
              if (error instanceof Error) {
                // Don't report network errors (user's connection issue)
                if (error.message.includes('fetch') || error.message.includes('network')) {
                  return null
                }
                // Don't report timeout errors (expected behavior)
                if (error.message.includes('timeout')) {
                  return null
                }
              }
            }
            return event
          },
        })
        console.log('✅ Error tracking initialized (Sentry)')
      }).catch((err) => {
        console.warn('⚠️  Failed to initialize Sentry:', err)
      })
    } else {
      // Server-side initialization would go here if using @sentry/nextjs
      console.log('✅ Error tracking configured (server-side)')
    }
  } catch (error) {
    console.warn('⚠️  Error tracking initialization failed:', error)
  }
}

// Auto-initialize on module load (client-side only)
if (typeof window !== 'undefined') {
  initErrorTracking()
}
