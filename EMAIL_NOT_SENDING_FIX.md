# Fix: Confirmation Emails Not Sending

## What Was Fixed

I've updated `lib/auth/client-helpers.ts` to use the correct redirect URL consistently:
- Now uses `NEXT_PUBLIC_APP_URL` if set
- Falls back to `window.location.origin`
- Logs the redirect URL for debugging

## Why Emails Stop Sending

The most common reason Supabase stops sending confirmation emails is **redirect URL mismatch**. Supabase will silently fail to send emails if the `emailRedirectTo` URL is not in the allowed redirect URLs list.

---

## 🚀 Quick Fix Checklist

### Step 1: Configure Supabase Redirect URLs ⭐ **MOST IMPORTANT**

1. **Go to Supabase Dashboard**:
   ```
   https://supabase.com/dashboard/project/qpdoemudsvfhnxaigrsd/auth/url-configuration
   ```

2. **Set Site URL**:
   ```
   https://tales.anejjar.com
   ```

3. **Add ALL these Redirect URLs** (click "Add URL" for each):
   ```
   https://tales.anejjar.com/**
   https://tales.anejjar.com/auth/callback
   https://tales.anejjar.com/auth/reset-password
   http://localhost:3000/**
   http://localhost:3000/auth/callback
   http://localhost:3000/auth/reset-password
   ```

4. **Click Save**

**Why this matters**: Supabase validates the `emailRedirectTo` parameter. If the URL isn't whitelisted, it will reject the signup and NOT send the email (silently!).

---

### Step 2: Check Email Confirmation Settings

1. **Go to**:
   ```
   https://supabase.com/dashboard/project/qpdoemudsvfhnxaigrsd/auth/providers
   ```

2. **Check "Email" provider settings**:
   - ✅ "Enable email provider" should be ON
   - ✅ "Confirm email" should be ON (if you want email verification)
   - ❌ "Autoconfirm users" should be OFF (if you want email verification)

3. **Check "Email Auth" settings**:
   ```
   https://supabase.com/dashboard/project/qpdoemudsvfhnxaigrsd/auth/settings
   ```
   - Look for "Confirm email" toggle
   - Make sure it's enabled

---

### Step 3: Check Email Rate Limiting

Supabase has rate limits for sending emails:
- **Default**: 4 emails per hour per user
- **If exceeded**: Emails won't send until the limit resets

**To check**:
1. Go to: https://supabase.com/dashboard/project/qpdoemudsvfhnxaigrsd/logs/auth-logs
2. Look for "Email rate limit exceeded" errors
3. Wait 1 hour or use a different email for testing

---

### Step 4: Verify SMTP Configuration (If using custom SMTP)

If you configured custom SMTP:

1. **Go to**:
   ```
   https://supabase.com/dashboard/project/qpdoemudsvfhnxaigrsd/auth/email-templates
   ```

2. **Check SMTP settings**:
   - Verify SMTP host, port, username, password
   - Make sure "Enable Custom SMTP" is on if you're using it
   - Test the connection

**Note**: If NOT using custom SMTP, Supabase uses its own email service (no configuration needed).

---

### Step 5: Check Email Templates

1. **Go to**:
   ```
   https://supabase.com/dashboard/project/qpdoemudsvfhnxaigrsd/auth/email-templates
   ```

2. **Check "Confirm signup" template**:
   - Make sure it exists and is not empty
   - Verify it contains `{{ .ConfirmationURL }}`
   - Default template should work fine

3. **Test with default template**:
   - Click "Reset to default" if you customized it
   - Try signup again

---

## 🔍 Debugging Steps

### Check Browser Console

After clicking "Sign Up":

1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for these messages:
   ```
   Attempting sign up for: user@example.com
   Auth redirect URL: https://tales.anejjar.com/auth/callback
   Supabase sign up successful: <user-id>
   Confirmation email should be sent to: user@example.com
   ```

4. **If you see an error**:
   - `redirect URL not allowed` → Configure redirect URLs in Supabase
   - `Email rate limit exceeded` → Wait 1 hour or use different email
   - `Network error` → Check your internet / Supabase project URL

---

### Check Supabase Auth Logs

1. **Go to**:
   ```
   https://supabase.com/dashboard/project/qpdoemudsvfhnxaigrsd/logs/auth-logs
   ```

2. **Look for recent signup attempts**:
   - Should show `user.created` event
   - Check for any error messages
   - Look for email-related errors

3. **Common errors**:
   - `redirect URL not allowed` → Add URL to whitelist
   - `email rate limit exceeded` → Wait or use different email
   - `SMTP error` → Check SMTP configuration

---

### Test Signup Flow

1. **Use a fresh email** (not used before):
   ```
   test-$(date +%s)@example.com
   ```

2. **Open browser in incognito mode** (fresh cookies)

3. **Go to signup page**:
   ```
   https://tales.anejjar.com/signup
   ```

4. **Fill form and submit**

5. **Check browser console** for logs

6. **Check Supabase logs** for events

7. **Check email inbox** (including spam/junk)

---

## ✅ Expected Behavior After Fix

### When Signup Works Correctly:

1. **User fills form** → Submits
2. **Browser console shows**:
   ```
   Attempting sign up for: user@example.com
   Auth redirect URL: https://tales.anejjar.com/auth/callback
   Supabase sign up successful: abc123
   Confirmation email should be sent to: user@example.com
   ```
3. **Redirect to**: `/verify-email?email=user@example.com`
4. **Email arrives** within 1-2 minutes
5. **User clicks link** → Redirected to `/library` (logged in)

---

## 🆘 Still Not Receiving Emails?

### Checklist:

- [ ] Redirect URLs configured in Supabase (including `/**` wildcard)
- [ ] Site URL set to `https://tales.anejjar.com`
- [ ] Email confirmation enabled in Supabase settings
- [ ] Autoconfirm is OFF
- [ ] Not hitting rate limits (use fresh emails for testing)
- [ ] SMTP configured correctly (if using custom SMTP)
- [ ] Email template is valid and not empty
- [ ] No errors in browser console
- [ ] No errors in Supabase auth logs
- [ ] Checked spam/junk folder
- [ ] Waited at least 5 minutes for email

---

### Alternative Testing Methods:

#### Method 1: Check Supabase Dashboard Directly

1. Go to: https://supabase.com/dashboard/project/qpdoemudsvfhnxaigrsd/auth/users
2. After signup, the user should appear here
3. Check the `email_confirmed_at` field (should be null)
4. Click "..." → "Send confirmation email" to manually trigger

#### Method 2: Manual Email Verification (Testing Only)

1. Go to: https://supabase.com/dashboard/project/qpdoemudsvfhnxaigrsd/auth/users
2. Find the user
3. Click "..." → "Set email to confirmed"
4. User can now login without email verification

**Note**: Only use for testing. In production, users must verify via email.

#### Method 3: Disable Email Confirmation (Testing Only)

1. Go to: https://supabase.com/dashboard/project/qpdoemudsvfhnxaigrsd/auth/providers
2. Turn OFF "Confirm email"
3. Users can login immediately without verification
4. **Remember to turn it back ON for production!**

---

## 📋 Deployment Steps

After fixing the code:

1. **Rebuild application**:
   ```bash
   npm run build
   ```

2. **Redeploy**:
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

3. **Clear browser cache** or use incognito mode

4. **Test with fresh email**

---

## 🔧 Quick Test Script

Run this to test if Supabase is configured correctly:

```bash
./check-supabase-config.sh
```

This will check:
- Environment variables
- Supabase connection
- Auth settings
- Callback endpoint

---

## 📚 Related Documentation

- **QUICK_FIX_AUTH_ERROR.md** - Authentication error fixes
- **AUTH_ERROR_TROUBLESHOOTING.md** - Detailed auth troubleshooting
- **DEPLOYMENT_FIX_URGENT.md** - Deployment instructions
- **check-supabase-config.sh** - Configuration checker script

---

## Summary

**Root Cause**: Supabase redirect URLs not whitelisted

**Fix Applied**: Updated `client-helpers.ts` to use correct redirect URL

**Action Required**:
1. Configure Supabase redirect URLs (5 minutes)
2. Verify email confirmation settings
3. Redeploy application
4. Test with fresh email

**Expected Result**: Confirmation emails sent within 1-2 minutes of signup ✨
