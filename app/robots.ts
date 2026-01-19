import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-tales.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/profile/',
          '/library/',
          '/story/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

