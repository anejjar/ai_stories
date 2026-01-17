import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help Center - Get Support for AI Tales | AI Tales',
  description:
    'Get support for AI Tales. Browse FAQs, find answers about safety, technical issues, content, pricing, and results. Contact support if you need additional help.',
  keywords: [
    'AI Tales help center',
    'story generator support',
    'FAQ AI stories',
    'AI Tales customer support',
    'help center',
    'support FAQ',
  ],
  openGraph: {
    title: 'Help Center - Get Support for AI Tales',
    description: 'Get support for AI Tales. Browse FAQs, find answers about safety, technical issues, content, pricing, and results.',
    url: 'https://ai-tales.com/support',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AI Tales Help Center' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Help Center - Get Support for AI Tales',
    description: 'Get support for AI Tales. Browse FAQs, find answers about safety, technical issues, content, pricing, and results.',
  },
}

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
