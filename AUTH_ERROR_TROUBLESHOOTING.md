# Auth Error: "Could not authenticate user" - Troubleshooting Guide

## Problem
You're seeing "Could not authenticate user" message after clicking the email confirmation link, even though the redirect is working correctly to `https://tales.anejjar.com/login`.

## Common Causes & Solutions

### 1. Supabase Redirect URLs Not Configured ⭐ **MOST COMMON**

**Symptom**: Redirect works, but authentication fails

**Solution**:
1. Go to: https://supabase.com/dashboard/project/qpdoemudsvfhnxaigrsd/auth/url-configuration

2. **Check Site URL**:
   - Should be: `https://tales.anejjar.com`
   - Click "Save" if you need to update it

3. **Add Redirect URLs** (if not already there):
   Click "Add URL" and add these one by one:
   ```
   https://tales.anejjar.com/**
   https://tales.anejjar.com/auth/callback
   http://localhost:3000/**
   http://localhost:3000/auth/callback
   ```

4. **Save changes** and try again

**Why this matters**: Supabase validates that the callback URL matches allowed redirect URLs. If not configured, it rejects the authentication.

---

### 2. Email Link Already Used

**Symptom**: Works the first time, fails on subsequent clicks

**Explanation**: Email confirmation links are single-use tokens. Once you click it successfully, the token is consumed.

**Solution**:
- If you've already confirmed your email, just try logging in normally
- If you need a new link, request password reset or resend confirmation email

---

### 3. Email Link Expired

**Symptom**: Link worked initially but now shows error

**Explanation**: Confirmation tokens expire after a certain time (usually 24 hours)

**Solution**:
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/qpdoemudsvfhnxaigrsd
2. Navigate to Authentication → Users
3. Find the user and click "Send recovery email" or delete and recreate the account

---

### 4. Cookie/Session Issues

**Symptom**: Random authentication failures

**Solution**:
1. Clear browser cookies for `tales.anejjar.com`
2. Try in incognito/private mode
3. Check browser console for cookie errors

---

### 5. Reverse Proxy Cookie Configuration

**Symptom**: Works locally but not in production

**If using Nginx**, ensure cookies are allowed:
```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;

    # Important for cookies:
    proxy_cookie_path / "/; SameSite=Lax; Secure";
}
```

**If using Caddy**:
```
tales.anejjar.com {
    reverse_proxy localhost:3000
}
```
(Caddy handles cookies correctly by default)

---

### 6. Environment Variable Mismatch

**Symptom**: Inconsistent behavior

**Check that these match**:
```bash
# In your .env file:
NEXT_PUBLIC_SUPABASE_URL=https://qpdoemudsvfhnxaigrsd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=https://tales.anejjar.com
```

**Verify in production**:
- These environment variables must be set in your deployment platform
- They must be set as build-time variables (for Next.js)

---

## Diagnostic Steps

### Step 1: Check Server Logs

After clicking the confirmation link, check your server logs for:

```
Auth callback redirect determination: {
  productionUrl: 'https://tales.anejjar.com',
  redirectTo: '...',
  finalOrigin: 'https://tales.anejjar.com'
}
```

And look for:
```
Auth callback error: {
  error: '...',
  code: '...',
  status: ...,
  type: 'signup'
}
```

**What to look for**:
- `error: 'invalid_request'` → Supabase redirect URL not configured
- `error: 'Token has expired'` → Need new confirmation email
- `error: 'Token already used'` → Already confirmed, just login

---

### Step 2: Test the Email Link

Copy the full confirmation link from your email. It should look like:
```
https://qpdoemudsvfhnxaigrsd.supabase.co/auth/v1/verify?token=LONG_TOKEN_HERE&type=signup&redirect_to=https://tales.anejjar.com/auth/callback
```

**Check**:
1. ✓ Domain is `qpdoemudsvfhnxaigrsd.supabase.co`
2. ✓ Has `token` parameter
3. ✓ Has `type=signup`
4. ✓ `redirect_to` points to `https://tales.anejjar.com/auth/callback`

If `redirect_to` is wrong, you need to update the Supabase email template.

---

### Step 3: Check Supabase Auth Logs

1. Go to: https://supabase.com/dashboard/project/qpdoemudsvfhnxaigrsd/logs/auth-logs

2. Look for recent authentication attempts

3. Check for error messages like:
   - "redirect URL not allowed"
   - "invalid token"
   - "token expired"

---

### Step 4: Test with a Fresh Account

1. **Create a new test account** with a different email
2. **Don't click the link multiple times**
3. **Check server logs immediately** after clicking

This helps identify if the issue is with a specific user or systematic.

---

## Quick Fixes

### Fix 1: Update Supabase Email Template

If the `redirect_to` in the email is wrong:

1. Go to: https://supabase.com/dashboard/project/qpdoemudsvfhnxaigrsd/auth/templates

2. Click "Confirm signup" template

3. Ensure the link uses:
   ```
   {{ .ConfirmationURL }}
   ```

4. If you customized it, make sure `redirect_to` parameter is:
   ```
   redirect_to={{ .SiteURL }}/auth/callback
   ```

---

### Fix 2: Resend Confirmation Email

If you need a fresh token:

**Option A - Via Supabase Dashboard**:
1. Go to Authentication → Users
2. Find the user
3. Click "..." → Send confirmation email

**Option B - Via Code**:
```typescript
// Create a resend endpoint
const { error } = await supabase.auth.resend({
  type: 'signup',
  email: 'user@example.com'
})
```

---

### Fix 3: Manual Email Verification (Testing Only)

For testing purposes, you can manually verify a user:

1. Go to Supabase Dashboard → Authentication → Users
2. Find the user
3. Click "..." → "Set email to confirmed"

**Note**: This is for testing only. In production, users should click the link.

---

## Updated Error Messages

The callback handler now provides more specific errors:

| Error Message | Meaning | Solution |
|---------------|---------|----------|
| "Verification link has expired" | Token is too old | Request new confirmation email |
| "This verification link has already been used" | Token consumed | Just login normally |
| "Verification link is invalid" | Bad token | Request new confirmation or sign up again |
| "Invalid authentication link" | No code parameter | Check email link is complete |
| "Authentication failed: [details]" | Other error | Check server logs for details |

---

## Expected Flow (Correct Behavior)

1. **User signs up** → Account created in Supabase (unverified)
2. **Confirmation email sent** → Contains link to Supabase with redirect_to
3. **User clicks link** → Supabase verifies token → Redirects to `/auth/callback?code=...`
4. **Callback handler** → Exchanges code for session → Sets cookies
5. **User redirected** → To `/library` (logged in)

---

## Debugging Checklist

- [ ] Supabase redirect URLs configured (includes `tales.anejjar.com`)
- [ ] NEXT_PUBLIC_APP_URL set to `https://tales.anejjar.com`
- [ ] Email link contains correct `redirect_to` parameter
- [ ] Confirmation link is fresh (not expired or used)
- [ ] Server logs show correct origin detection
- [ ] No browser cookie issues (test in incognito)
- [ ] Supabase auth logs show no errors

---

## Test Commands

### Check Environment Variables
```bash
# In your server/container
echo $NEXT_PUBLIC_APP_URL
# Should output: https://tales.anejjar.com

echo $NEXT_PUBLIC_SUPABASE_URL
# Should output: https://qpdoemudsvfhnxaigrsd.supabase.co
```

### Check Supabase Configuration via API
```bash
# Get auth config
curl https://qpdoemudsvfhnxaigrsd.supabase.co/auth/v1/settings \
  -H "apikey: YOUR_ANON_KEY"
```

### Monitor Server Logs
```bash
# For Docker
docker logs -f ai-stories

# For Dokploy
# Check in the Dokploy dashboard → Logs

# For Vercel
vercel logs
```

---

## Still Not Working?

If none of the above solutions work:

1. **Collect information**:
   - Screenshot of the error
   - Full email confirmation link (redact the token)
   - Server logs (last 50 lines)
   - Supabase auth logs

2. **Verify Supabase project**:
   - Confirm the project URL matches
   - Check if auth is enabled
   - Verify email settings are correct

3. **Test basic auth**:
   - Try password reset instead
   - Try creating account without email confirmation (if enabled)

4. **Check for known issues**:
   - Supabase status: https://status.supabase.com
   - Supabase docs: https://supabase.com/docs/guides/auth

---

## Next Steps After Fix

Once working:

1. **Test the complete flow**:
   - Sign up with test email
   - Receive confirmation email
   - Click link
   - Get redirected and logged in

2. **Monitor for 24 hours**:
   - Check if other users report issues
   - Review auth logs for patterns

3. **Document your configuration**:
   - Save your Supabase redirect URL settings
   - Keep environment variables documented

---

## Summary

**Most likely cause**: Supabase redirect URLs not configured

**Quick fix**: Add `https://tales.anejjar.com/**` to Supabase allowed redirect URLs

**Verification**: Check server logs for detailed error messages after deploying the updated callback handler
