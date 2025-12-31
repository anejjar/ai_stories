// Core Type Definitions

export type SubscriptionTier = 'trial' | 'pro' | 'family'

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
  onboardingCompleted?: boolean
  onboardingStep?: OnboardingStep
  onboardingDismissedAt?: Date
  onboardingChecklist?: OnboardingChecklist
}

export interface ChildAppearance {
  skinTone?: string
  hairColor?: string
  hairStyle?: string
}

export interface Child {
  name: string
  adjectives: string[]
  appearance?: ChildAppearance // Family Plan only
  profileId?: string // Reference to child profile if using saved profile
}

export interface ChildProfile {
  id: string
  userId: string
  name: string
  nickname?: string
  birthDate?: Date
  appearance?: ChildAppearance
  aiGeneratedImageUrl?: string // AI-processed safe version
  ai_generated_image_url?: string // Database column name (snake_case)
  aiDescription?: string // AI description for consistent illustration generation
  ai_description?: string // Database column name (snake_case)
  originalImageUploadedAt?: Date // When original was uploaded (for tracking)
  createdAt: Date
  updatedAt: Date
}

export interface BookPage {
  pageNumber: number
  text: string
  illustration_url: string
  // Aspect ratio metadata (optional for backward compatibility)
  width?: number
  height?: number
  aspectRatio?: 'square' | 'portrait' | 'landscape'
}

export interface Story {
  id: string
  userId: string
  title: string
  content: string
  childName: string // Deprecated: kept for backward compatibility
  adjectives: string[] // Deprecated: kept for backward compatibility
  children?: Child[] // New: array of children for multi-child stories
  theme: string
  moral?: string
  hasImages: boolean
  imageUrls?: string[]
  appearance?: ChildAppearance // Deprecated: kept for backward compatibility (Family Plan only)
  parentStoryId?: string // If set, this is a draft of another story
  draftNumber?: number // Draft number (1, 2, 3, etc.)
  isSelectedDraft?: boolean // True if this draft was selected as final
  isIllustratedBook?: boolean // True if this is an illustrated book format (Family Plan feature)
  bookPages?: BookPage[] // Structured pages with illustrations (Family Plan feature)
  visibility?: 'public' | 'private'
  publishedAt?: Date
  viewCount?: number
  likesCount?: number
  commentsCount?: number
  averageRating?: number
  ratingsCount?: number
  createdAt: Date
  updatedAt: Date
}

export interface StoryInput {
  childName?: string // Optional: for single-child stories (backward compatible)
  adjectives?: string[] // Optional: for single-child stories (backward compatible)
  children?: Child[] // New: for multi-child stories
  theme: string
  moral?: string
  generateImages?: boolean
  templateId?: string // Optional template ID
  appearance?: ChildAppearance // Deprecated: kept for backward compatibility (Family Plan only)
  profileId?: string // Optional: for illustrated books with child profile
}

export interface TrialUsage {
  userId: string
  storiesGenerated: number
  trialCompleted: boolean
  trialCompletedAt?: Date
}

export interface Payment {
  id: string
  userId: string
  stripePaymentIntentId: string
  amount: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed'
  subscriptionTier: SubscriptionTier
  createdAt: Date
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  code: string
  message: string
  details?: unknown
}

export interface StoryGenerationRequest {
  childName?: string // Optional: for single-child stories
  adjectives?: string[] // Optional: for single-child stories
  children?: Child[] // Optional: for multi-child stories
  theme: string
  moral?: string
  templateId?: string
}

export interface StoryGenerationResponse {
  story: Story
  requiresUpgrade?: boolean
}

export interface DraftGenerationRequest {
  childName?: string // Optional: for single-child stories
  adjectives?: string[] // Optional: for single-child stories
  children?: Child[] // Optional: for multi-child stories
  theme: string
  moral?: string
  templateId?: string
  numberOfDrafts?: number // Default: 3
}

export interface DraftGenerationResponse {
  drafts: Story[]
  parentStoryId?: string // ID of the parent story (first draft)
  requiresUpgrade?: boolean
}

// =====================================================
// DAILY USAGE TRACKING (Family Plan Limits)
// =====================================================

export interface DailyUsage {
  id: string
  userId: string
  usageDate: Date
  textStoriesCount: number
  illustratedStoriesCount: number
  firstTextStoryAt?: Date
  firstIllustratedStoryAt?: Date
  lastResetAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface UsageLimitCheck {
  canCreate: boolean
  reason: string
  resetAt?: Date
  currentCount?: number
  maxCount?: number
}

export interface UsageStats {
  today: {
    textStories: number
    illustratedStories: number
    textLimit: number
    illustratedLimit: number
    textResetAt?: Date
    illustratedResetAt?: Date
  }
  thisWeek: {
    textStories: number
    illustratedStories: number
  }
  thisMonth: {
    textStories: number
    illustratedStories: number
  }
  allTime: {
    totalStories: number
  }
}

// =====================================================
// FEATURED STORIES (Homepage Display)
// =====================================================

export interface FeaturedStory {
  id: string
  storyId: string
  story?: Story // Populated when fetching
  featuredBy?: string
  displayTitle?: string
  displayExcerpt?: string
  featuredOrder: number
  category?: string
  tags?: string[]
  isActive: boolean
  featuredFrom: Date
  featuredUntil?: Date
  viewCount: number
  clickCount: number
  createdAt: Date
  updatedAt: Date
}

export interface FeaturedStoryInput {
  storyId: string
  displayTitle?: string
  displayExcerpt?: string
  category?: string
  tags?: string[]
  featuredOrder?: number
  featuredUntil?: Date
}

// =====================================================
// STORY SHARING
// =====================================================

export interface SharedStoryToken {
  id: string
  storyId: string
  sharedBy: string
  token: string
  requiresAuth: boolean
  expiresAt?: Date
  maxViews?: number
  currentViews: number
  sharedVia?: 'email' | 'facebook' | 'twitter' | 'link'
  sharedAt: Date
  lastAccessedAt?: Date
  createdAt: Date
}

export interface ShareStoryRequest {
  storyId: string
  method: 'email' | 'facebook' | 'twitter' | 'link'
  expiresIn?: number // Hours until expiration
  maxViews?: number // Optional view limit
}

export interface ShareStoryResponse {
  success: boolean
  shareUrl: string
  token: string
  expiresAt?: Date
}

// =====================================================
// SUBSCRIPTION TIER LIMITS
// =====================================================

export interface TierLimits {
  tier: SubscriptionTier
  childProfiles: number
  illustratedStoriesPerDay: number | 'unlimited'
  textStoriesPerDay: number | 'unlimited'
  features: string[]
  price: number // in cents
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, TierLimits> = {
  trial: {
    tier: 'trial',
    childProfiles: 1,
    illustratedStoriesPerDay: 0,
    textStoriesPerDay: 1, // Total lifetime, not per day
    features: [
      '1 free story',
      'Save & view stories',
      '100% kid-safe content',
      'Personalized with child\'s name'
    ],
    price: 0
  },
  pro: {
    tier: 'pro',
    childProfiles: 2,
    illustratedStoriesPerDay: 0, // No illustrated stories in Pro
    textStoriesPerDay: 'unlimited',
    features: [
      'Unlimited text stories',
      'Multiple story drafts (3 per request)',
      'Rewrite & enhance tools',
      '25+ story themes',
      '10 story templates',
      'Text-to-Speech audio',
      'Unlimited storage',
      'Ad-free'
    ],
    price: 999 // $9.99
  },
  family: {
    tier: 'family',
    childProfiles: 3,
    illustratedStoriesPerDay: 2,
    textStoriesPerDay: 10,
    features: [
      'Everything in Pro',
      'Up to 3 child profiles',
      '2 AI-illustrated stories per day',
      '10 text stories per day',
      'High-resolution picture books',
      'Child appearance customization',
      'PDF export',
      'Advanced art styles',
      'Family dashboard'
    ],
    price: 2499 // $24.99
  }
}


// Export discovery types
export * from './discovery'

// =====================================================
// ONBOARDING SYSTEM
// =====================================================

export type OnboardingStep =
  | 'welcome'
  | 'profile_setup'
  | 'tour_active'
  | 'first_story'
  | 'completed'

export interface OnboardingChecklistItem {
  id: string
  label: string
  completed: boolean
  completedAt?: Date
}

export interface OnboardingChecklist {
  items: OnboardingChecklistItem[]
  dismissed: boolean
}

export interface OnboardingState {
  onboardingCompleted: boolean
  onboardingStep: OnboardingStep
  onboardingDismissedAt?: Date
  onboardingChecklist: OnboardingChecklist
}

export interface TourTooltipConfig {
  id: string
  target: string // CSS selector or element ID
  title: string
  description: string
  placement: 'top' | 'bottom' | 'left' | 'right'
  step: number
  totalSteps: number
}

export interface OnboardingUpdateRequest {
  step?: OnboardingStep
  completed?: boolean
  dismissed?: boolean
  checklistUpdate?: {
    itemId: string
    completed: boolean
  }
}
