// Supabase Database Types and Helper Functions

import type { User, Story, TrialUsage, Payment, SubscriptionTier, ChildAppearance, Child, ChildProfile, BookPage } from './index'

// Database User Row (matches PostgreSQL users table)
export interface DatabaseUser {
  id: string
  email: string
  display_name: string | null
  photo_url: string | null
  subscription_tier: SubscriptionTier
  created_at: string // ISO timestamp
  updated_at: string // ISO timestamp
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  onboarding_completed: boolean
  onboarding_step: 'welcome' | 'profile_setup' | 'tour_active' | 'first_story' | 'completed'
  onboarding_dismissed_at: string | null // ISO timestamp
  onboarding_checklist: OnboardingChecklist | null // JSONB
}

// Database Story Row (matches PostgreSQL stories table)
export interface DatabaseStory {
  id: string
  user_id: string
  title: string
  content: string
  child_name: string // Kept for backward compatibility
  adjectives: string[] // Kept for backward compatibility
  children: Child[] | null // JSONB array for multi-child stories
  theme: string
  moral: string | null
  has_images: boolean
  image_urls: string[] | null
  appearance: ChildAppearance | null // JSONB column for Family Plan customization (deprecated, use children[].appearance)
  parent_story_id: string | null // If set, this is a draft of another story
  draft_number: number | null // Draft number (1, 2, 3, etc.)
  is_selected_draft: boolean | null // True if this draft was selected as final
  is_illustrated_book: boolean | null // True if this is an illustrated book format (Family Plan feature)
  book_pages: BookPage[] | null // JSONB array of structured pages with illustrations (Family Plan feature)
  visibility: 'public' | 'private' | null
  published_at: string | null // ISO timestamp
  view_count: number | null
  likes_count: number | null
  comments_count: number | null
  average_rating: number | null
  ratings_count: number | null
  created_at: string // ISO timestamp
  updated_at: string // ISO timestamp
}

// Database Trial Usage Row (matches PostgreSQL usage table)
export interface DatabaseTrialUsage {
  id: string
  user_id: string
  stories_generated: number
  trial_completed: boolean
  trial_completed_at?: string // ISO timestamp
  created_at: string // ISO timestamp
  updated_at: string // ISO timestamp
}

// Database Payment Row (matches PostgreSQL payments table)
export interface DatabasePayment {
  id: string
  user_id: string
  stripe_payment_intent_id: string
  amount: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed'
  subscription_tier: SubscriptionTier
  created_at: string // ISO timestamp
}

// Database Child Profile Row (matches PostgreSQL child_profiles table)
export interface DatabaseChildProfile {
  id: string
  user_id: string
  name: string
  nickname: string | null
  birth_date: string | null // ISO date string
  appearance: ChildAppearance | null // JSONB
  ai_generated_image_url: string | null
  ai_description: string | null // AI-generated description for consistent illustration generation
  original_image_uploaded_at: string | null // ISO timestamp
  created_at: string // ISO timestamp
  updated_at: string // ISO timestamp
}

// Supabase Database Schema Type
export interface Database {
  public: {
    Tables: {
      users: {
        Row: DatabaseUser
        Insert: Omit<DatabaseUser, 'created_at' | 'updated_at'>
        Update: Partial<Omit<DatabaseUser, 'id' | 'created_at'>>
        Relationships: []
      }
      stories: {
        Row: DatabaseStory
        Insert: Omit<DatabaseStory, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<DatabaseStory, 'id' | 'created_at'>>
        Relationships: []
      }
      usage: {
        Row: DatabaseTrialUsage
        Insert: Omit<DatabaseTrialUsage, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<DatabaseTrialUsage, 'id' | 'created_at'>>
        Relationships: []
      }
      payments: {
        Row: DatabasePayment
        Insert: Omit<DatabasePayment, 'id' | 'created_at'>
        Update: Partial<Omit<DatabasePayment, 'id' | 'created_at'>>
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper functions to convert between Database and app types
export function databaseUserToUser(data: DatabaseUser): User {
  return {
    id: data.id,
    email: data.email,
    displayName: data.display_name || undefined,
    photoURL: data.photo_url || undefined,
    subscriptionTier: data.subscription_tier,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    stripeCustomerId: data.stripe_customer_id || undefined,
    stripeSubscriptionId: data.stripe_subscription_id || undefined,
    onboardingCompleted: data.onboarding_completed,
    onboardingStep: data.onboarding_step as any,
    onboardingDismissedAt: data.onboarding_dismissed_at ? new Date(data.onboarding_dismissed_at) : undefined,
    onboardingChecklist: data.onboarding_checklist,
  }
}

export function userToDatabaseUser(user: Partial<User>): Partial<DatabaseUser> {
  return {
    email: user.email,
    display_name: user.displayName || null,
    photo_url: user.photoURL || null,
    subscription_tier: user.subscriptionTier,
    stripe_customer_id: user.stripeCustomerId || null,
    stripe_subscription_id: user.stripeSubscriptionId || null,
  } as Partial<DatabaseUser>
}

export function databaseStoryToStory(data: DatabaseStory): Story {
  // Safely convert dates
  const createdAt = data.created_at ? new Date(data.created_at) : new Date()
  const updatedAt = data.updated_at ? new Date(data.updated_at) : new Date()

  // Validate dates
  const validCreatedAt = isNaN(createdAt.getTime()) ? new Date() : createdAt
  const validUpdatedAt = isNaN(updatedAt.getTime()) ? new Date() : updatedAt

  // Parse children if it's a string (JSONB from database)
  let children: Child[] | undefined = undefined
  if (data.children) {
    if (typeof data.children === 'string') {
      try {
        children = JSON.parse(data.children) as Child[]
      } catch {
        children = undefined
      }
    } else if (Array.isArray(data.children)) {
      children = data.children as Child[]
    }
  }

  // Parse appearance if it's a string (JSONB from database) - deprecated, use children[].appearance
  let appearance: ChildAppearance | undefined = undefined
  if (data.appearance) {
    if (typeof data.appearance === 'string') {
      try {
        appearance = JSON.parse(data.appearance) as ChildAppearance
      } catch {
        appearance = undefined
      }
    } else {
      appearance = data.appearance as ChildAppearance
    }
  }

  // Parse book_pages if it's a string (JSONB from database)
  let bookPages: BookPage[] | undefined = undefined
  if (data.book_pages) {
    if (typeof data.book_pages === 'string') {
      try {
        bookPages = JSON.parse(data.book_pages) as BookPage[]
      } catch {
        bookPages = undefined
      }
    } else if (Array.isArray(data.book_pages)) {
      bookPages = data.book_pages as BookPage[]
    }
  }

  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    content: data.content,
    childName: data.child_name, // Kept for backward compatibility
    adjectives: data.adjectives, // Kept for backward compatibility
    children, // New: multi-child support
    theme: data.theme,
    moral: data.moral || undefined,
    hasImages: data.has_images,
    imageUrls: data.image_urls || undefined,
    appearance, // Deprecated: kept for backward compatibility
    parentStoryId: data.parent_story_id || undefined,
    draftNumber: data.draft_number || undefined,
    isSelectedDraft: data.is_selected_draft || false,
    isIllustratedBook: data.is_illustrated_book || false,
    bookPages,
    visibility: data.visibility || 'private',
    publishedAt: data.published_at ? new Date(data.published_at) : undefined,
    viewCount: data.view_count || 0,
    likesCount: data.likes_count || 0,
    commentsCount: data.comments_count || 0,
    averageRating: typeof data.average_rating === 'string'
      ? parseFloat(data.average_rating)
      : (data.average_rating || 0),
    ratingsCount: data.ratings_count || 0,
    createdAt: validCreatedAt,
    updatedAt: validUpdatedAt,
  }
}

export function storyToDatabaseStory(story: Partial<Story>): Partial<DatabaseStory> {
  // If children array exists, use it; otherwise fall back to single child for backward compatibility
  const hasChildren = story.children && story.children.length > 0
  const childName = hasChildren ? story.children![0].name : story.childName
  const adjectives = hasChildren ? story.children![0].adjectives : story.adjectives

  return {
    user_id: story.userId,
    title: story.title,
    content: story.content,
    child_name: childName || '', // Kept for backward compatibility
    adjectives: adjectives || [], // Kept for backward compatibility
    children: story.children || null, // New: multi-child support
    theme: story.theme,
    moral: story.moral || null,
    has_images: story.hasImages ?? false, // Ensure boolean, never undefined
    image_urls: story.imageUrls || null,
    appearance: story.appearance || null, // Deprecated: kept for backward compatibility
    parent_story_id: story.parentStoryId || null,
    draft_number: story.draftNumber || null,
    is_selected_draft: story.isSelectedDraft ?? false, // Ensure boolean, never undefined
    is_illustrated_book: story.isIllustratedBook ?? false, // Ensure boolean, never undefined
    book_pages: story.bookPages || null, // JSONB array of pages
    visibility: story.visibility || 'private',
    published_at: story.publishedAt ? story.publishedAt.toISOString() : null,
  } as Partial<DatabaseStory>
}

export function databaseTrialUsageToTrialUsage(
  data: DatabaseTrialUsage
): TrialUsage {
  return {
    userId: data.user_id,
    storiesGenerated: data.stories_generated,
    trialCompleted: data.trial_completed,
    trialCompletedAt: data.trial_completed_at
      ? new Date(data.trial_completed_at)
      : undefined,
  }
}

export function databasePaymentToPayment(data: DatabasePayment): Payment {
  return {
    id: data.id,
    userId: data.user_id,
    stripePaymentIntentId: data.stripe_payment_intent_id,
    amount: data.amount,
    currency: data.currency,
    status: data.status,
    subscriptionTier: data.subscription_tier,
    createdAt: new Date(data.created_at),
  }
}

// Legacy compatibility functions (for gradual migration)
export function firestoreUserToUser(id: string, data: any): User {
  return {
    id,
    email: data.email || '',
    displayName: data.display_name || data.displayName,
    photoURL: data.photo_url || data.photoURL,
    subscriptionTier: data.subscription_tier || data.subscriptionTier,
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
    stripeCustomerId: data.stripe_customer_id || data.stripeCustomerId,
    stripeSubscriptionId: data.stripe_subscription_id || data.stripeSubscriptionId,
  }
}

export function firestoreStoryToStory(id: string, data: any): Story {
  return {
    id,
    userId: data.user_id || data.userId,
    title: data.title,
    content: data.content,
    childName: data.child_name || data.childName,
    adjectives: data.adjectives,
    theme: data.theme,
    moral: data.moral,
    hasImages: data.has_images || data.hasImages || false,
    imageUrls: data.image_urls || data.imageUrls,
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
  }
}

export function databaseChildProfileToChildProfile(data: DatabaseChildProfile): ChildProfile {
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    nickname: data.nickname || undefined,
    birthDate: data.birth_date ? new Date(data.birth_date) : undefined,
    appearance: data.appearance || undefined,
    aiGeneratedImageUrl: data.ai_generated_image_url || undefined,
    ai_generated_image_url: data.ai_generated_image_url || undefined,
    aiDescription: data.ai_description || undefined,
    ai_description: data.ai_description || undefined,
    originalImageUploadedAt: data.original_image_uploaded_at ? new Date(data.original_image_uploaded_at) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
}

export function childProfileToDatabaseChildProfile(profile: Partial<ChildProfile>): Partial<DatabaseChildProfile> {
  return {
    user_id: profile.userId,
    name: profile.name,
    nickname: profile.nickname || null,
    birth_date: profile.birthDate ? profile.birthDate.toISOString().split('T')[0] : null,
    appearance: profile.appearance || null,
    ai_generated_image_url: profile.aiGeneratedImageUrl || profile.ai_generated_image_url || null,
    ai_description: profile.aiDescription || profile.ai_description || null,
    original_image_uploaded_at: profile.originalImageUploadedAt ? profile.originalImageUploadedAt.toISOString() : null,
  } as Partial<DatabaseChildProfile>
}
