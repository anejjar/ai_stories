# Testing Subscription Tiers (Development Only)

## Overview
This is a **testing-only** feature that allows developers to manually switch subscription tiers without going through Stripe checkout. This should be **removed before production deployment**.

## How to Use

1. **Navigate to Profile Page**: Go to `/profile` while logged in
2. **Find the Testing Toggle**: You'll see a red-bordered card at the top with "🧪 TESTING ONLY - Subscription Tier Switcher"
3. **Switch Tiers**: Click on any tier button (Trial, PRO, or PRO MAX) to instantly switch your subscription tier
4. **Test Features**: After switching, refresh the page or navigate to test PRO/PRO MAX features:
   - **PRO**: Multiple story drafts, unlimited stories, TTS, etc.
   - **PRO MAX**: Everything in PRO + AI image generation, appearance customization

## Files Created (To Remove Later)

### API Endpoint
- `app/api/test/subscription/route.ts` - API endpoint for updating subscription tier
  - Only works in development mode (NODE_ENV !== 'production')
  - Requires authentication

### Component
- `components/test/subscription-toggle.tsx` - UI component for switching tiers
  - Only renders in development mode
  - Shows warning messages about testing-only usage

### Integration
- `app/(dashboard)/profile/page.tsx` - Added the toggle component to profile page
- `hooks/use-auth.ts` - Added `refreshProfile()` function to refresh user data after tier change

## How to Remove Before Production

1. Delete the API endpoint:
   ```bash
   rm app/api/test/subscription/route.ts
   ```

2. Delete the component:
   ```bash
   rm components/test/subscription-toggle.tsx
   ```

3. Remove from profile page:
   - Remove the import: `import { SubscriptionToggle } from '@/components/test/subscription-toggle'`
   - Remove the component usage (the conditional block with `<SubscriptionToggle />`)

4. Optional: Remove `refreshProfile` from `use-auth.ts` if not used elsewhere

## Security Notes

- ✅ The API endpoint checks `NODE_ENV` and won't work in production
- ✅ The component only renders in development mode
- ✅ Still requires authentication (user must be logged in)
- ⚠️ This bypasses payment validation - only for testing!

## Testing Checklist

- [ ] Switch to PRO tier and test:
  - [ ] Multiple story drafts generation
  - [ ] Unlimited story creation
  - [ ] Text-to-speech functionality
  - [ ] Story enhancement tools
  
- [ ] Switch to PRO MAX tier and test:
  - [ ] All PRO features
  - [ ] AI image generation
  - [ ] Appearance customization
  - [ ] Multi-child stories with appearance

- [ ] Switch back to Trial and verify:
  - [ ] Trial limit is enforced
  - [ ] PRO features are locked
  - [ ] Upgrade prompts appear

