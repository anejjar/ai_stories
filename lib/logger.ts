/**
 * Structured Logging Utility
 * Provides structured JSON logging with PII sanitization
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: {
    message: string
    stack?: string
    name?: string
  }
  requestId?: string
  userId?: string
  path?: string
}

/**
 * Sanitize data to remove PII (Personally Identifiable Information)
 */
function sanitizeData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data
  }

  if (typeof data === 'string') {
    // Remove email addresses
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    let sanitized = data.replace(emailRegex, '[EMAIL_REDACTED]')
    
    // Remove potential API keys (long alphanumeric strings)
    sanitized = sanitized.replace(/[a-zA-Z0-9]{32,}/g, (match) => {
      // Keep UUIDs (they're not sensitive)
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(match)) {
        return match
      }
      return '[KEY_REDACTED]'
    })
    
    return sanitized
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData)
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {}
    const sensitiveKeys = [
      'email',
      'password',
      'token',
      'apiKey',
      'api_key',
      'secret',
      'authorization',
      'cookie',
      'credit_card',
      'ssn',
      'phone',
      'address',
      'lemonsqueezy_customer_id',
      'lemonsqueezy_subscription_id',
      'stripe_customer_id',
      'stripe_subscription_id',
    ]

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase()
      if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
        sanitized[key] = '[REDACTED]'
      } else {
        sanitized[key] = sanitizeData(value)
      }
    }

    return sanitized
  }

  return data
}

/**
 * Get request ID from headers or generate one
 */
function getRequestId(): string | undefined {
  // Request ID would be set by middleware
  // For now, return undefined - middleware will set it
  return undefined
}

/**
 * Format log entry as JSON
 */
function formatLog(entry: LogEntry): string {
  return JSON.stringify(entry)
}

/**
 * Log a message with structured format
 */
function log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message: sanitizeData(message) as string,
    requestId: getRequestId(),
  }

  if (context) {
    entry.context = sanitizeData(context) as LogContext
  }

  if (error) {
    entry.error = {
      message: error.message,
      stack: error.stack,
      name: error.name,
    }
  }

  const logLine = formatLog(entry)

  // Use appropriate console method based on level
  switch (level) {
    case 'debug':
      if (process.env.NODE_ENV === 'development') {
        console.debug(logLine)
      }
      break
    case 'info':
      console.info(logLine)
      break
    case 'warn':
      console.warn(logLine)
      break
    case 'error':
      console.error(logLine)
      break
  }
}

/**
 * Logger API
 */
export const logger = {
  debug: (message: string, context?: LogContext) => {
    log('debug', message, context)
  },

  info: (message: string, context?: LogContext) => {
    log('info', message, context)
  },

  warn: (message: string, context?: LogContext) => {
    log('warn', message, context)
  },

  error: (message: string, error?: Error, context?: LogContext) => {
    log('error', message, context, error)
  },
}

/**
 * Create a logger with request context
 */
export function createRequestLogger(requestId?: string, userId?: string, path?: string) {
  const baseContext: LogContext = {}
  if (requestId) baseContext.requestId = requestId
  if (userId) baseContext.userId = userId
  if (path) baseContext.path = path

  return {
    debug: (message: string, context?: LogContext) => {
      log('debug', message, { ...baseContext, ...context })
    },
    info: (message: string, context?: LogContext) => {
      log('info', message, { ...baseContext, ...context })
    },
    warn: (message: string, context?: LogContext) => {
      log('warn', message, { ...baseContext, ...context })
    },
    error: (message: string, error?: Error, context?: LogContext) => {
      log('error', message, { ...baseContext, ...context }, error)
    },
  }
}
