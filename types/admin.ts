// Admin-specific type definitions

import { User, Story, SubscriptionTier } from './index'

export type AdminRole = 'user' | 'superadmin'

export interface AdminUser extends User {
  role: AdminRole
  lastAdminActionAt?: Date
  adminNotes?: string
}

export type AdminActionType =
  | 'user_view'
  | 'user_edit'
  | 'subscription_change'
  | 'story_review'
  | 'story_delete'
  | 'report_review'

export interface AdminActivity {
  id: string
  adminId: string
  actionType: AdminActionType
  targetId?: string
  targetType?: string
  details: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
  admin?: {
    email: string
    display_name?: string
  }
}

export interface AdminDashboardStats {
  users: {
    total: number
    newThisWeek: number
    trial: number
    pro: number
    family: number
  }
  stories: {
    total: number
    public: number
    private: number
    newThisWeek: number
  }
  reports: {
    pending: number
    reviewed: number
    resolved: number
  }
  revenue: {
    thisMonth: number
  }
  subscriptions: {
    trial: number
    pro: number
    family: number
  }
}

export interface UserManagementFilters {
  search?: string
  tier?: SubscriptionTier | 'all'
  sortBy?: 'created_at' | 'email' | 'subscription_tier'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface ReportManagementFilters {
  status?: 'all' | 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  reason?: 'all' | 'inappropriate' | 'spam' | 'copyright' | 'other'
  sortBy?: 'created_at' | 'status'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface StoryManagementFilters {
  visibility?: 'all' | 'public' | 'private'
  type?: 'all' | 'text' | 'illustrated'
  search?: string
  sortBy?: 'created_at' | 'view_count' | 'likes_count'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface AdminUserListItem {
  id: string
  email: string
  displayName?: string
  photoURL?: string
  subscriptionTier: SubscriptionTier
  role: AdminRole
  createdAt: Date
  storiesCount?: number
  adminNotes?: string
}

export interface AdminStoryListItem extends Story {
  authorEmail?: string
  authorName?: string
}

export type StoryReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed'
export type StoryReportReason = 'inappropriate' | 'spam' | 'copyright' | 'other'
export type StoryReportAction =
  | 'no_action'
  | 'warning_sent'
  | 'story_hidden'
  | 'story_deleted'
  | 'user_warned'
  | 'user_suspended'

export interface StoryReport {
  id: string
  storyId: string
  userId: string
  reason: StoryReportReason
  description?: string
  status: StoryReportStatus
  reviewedBy?: string
  reviewedAt?: Date
  resolutionNotes?: string
  actionTaken?: StoryReportAction
  createdAt: Date
  updatedAt: Date
  // Related data
  story?: Story
  reporter?: {
    id: string
    email: string
    displayName?: string
  }
  reviewer?: {
    id: string
    email: string
    displayName?: string
  }
}

export interface AdminUserDetail extends AdminUser {
  lemonsqueezyCustomerId?: string
  lemonsqueezySubscriptionId?: string
  totalStories: number
  readingStreak: {
    current: number
    longest: number
  }
  totalPoints: number
  readerLevel: string
  childProfilesCount: number
  lastLoginAt?: Date
  recentStories: Story[]
}
