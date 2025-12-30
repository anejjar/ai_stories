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

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key (for server-side ops) |
| `RESEND_API_KEY` | Your Resend API key for emails |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Your Gemini API key |
| `CRON_SECRET` | A long random string to secure your cron endpoints |
| `NEXT_PUBLIC_APP_URL` | Your application URL (e.g., `https://stories.yourdomain.com`) |
| `STRIPE_SECRET_KEY` | Your Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Your Stripe webhook secret |

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

## 4. Troubleshooting
- **Build Errors**: Check the **Logs** tab in Dokploy for build errors.
- **Port Mapping**: Ensure the internal port `3000` is mapped correctly in Dokploy.
- **Database Connection**: Verify your Supabase URL and keys if the app fails to start or connect to the database.

