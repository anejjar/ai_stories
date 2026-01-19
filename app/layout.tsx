import type { Metadata, Viewport } from 'next'
import { Comic_Neue, Nunito } from 'next/font/google'
import { QueryProvider } from '@/lib/providers/query-provider'
import { GlitchTipProvider } from '@/lib/providers/glitchtip-provider'
import { Toaster } from '@/components/ui/toaster'
import { GoogleAnalytics, AnalyticsTracker } from '@/lib/analytics'
import { SoftwareApplicationSchema, OrganizationSchema } from '@/components/schema/schema-markup'
import './globals.css'

const comicNeue = Comic_Neue({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-comic',
})

const nunito = Nunito({
  weight: ['400', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-nunito',
})

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-tales.com'

export const metadata: Metadata = {
  title: {
    default: 'AI Story Generator for Kids | Personalized Bedtime Stories | AI Tales',
    template: '%s | AI Tales',
  },
  description: 'Create unlimited personalized bedtime stories in seconds with AI. Safe, educational, human-moderated stories where your child is the hero. Start free—no credit card required. Join 10,000+ families.',
  keywords: [
    // Primary Keywords
    'AI story generator for kids',
    'personalized bedtime stories',
    'bedtime story generator',
    'AI stories for children',
    'personalized children\'s stories',
    // Secondary Keywords
    'educational storytelling',
    'interactive stories for kids',
    'safe AI content for children',
    'family storytelling app',
    'AI-illustrated children\'s books',
    'bedtime story audio',
    // Long-tail Keywords
    'bedtime stories with child\'s name',
    'ai generated children\'s stories',
    'personalized story book for kids',
    'make your own bedtime story',
    'bedtime story app for toddlers',
    'safe ai stories for children',
    'bedtime story creator online',
    'custom children\'s book generator',
    'ai storytelling for kids',
    'personalized fairy tales for children',
    'bedtime stories without ads',
    'create bedtime story with my child',
    'ai bedtime story maker',
    'educational bedtime stories ai',
    'instant bedtime story generator',
    'how to create personalized story for child',
    'wonderbly alternative',
    'epic alternative',
  ],
  authors: [{ name: 'AI Tales' }],
  creator: 'AI Tales',
  publisher: 'AI Tales',
  metadataBase: new URL(appUrl),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: appUrl,
    siteName: 'AI Tales',
    title: 'AI Story Generator for Kids | AI Tales',
    description: 'Create unlimited personalized bedtime stories in seconds with AI. Safe, educational, human-moderated stories where your child is the hero. Start free—no credit card required. Join 10,000+ families.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Tales - Personalized AI Story Generator for Kids',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Story Generator for Kids | AI Tales',
    description: 'Create unlimited personalized bedtime stories in seconds with AI. Safe, educational, human-moderated stories where your child is the hero. Start free!',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fdf2f8' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <GoogleAnalytics />
        <SoftwareApplicationSchema />
        <OrganizationSchema />
      </head>
      <body className={`${comicNeue.variable} ${nunito.variable} font-sans`}>
        <GlitchTipProvider>
          <QueryProvider>
            <AnalyticsTracker />
            {children}
            <Toaster />
          </QueryProvider>
        </GlitchTipProvider>
      </body>
    </html>
  )
}

