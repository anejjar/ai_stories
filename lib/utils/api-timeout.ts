/**
 * API Timeout Utilities
 * Provides timeout wrappers for external API calls
 */

/**
 * Create a timeout promise that rejects after specified milliseconds
 */
export function createTimeoutPromise(timeoutMs: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
  })
}

/**
 * Wrap a promise with a timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage?: string
): Promise<T> {
  const timeout = createTimeoutPromise(timeoutMs)
  
  try {
    return await Promise.race([
      promise,
      timeout
    ])
  } catch (error) {
    if (error instanceof Error && error.message.includes('timeout')) {
      throw new Error(timeoutMessage || `Request timeout after ${timeoutMs}ms`)
    }
    throw error
  }
}

/**
 * Create an AbortController with timeout
 */
export function createTimeoutController(timeoutMs: number): AbortController {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), timeoutMs)
  return controller
}
