// Discovery & Social Features Type Definitions

import { Story, Child, ChildAppearance } from './index'

// =====================================================
// EXTENDED STORY TYPES
// =====================================================

export interface PublicStory extends Omit<Story, 'visibility'> {
  visibility: 'public'
  viewCount: number
  likesCount: number
  commentsCount: number
  averageRating: number
  ratingsCount: number
  publishedAt: Date
  isLikedByUser?: boolean
  userRating?: number
  authorName?: string
}

// =====================================================
// SOCIAL INTERACTIONS
// =====================================================

export interface StoryLike {
  id: string
  storyId: string
  userId: string
  createdAt: Date
}

export interface StoryComment {
  id: string
  storyId: string
  userId: string
  content: string
  parentCommentId?: string | null
  createdAt: Date
  updatedAt: Date
  // Populated fields
  authorName?: string
  authorAvatar?: string
  replies?: StoryComment[]
}

export interface StoryRating {
  id: string
  storyId: string
  userId: string
  rating: number // 1-5
  createdAt: Date
  updatedAt: Date
}

export type ReportReason = 'inappropriate' | 'spam' | 'copyright' | 'other'
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed'

export interface StoryReport {
  id: string
  storyId: string
  userId: string
  reason: ReportReason
  description?: string
  status: ReportStatus
  reviewedBy?: string
  reviewedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface SocialStats {
  likesCount: number
  commentsCount: number
  averageRating: number
  ratingsCount: number
  viewCount: number
  isLikedByUser: boolean
  userRating?: number
}

// =====================================================
// DISCOVERY PAGE
// =====================================================

export type DiscoverySortBy = 'recent' | 'popular' | 'top_rated' | 'trending'

export interface DiscoveryFilters {
  search?: string
  theme?: string
  sortBy?: DiscoverySortBy
  page?: number
  limit?: number
}

export interface DiscoveryResponse {
  stories: PublicStory[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
}

// =====================================================
// STORY TEMPLATES / IDEAS
// =====================================================

export type TemplateCategory = 'adventure' | 'fantasy' | 'learning' | 'bedtime' | 'general'

export interface StoryTemplate {
  id: string
  title: string
  description: string
  theme: string
  moral?: string
  suggestedAdjectives: string[]
  suggestedChildName?: string
  icon?: string
  category: TemplateCategory
  previewText?: string
}

export interface StoryIdea extends StoryTemplate {
  previewText: string
}

// =====================================================
// API REQUEST/RESPONSE TYPES
// =====================================================

export interface PublishStoryRequest {
  storyId: string
  visibility: 'public' | 'private'
}

export interface LikeStoryRequest {
  storyId: string
}

export interface LikeStoryResponse {
  isLiked: boolean
  likesCount: number
}

export interface CommentStoryRequest {
  storyId: string
  content: string
  parentCommentId?: string
}

export interface RateStoryRequest {
  storyId: string
  rating: number // 1-5
}

export interface RateStoryResponse {
  averageRating: number
  ratingsCount: number
  userRating: number
}

export interface ReportStoryRequest {
  storyId: string
  reason: ReportReason
  description?: string
}

export interface RelatedStoriesRequest {
  storyId: string
  limit?: number
}

export interface RelatedStoriesResponse {
  stories: PublicStory[]
}
