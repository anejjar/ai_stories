# Fix: Database Error Saving New User

## Problem

Getting error: **"⚠️ Database error saving new user"** when trying to create a new account.

## Root Cause

The database schema is out of sync with the code. The following migrations haven't been applied:

1. **011_family_plan_migration.sql** - Updates subscription_tier constraint to include 'family' instead of 'pro_max'
2. **012_discovery_system.sql** - Adds discovery features (likes, comments, ratings)
3. **012_fix_display_name.sql** - Fixes the display_name column reference
4. **013_onboarding_system.sql** - Adds onboarding columns to users table

## Solution

You need to apply the pending migrations to your database.

### Option 1: Using Supabase SQL Editor (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor**
4. Run each migration file in order:

#### Step 1: Apply Family Plan Migration
Copy and paste the contents of `supabase/migrations/011_family_plan_migration.sql` and click **Run**.

#### Step 2: Apply Discovery System Migration
Copy and paste the contents of `supabase/migrations/012_discovery_system.sql` and click **Run**.

#### Step 3: Apply Display Name Fix
Copy and paste the contents of `supabase/migrations/012_fix_display_name.sql` and click **Run**.

#### Step 4: Apply Onboarding System Migration
Copy and paste the contents of `supabase/migrations/013_onboarding_system.sql` and click **Run**.

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed and linked to your project:

```bash
cd C:/laragon/www/claude/ai_stories
npx supabase db push
```

This will apply all pending migrations automatically.

## Verification

After applying the migrations, try creating a new account again. The error should be resolved.

### What the Migrations Do

1. **Family Plan Migration**: Updates the database to support the 'family' subscription tier
2. **Discovery System**: Adds social features (public stories, likes, comments, ratings)
3. **Display Name Fix**: Fixes column name references from `full_name` to `display_name`
4. **Onboarding System**: Adds these columns to the `users` table:
   - `onboarding_completed` (boolean)
   - `onboarding_step` (text)
   - `onboarding_dismissed_at` (timestamp)
   - `onboarding_checklist` (jsonb)

## Why This Happened

The code was updated to use new database columns (onboarding fields) that don't exist in your database yet. The migrations need to be applied to create these columns.

---

**Quick Fix:** Run the migrations using one of the options above, then try creating a new account again.
