# Family Plan Setup Guide

This guide will walk you through setting up the Family Plan implementation in your local development environment.

## 📋 Prerequisites

- Supabase project (cloud or local)
- Stripe account (for payment processing)
- OpenAI API key (for story generation)
- Replicate API token (for image generation)

---

## Step 1: Apply Database Migration

### Option A: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and paste the migration**
   - Open `supabase/migrations/011_family_plan_migration.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" or press Ctrl+Enter

4. **Verify migration success**
   ```sql
   -- Check if tables were created
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('daily_usage', 'featured_stories', 'shared_story_tokens');

   -- Check subscription tier constraint
   SELECT conname, pg_get_constraintdef(oid)
   FROM pg_constraint
   WHERE conname = 'users_subscription_tier_check';
   ```

### Option B: Using Supabase CLI (if installed)

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Apply migration
supabase db push
```

---

## Step 2: Set Up Lemon Squeezy Products

### Create Products in Lemon Squeezy Dashboard

1. **Go to Lemon Squeezy Dashboard**
   - Visit https://app.lemonsqueezy.com

2. **Create Pro Plan Product**
   - Click "Products" → "Add product"
   - Name: `Pro Plan`
   - Description: `Unlimited text stories for AI Stories`
   - Pricing:
     - Recurring: Monthly
     - Price: $9.99 USD
   - Click "Save product"
   - After creating, add a variant and **Copy the Variant ID**

3. **Create Family Plan Product**
   - Click "Products" → "Add product"
   - Name: `Family Plan`
   - Description: `AI-illustrated picture books for families`
   - Pricing:
     - Recurring: Monthly
     - Price: $24.99 USD
   - Click "Save product"
   - After creating, add a variant and **Copy the Variant ID**

4. **Set up Webhook (for subscription events)**
   - Go to "Settings" → "Webhooks"
   - Click "Create webhook"
   - Endpoint URL: `https://your-domain.com/api/payments/webhook`
     - For local dev: Use ngrok or skip for now
   - Events to listen for:
     - `subscription_created`
     - `subscription_updated`
     - `subscription_cancelled`
     - `subscription_expired`
     - `subscription_payment_success`
   - Click "Create webhook"
   - **Copy the Webhook Secret**

---

## Step 3: Configure Environment Variables

### Update your `.env.local` file:

```env
# ================================
# Lemon Squeezy Configuration
# ================================
LEMONSQUEEZY_API_KEY=your-api-key  # Your Lemon Squeezy API Key
LEMONSQUEEZY_STORE_ID=your-store-id  # Your Lemon Squeezy Store ID
LEMONSQUEEZY_WEBHOOK_SECRET=your-webhook-secret  # Your Webhook Secret

# Lemon Squeezy Variant IDs (from Step 2)
LEMONSQUEEZY_PRO_VARIANT_ID=your-pro-variant-id  # Pro Plan Variant ID
LEMONSQUEEZY_FAMILY_VARIANT_ID=your-family-variant-id  # Family Plan Variant ID
```

### Full `.env.local` example:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI
OPENAI_API_KEY=sk-xxxxx

# Replicate
REPLICATE_API_TOKEN=r8_xxxxx

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Lemon Squeezy (NEW!)
LEMONSQUEEZY_API_KEY=your-api-key
LEMONSQUEEZY_STORE_ID=your-store-id
LEMONSQUEEZY_WEBHOOK_SECRET=your-webhook-secret
LEMONSQUEEZY_PRO_VARIANT_ID=your-pro-variant-id
LEMONSQUEEZY_FAMILY_VARIANT_ID=your-family-variant-id
```

---

## Step 4: Test the Implementation

### 4.1 Start the Development Server

```bash
npm run dev
# or
yarn dev
```

Visit http://localhost:3000

### 4.2 Test User Signup Flow

1. **Create a test account**
   - Go to http://localhost:3000/signup
   - Create a new account
   - You'll start on the `trial` tier

2. **Verify trial user in database**
   ```sql
   SELECT id, email, subscription_tier
   FROM users
   ORDER BY created_at DESC
   LIMIT 1;
   ```

### 4.3 Test Subscription Tiers (Manual Testing)

You can manually update subscription tiers for testing:

```sql
-- Update to Pro tier
UPDATE users
SET subscription_tier = 'pro'
WHERE email = 'your-test-email@example.com';

-- Update to Family tier
UPDATE users
SET subscription_tier = 'family'
WHERE email = 'your-test-email@example.com';

-- Reset to Trial
UPDATE users
SET subscription_tier = 'trial'
WHERE email = 'your-test-email@example.com';
```

### 4.4 Test Daily Usage Limits (Family Plan)

1. **Set yourself to Family tier** (see above)

2. **Generate stories**
   - Go to http://localhost:3000/create
   - Generate a text story (should work)
   - Generate 10 text stories total
   - Try generating an 11th (should be blocked with limit message)

3. **Check usage in database**
   ```sql
   SELECT * FROM daily_usage
   WHERE user_id = 'your-user-id'
   ORDER BY usage_date DESC;
   ```

4. **Test illustrated story limits**
   - Generate an illustrated story (requires child profile)
   - Generate a 2nd illustrated story (should work)
   - Try a 3rd (should be blocked)

### 4.5 Test Usage Dashboard

1. **View usage dashboard**
   - Go to http://localhost:3000/profile
   - Scroll down to see usage statistics
   - Or add `<UsageDashboard />` component to any page

2. **Verify dashboard displays:**
   - Today's usage with progress bars
   - Countdown timers for limit resets
   - Weekly and monthly statistics
   - Upgrade prompts when near limits

### 4.6 Test Stripe Checkout (Optional)

**Note:** For local testing, you'll need to use Stripe's test mode.

1. **Go to pricing page**
   - Visit http://localhost:3000/pricing

2. **Click "Get Family Plan Now"**
   - Should redirect to Stripe checkout
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any CVC

3. **Complete checkout**
   - Should redirect to success page
   - Check database for updated subscription_tier

---

## Step 5: Verify Everything Works

### Checklist:

- [ ] Database migration applied successfully
- [ ] Three subscription tiers exist: trial, pro, family
- [ ] `daily_usage` table created
- [ ] `featured_stories` table created
- [ ] `shared_story_tokens` table created
- [ ] Stripe products created (Pro & Family)
- [ ] Environment variables configured
- [ ] App runs without errors
- [ ] Can create user account (trial tier)
- [ ] Can manually switch tiers in database
- [ ] Family Plan: Text story limit works (10/day)
- [ ] Family Plan: Illustrated story limit works (2/day)
- [ ] Usage dashboard displays correctly
- [ ] Pricing page shows Family Plan at $24.99

---

## 🐛 Troubleshooting

### Database Migration Issues

**Error: "relation already exists"**
- Some tables may already exist from previous migrations
- Safe to ignore if the tables are correct

**Error: "constraint already exists"**
```sql
-- Drop and recreate constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_subscription_tier_check;
ALTER TABLE users ADD CONSTRAINT users_subscription_tier_check
  CHECK (subscription_tier IN ('trial', 'pro', 'family'));
```

### Stripe Integration Issues

**Webhook not receiving events**
- For local development, use [Stripe CLI](https://stripe.com/docs/stripe-cli)
- Or use a service like ngrok to expose localhost

**"Price ID not configured" error**
- Make sure `STRIPE_PRO_PRICE_ID` and `STRIPE_FAMILY_PRICE_ID` are set in `.env.local`
- Restart your dev server after adding env variables

### Usage Limits Not Working

**Check database functions exist:**
```sql
SELECT proname FROM pg_proc
WHERE proname IN ('can_create_story', 'increment_story_usage');
```

**If missing, re-run the migration**

---

## 📞 Need Help?

If you run into issues:

1. Check the console for errors
2. Check Supabase logs (Dashboard → Logs)
3. Check server logs and console for any configuration errors
4. Check the database tables were created correctly

---

## 🎉 Next Steps After Setup

Once everything is working:

1. **Test the complete user flow**
   - Signup → Subscribe → Generate stories → Hit limits → Upgrade

2. **Add Usage Dashboard to your app**
   - Consider adding to settings page or dashboard

3. **Customize the pricing page**
   - Update branding, colors, and messaging

4. **Set up webhook endpoint**
   - For production, configure webhook with your domain

5. **Phase 2: Featured Stories & Sharing**
   - Homepage story gallery
   - Admin curation panel
   - Auth-required sharing

---

**Last Updated:** December 11, 2025
**Status:** Ready for local testing
