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
# AI PROVIDERS - Image Generation (Required for Family Plan)
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
# LEMON SQUEEZY (Required for payments)
# -----------------------------------------------------
# Get these from your Lemon Squeezy Dashboard
# API Key: Settings > API
LEMONSQUEEZY_API_KEY=your-lemonsqueezy-api-key

# Store ID: Found in your store URL or Settings > Stores
LEMONSQUEEZY_STORE_ID=your-store-id

# Webhook secret for handling Lemon Squeezy events
# Get this when setting up webhooks in Lemon Squeezy Dashboard
LEMONSQUEEZY_WEBHOOK_SECRET=your-webhook-secret

# Variant IDs for subscription products
# Create products in Lemon Squeezy Dashboard > Products
# Then create variants for each product and copy the Variant ID
LEMONSQUEEZY_PRO_VARIANT_ID=your-pro-variant-id
LEMONSQUEEZY_FAMILY_VARIANT_ID=your-family-variant-id

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

# Sentry / GlitchTip Error Tracking
NEXT_PUBLIC_GLITCHTIP_DSN=your-glitchtip-dsn-here

# -----------------------------------------------------
# PRODUCTION NOTES
# -----------------------------------------------------
# 1. Never commit this file with real values
# 2. Use different API keys for production
# 3. Use Lemon Squeezy live mode for production
# 4. Set up proper webhook endpoints
# 5. Configure rate limiting for production traffic

