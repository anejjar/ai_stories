/**
 * Achievement Definitions
 * Catalog of all available achievements
 */

import type { Achievement } from './types'

export const ACHIEVEMENTS: Record<string, Achievement> = {
  // ==================== MILESTONE ACHIEVEMENTS ====================
  first_story: {
    id: 'first_story',
    name: 'Story Starter',
    description: 'Created your first story',
    category: 'milestone',
    icon: '🎉',
    requirement_type: 'story_count',
    requirement_value: 1,
    points: 10,
    tier: 'bronze',
    is_secret: false,
    created_at: new Date().toISOString(),
  },
  story_10: {
    id: 'story_10',
    name: 'Rising Author',
    description: 'Created 10 stories',
    category: 'milestone',
    icon: '📚',
    requirement_type: 'story_count',
    requirement_value: 10,
    points: 25,
    tier: 'silver',
    is_secret: false,
    created_at: new Date().toISOString(),
  },
  story_25: {
    id: 'story_25',
    name: 'Prolific Writer',
    description: 'Created 25 stories',
    category: 'milestone',
    icon: '✨',
    requirement_type: 'story_count',
    requirement_value: 25,
    points: 50,
    tier: 'gold',
    is_secret: false,
    created_at: new Date().toISOString(),
  },
  story_50: {
    id: 'story_50',
    name: 'Story Master',
    description: 'Created 50 stories',
    category: 'milestone',
    icon: '🏆',
    requirement_type: 'story_count',
    requirement_value: 50,
    points: 100,
    tier: 'platinum',
    is_secret: false,
    created_at: new Date().toISOString(),
  },
  story_100: {
    id: 'story_100',
    name: 'Legendary Author',
    description: 'Created 100 stories',
    category: 'milestone',
    icon: '👑',
    requirement_type: 'story_count',
    requirement_value: 100,
    points: 250,
    tier: 'diamond',
    is_secret: false,
    created_at: new Date().toISOString(),
  },

  // ==================== STREAK ACHIEVEMENTS ====================
  streak_3: {
    id: 'streak_3',
    name: 'Getting Started',
    description: 'Read stories for 3 days in a row',
    category: 'streak',
    icon: '🔥',
    requirement_type: 'streak_days',
    requirement_value: 3,
    points: 15,
    tier: 'bronze',
    is_secret: false,
    created_at: new Date().toISOString(),
  },
  streak_7: {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Read stories for 7 days in a row',
    category: 'streak',
    icon: '🌟',
    requirement_type: 'streak_days',
    requirement_value: 7,
    points: 30,
    tier: 'silver',
    is_secret: false,
    created_at: new Date().toISOString(),
  },
  streak_14: {
    id: 'streak_14',
    name: 'Two Week Hero',
    description: 'Read stories for 14 days in a row',
    category: 'streak',
    icon: '⚡',
    requirement_type: 'streak_days',
    requirement_value: 14,
    points: 60,
    tier: 'gold',
    is_secret: false,
    created_at: new Date().toISOString(),
  },
  streak_30: {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Read stories for 30 days in a row',
    category: 'streak',
    icon: '💫',
    requirement_type: 'streak_days',
    requirement_value: 30,
    points: 120,
    tier: 'platinum',
    is_secret: false,
    created_at: new Date().toISOString(),
  },
  streak_100: {
    id: 'streak_100',
    name: 'Century Champion',
    description: 'Read stories for 100 days in a row',
    category: 'streak',
    icon: '🎖️',
    requirement_type: 'streak_days',
    requirement_value: 100,
    points: 500,
    tier: 'diamond',
    is_secret: false,
    created_at: new Date().toISOString(),
  },

  // ==================== EXPLORER ACHIEVEMENTS ====================
  theme_5: {
    id: 'theme_5',
    name: 'Theme Explorer',
    description: 'Created stories with 5 different themes',
    category: 'explorer',
    icon: '🗺️',
    requirement_type: 'theme_count',
    requirement_value: 5,
    points: 20,
    tier: 'bronze',
    is_secret: false,
    created_at: new Date().toISOString(),
  },
  theme_10: {
    id: 'theme_10',
    name: 'Genre Master',
    description: 'Created stories with 10 different themes',
    category: 'explorer',
    icon: '🌍',
    requirement_type: 'theme_count',
    requirement_value: 10,
    points: 40,
    tier: 'silver',
    is_secret: false,
    created_at: new Date().toISOString(),
  },
  theme_all: {
    id: 'theme_all',
    name: 'Universal Creator',
    description: 'Created stories with all available themes',
    category: 'explorer',
    icon: '🌌',
    requirement_type: 'theme_count',
    requirement_value: 25,
    points: 100,
    tier: 'gold',
    is_secret: false,
    created_at: new Date().toISOString(),
  },

  // ==================== CREATOR ACHIEVEMENTS ====================
  illustrated_first: {
    id: 'illustrated_first',
    name: 'Picture Perfect',
    description: 'Created your first illustrated story',
    category: 'creator',
    icon: '🎨',
    requirement_type: 'special',
    requirement_value: 1,
    points: 30,
    tier: 'silver',
    is_secret: false,
    created_at: new Date().toISOString(),
  },
  illustrated_10: {
    id: 'illustrated_10',
    name: 'Book Illustrator',
    description: 'Created 10 illustrated stories',
    category: 'creator',
    icon: '📖',
    requirement_type: 'special',
    requirement_value: 10,
    points: 75,
    tier: 'gold',
    is_secret: false,
    created_at: new Date().toISOString(),
  },

  // ==================== SPECIAL ACHIEVEMENTS ====================
  early_bird: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Read a story before 8 AM',
    category: 'special',
    icon: '🌅',
    requirement_type: 'special',
    requirement_value: 1,
    points: 15,
    tier: 'bronze',
    is_secret: false,
    created_at: new Date().toISOString(),
  },
  night_owl: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Read a story after 10 PM',
    category: 'special',
    icon: '🦉',
    requirement_type: 'special',
    requirement_value: 1,
    points: 15,
    tier: 'bronze',
    is_secret: false,
    created_at: new Date().toISOString(),
  },
  weekend_reader: {
    id: 'weekend_reader',
    name: 'Weekend Warrior',
    description: 'Read stories on Saturday and Sunday',
    category: 'special',
    icon: '📅',
    requirement_type: 'special',
    requirement_value: 1,
    points: 20,
    tier: 'bronze',
    is_secret: false,
    created_at: new Date().toISOString(),
  },
}

// Helper functions
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS[id]
}

export function getAllAchievements(): Achievement[] {
  return Object.values(ACHIEVEMENTS)
}

export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
  return Object.values(ACHIEVEMENTS).filter(a => a.category === category)
}

export function getAchievementsByTier(tier: Achievement['tier']): Achievement[] {
  return Object.values(ACHIEVEMENTS).filter(a => a.tier === tier)
}

// Tier colors for UI
export const TIER_COLORS = {
  bronze: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-300',
    gradient: 'from-amber-400 to-amber-600',
  },
  silver: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
    gradient: 'from-gray-300 to-gray-500',
  },
  gold: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-900',
    border: 'border-yellow-400',
    gradient: 'from-yellow-400 to-yellow-600',
  },
  platinum: {
    bg: 'bg-purple-100',
    text: 'text-purple-900',
    border: 'border-purple-400',
    gradient: 'from-purple-400 to-purple-600',
  },
  diamond: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-900',
    border: 'border-cyan-400',
    gradient: 'from-cyan-400 via-blue-500 to-purple-600',
  },
} as const

// Category emojis for UI
export const CATEGORY_EMOJIS = {
  milestone: '🎯',
  streak: '🔥',
  explorer: '🗺️',
  creator: '🎨',
  special: '⭐',
} as const

// Points needed for each reader level
export const READER_LEVEL_POINTS = {
  bronze: 0,
  silver: 100,
  gold: 300,
  platinum: 750,
  diamond: 1500,
} as const

export function getReaderLevelFromPoints(points: number): Achievement['tier'] {
  if (points >= READER_LEVEL_POINTS.diamond) return 'diamond'
  if (points >= READER_LEVEL_POINTS.platinum) return 'platinum'
  if (points >= READER_LEVEL_POINTS.gold) return 'gold'
  if (points >= READER_LEVEL_POINTS.silver) return 'silver'
  return 'bronze'
}

export function getPointsToNextLevel(currentPoints: number): { level: Achievement['tier']; pointsNeeded: number } | null {
  const currentLevel = getReaderLevelFromPoints(currentPoints)

  const levels: Achievement['tier'][] = ['bronze', 'silver', 'gold', 'platinum', 'diamond']
  const currentIndex = levels.indexOf(currentLevel)

  if (currentIndex === levels.length - 1) {
    return null // Already at max level
  }

  const nextLevel = levels[currentIndex + 1]
  const pointsNeeded = READER_LEVEL_POINTS[nextLevel] - currentPoints

  return { level: nextLevel, pointsNeeded }
}
