# Dokploy Deployment Guide for AI Stories

This guide explains how to deploy the AI Stories application to your Contabo VPS using Dokploy and how to configure the scheduled cron jobs.

## 1. Prerequisites
- Dokploy installed on your Contabo VPS.
- Domain name pointed to your VPS (optional but recommended).

## 2. Deployment Steps in Dokploy

### Step 1: Create a New Project
1. Log in to your Dokploy dashboard.
2. Create a new **Project** (e.g., `ai-stories`).

### Step 2: Create a New Application
1. Inside the project, create a new **Application**.
2. Select **Source**:
   - If using GitHub/GitLab: Connect your repository.
   - If using Local: Upload your files or use the CLI.
3. Select **Build Type**: `Docker` (it will automatically use the `Dockerfile` we created).

### Step 3: Configure Environment Variables
Go to the **Environment** tab of your application and add the following variables:

> **Important for Next.js**: Variables starting with `NEXT_PUBLIC_` must also be added to the **Build Arguments** tab in Dokploy so they can be baked into the client-side bundle during the build process.

| Variable | Description | Build Arg? |
|----------|-------------|------------|
| `NODE_ENV` | `production` | No |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | **Yes** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | **Yes** |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | **Yes** |
| `RESEND_API_KEY` | Your Resend API key for emails | No |
| `OPENAI_API_KEY` | Your OpenAI API key | No |
| `ANTHROPIC_API_KEY` | Your Anthropic API key | No |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Your Gemini API key | No |
| `CRON_SECRET` | A long random string to secure your cron endpoints | No |
| `NEXT_PUBLIC_APP_URL` | Your application URL | **Yes** |
| `STRIPE_SECRET_KEY` | Your Stripe secret key | No |
| `STRIPE_WEBHOOK_SECRET` | Your Stripe webhook secret | No |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key | **Yes** |

### Step 4: Deploy
1. Go to the **Deployments** tab.
2. Click **Deploy**. Dokploy will build the image and start the container.

## 3. Configuring Cron Jobs (Queues/Schedules)

Dokploy has a built-in **Crons** feature. We will use it to trigger our Next.js API cron routes.

### Bedtime Reminders (Hourly)
1. In your application settings, go to the **Crons** tab.
2. Click **Add Cron**.
3. **Name**: `bedtime-reminders`
4. **Schedule**: `0 * * * *` (Every hour)
5. **Command**: 
   ```bash
   curl -X GET "http://localhost:3000/api/cron/bedtime-reminder" -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```
   *Note: Replace `YOUR_CRON_SECRET` with the value you set in the environment variables.*

### Weekly Summary (Weekly)
1. Click **Add Cron**.
2. **Name**: `weekly-summary`
3. **Schedule**: `0 18 * * 0` (Every Sunday at 6 PM)
4. **Command**:
   ```bash
   curl -X GET "http://localhost:3000/api/cron/weekly-summary" -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

## 4. Important Notes

### Build Arguments Configuration
When setting up build arguments in Dokploy, you must add **both** the variable name and its actual value. For example:
- **Incorrect**: `NEXT_PUBLIC_SUPABASE_URL=` (empty value)
- **Correct**: `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co`

The following variables **must** be added as Build Arguments (not just Environment Variables):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (required during build for API route prerendering)
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Why SUPABASE_SERVICE_ROLE_KEY is a Build Argument
Next.js attempts to collect page data during the build process, which includes evaluating API routes. Some API routes (like `/api/child-profiles/verify-migration`) use the Supabase admin client, which requires the service role key. Without this key available during build, you'll see errors like:
```
Error: supabaseKey is required.
```

## 5. Troubleshooting

### "supabaseKey is required" Error
If you see this error during build:
1. Go to the **Build Arguments** tab in Dokploy
2. Ensure `SUPABASE_SERVICE_ROLE_KEY` is added with the actual key value (not empty)
3. Verify all `NEXT_PUBLIC_*` variables are also in Build Arguments with values
4. Redeploy the application

### Other Common Issues
- **Build Errors**: Check the **Logs** tab in Dokploy for build errors.
- **Port Mapping**: Ensure the internal port `3000` is mapped correctly in Dokploy.
- **Database Connection**: Verify your Supabase URL and keys if the app fails to start or connect to the database.

