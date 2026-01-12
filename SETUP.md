# Setup Guide - AI Stories App

This guide will walk you through setting up all the required services and API keys for the AI Stories application.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (for database and authentication)
- A Google account (for Gemini API)
- A Stripe account (for payments)

## Step 1: Install Dependencies

```bash
npm install
# or
yarn install
```

## Step 2: Supabase Setup

### 2.1 Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in the project details:
   - Organization: Select or create one
   - Name: "ai-stories" (or your preferred name)
   - Database Password: Create a strong password (save this!)
   - Region: Choose closest to your users
   - Pricing Plan: Free tier is fine for development
5. Click "Create new project"
6. Wait for the project to be set up (takes 1-2 minutes)

### 2.2 Get Supabase API Keys

1. In your project dashboard, go to Settings > API
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys" > "anon public")
   - **service_role** key (under "Project API keys" > "service_role")
     - ⚠️ **Important**: Keep the service_role key secret! Never expose it in client-side code.

### 2.3 Set Up Database Schema

1. Go to SQL Editor in your Supabase dashboard
2. Run the migration files in order:
   - First, run `supabase/migrations/001_initial_schema.sql` to create tables
   - Then, run `supabase/migrations/002_rls_policies.sql` to set up Row Level Security

Alternatively, you can copy and paste the SQL from those files into the SQL Editor.

### 2.4 Enable Authentication Providers

1. Go to Authentication > Providers
2. Enable **Email** provider (should be enabled by default)
3. **Important**: Go to Authentication > Settings and **disable "Confirm email"** for development
   - This allows users to sign up and immediately have an active session
   - For production, you can re-enable email confirmation and use the database trigger (see migration 003)
4. (Optional) Enable **Google** provider:
   - Click on Google provider
   - Toggle "Enable Google provider"
   - Add your Google OAuth credentials (Client ID and Client Secret)
   - Set redirect URL to: `https://your-project-ref.supabase.co/auth/v1/callback`

### 2.5 Set Up Storage (Optional - for future image storage)

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `stories`
3. Set it to **Public** if you want images to be publicly accessible
4. Add storage policies as needed (will be configured when image storage is implemented)

## Step 3: Google Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Select your Google Cloud project (or create a new one)
5. **Important:** Make sure the Gemini API is enabled in your Google Cloud project:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to "APIs & Services" > "Library"
   - Search for "Generative Language API"
   - Click on it and make sure it's **Enabled**
6. Copy the API key and add it to your `.env.local` file

**Note:** The free tier includes generous usage limits. For production, consider setting up billing.

**Troubleshooting:**
- If you get "API key not valid" error, verify:
  - The API key is correct (starts with `AIza`)
  - Gemini API is enabled in your Google Cloud project
  - The API key has the necessary permissions
  - Try creating a new API key if the current one doesn't work

## Step 4: Stripe Setup

### 4.1 Create Stripe Account

1. Go to [Lemon Squeezy Dashboard](https://app.lemonsqueezy.com)
2. Sign up or log in
3. Complete account setup (use test mode for development)

### 4.2 Get API Key and Store ID

1. Go to Settings > API
2. Copy your **API Key** (click "Reveal" if needed)
3. Go to Settings > Stores
4. Copy your **Store ID** (found in the store URL or store settings)

### 4.3 Create Products and Variants

1. Go to Products > Add product
2. Create two products:

   **Product 1: PRO**
   - Name: "PRO"
   - Description: "Unlimited text story generation"
   - Pricing: Recurring, Monthly, $9.99
   - After creating, add a variant and copy the **Variant ID**

   **Product 2: Family Plan**
   - Name: "Family Plan"
   - Description: "Unlimited stories with AI illustrations"
   - Pricing: Recurring, Monthly, $24.99
   - After creating, add a variant and copy the **Variant ID**

### 4.4 Set Up Webhooks (for production)

1. Go to Settings > Webhooks
2. Click "Create webhook"
3. Enter your production URL: `https://yourdomain.com/api/payments/webhook`
4. Select events:
   - `subscription_created`
   - `subscription_updated`
   - `subscription_cancelled`
   - `subscription_expired`
   - `subscription_payment_success`
5. Copy the webhook signing secret

## Step 5: Configure Environment Variables

1. Copy `.env.local.template` to `.env.local`:
   ```bash
   cp .env.local.template .env.local
   ```

2. Open `.env.local` and fill in all the values:
   - Supabase URL (from Step 2.2)
   - Supabase Anon Key (from Step 2.2)
   - Supabase Service Role Key (from Step 2.2)
   - Gemini API Key (from Step 3)
   - Lemon Squeezy API Key and Store ID (from Step 4.2)
   - Lemon Squeezy Variant IDs (from Step 4.3)
   - Lemon Squeezy Webhook Secret (from Step 4.4, optional for development)
   - App URL (use `http://localhost:3000` for development)

Example `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-key
LEMONSQUEEZY_API_KEY=your-lemonsqueezy-api-key
LEMONSQUEEZY_STORE_ID=your-store-id
LEMONSQUEEZY_PRO_VARIANT_ID=your-pro-variant-id
LEMONSQUEEZY_FAMILY_VARIANT_ID=your-family-variant-id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 6: Verify Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)

3. Check the browser console and terminal for any errors

## Troubleshooting

### Supabase Errors

- **"Missing Supabase environment variables"**: Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly
- **"Permission denied"**: Check Row Level Security (RLS) policies in Supabase dashboard
- **"Invalid API key"**: Verify your Supabase keys are correct and haven't been rotated
- **Database connection errors**: Ensure your Supabase project is active and the database password is correct

### Gemini API Errors

- **"API key not valid"**: Verify your API key in Google AI Studio
- **Rate limit errors**: Check your API quota in Google Cloud Console

### Stripe Errors

- **"Invalid API Key"**: Ensure you're using test keys (`sk_test_` and `pk_test_`) for development
- **Price ID errors**: Verify the Price IDs exist in your Stripe dashboard

## Next Steps

Once setup is complete, you can:

1. Start building features (see `project_plan.md`)
2. Test authentication flow
3. Test story generation
4. Test payment integration

## Security Notes

- **Never commit `.env.local` to version control**
- Keep your service account keys and API keys secure
- Use environment variables for all sensitive data
- Regularly rotate API keys in production
- Monitor API usage to prevent unexpected charges

## Production Deployment

Before deploying to production:

1. Create production Supabase project (or upgrade existing project)
2. Set up production Stripe account
3. Configure production environment variables
4. Review and update RLS policies for production
5. Set up monitoring and error tracking
6. Configure custom domain
7. Enable Supabase Auth email confirmations
8. Set up database backups
9. Review API rate limits and upgrade plan if needed

