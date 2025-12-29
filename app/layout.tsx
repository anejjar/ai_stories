import type { Metadata, Viewport } from 'next'
import { Comic_Neue, Nunito } from 'next/font/google'
import { QueryProvider } from '@/lib/providers/query-provider'
import { Toaster } from '@/components/ui/toaster'
import { GoogleAnalytics, AnalyticsTracker, UmamiAnalytics } from '@/lib/analytics'
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

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://safeaistories.com'

export const metadata: Metadata = {
  title: {
    default: 'AI Bedtime Stories Kids Love | Safe AI Stories Generator',
    template: '%s | Safe AI Stories',
  },
  description: 'Create magical, personalized bedtime stories in seconds with AI. Safe, ad-free tales your kids will love. Try free tonight—sweet dreams guaranteed! ✨',
  keywords: [
    // Primary Keywords
    'ai bedtime stories',
    'bedtime story generator',
    'personalized bedtime stories',
    'ai story generator for kids',
    'custom bedtime stories',
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
  ],
  authors: [{ name: 'Safe AI Stories' }],
  creator: 'Safe AI Stories',
  publisher: 'Safe AI Stories',
  metadataBase: new URL(appUrl),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: appUrl,
    siteName: 'Safe AI Stories',
    title: 'AI Bedtime Stories Kids Love | Safe AI Stories Generator',
    description: 'Create magical, personalized bedtime stories in seconds with AI. Safe, ad-free tales your kids will love. Try free tonight—sweet dreams guaranteed! ✨',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Safe AI Stories - Personalized AI Bedtime Stories for Kids',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Bedtime Stories Kids Love | Safe AI Stories',
    description: 'Create magical, personalized bedtime stories in seconds with AI. Safe, ad-free tales your kids will love. Try free tonight! ✨',
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
        <UmamiAnalytics />
        <SoftwareApplicationSchema />
        <OrganizationSchema />
      </head>
      <body className={`${comicNeue.variable} ${nunito.variable} font-sans`}>
        <QueryProvider>
          <AnalyticsTracker />
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  )
}

