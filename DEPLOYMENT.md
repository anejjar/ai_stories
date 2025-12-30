# Deployment Guide

This guide walks you through deploying AI Stories to production.

## Prerequisites

- [Vercel account](https://vercel.com) (recommended) or other hosting provider
- [Supabase project](https://supabase.com) (production instance)
- [Stripe account](https://stripe.com) (live mode)
- [OpenAI API key](https://platform.openai.com) or other AI provider

## Step 1: Prepare Supabase (Production)

### Create Production Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project for production
3. Note down the project URL and keys

### Run Migrations
Execute the SQL migrations in order:
```bash
# In Supabase SQL Editor, run each file from:
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_user_profile_trigger.sql
# ... and so on
```

### Create Storage Bucket
1. Go to Storage in Supabase Dashboard
2. Create a bucket named `stories`
3. Set it to public (for story images)
4. Create a bucket named `child-profiles` (optional)

### Configure Authentication
1. Go to Authentication > Providers
2. Enable Email/Password
3. Enable Google OAuth (optional)
4. Set up redirect URLs for your production domain

## Step 2: Configure Stripe (Production)

### Switch to Live Mode
1. Toggle to Live mode in Stripe Dashboard
2. Complete account verification

### Create Products
1. Go to Products > Add Product
2. Create "PRO" subscription:
   - Name: AI Stories PRO
   - Price: $9.99/month (or your price)
   - Note the Price ID
3. Create "Family Plan" subscription:
   - Name: AI Stories Family Plan
   - Price: $19.99/month (or your price)
   - Note the Price ID

### Set Up Webhooks
1. Go to Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/payments/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Note the webhook signing secret

## Step 3: Deploy to Vercel

### Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Import your Git repository

### Configure Environment Variables
Add these environment variables in Vercel:

```
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key

# AI Providers
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-production-key
IMAGE_PROVIDER=dalle

# Stripe (Live Mode)
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_FAMILY_PRICE_ID=price_xxx

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Test the deployment URL

### Configure Custom Domain
1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS as instructed
4. Wait for SSL certificate provisioning

## Step 4: Post-Deployment Checklist

### Verify Functionality
- [ ] User can sign up/login
- [ ] Story generation works
- [ ] Payment flow works (use Stripe test card first)
- [ ] Images are generated (Family Plan)
- [ ] PDF export works
- [ ] Audio playback works

### Monitor Health
- Check `/api/health` endpoint
- Set up uptime monitoring (e.g., UptimeRobot)

### Set Up Alerts
- Configure Vercel Analytics
- Set up error tracking (Sentry recommended)
- Monitor Stripe webhook failures

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `AI_PROVIDER` | Yes | AI provider(s): openai, gemini, anthropic |
| `OPENAI_API_KEY` | Conditional | OpenAI API key |
| `GEMINI_API_KEY` | Conditional | Google Gemini API key |
| `IMAGE_PROVIDER` | Yes | Image provider: dalle, stable-diffusion |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `STRIPE_PRO_PRICE_ID` | Yes | Stripe PRO price ID |
| `STRIPE_FAMILY_PRICE_ID` | Yes | Stripe Family Plan price ID |
| `NEXT_PUBLIC_APP_URL` | Yes | Production app URL |
| `NEXT_PUBLIC_GA_ID` | No | Google Analytics ID |

## Troubleshooting

### Build Fails
- Check environment variables are set
- Verify all dependencies are installed
- Check build logs for specific errors

### Authentication Issues
- Verify Supabase URL and keys
- Check redirect URLs in Supabase Auth settings
- Ensure cookies are working (same-site settings)

### Payment Issues
- Verify Stripe keys (live vs test)
- Check webhook endpoint is accessible
- Verify webhook secret is correct
- Check Stripe Dashboard for failed webhooks

### Image Generation Fails
- Verify OpenAI API key has access to DALL-E
- Check rate limits aren't exceeded
- Verify storage bucket exists and is configured

## Scaling Considerations

### Database
- Enable connection pooling in Supabase
- Add indexes for frequently queried columns
- Consider read replicas for high traffic

### Rate Limiting
- Current limits are in-memory (reset on deploy)
- For production scale, consider Redis-based rate limiting

### Image Storage
- Supabase Storage has bandwidth limits
- Consider CDN for high-traffic scenarios

### AI Costs
- Monitor OpenAI usage
- Set up usage alerts
- Consider caching for similar prompts

## Support

For issues, check:
1. Vercel deployment logs
2. Supabase logs
3. Stripe webhook logs
4. Browser console for client-side errors

