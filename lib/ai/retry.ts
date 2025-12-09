// Retry logic with exponential backoff

import type { ProviderError } from './types'

export interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
}

// Faster options for image generation
const IMAGE_GENERATION_OPTIONS: Required<RetryOptions> = {
  maxRetries: 1, // Only 1 retry for images (fail fast)
  initialDelay: 500, // Shorter initial delay
  maxDelay: 2000, // Shorter max delay
  backoffMultiplier: 2,
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: Error | null = null

  for (let attempt = 0; attempt < opts.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Don't retry on certain errors (e.g., authentication errors)
      if (isNonRetryableError(error)) {
        throw lastError
      }

      // Don't delay after the last attempt
      if (attempt < opts.maxRetries - 1) {
        const delay = Math.min(
          opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt),
          opts.maxDelay
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('Failed after retries')
}

/**
 * Check if an error is non-retryable
 */
function isNonRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    
    // Authentication/authorization errors
    if (
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('invalid api key') ||
      message.includes('authentication') ||
      message.includes('401') ||
      message.includes('403')
    ) {
      return true
    }

    // Rate limit errors might be retryable, but we'll let the retry logic handle them
    // Invalid request errors
    if (
      message.includes('invalid request') ||
      message.includes('bad request') ||
      message.includes('400')
    ) {
      return true
    }
  }

  return false
}

/**
 * Retry with provider fallback
 * Tries multiple providers in sequence until one succeeds
 */
export async function retryWithFallback<T>(
  providers: Array<() => Promise<T>>,
  options: RetryOptions = {}
): Promise<{ result: T; providerIndex: number }> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: Error | null = null

  for (let providerIndex = 0; providerIndex < providers.length; providerIndex++) {
    const providerFn = providers[providerIndex]
    
    try {
      // Add timeout for image generation (30 seconds max per provider)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 90000)
      })

      // Use faster retry options - only 1 retry with shorter delays
      const retryOptions = {
        maxRetries: 1, // Only one retry per provider, then move to next
        initialDelay: 500, // Shorter initial delay for faster failure
        maxDelay: 2000,
        backoffMultiplier: 2,
      }

      // Try this provider with retries and timeout
      const result = await Promise.race([
        retryWithBackoff(providerFn, retryOptions),
        timeoutPromise
      ])
      
      return { result, providerIndex }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      const errorMessage = lastError.message
      
      // Fail fast for certain errors (API not available, authentication, etc.)
      if (
        errorMessage.includes('not available') ||
        errorMessage.includes('not configured') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('404') ||
        errorMessage.includes('401') ||
        errorMessage.includes('403')
      ) {
        console.warn(`Provider ${providerIndex} failed fast:`, errorMessage)
        // Continue to next provider immediately
        continue
      }
      
      console.warn(`Provider ${providerIndex} failed:`, errorMessage)
      // Continue to next provider
      continue
    }
  }

  throw lastError || new Error('All providers failed')
}








