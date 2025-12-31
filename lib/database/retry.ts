/**
 * Database Retry Utilities
 * Provides retry logic for database operations with exponential backoff
 */

export interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  const errorMessage = error.message.toLowerCase()
  const errorCode = (error as any).code

  // Don't retry on constraint violations, authentication errors, invalid data
  if (
    errorMessage.includes('constraint') ||
    errorMessage.includes('unique') ||
    errorMessage.includes('duplicate') ||
    errorMessage.includes('authentication') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('forbidden') ||
    errorMessage.includes('invalid') ||
    errorCode === '23505' || // PostgreSQL unique violation
    errorCode === '23503' || // PostgreSQL foreign key violation
    errorCode === '23514' || // PostgreSQL check violation
    errorCode === 'PGRST116' || // PostgREST not found
    errorCode === 'PGRST301' // PostgREST schema cache miss
  ) {
    return false
  }

  // Retry on connection timeouts, temporary network errors, deadlocks
  if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('network') ||
    errorMessage.includes('deadlock') ||
    errorMessage.includes('temporary') ||
    errorMessage.includes('econnreset') ||
    errorMessage.includes('etimedout') ||
    errorCode === '40P01' || // PostgreSQL deadlock detected
    errorCode === '40001' || // PostgreSQL serialization failure
    errorCode === '08006' // PostgreSQL connection failure
  ) {
    return true
  }

  // Default: retry on unknown errors (might be transient)
  return true
}

/**
 * Retry a database operation with exponential backoff
 */
export async function retryDatabaseOperation<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry on non-retryable errors
      if (!isRetryableError(error)) {
        throw lastError
      }

      // Don't delay after the last attempt
      if (attempt < opts.maxRetries) {
        const delay = Math.min(
          opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt),
          opts.maxDelay
        )
        
        console.log(`Database operation failed (attempt ${attempt + 1}/${opts.maxRetries + 1}), retrying in ${delay}ms...`, {
          error: lastError.message,
          code: (error as any).code
        })
        
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('Database operation failed after retries')
}
