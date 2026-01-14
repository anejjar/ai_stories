# URGENT: Fix Auth Redirect Issue in Production

## Problem
Users are being redirected to Docker container hostnames like `https://480732db8db3:3000` instead of `https://tales.anejjar.com` after email confirmation.

## Root Cause
The `NEXT_PUBLIC_APP_URL` environment variable is not being properly set or loaded in your production environment.

## Immediate Solution

### Option 1: Hardcoded Fallback (FASTEST - Already Applied)

I've updated the auth callback handler to use a hardcoded fallback to `https://tales.anejjar.com` when the environment variable is not set or contains invalid values.

**No additional deployment steps needed for this fix** - just redeploy your app and it will work.

### Option 2: Properly Set Environment Variable (RECOMMENDED)

Follow these steps based on your deployment platform:

---

## For Dokploy Deployment

1. **Go to your Dokploy dashboard**
2. **Navigate to your AI Stories application**
3. **Go to the "Environment" or "Environment Variables" section**
4. **Add/Update this variable**:
   ```
   NEXT_PUBLIC_APP_URL=https://tales.anejjar.com
   ```
5. **Rebuild the application** (important - Next.js needs this at build time)
6. **Redeploy**

### Dokploy CLI Method:
```bash
# Add environment variable via CLI
dokploy env set NEXT_PUBLIC_APP_URL=https://tales.anejjar.com

# Rebuild and redeploy
dokploy deploy
```

---

## For Docker Compose

Update your `docker-compose.yml`:

```yaml
services:
  ai-stories:
    build:
      context: .
      args:
        NEXT_PUBLIC_APP_URL: https://tales.anejjar.com
    environment:
      - NEXT_PUBLIC_APP_URL=https://tales.anejjar.com
    # ... other configuration
```

Then rebuild:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## For Docker Run

```bash
# Stop existing container
docker stop ai-stories
docker rm ai-stories

# Rebuild with build arg
docker build \
  --build-arg NEXT_PUBLIC_APP_URL=https://tales.anejjar.com \
  -t ai-stories .

# Run with environment variable
docker run -d \
  --name ai-stories \
  -p 3000:3000 \
  -e NEXT_PUBLIC_APP_URL=https://tales.anejjar.com \
  ai-stories
```

---

## For Vercel

1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Add variable:
   - **Name**: `NEXT_PUBLIC_APP_URL`
   - **Value**: `https://tales.anejjar.com`
   - **Environment**: Production (and optionally Preview)
3. Redeploy from the Deployments tab

---

## For Railway

1. Go to your project settings
2. Navigate to "Variables"
3. Add variable:
   ```
   NEXT_PUBLIC_APP_URL=https://tales.anejjar.com
   ```
4. Railway will automatically redeploy

---

## For Netlify

1. Go to: Site settings → Environment variables
2. Add variable:
   - **Key**: `NEXT_PUBLIC_APP_URL`
   - **Value**: `https://tales.anejjar.com`
3. Trigger a new deployment

---

## Verification Steps

After redeploying:

1. **Check the environment variable is loaded**:
   - Create a test page: `app/test-env/page.tsx`
   ```typescript
   export default function TestEnv() {
     return (
       <div>
         <h1>Environment Check</h1>
         <p>NEXT_PUBLIC_APP_URL: {process.env.NEXT_PUBLIC_APP_URL}</p>
       </div>
     )
   }
   ```
   - Visit: `https://tales.anejjar.com/test-env`
   - Should show: `NEXT_PUBLIC_APP_URL: https://tales.anejjar.com`

2. **Test email confirmation**:
   - Create a new test account
   - Click the confirmation link in email
   - Should redirect to: `https://tales.anejjar.com/library`

3. **Check server logs**:
   - Look for the debug log: "Auth callback redirect determination:"
   - Should show `finalOrigin: https://tales.anejjar.com`

---

## Quick Fix Summary

The callback handler now has **multiple fallback mechanisms**:

1. ✅ **Priority 1**: Uses `NEXT_PUBLIC_APP_URL` if set
2. ✅ **Priority 2**: Uses `redirect_to` parameter from Supabase
3. ✅ **Priority 3**: Uses `X-Forwarded-Host` header (for reverse proxies)
4. ✅ **Priority 4**: Uses `Host` header (if it looks like a valid domain)
5. ✅ **Priority 5**: Falls back to `https://tales.anejjar.com`

**Even if the environment variable is not set, it will now default to your production domain.**

---

## If Still Not Working

### Check 1: Verify Supabase Configuration

Go to: https://supabase.com/dashboard/project/qpdoemudsvfhnxaigrsd/auth/url-configuration

Ensure these are set:
- **Site URL**: `https://tales.anejjar.com`
- **Redirect URLs**: Add `https://tales.anejjar.com/**`

### Check 2: Check Reverse Proxy Headers

If you're using a reverse proxy (Nginx, Caddy, Traefik), ensure it's forwarding headers:

**Nginx example**:
```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
}
```

**Caddy example**:
```
tales.anejjar.com {
    reverse_proxy localhost:3000 {
        header_up X-Forwarded-Host {host}
        header_up X-Forwarded-Proto {scheme}
    }
}
```

### Check 3: View Server Logs

Look for the debug log in your server logs:
```
Auth callback redirect determination: {
  productionUrl: '...',
  redirectTo: '...',
  forwardedHost: '...',
  host: '...',
  finalOrigin: '...'
}
```

This will tell you exactly what values are being detected.

### Check 4: Clear Next.js Cache

Sometimes Next.js caches environment variables:
```bash
# In your deployment
rm -rf .next
npm run build
```

---

## Current Code Changes

### File: `app/auth/callback/route.ts`

The callback handler now:
1. Checks multiple sources for the correct domain
2. Validates that domains are not internal Docker hostnames
3. Falls back to `https://tales.anejjar.com` as last resort
4. Logs all decisions for debugging

### File: `.env`

Updated to:
```env
NEXT_PUBLIC_APP_URL=https://tales.anejjar.com
```

---

## Action Required

### Minimal Action (Already Working):
✅ Just redeploy - the hardcoded fallback will work immediately

### Recommended Action (Best Practice):
1. Set `NEXT_PUBLIC_APP_URL=https://tales.anejjar.com` in your deployment platform
2. Rebuild from scratch (not just restart)
3. Verify the environment variable is loaded
4. Test email confirmation flow

---

## Expected Results After Fix

✅ Email confirmation redirects to: `https://tales.anejjar.com/library`
✅ Password reset redirects to: `https://tales.anejjar.com/auth/reset-password`
✅ Errors redirect to: `https://tales.anejjar.com/login?error=...`
❌ No more Docker container IDs in URLs
❌ No more `0.0.0.0:3000` in URLs

---

## Support

If the issue persists:
1. Check server logs for the "Auth callback redirect determination" log
2. Share the log output
3. Verify your deployment platform's environment variable configuration
4. Test with the `/test-env` page to confirm variables are loaded

The code now has multiple safety nets, so it should work even without the environment variable being set.
