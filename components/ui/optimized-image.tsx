'use client'

import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  priority?: boolean
  onLoad?: () => void
  onError?: () => void
}

/**
 * Optimized Image component that uses Next.js Image
 * Falls back to regular img tag if there are issues
 */
export function OptimizedImage({
  src,
  alt,
  fill,
  width,
  height,
  className = '',
  priority = false,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [useNativeImg, setUseNativeImg] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Check if URL is from an allowed domain
  const isAllowedDomain = (url: string) => {
    try {
      const urlObj = new URL(url)
      const allowedPatterns = [
        /\.supabase\.co$/,
        /\.supabase\.in$/,
        /oaidalleapiprodscus\.blob\.core\.windows\.net$/,
        /\.openai\.com$/,
      ]
      return allowedPatterns.some(pattern => pattern.test(urlObj.hostname))
    } catch {
      return false
    }
  }

  const handleError = () => {
    setUseNativeImg(true)
    onError?.()
  }

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  // Use native img for external URLs not in our allowed list
  // or if Next.js Image has failed
  if (useNativeImg || !isAllowedDomain(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        onLoad={handleLoad}
        onError={onError}
        style={fill ? { objectFit: 'cover', width: '100%', height: '100%' } : undefined}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
      />
    )
  }

  // Use Next.js Image for optimized loading
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={{ objectFit: 'cover' }}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 400}
      height={height || 400}
      className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      priority={priority}
      onLoad={handleLoad}
      onError={handleError}
    />
  )
}

