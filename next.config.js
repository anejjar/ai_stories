/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
      },
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net', // DALL-E images
      },
      {
        protocol: 'https',
        hostname: '**.openai.com', // OpenAI CDN
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Mark optional packages as external to prevent build-time resolution
  // In Next.js 16, serverComponentsExternalPackages was replaced with serverExternalPackages
  serverExternalPackages: ['@anthropic-ai/sdk'],
  // Add empty turbopack config to silence the warning (webpack config is kept for compatibility)
  turbopack: {},
  webpack: (config, { isServer }) => {
    // Handle optional dependencies gracefully
    if (isServer) {
      // Don't try to bundle optional packages
      config.externals = config.externals || []
      if (Array.isArray(config.externals)) {
        config.externals.push('@anthropic-ai/sdk')
      } else if (typeof config.externals === 'object') {
        config.externals['@anthropic-ai/sdk'] = 'commonjs @anthropic-ai/sdk'
      }
    }
    
    return config
  },
}

module.exports = nextConfig

