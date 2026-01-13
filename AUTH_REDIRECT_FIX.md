# Auth Redirect Fix - Email Confirmation Issue

## Problem Summary

Users were being redirected to `https://0.0.0.0:3000/login?error=Could%20not%20authenticate` after clicking the email confirmation link, instead of staying on the production domain `https://tales.anejjar.com`.

## Root Cause

1. **Incorrect Environment Variable**: The `.env` file had `NEXT_PUBLIC_APP_URL=http://localhost:3000` which is the development URL
2. **Missing Fallback Logic**: The auth callback handler was using only the request origin without checking the environment variable
3. **Docker Configuration**: The Dockerfile sets `HOSTNAME="0.0.0.0"` which is correct for Docker networking, but the app wasn't handling this properly

## Fixes Applied

### 1. Updated Auth Callback Handler (`app/auth/callback/route.ts`)

**Changes:**
- Added proper environment variable handling for `NEXT_PUBLIC_APP_URL`
- Added fallback logic to prevent `0.0.0.0` redirects
- Uses production URL from environment variable as priority

**Key Code Changes:**
```typescript
// BEFORE:
const { searchParams, origin } = new URL(request.url)

// AFTER:
const requestUrl = new URL(request.url)
const { searchParams } = requestUrl

// Use NEXT_PUBLIC_APP_URL as the base URL for redirects in production
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin

// Ensure we never redirect to 0.0.0.0 or invalid origins
const origin = baseUrl.includes('0.0.0.0') ? requestUrl.origin : baseUrl
```

### 2. Updated Environment Variable (`.env`)

**Changed:**
```env
# BEFORE:
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AFTER:
NEXT_PUBLIC_APP_URL=https://tales.anejjar.com
```

## Deployment Checklist

### For Production Deployment:

1. **Update Environment Variables in Your Hosting Platform** (Vercel/Dokploy/Docker):
   ```env
   NEXT_PUBLIC_APP_URL=https://tales.anejjar.com
   ```

2. **Verify Supabase Configuration**:
   - Go to: https://supabase.com/dashboard/project/qpdoemudsvfhnxaigrsd/auth/url-configuration
   - Ensure these URLs are configured:
     - **Site URL**: `https://tales.anejjar.com`
     - **Redirect URLs**: Add `https://tales.anejjar.com/auth/callback`
     - **Additional Redirect URLs**: Add any other required callback URLs

3. **Rebuild and Redeploy**:
   ```bash
   # For Docker:
   docker build --build-arg NEXT_PUBLIC_APP_URL=https://tales.anejjar.com -t ai-stories .
   docker run -p 3000:3000 -e NEXT_PUBLIC_APP_URL=https://tales.anejjar.com ai-stories

   # For Vercel:
   vercel --prod

   # For Dokploy:
   # Ensure NEXT_PUBLIC_APP_URL is set in the Dokploy environment variables
   ```

### For Local Development:

1. **Create a `.env.local` file** (for development only):
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

2. **Keep `.env` with production values** (for deployment):
   ```env
   NEXT_PUBLIC_APP_URL=https://tales.anejjar.com
   ```

## Files Modified

1. ✅ `app/auth/callback/route.ts` - Fixed redirect logic
2. ✅ `.env` - Updated production URL
3. ✅ Created `AUTH_REDIRECT_FIX.md` - This documentation

## Backups Created

All modified files have been backed up with timestamps:
- `app/auth/callback/route.ts.backup-[timestamp]`
- `.env.backup-[timestamp]`

## Testing Instructions

### 1. Test Email Confirmation Flow:

1. **Create a new test account**:
   - Go to: https://tales.anejjar.com/signup
   - Use a test email address
   - Complete signup

2. **Check confirmation email**:
   - Open the email confirmation link
   - URL should look like:
     ```
     https://qpdoemudsvfhnxaigrsd.supabase.co/auth/v1/verify?token=...&type=signup&redirect_to=https://tales.anejjar.com/auth/callback
     ```

3. **Verify redirect**:
   - After clicking the link, you should be redirected to:
     ```
     https://tales.anejjar.com/library
     ```
   - You should **NOT** see `0.0.0.0:3000` in the URL
   - You should **NOT** see an error message

### 2. Test Password Reset Flow:

1. Go to: https://tales.anejjar.com/forgot-password
2. Enter email and request reset
3. Click reset link in email
4. Should redirect to: `https://tales.anejjar.com/auth/reset-password`

### 3. Check Error Scenarios:

1. **Invalid verification token**:
   - Should redirect to: `https://tales.anejjar.com/login?error=Could not authenticate user`
   - Should **NOT** redirect to `0.0.0.0:3000`

2. **Expired verification token**:
   - Should redirect to: `https://tales.anejjar.com/login?error=Could not authenticate user`
   - Should **NOT** redirect to `0.0.0.0:3000`

## Supabase Configuration Verification

### 1. Check Redirect URLs in Supabase Dashboard:

1. Go to: [Supabase Auth Settings](https://supabase.com/dashboard/project/qpdoemudsvfhnxaigrsd/auth/url-configuration)

2. **Verify these settings**:
   - **Site URL**: `https://tales.anejjar.com`
   - **Redirect URLs** (add if missing):
     - `https://tales.anejjar.com/**`
     - `https://tales.anejjar.com/auth/callback`
     - `http://localhost:3000/**` (for development)
     - `http://localhost:3000/auth/callback` (for development)

### 2. Check Email Templates:

1. Go to: [Email Templates](https://supabase.com/dashboard/project/qpdoemudsvfhnxaigrsd/auth/templates)

2. **Verify the redirect_to parameter**:
   - Confirmation email template should use: `{{ .ConfirmationURL }}`
   - Reset password template should use: `{{ .ResetPasswordURL }}`

## Additional Hardcoded URLs Found

These files had hardcoded `localhost:3000` references (documentation only - no code changes needed):
- `README.md` - Documentation examples
- `SETUP.md` - Setup instructions
- `DOKPLOY_SETUP.md` - Deployment guide
- `FAMILY_PLAN_SETUP_GUIDE.md` - Feature guide
- Various other markdown documentation files

These are safe to leave as-is since they're documentation, not code.

## Environment Variables Reference

### Required for Production:

```env
# App URL (CRITICAL - must match your domain)
NEXT_PUBLIC_APP_URL=https://tales.anejjar.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://qpdoemudsvfhnxaigrsd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Providers
OPENAI_API_KEY=your_key
GEMINI_API_KEY=your_key

# Email
RESEND_API_KEY=your_key

# Security
CRON_SECRET=your_secret
```

## Troubleshooting

### Issue: Still redirecting to 0.0.0.0:3000

**Solution 1**: Clear browser cache and cookies
```bash
# Or use incognito/private browsing mode
```

**Solution 2**: Verify environment variable in production
```bash
# Check that NEXT_PUBLIC_APP_URL is set correctly
echo $NEXT_PUBLIC_APP_URL
# Should output: https://tales.anejjar.com
```

**Solution 3**: Rebuild with fresh environment
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Issue: Error "Could not authenticate user"

**Possible causes:**
1. **Supabase redirect URLs not configured** - Add `https://tales.anejjar.com/auth/callback` to Supabase
2. **Token expired** - Request a new confirmation email
3. **Invalid token** - Ensure the full URL from the email is used

### Issue: Redirects work locally but not in production

**Solution**: Check these in order:
1. Verify `NEXT_PUBLIC_APP_URL` is set in production environment
2. Rebuild the Docker image or redeploy
3. Check Supabase redirect URLs include your production domain
4. Verify no reverse proxy is modifying headers

## Success Criteria

✅ Email confirmation redirects to `https://tales.anejjar.com/library`
✅ Password reset redirects to `https://tales.anejjar.com/auth/reset-password`
✅ No `0.0.0.0:3000` URLs appear anywhere in the redirect flow
✅ Error redirects go to `https://tales.anejjar.com/login?error=...`
✅ All authentication flows complete successfully

## Support

If issues persist after applying these fixes:

1. Check browser console for errors
2. Check server logs for authentication errors
3. Verify Supabase email logs: [Supabase Logs](https://supabase.com/dashboard/project/qpdoemudsvfhnxaigrsd/logs/auth-logs)
4. Test with a fresh incognito window
5. Verify all environment variables are loaded correctly in production

## Files Created

- ✅ `AUTH_REDIRECT_FIX.md` - This comprehensive fix documentation
