# Onboarding System Integration Guide

## Overview
A complete onboarding system has been implemented to guide new users from account creation through their first story. This guide explains how to complete the integration.

## What's Been Created

### 1. Database Migration
**File:** `supabase/migrations/013_onboarding_system.sql`
- Adds onboarding fields to users table
- Tracks onboarding completion, current step, dismissal, and checklist progress

### 2. Type Definitions
**File:** `types/index.ts`
- `OnboardingStep`: Type for tracking progress through onboarding
- `OnboardingChecklistItem`: Individual checklist task
- `OnboardingChecklist`: Full checklist with items and dismissal state
- `TourTooltipConfig`: Configuration for tour tooltips
- `OnboardingUpdateRequest`: API request structure

### 3. API Route
**File:** `app/api/users/onboarding/route.ts`
- `GET /api/users/onboarding` - Fetch current onboarding state
- `PATCH /api/users/onboarding` - Update onboarding progress

### 4. Custom Hook
**File:** `hooks/use-onboarding.ts`
- `useOnboarding()` - Manages all onboarding state and actions
- Methods: completeStep, skipOnboarding, completeChecklist, etc.

### 5. Components

#### Core Components
- **WelcomeModal** (`components/onboarding/welcome-modal.tsx`)
  - 2-screen welcome flow
  - Introduces app features
  - Optional quick profile setup

- **QuickProfileForm** (`components/onboarding/quick-profile-form.tsx`)
  - Simplified child profile creation
  - Just name and age range

- **TourTooltip** (`components/onboarding/tour-tooltip.tsx`)
  - Contextual tooltip system
  - TourWrapper for multi-step tours

- **SuccessModal** (`components/onboarding/success-modal.tsx`)
  - Celebrates first story creation
  - Shows achievement unlocked
  - Encourages upgrades for trial users

- **ChecklistWidget** (`components/onboarding/checklist-widget.tsx`)
  - Persistent checklist in bottom-right corner
  - Tracks 6 discovery tasks
  - Collapsible and dismissible

- **OnboardingManager** (`components/onboarding/onboarding-manager.tsx`)
  - Orchestrates onboarding flow
  - Shows welcome modal at right time

- **CreatePageTour** (`components/onboarding/create-page-tour.tsx`)
  - Ready-to-use tour for create page
  - 4 tooltip steps highlighting key features

### 6. Integration Points
**File:** `app/(dashboard)/layout.tsx`
- Added `<OnboardingManager />` - Shows welcome modal for new users
- Added `<ChecklistWidget />` - Shows discovery checklist

## Integration Steps

### Step 1: Run Database Migration
```bash
npx supabase db push
# or
npx supabase migration up
```

This adds the onboarding fields to your users table.

### Step 2: Add Tour to Create Page
In `app/(dashboard)/create/page.tsx`, add:

```tsx
import { CreatePageTour } from '@/components/onboarding/create-page-tour'
import { SuccessModal } from '@/components/onboarding/success-modal'
import { useOnboarding } from '@/hooks/use-onboarding'

function CreateContent() {
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdStory, setCreatedStory] = useState<Story | null>(null)
  const { onboardingStep } = useOnboarding()
  const isFirstStory = onboardingStep === 'tour_active' || onboardingStep === 'first_story'

  // In handleSubmit, after successful story creation:
  if (result.success && result.data) {
    const story = result.data as Story

    // Show success modal for first-time users
    if (isFirstStory) {
      setCreatedStory(story)
      setShowSuccessModal(true)
    } else {
      toast.success('Story created! 🎉', 'Your magical story is ready!')
      router.push(`/story/${story.id}`)
    }
  }

  return (
    <>
      {/* ... existing code ... */}

      <CreatePageTour />

      <SuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        storyId={createdStory?.id}
        storyTitle={createdStory?.title}
      />
    </>
  )
}
```

### Step 3: Add Tour IDs to StoryForm
In `components/stories/story-form.tsx`, add data-tour attributes:

```tsx
// Theme selector
<div data-tour="theme-select">
  <Select value={theme} onValueChange={setTheme}>
    {/* ... theme options ... */}
  </Select>
</div>

// Template section (if exists)
<div data-tour="template-section">
  {/* ... template cards ... */}
</div>

// Trial badge
<div data-tour="trial-badge">
  <Badge>Trial: {storiesUsed}/1 stories</Badge>
</div>

// Generate button
<Button type="submit" data-tour="generate-button">
  Generate Story
</Button>
```

### Step 4: Update User Type Interface
In `types/index.ts`, update the User interface to include onboarding fields:

```tsx
export interface User {
  id: string
  email: string
  displayName?: string
  photoURL?: string
  subscriptionTier: SubscriptionTier
  createdAt: Date
  updatedAt: Date
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  // Add onboarding fields
  onboardingCompleted?: boolean
  onboardingStep?: OnboardingStep
  onboardingDismissedAt?: Date
  onboardingChecklist?: OnboardingChecklist
}
```

### Step 5: Update refreshProfile to Fetch Onboarding Data
In `hooks/use-auth.ts`, ensure the profile fetch includes onboarding fields:

```tsx
const { data: profile } = await supabaseAdmin
  .from('users')
  .select('*, onboarding_completed, onboarding_step, onboarding_dismissed_at, onboarding_checklist')
  .eq('id', userId)
  .single()
```

### Step 6: Install Missing Dependencies (if needed)
The SuccessModal uses react-confetti:

```bash
npm install react-confetti
```

## Onboarding Flow

### New User Journey:
1. **Sign up/Login** → Redirected to library
2. **WelcomeModal appears** (2 screens)
   - Screen 1: Welcome + feature highlights
   - Screen 2: Quick profile setup (optional)
3. **Redirect to /create** with tour active
4. **TourTooltips guide user** through form (4 steps)
5. **User creates first story**
6. **SuccessModal celebrates** achievement
7. **ChecklistWidget appears** with ongoing tasks
8. **Onboarding complete!**

### Checklist Tasks:
- ✅ Create your first story
- Add a child profile
- Explore different themes
- Customize character appearance
- Discover community stories
- Start a reading streak

## Key Features

### Skip/Resume Functionality
- Users can skip the entire onboarding
- Can resume from the checklist widget anytime
- Dismissal is tracked in database

### Progress Tracking
- Each step is saved to database
- Checklist items track completion
- Milestones integrate with achievements system

### Responsive to Subscription Tier
- Success modal adapts messaging for trial users
- Shows upgrade prompts at appropriate times
- Highlights premium features

## Customization Options

### Modify Tour Steps
Edit `components/onboarding/create-page-tour.tsx`:
- Change tooltip messages
- Add/remove steps
- Adjust target selectors
- Modify placement

### Update Checklist Items
Edit `supabase/migrations/013_onboarding_system.sql`:
- Modify default checklist items
- Add new tasks
- Change labels

### Customize Welcome Flow
Edit `components/onboarding/welcome-modal.tsx`:
- Update feature highlights
- Change copy and messaging
- Modify visual design

## Testing Checklist

- [ ] Run database migration successfully
- [ ] New user sees welcome modal on first login
- [ ] Profile creation works (both create and skip)
- [ ] Tour tooltips appear on create page
- [ ] Tour can be completed or skipped
- [ ] First story triggers success modal
- [ ] Checklist widget appears and tracks progress
- [ ] Checklist can be dismissed
- [ ] Onboarding state persists across sessions
- [ ] Trial users see appropriate upgrade messaging

## Troubleshooting

### Welcome modal doesn't appear
- Check that user has `onboarding_completed = false` in database
- Verify `onboarding_step = 'welcome'`
- Ensure OnboardingManager is in dashboard layout

### Tour tooltips not showing
- Verify data-tour attributes exist on target elements
- Check that `onboarding_step = 'tour_active'`
- Ensure elements are visible when tour starts

### Success modal not triggering
- Check that story creation success is detected
- Verify onboarding step is 'tour_active' or 'first_story'
- Ensure modal state is managed correctly

### Checklist widget missing
- Verify ChecklistWidget is in dashboard layout
- Check that `onboarding_checklist.dismissed = false`
- Ensure user has checklist data in database

## Next Steps

After integration:
1. Test the full flow with a new account
2. Gather user feedback on onboarding experience
3. Monitor completion rates
4. A/B test different messaging
5. Add analytics tracking for each step

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify database migration ran successfully
3. Ensure all imports are correct
4. Check that hooks are called in client components ('use client')

---

**Congratulations!** Your app now has a world-class onboarding experience that will delight new users and increase engagement! 🎉
