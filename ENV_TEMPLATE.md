# =====================================================
# AI Stories - Environment Variables Template
# =====================================================
# Copy this file to .env.local for development
# For production, set these in your hosting provider (Vercel, etc.)
# =====================================================

# -----------------------------------------------------
# SUPABASE (Required)
# -----------------------------------------------------
# Get these from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# -----------------------------------------------------
# AI PROVIDERS - Text Generation (At least one required)
# -----------------------------------------------------
# Comma-separated list of providers in priority order
# Options: openai, gemini, anthropic
AI_PROVIDER=gemini

# Google Gemini (Recommended - uses latest Gemini 2.5 models)
GEMINI_API_KEY=your-gemini-key

# OpenAI (Alternative - supports both text and images)
# OPENAI_API_KEY=sk-your-openai-key

# Anthropic Claude (Alternative)
# ANTHROPIC_API_KEY=your-anthropic-key

# -----------------------------------------------------
# AI PROVIDERS - Image Generation (Required for PRO MAX)
# -----------------------------------------------------
# Comma-separated list of providers in priority order
# Options: dalle, stable-diffusion, midjourney
# NOTE: Gemini does NOT support image generation, use DALL-E instead
IMAGE_PROVIDER=dalle

# DALL-E (Recommended - uses OpenAI DALL-E 3)
OPENAI_API_KEY=sk-your-openai-key

# Alternative: DALL_E_API_KEY=sk-your-openai-key  # Will use OPENAI_API_KEY if not set

# Stability AI / Stable Diffusion (Alternative)
# STABILITY_AI_API_KEY=your-stability-key
# STABLE_DIFFUSION_API_KEY=your-sd-key

# Midjourney (Alternative - requires proxy service)
# MIDJOURNEY_API_KEY=your-midjourney-key

# -----------------------------------------------------
# STRIPE (Required for payments)
# -----------------------------------------------------
# Get these from your Stripe Dashboard
STRIPE_SECRET_KEY=sk_test_your-stripe-secret
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable

# Webhook secret for handling Stripe events
# Get this when setting up webhooks in Stripe Dashboard
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Price IDs for subscription products
# Create these in Stripe Dashboard > Products
STRIPE_PRO_PRICE_ID=price_your-pro-price-id
STRIPE_PRO_MAX_PRICE_ID=price_your-pro-max-price-id

# -----------------------------------------------------
# APPLICATION
# -----------------------------------------------------
# Your app's public URL (required for proper redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# -----------------------------------------------------
# OPTIONAL - Analytics & Monitoring
# -----------------------------------------------------
# Google Analytics
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Sentry Error Tracking
# SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# -----------------------------------------------------
# PRODUCTION NOTES
# -----------------------------------------------------
# 1. Never commit this file with real values
# 2. Use different API keys for production
# 3. Enable Stripe live mode for production
# 4. Set up proper webhook endpoints
# 5. Configure rate limiting for production traffic

