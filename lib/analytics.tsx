'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

// Google Analytics tracking ID
const GA_ID = process.env.NEXT_PUBLIC_GA_ID

// Track page views
function usePageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_ID) return

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    
    // Send page view to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', GA_ID, {
        page_path: url,
      })
    }
  }, [pathname, searchParams])
}

// Analytics provider component
function AnalyticsTrackerInner() {
  usePageView()
  return null
}

export function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <AnalyticsTrackerInner />
    </Suspense>
  )
}

// Google Analytics script component
export function GoogleAnalytics() {
  if (!GA_ID) return null

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <script
        id="google-analytics"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}

// Custom event tracking
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (!GA_ID || typeof window === 'undefined') return

  if ((window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Predefined events for the app
export const analytics = {
  // Story events
  storyCreated: (theme: string) => trackEvent('story_created', 'stories', theme),
  storyViewed: (storyId: string) => trackEvent('story_viewed', 'stories', storyId),
  imagesGenerated: (storyId: string) => trackEvent('images_generated', 'stories', storyId),
  storyShared: (method: string) => trackEvent('story_shared', 'stories', method),
  storyPrinted: () => trackEvent('story_printed', 'stories'),
  pdfDownloaded: () => trackEvent('pdf_downloaded', 'stories'),
  
  // User events
  userSignedUp: () => trackEvent('sign_up', 'users'),
  userLoggedIn: () => trackEvent('login', 'users'),
  profileCreated: () => trackEvent('profile_created', 'users'),
  childProfileCreated: () => trackEvent('child_profile_created', 'users'),
  
  // Subscription events
  subscriptionStarted: (tier: string) => trackEvent('subscription_started', 'payments', tier),
  upgradeClicked: (tier: string) => trackEvent('upgrade_clicked', 'payments', tier),
  trialCompleted: () => trackEvent('trial_completed', 'payments'),
  
  // Feature usage
  audioPlayStarted: () => trackEvent('audio_play_started', 'features'),
  bedtimeModeEnabled: () => trackEvent('bedtime_mode_enabled', 'features'),
  storyEnhanced: (type: string) => trackEvent('story_enhanced', 'features', type),
}

