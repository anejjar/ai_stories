# Family Plan Implementation - Progress Tracker

## ✅ Completed (December 11, 2025)

### 1. Database Migration ✅
**File:** `supabase/migrations/011_family_plan_migration.sql`

**What was done:**
- ✅ Updated subscription tier enum to include 'family'
- ✅ Added grandfathering support (is_grandfathered, grandfathered_price columns)
- ✅ Migrated existing 'pro_max' users to 'family' tier at $19.99
- ✅ Created `daily_usage` table with rolling 24-hour window tracking
- ✅ Created `featured_stories` table for homepage curation
- ✅ Created `shared_story_tokens` table for auth-required sharing
- ✅ Added child profile limit enforcement (trigger-based)
- ✅ Created PostgreSQL functions:
  - `can_create_story()` - Check if user can create story based on limits
  - `increment_story_usage()` - Increment usage counters
  - `get_or_create_daily_usage()` - Get or create usage record

**Key Features:**
- Rolling 24-hour windows (not midnight reset)
- Separate tracking for text vs illustrated stories
- Automatic counter reset after 24 hours
- Database-level limit enforcement

---

### 2. TypeScript Types ✅
**File:** `types/index.ts`

**What was done:**
- ✅ Updated `SubscriptionTier` type to include 'family'
- ✅ Added grandfathering fields to `User` interface
- ✅ Created `DailyUsage` interface
- ✅ Created `UsageLimitCheck` interface
- ✅ Created `UsageStats` interface
- ✅ Created `FeaturedStory` and `FeaturedStoryInput` interfaces
- ✅ Created `SharedStoryToken` and sharing-related interfaces
- ✅ Created `TierLimits` interface
- ✅ Added `SUBSCRIPTION_LIMITS` constant with all tier limits

**Tier Limits Defined:**
- **Trial:** 1 child, 1 story total (lifetime), $0
- **Pro:** 2 children, unlimited text stories, $9.99/month
- **Family:** 3 children, 2 illustrated/day, 10 text/day, $24.99/month
- **ProMax (Legacy):** 3 children, unlimited, $19.99/month (grandfathered)

---

### 3. Daily Usage Tracking Service ✅
**File:** `lib/usage/daily-limits.ts`

**What was done:**
- ✅ Created `checkStoryLimit()` - validates user can create story with rolling window
- ✅ Created `incrementStoryUsage()` - tracks usage after generation
- ✅ Created `getUserUsageStats()` - complete analytics (today/week/month/all-time)
- ✅ Created `checkChildProfileLimit()` - enforces profile limits
- ✅ Created `getTimeUntilReset()` - countdown timers
- ✅ Created `formatUsageMessage()` - user-friendly messages
- ✅ Integrated with Supabase PostgreSQL functions
- ✅ Error handling with fail-open strategy

---

### 4. Stripe Configuration Update ✅
**Files:** `lib/payments/stripe.ts`

**What was done:**
- ✅ Added `family: 2499` ($24.99) to SUBSCRIPTION_PRICES
- ✅ Updated `getPriceIdForTier()` to include STRIPE_FAMILY_PRICE_ID
- ✅ Created `getTierDisplayName()` helper function
- ✅ Created `getTierFeatures()` with all tier features
- ✅ Documented environment variables needed

**Required Env Variables:**
```
STRIPE_FAMILY_PRICE_ID=price_xxx  # Create in Stripe Dashboard at $24.99/month
STRIPE_PRO_MAX_PRICE_ID=price_xxx # Legacy users only at $19.99/month
```

---

### 5. Limit Enforcement in API ✅
**File:** `app/api/stories/route.ts`

**What was done:**
- ✅ Imported `checkStoryLimit` and `incrementStoryUsage` from daily-limits service
- ✅ Added Family Plan limit check before story generation (line 195-221)
- ✅ Return 429 error with reset time when limit reached
- ✅ Track usage after successful story save (line 521-525)
- ✅ Handle both text and illustrated stories separately
- ✅ Updated illustrated book check to include 'family' tier (line 316)
- ✅ Proper error messages with `isLimitReached` and `resetAt` data

---

### 6. Usage Dashboard & React Hooks ✅
**New Files Created:**
- ✅ `hooks/use-usage-stats.ts` - React hook for usage data
- ✅ `components/usage/usage-dashboard.tsx` - Complete dashboard UI
- ✅ `app/api/usage/stats/route.ts` - API endpoint for stats

**Features Implemented:**
- ✅ Real-time usage display with progress bars
- ✅ Countdown timers for limit resets (updates every minute)
- ✅ Color-coded progress (green/yellow/red based on usage)
- ✅ Weekly and monthly statistics
- ✅ All-time story count
- ✅ Upgrade prompts when near/at limits
- ✅ Support for all tiers (trial/pro/family)
- ✅ Dark mode compatible
- ✅ Loading and error states

---

### 7. Update Pricing Page ✅
**File:** `app/(dashboard)/pricing/page.tsx`

**What was done:**
- ✅ Renamed "PRO MAX" to "FAMILY PLAN" throughout
- ✅ Updated price from $19.99 to $24.99
- ✅ Updated feature list with new limits:
  - "Up to 3 Child Profiles"
  - "2 AI-Illustrated Stories/Day"
  - "10 Text Stories/Day"
  - "Family Dashboard"
- ✅ Updated metadata description
- ✅ Updated comparison table with accurate limits
- ✅ Changed signup link from `?tier=pro_max` to `?tier=family`
- ✅ Kept "BEST VALUE" badge on Family Plan

---

### 8. Payment Webhook Update ✅
**File:** `app/api/payments/webhook/route.ts`

**What was done:**
- ✅ Added STRIPE_FAMILY_PRICE_ID handling for new subscribers
- ✅ Legacy STRIPE_PRO_MAX_PRICE_ID converts to family tier with grandfathering
- ✅ New Family Plan subscribers: `is_grandfathered = false`
- ✅ Legacy ProMax subscribers: `is_grandfathered = true`, `grandfathered_price = 1999`
- ✅ Added logging for debugging subscription updates
- ✅ Handles subscription created/updated/deleted events

---

## ✅ Phase 1 Complete! (December 11, 2025)

**All core infrastructure is now in place:**
- Database schema with rolling window tracking ✅
- TypeScript types for all new features ✅
- Daily usage service layer ✅
- API limit enforcement ✅
- React hooks and UI components ✅
- Stripe integration updated ✅
- Pricing page rebranded ✅
- Payment webhooks configured ✅

**Next Steps:**
- Apply database migration to production
- Create Stripe products and update environment variables
- Test complete flow (signup → subscribe → generate stories → hit limits → upgrade)

---

## 📋 Remaining Tasks

### Phase 2: Homepage & Sharing (Next Week)

---

### Phase 2: Homepage & Sharing (Next Week)

#### 8. Featured Stories on Homepage
**New Files:**
- `components/stories/featured-stories-gallery.tsx`
- `app/api/featured-stories/route.ts`
- `hooks/use-featured-stories.ts`

**Tasks:**
- [ ] Create gallery component for homepage
- [ ] API endpoint to fetch active featured stories
- [ ] Anonymize story display (no child names)
- [ ] Add "Sign up to read" modal
- [ ] Track view/click metrics

#### 9. Admin Panel for Curation
**New Files:**
- `app/admin/featured-stories/page.tsx`
- `app/api/admin/featured-stories/route.ts`
- `components/admin/story-curation-panel.tsx`

**Tasks:**
- [ ] Admin route protection
- [ ] List all stories for curation
- [ ] Add/remove from featured
- [ ] Edit display title/excerpt
- [ ] Set category and tags
- [ ] Preview how story appears on homepage

#### 10. Auth-Required Story Sharing
**Files to update:**
- `components/stories/share-dialog.tsx`
- `middleware.ts`
- `app/story/[id]/page.tsx`

**Tasks:**
- [ ] Update share dialog with auth disclaimer
- [ ] Redirect to signup when sharing link accessed
- [ ] Store redirect path after auth
- [ ] Track share attribution
- [ ] Show who shared the story (optional)

---

## 📊 2026 Roadmap Implementation Schedule

### Q1 2026 (January - March)
**Priority:** Family Features & Social Proof

**Week 1-2:**
- [ ] Family Dashboard component
- [ ] Story Collections feature
- [ ] Reading Streaks & Badges

**Week 3-4:**
- [ ] Public Story Gallery expansion
- [ ] Usage Analytics Dashboard
- [ ] "What's New" communication system

**Deliverables:**
- Family Dashboard live
- 50+ featured stories
- Engagement metrics tracking

---

### Q2 2026 (April - June)
**Priority:** Enhanced Personalization

**Weeks 1-4:**
- [ ] Advanced Child Profiles (interests, hobbies, reading level)
- [ ] Story Series & Continuations
- [ ] Parent-Child Co-Creation tools

**Weeks 5-8:**
- [ ] Voice Cloning improvements
- [ ] 50+ new story templates
- [ ] Cultural/diversity templates

**Deliverables:**
- Personalization engine
- Story continuity system
- Template library expansion

---

### Q3 2026 (July - September)
**Priority:** Interactive & Educational

**Weeks 1-4:**
- [ ] Interactive Stories (choose-your-own-adventure)
- [ ] Quiz questions within stories
- [ ] Vocabulary building

**Weeks 5-8:**
- [ ] Learning Reports for Parents
- [ ] Educator/School Edition (new tier)
- [ ] Multi-Language Support

**Weeks 9-12:**
- [ ] Story Remixing feature
- [ ] Curriculum alignment
- [ ] Progress tracking system

**Deliverables:**
- Interactive story engine
- School edition beta
- 4 languages supported

---

### Q4 2026 (October - December)
**Priority:** Community & Premium Features

**Weeks 1-4:**
- [ ] Story Marketplace infrastructure
- [ ] Revenue sharing system
- [ ] Professional illustrations marketplace

**Weeks 5-8:**
- [ ] Grandparent Access add-on
- [ ] Print-on-Demand integration
- [ ] Story Parties & Events

**Weeks 9-12:**
- [ ] AI Story Narration Videos
- [ ] Sibling Story Mode
- [ ] Year-end analytics & reports

**Deliverables:**
- Marketplace live
- Print-on-demand operational
- Video generation feature

---

## 💰 Revenue Projections 2026

### Pricing Structure
- **Trial:** $0
- **Pro:** $9.99/month
- **Family:** $24.99/month (primary tier)
- **Family Plus:** $34.99/month (Q4 launch)
- **Educator:** $49/month (Q3 launch)

### Add-Ons
- Story Packs: $4.99 each
- Custom Illustration Styles: $9.99/month
- Grandparent Access: $4.99/month
- Print-on-Demand: $19.99-$39.99 per book

### Targets
- **Q1:** 100 Family Plan subscribers → $2,499 MRR
- **Q2:** 300 Family Plan subscribers → $7,497 MRR
- **Q3:** 600 Family Plan subscribers + 20 schools → $15,974 MRR
- **Q4:** 1,000 Family Plan subscribers + 50 schools → $27,440 MRR

**Annual Target:** $50K+ MRR by December 2026

---

## 🎯 Success Metrics

### User Engagement
- Average stories per user per month: 5+
- Daily active users: 30% of subscribers
- Completion rate: 80%+ (users who hit child profile limit)

### Retention
- Month 1-2: 90%+
- Month 2-3: 85%+
- Month 3-6: 80%+
- Month 6-12: 75%+

### Conversion
- Trial to Pro: 15%+
- Trial to Family: 10%+
- Pro to Family upgrade: 25%+

### Community
- Featured stories: 500+ by Q1 end
- Marketplace creators: 50+ by Q4
- Print orders: 100+ per month by Q4

---

## 🚨 Blockers & Risks

### Technical
- Database scaling for daily usage tracking
- Image generation costs with increased limits
- Video generation infrastructure (Q4)

### Business
- User education on new limits
- Managing grandfather users expectations
- Competition from similar products

### Mitigation
- Implement caching for usage queries
- Optimize AI model usage
- Clear communication about value
- Focus on unique features (personalization, family focus)

---

## 📝 Next Immediate Steps

1. **Create `lib/usage/daily-limits.ts`** - Core service
2. **Update `lib/payments/stripe.ts`** - Family Plan pricing
3. **Update `app/api/stories/route.ts`** - Enforce limits
4. **Create Usage Dashboard** - Show limits to users
5. **Update Pricing Page** - Rebrand ProMax → Family

**Estimated Time:** 2-3 days for core functionality

---

**Last Updated:** December 11, 2025
**Status:** Phase 1 in progress (60% complete)
**Next Milestone:** Core infrastructure complete by December 14, 2025
