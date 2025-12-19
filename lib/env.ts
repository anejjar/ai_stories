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

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRO_PRICE_ID: z.string().optional(),
  STRIPE_PRO_MAX_PRICE_ID: z.string().optional(),

  // Email (waitlist)
  RESEND_API_KEY: z.string().min(1).optional(),
  WAITLIST_FROM_EMAIL: z.string().email().optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
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
      throw new Error(`Missing or invalid environment variables: ${missingVars}`)
    }
    throw error
  }
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

