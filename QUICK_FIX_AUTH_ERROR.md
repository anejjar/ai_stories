# Quick Fix: "Could not authenticate user" Error

## ✅ Good News
The redirect is working correctly! You're now being sent to `https://tales.anejjar.com/login` instead of Docker container IDs.

## ❌ Current Issue
The error "Could not authenticate user" appears because authentication is failing.

## 🎯 Most Likely Cause
**Supabase redirect URLs are not configured properly.**

---

## 🚀 Quick Fix (5 Minutes)

### Step 1: Configure Supabase Redirect URLs

1. **Open Supabase Dashboard**:
   https://supabase.com/dashboard/project/qpdoemudsvfhnxaigrsd/auth/url-configuration

2. **Set Site URL**:
   ```
   https://tales.anejjar.com
   ```
   Click **Save**

3. **Add Redirect URLs** (click "Add URL" for each):
   ```
   https://tales.anejjar.com/**
   https://tales.anejjar.com/auth/callback
   http://localhost:3000/**
   http://localhost:3000/auth/callback
   ```
   Click **Save** after adding all URLs

### Step 2: Redeploy Your Application

```bash
# Option A: Using the deploy script
./deploy-fix.sh

# Option B: Manual Docker
docker-compose down
docker-compose up -d --build

# Option C: Just restart (if already deployed)
docker-compose restart
```

### Step 3: Test with a Fresh Account

1. Go to: https://tales.anejjar.com/signup
2. Create a new test account (use a fresh email)
3. Check your email for the confirmation link
4. Click the link
5. You should be redirected to `/library` and logged in

**Important**: Don't reuse old confirmation emails - they expire and can only be used once!

---

## 🔍 Verification

After fixing:

1. **Check Server Logs** for:
   ```
   Auth callback redirect determination: {
     ...
     finalOrigin: 'https://tales.anejjar.com'
   }
   ```

2. **If there's an error**, it will now show a more specific message:
   - "Verification link has expired" → Request new email
   - "This verification link has already been used" → Just login normally
   - "Authentication failed: [details]" → Check logs for the specific error

3. **Use the config checker**:
   ```bash
   ./check-supabase-config.sh
   ```

---

## 🆘 If Still Not Working

### Check 1: Ensure Fresh Confirmation Email
Old confirmation links don't work. Create a NEW test account with a different email.

### Check 2: Look at Server Logs
The callback now logs detailed errors:
```bash
# For Docker
docker logs -f ai-stories | grep "Auth callback"

# Look for lines like:
Auth callback error: {
  error: "...",
  code: "...",
  ...
}
```

### Check 3: Verify Email Link Format
Your confirmation email should contain a link like:
```
https://qpdoemudsvfhnxaigrsd.supabase.co/auth/v1/verify?token=...&type=signup&redirect_to=https://tales.anejjar.com/auth/callback
```

**Check**:
- ✓ `redirect_to` parameter points to `https://tales.anejjar.com/auth/callback`
- ✓ Not `http://localhost:3000` or `0.0.0.0`
- ✓ Not a Docker container ID

### Check 4: Update Email Template (If redirect_to is wrong)

1. Go to: https://supabase.com/dashboard/project/qpdoemudsvfhnxaigrsd/auth/templates
2. Click "Confirm signup"
3. Ensure it uses: `{{ .ConfirmationURL }}`
4. Save and send a new confirmation email

---

## 📋 Quick Checklist

- [ ] Supabase Site URL = `https://tales.anejjar.com`
- [ ] Supabase Redirect URLs include `https://tales.anejjar.com/**`
- [ ] Application redeployed with updated callback handler
- [ ] Testing with a FRESH account (new email)
- [ ] Confirmation link not expired or already used
- [ ] Server logs checked for specific error messages

---

## 📚 Documentation

For more details, see:
- **AUTH_ERROR_TROUBLESHOOTING.md** - Comprehensive troubleshooting guide
- **DEPLOYMENT_FIX_URGENT.md** - Deployment instructions
- **AUTH_REDIRECT_FIX.md** - Original redirect fix

---

## 🎯 Expected Result

After the fix:

1. Sign up → Receive confirmation email
2. Click link → Redirected to `https://tales.anejjar.com/auth/callback?code=...`
3. Callback processes → Sets session cookies
4. Final redirect → `https://tales.anejjar.com/library` (logged in!)

No error messages! ✨

---

## 💡 Pro Tip

**Bookmark this Supabase page** for quick access:
https://supabase.com/dashboard/project/qpdoemudsvfhnxaigrsd/auth/url-configuration

You'll need it whenever you change domains or add new callback URLs.
