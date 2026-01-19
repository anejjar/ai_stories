/**
 * Input Sanitization Utilities
 * Sanitizes user inputs to prevent SQL injection and XSS attacks
 */

/**
 * Sanitize search query input
 * Removes dangerous characters and limits length
 */
export function sanitizeSearchQuery(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return input
    .trim()
    .slice(0, 100) // Limit to 100 characters
    .replace(/[%_\\]/g, '') // Remove SQL wildcards and backslashes
    .replace(/[<>'"]/g, '') // Remove potential XSS characters
}

/**
 * Sanitize text input for database queries
 */
export function sanitizeTextInput(input: string | null | undefined, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove HTML brackets
}

/**
 * Validate and sanitize email input
 */
export function sanitizeEmail(input: string | null | undefined): string | null {
  if (!input || typeof input !== 'string') {
    return null
  }

  const email = input.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(email)) {
    return null
  }

  return email.slice(0, 255) // Email max length
}

/**
 * Escape special characters for SQL LIKE/ILIKE queries
 */
export function escapeLikePattern(pattern: string): string {
  return pattern.replace(/([%_\\])/g, '\\$1')
}

/**
 * Validate UUID format
 */
export function isValidUUID(input: string | null | undefined): boolean {
  if (!input || typeof input !== 'string') {
    return false
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(input)
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: string | number | null | undefined, defaultValue: number = 0): number {
  if (typeof input === 'number') {
    return isNaN(input) ? defaultValue : input
  }

  if (typeof input === 'string') {
    const parsed = parseInt(input, 10)
    return isNaN(parsed) ? defaultValue : parsed
  }

  return defaultValue
}
