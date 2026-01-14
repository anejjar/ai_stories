# Supabase Configuration Checklist

## ⚡ Quick Setup (5 Minutes)

Copy this checklist and complete each step:

### 1. Configure Redirect URLs ⭐ **CRITICAL**

**Link**: https://supabase.com/dashboard/project/qpdoemudsvfhnxaigrsd/auth/url-configuration

**Actions**:
- [ ] Set Site URL to: `https://tales.anejjar.com`
- [ ] Add: `https://tales.anejjar.com/**`
- [ ] Add: `https://tales.anejjar.com/auth/callback`
- [ ] Add: `https://tales.anejjar.com/auth/reset-password`
- [ ] Add: `http://localhost:3000/**` (for dev)
- [ ] Add: `http://localhost:3000/auth/callback` (for dev)
- [ ] Click **Save**

---

### 2. Verify Email Settings

**Link**: https://supabase.com/dashboard/project/qpdoemudsvfhnxaigrsd/auth/providers

**Actions**:
- [ ] Email provider is **enabled**
- [ ] "Confirm email" is **ON**
- [ ] "Autoconfirm users" is **OFF** (unless you want to skip email verification)

---

### 3. Deploy Application

```bash
# Stop current containers
docker-compose down

# Rebuild with updates
docker-compose up -d --build
```

**Actions**:
- [ ] Application redeployed
- [ ] No errors in startup logs
- [ ] Can access https://tales.anejjar.com

---

### 4. Test Signup Flow

**Actions**:
- [ ] Open https://tales.anejjar.com/signup in **incognito mode**
- [ ] Use a **fresh email** (not used before)
- [ ] Fill form and submit
- [ ] Open browser console (F12)
- [ ] Check for log: `Auth redirect URL: https://tales.anejjar.com/auth/callback`
- [ ] Check for: `Confirmation email should be sent to: <email>`
- [ ] Wait 1-5 minutes for email
- [ ] Check spam/junk folder if needed
- [ ] Click confirmation link in email
- [ ] Redirected to `/library` and logged in

---

## 🔍 Troubleshooting

If emails still not sending:

### Check 1: Browser Console
```
Open DevTools (F12) → Console tab
Look for: "Auth redirect URL: https://tales.anejjar.com/auth/callback"
```

### Check 2: Supabase Logs
```
Go to: https://supabase.com/dashboard/project/qpdoemudsvfhnxaigrsd/logs/auth-logs
Look for: "redirect URL not allowed" or "rate limit" errors
```

### Check 3: Run Config Checker
```bash
./check-supabase-config.sh
```

---

## 📋 Configuration Verification

Use this to verify your setup is correct:

### Environment Variables
```bash
# Should be set in production
NEXT_PUBLIC_APP_URL=https://tales.anejjar.com
NEXT_PUBLIC_SUPABASE_URL=https://qpdoemudsvfhnxaigrsd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>
```

### Supabase Settings
```
Site URL: https://tales.anejjar.com
Redirect URLs:
  - https://tales.anejjar.com/**
  - https://tales.anejjar.com/auth/callback
  - https://tales.anejjar.com/auth/reset-password
Email Confirmation: ON
Autoconfirm: OFF
```

---

## 🎯 Success Criteria

✅ User creates account
✅ Confirmation email arrives within 5 minutes
✅ Email link redirects to correct domain
✅ User is logged in after confirmation
✅ No errors in browser console
✅ No errors in Supabase logs

---

## 🆘 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| No email received | Check redirect URLs configured in Supabase |
| "Could not authenticate user" | Add redirect URLs, check Site URL |
| "redirect URL not allowed" in logs | Add URL to allowed redirects |
| Email goes to spam | Normal - check spam folder |
| "Rate limit exceeded" | Wait 1 hour or use different email |
| Old email link doesn't work | Links are single-use, request new one |

---

## 📚 Complete Documentation

- **EMAIL_NOT_SENDING_FIX.md** - Email troubleshooting guide
- **QUICK_FIX_AUTH_ERROR.md** - Auth error fixes
- **AUTH_ERROR_TROUBLESHOOTING.md** - Detailed troubleshooting
- **DEPLOYMENT_FIX_URGENT.md** - Deployment instructions
- **check-supabase-config.sh** - Configuration checker

---

## ✨ Final Notes

- **Always use fresh emails for testing** (not previously used)
- **Check spam folder** - confirmation emails often go there
- **Wait up to 5 minutes** - emails can take time
- **Use incognito mode** - fresh cookies/session
- **Check both browser console and Supabase logs** for errors

Once configured correctly, emails should send reliably! 🚀
