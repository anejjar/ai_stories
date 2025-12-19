/**
 * Achievement System Types
 * Defines interfaces for achievements, badges, streaks, and reading sessions
 */

export type AchievementCategory = 'milestone' | 'streak' | 'explorer' | 'creator' | 'special'

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'

export type RequirementType = 'story_count' | 'streak_days' | 'theme_count' | 'special'

export interface Achievement {
  id: string
  name: string
  description: string
  category: AchievementCategory
  icon: string // emoji or icon name
  requirement_type: RequirementType
  requirement_value: number
  points: number
  tier: AchievementTier
  is_secret: boolean
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
  progress: number
  is_viewed: boolean
  achievement?: Achievement // Joined data
}

export interface ReadingSession {
  id: string
  user_id: string
  story_id: string
  read_at: string
  duration_seconds?: number
  completed: boolean
  audio_used: boolean
  created_at: string
}

export interface ReadingStreak {
  current: number
  longest: number
  lastReadDate: Date | null
}

export interface UserStats {
  totalStories: number
  totalReadingSessions: number
  uniqueThemes: number
  illustratedStories: number
  totalReadingTime: number // in seconds
  averageSessionDuration: number
  streak: ReadingStreak
  totalPoints: number
  readerLevel: AchievementTier
}

export interface AchievementProgress {
  achievement: Achievement
  currentProgress: number
  requiredProgress: number
  isUnlocked: boolean
  percentComplete: number
}

export interface AchievementUnlock {
  achievement: Achievement
  unlockedAt: string
  isNew: boolean // Just unlocked in this session
}

// For the UI celebration/modal
export interface AchievementNotification {
  achievement: Achievement
  message: string
  pointsEarned: number
}

// Helper type for achievement checking functions
export interface AchievementCheckResult {
  achievement_id: string
  newly_unlocked: boolean
}

// Reading stats for dashboard
export interface DailyReadingStats {
  date: string
  storiesRead: number
  sessionsCount: number
  totalMinutes: number
}

export interface WeeklyReadingStats {
  weekStart: string
  weekEnd: string
  totalStories: number
  totalSessions: number
  totalMinutes: number
  dailyStats: DailyReadingStats[]
  streakDays: number
  achievementsUnlocked: number
}

export interface ThemeStats {
  theme: string
  count: number
  percentage: number
  lastUsed: string
}

// For leaderboards (future feature)
export interface LeaderboardEntry {
  userId: string
  userName?: string
  totalPoints: number
  readerLevel: AchievementTier
  achievementCount: number
  currentStreak: number
  rank: number
}
