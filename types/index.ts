// Core Type Definitions

export type SubscriptionTier = 'trial' | 'pro' | 'pro_max'

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
}

export interface ChildAppearance {
  skinTone?: string
  hairColor?: string
  hairStyle?: string
}

export interface Child {
  name: string
  adjectives: string[]
  appearance?: ChildAppearance // PRO MAX only
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
  appearance?: ChildAppearance // Deprecated: kept for backward compatibility (PRO MAX only)
  parentStoryId?: string // If set, this is a draft of another story
  draftNumber?: number // Draft number (1, 2, 3, etc.)
  isSelectedDraft?: boolean // True if this draft was selected as final
  isIllustratedBook?: boolean // True if this is an illustrated book format (PRO MAX feature)
  bookPages?: BookPage[] // Structured pages with illustrations (PRO MAX feature)
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
  appearance?: ChildAppearance // Deprecated: kept for backward compatibility (PRO MAX only)
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

