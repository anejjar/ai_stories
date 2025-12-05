# PRODUCT PLAN — Personalized Baby Stories App (PRO + PRO MAX Model)

**Version 2.0 — With Technology Stack Requirements**

---

## 1. Product Vision

To empower parents globally to create beautiful, emotionally meaningful, and educational stories starring their child—transforming bedtime into a deeply personalized and memorable family ritual.

**Every output must be 100% kid-safe, wholesome, and privacy-respecting.**

## 2. Business Goal

Launch a polished MVP that uses a One-Story Free Trial to convert users into paying customers across two tiers: PRO and PRO MAX.

### Target Conversion Rate:

- **10–15%** Trial → PRO
- **5–10%** PRO → PRO MAX (within 90 days)

## 3. Tiered Offering (2-Tier Model)

With the Free Tier removed, the product is structured around a free trial → paid tiers system.

### 3.1 Free Trial (Usage-Based, Not Time-Based)

**Limits:**
- User can generate 1 story for free
- No image generation
- That story can be saved and viewed, but the user cannot create more without upgrading

**Purpose:** Show the core value instantly with almost zero friction.

### 3.2 PRO — Standard Storytelling Tier

**Features:**
- Unlimited text story generation
- Unlimited story storage
- Rewrite/Enhance tools:
  - Make it calmer
  - Make it funnier
  - Extend or shorten
- Extra story templates & themes
- Clean, ad-free experience

**Powered by:** Gemini Text API

### 3.3 PRO MAX — Premium Visual Storybook Tier

**Features:**
- Everything in PRO
- AI-illustrated stories featuring the child
- High-resolution picture-book images
- Unlimited illustrated story generations
- PDF export (Phase 2)
- More advanced themes & art styles

**Powered by:** Gemini + Imagen (or equivalent) for illustration

## 4. Key User Flows

### 4.1 Onboarding → Trial Story

- User signs up
- Simple form: child name, adjectives, moral/theme
- Generates 1 free story
- User reads the story → main emotional moment

### 4.2 Trial End → Upgrade Wall

After the first story, all creation actions lock:

**Upsell Modal:**
> "Your first story is ready! Unlock unlimited new stories with PRO, or add magical illustrations with PRO MAX."

**Buttons:**
- Get PRO
- Get PRO MAX
- "Not now" → read-only mode

### 4.3 PRO Flow

User can:
- Generate unlimited stories
- Rewrite/extend stories
- Save unlimited stories
- Share stories (text link for now)

PRO MAX features are visible but locked (to promote upgrades).

### 4.4 PRO MAX Flow

User can:
- Generate story + images in one flow
- Customize child's appearance (skin tone, hair, etc.)
- Export image-based storybook
- Enable PDF generation (future)

## 5. MVP Scope (Lean & Focused)

### Included in MVP:

- Authentication (email + magic link OR Google Sign-In)
- 1 free story trial system
- Story generation form
- Text generation via Gemini
- Save/load stories
- Upsell modals for PRO and PRO MAX
- Locked illustration features
- Basic library/history view

### Not Included in MVP (Phase 2+):

- PDF export
- TTS bedtime audio
- Multiple story styles
- Illustration customization options
- Custom characters or multi-child stories

## 6. Reliability, Moderation & Edge Cases

### 6.1 API Reliability

**Text API (Gemini):**
- 3 retries with exponential backoff
- 15-second generation timeout
- Graceful fallback messages

**Image API (Imagen):**
- Retry once
- If image generation fails → deliver text only + show soft prompt to retry

### 6.2 Content Moderation

**Input Moderation (Client & Server):**
- Check for profanity, sensitive topics
- Block unsafe prompts before API call

**Output Moderation:**
- If Gemini returns questionable content, treat as hard failure and retry
- Never store unsafe content
- No user-generated child images should ever be used for training

### 6.3 Failure States

**API Hard Failure:**
> "Ooops! Something went wrong. Please try again."

**Network Interruption:**
> Small banner: "Connection lost. Reconnecting…"

**Save Failure (Firestore):**
> Automatically cache story locally until connection returns.

## 7. Upsell & Conversion Strategy

### 7.1 Trial Completion Moment

This is the emotional climax—use it to convert.

After reading story:
- Dim background
- Show upgrade modal
- Highlight PRO MAX illustrations ("See your child inside the storybook!")

### 7.2 Soft Upsells

- Disabled "Add Illustration" button visible during trial
- Locked PRO MAX themes with a gold crown icon
- Blurred place-holder images: "Unlock magical illustrations with PRO MAX"

### 7.3 Library Upsells

At top of story library:
- Slot card: "Turn your stories into picture books — PRO MAX"

## 8. Product Success Metrics

### Acquisition

- Signup rate per 100 visitors
- Trial-start rate (percentage of new users who create their free story)

### Engagement

- Reading duration
- Number of saved stories per user
- Daily/weekly active users

### Conversion

- Trial → PRO
- PRO → PRO MAX

### Reliability Metrics

- API failure rate
- Generation success rate
- Average response time
- Firestore error frequency

## 9. Technology Stack Requirements

This section outlines all required technologies to build the initial MVP and scale it into full production.

### 9.1 Frontend (Mobile-First Web App)

**Framework:**
- Next.js (best for SSR + fast iteration)

**UI Technologies:**
- React
- TailwindCSS
- shadcn/ui
- framer-motion (animations)
- ui should be playfull/colorfull suit for kids

**State Management:**
- Zustand or Jotai (lightweight)
- React Query (API caching + retry management)

### 9.2 Backend

**Serverless Backend:**
- Next.js API Routes (serverless functions)
- Supabase Authentication (email + Google sign-in)

**Database:**
- Supabase PostgreSQL
  - `users` table
  - `stories` table
  - `usage` table (trial tracking)
  - `payments` table

**Storage:**
- Supabase Storage (for images generated in PRO MAX)

**Cache:**
- LocalStorage (temporary cached stories for offline protection)

### 9.3 AI Services

**Text Generation:**
- Gemini 1.5 Flash (fast, cheap)
- Gemini 1.5 Pro (for PRO MAX if needed)

**Image Generation:**
- Imagen 2 / Imagen API compatible service
- (Or another tuned visual model depending on cost and output quality)

**Moderation:**
- Google Safety Filters
- Custom rule-based input sanitizer (for profanity, unsafe themes)

### 9.4 Payments

**Payment Provider:**
- Stripe
  - Monthly subscriptions
  - Webhooks for subscription status
  - Tier switching (PRO ↔ PRO MAX)

### 9.5 Analytics

**Tools:**
- Supabase Analytics (built-in)
- Amplitude (optional)
- LogRocket (optional error tracking)

**Core Events to Track:**
- `trial_started`
- `story_generated`
- `story_read`
- `paywall_viewed`
- `payment_success`
- `pro_max_clicked`
- `image_generation_started/failed`

### 9.6 DevOps & Release Pipeline

**Deployment:**
- Vercel deployment for frontend
- Cloud Functions CI/CD via GitHub Actions

**Monitoring:**
- Supabase Dashboard (database and API monitoring)
- Vercel Analytics (deployment monitoring)
- Optional: Sentry or LogRocket for error tracking

## 10. Roadmap (90-Day Plan)

### Phase 1 — MVP (Weeks 1–4)

- 1-story free trial system
- Text generation
- Story saving
- Upsell modals
- PRO/PRO MAX paywall
- Basic library
- Locked illustration UI

### Phase 2 — PRO MAX Launch (Weeks 4–8)

- Image generation pipeline
- Image storage
- Combined text + image story viewer
- More themes
- Illustration previews

### Phase 3 — Growth Features (Weeks 8–12)

- PDF export
- TTS bedtime audio
- Multiple-draft story creation
- Child character customization
