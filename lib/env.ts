// Environment variable validation

import { z } from 'zod'

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // AI Providers - Text Generation
  // Comma-separated list: e.g., "openai,gemini,anthropic"
  AI_PROVIDER: z.string().optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),

  // AI Providers - Image Generation
  // Comma-separated list: e.g., "dalle,stable-diffusion"
  IMAGE_PROVIDER: z.string().optional(),
  DALL_E_API_KEY: z.string().min(1).optional(), // Can reuse OPENAI_API_KEY
  MIDJOURNEY_API_KEY: z.string().min(1).optional(),
  STABILITY_AI_API_KEY: z.string().min(1).optional(),
  STABLE_DIFFUSION_API_KEY: z.string().min(1).optional(),

  // Lemon Squeezy
  LEMONSQUEEZY_API_KEY: z.string().min(1),
  LEMONSQUEEZY_STORE_ID: z.string().min(1),
  LEMONSQUEEZY_WEBHOOK_SECRET: z.string().optional(),
  LEMONSQUEEZY_PRO_VARIANT_ID: z.string().optional(),
  LEMONSQUEEZY_FAMILY_VARIANT_ID: z.string().optional(),

  // Email (waitlist)
  RESEND_API_KEY: z.string().min(1).optional(),
  WAITLIST_FROM_EMAIL: z.string().email().optional(),

  // Cron Security
  CRON_SECRET: z.string().min(1).optional(),

  // Redis (Rate Limiting)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_GLITCHTIP_DSN: z.string().url().optional(),
})

type Env = z.infer<typeof envSchema>

/**
 * Validate environment variables
 * This will throw an error if required variables are missing
 */
export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((e) => e.path.join('.')).join(', ')
      const errorMessage = `Missing or invalid environment variables: ${missingVars}`
      console.error('❌ Environment validation failed:', errorMessage)
      console.error('Required variables:', error.errors.map(e => e.path.join('.')).join(', '))
      throw new Error(errorMessage)
    }
    throw error
  }
}

/**
 * Validate environment variables at startup (non-blocking in development)
 * In production, this will throw and prevent the app from starting
 */
export function validateEnvAtStartup(): void {
  if (process.env.NODE_ENV === 'production') {
    // In production, strict validation - fail fast
    try {
      validateEnv()
      console.log('✅ Environment variables validated successfully')
    } catch (error) {
      console.error('❌ CRITICAL: Environment validation failed in production')
      console.error(error)
      process.exit(1)
    }
  } else {
    // In development, warn but don't fail
    try {
      validateEnv()
      console.log('✅ Environment variables validated successfully')
    } catch (error) {
      console.warn('⚠️  Environment validation warnings (development mode):', error)
      console.warn('⚠️  Some features may not work correctly. Please check your .env.local file.')
    }
  }
}

// Auto-validate on module load (runs once when module is imported)
if (typeof window === 'undefined') {
  // Only run on server-side
  validateEnvAtStartup()
}

/**
 * Get environment variables (non-throwing version for development)
 */
export function getEnv(): Partial<Env> {
  try {
    return envSchema.parse(process.env)
  } catch {
    return {}
  }
}

