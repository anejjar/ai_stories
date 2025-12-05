import type { Metadata, Viewport } from 'next'
import { Comic_Neue, Nunito } from 'next/font/google'
import { QueryProvider } from '@/lib/providers/query-provider'
import { Toaster } from '@/components/ui/toaster'
import { GoogleAnalytics, AnalyticsTracker } from '@/lib/analytics'
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

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aistories.app'

export const metadata: Metadata = {
  title: {
    default: 'AI Stories - Personalized Bedtime Stories for Kids',
    template: '%s | AI Stories',
  },
  description: 'Create magical, personalized bedtime stories starring your child. AI-powered story generation with beautiful illustrations. Perfect for parents who want unique stories for their little ones.',
  keywords: ['bedtime stories', 'personalized stories', 'kids stories', 'AI stories', 'children books', 'story generator', 'custom stories'],
  authors: [{ name: 'AI Stories' }],
  creator: 'AI Stories',
  publisher: 'AI Stories',
  metadataBase: new URL(appUrl),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: appUrl,
    siteName: 'AI Stories',
    title: 'AI Stories - Personalized Bedtime Stories for Kids',
    description: 'Create magical, personalized bedtime stories starring your child. AI-powered story generation with beautiful illustrations.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Stories - Personalized Bedtime Stories',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Stories - Personalized Bedtime Stories for Kids',
    description: 'Create magical, personalized bedtime stories starring your child.',
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

