/**
 * Achievement Checker
 * Logic for checking progress and awarding achievements
 */

import { supabase } from '@/lib/supabase/client'
import type { UserAchievement, Achievement, AchievementCheckResult, UserStats } from './types'
import { ACHIEVEMENTS } from './definitions'

/**
 * Check and award achievements for a user
 * This is called after story creation, reading sessions, etc.
 */
export async function checkAndAwardAchievements(userId?: string): Promise<AchievementCheckResult[]> {
  try {

    let targetUserId = userId

    // If no userId provided, get current user
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return []
      targetUserId = user.id
    }

    // Call the database function to check and award achievements
    const { data, error } = await supabase.rpc('check_and_award_achievements', {
      user_uuid: targetUserId,
    })

    if (error) {
      console.error('Error checking achievements:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in checkAndAwardAchievements:', error)
    return []
  }
}

/**
 * Get all achievements for a user
 */
export async function getUserAchievements(userId?: string): Promise<UserAchievement[]> {
  try {

    let targetUserId = userId

    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return []
      targetUserId = user.id
    }

    const { data, error } = await supabase
      .from('user_achievements')
      .select('*, achievement:achievements(*)')
      .eq('user_id', targetUserId)
      .order('unlocked_at', { ascending: false })

    if (error) {
      console.error('Error fetching user achievements:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getUserAchievements:', error)
    return []
  }
}

/**
 * Get user's unviewed achievements (for notifications)
 */
export async function getUnviewedAchievements(userId?: string): Promise<UserAchievement[]> {
  try {

    let targetUserId = userId

    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return []
      targetUserId = user.id
    }

    const { data, error } = await supabase
      .from('user_achievements')
      .select('*, achievement:achievements(*)')
      .eq('user_id', targetUserId)
      .eq('is_viewed', false)
      .order('unlocked_at', { ascending: true })

    if (error) {
      console.error('Error fetching unviewed achievements:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getUnviewedAchievements:', error)
    return []
  }
}

/**
 * Mark achievements as viewed
 */
export async function markAchievementsAsViewed(achievementIds: string[]): Promise<boolean> {
  try {

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
      .from('user_achievements')
      .update({ is_viewed: true })
      .eq('user_id', user.id)
      .in('achievement_id', achievementIds)

    if (error) {
      console.error('Error marking achievements as viewed:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in markAchievementsAsViewed:', error)
    return false
  }
}

/**
 * Get user stats for progress tracking
 */
export async function getUserStats(userId?: string): Promise<UserStats | null> {
  try {

    let targetUserId = userId

    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return null
      targetUserId = user.id
    }

    // Fetch user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('reading_streak_current, reading_streak_longest, last_read_date, total_points, reader_level')
      .eq('id', targetUserId)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
      return null
    }

    // Count total stories
    const { count: totalStories } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId)

    // Count illustrated stories
    const { count: illustratedStories } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId)
      .eq('is_illustrated_book', true)

    // Count unique themes
    const { data: themesData } = await supabase
      .from('stories')
      .select('theme')
      .eq('user_id', targetUserId)

    const uniqueThemes = new Set((themesData || []).map(s => s.theme)).size

    // Count reading sessions
    const { count: totalReadingSessions } = await supabase
      .from('reading_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId)

    // Calculate total reading time
    const { data: sessionsData } = await supabase
      .from('reading_sessions')
      .select('duration_seconds')
      .eq('user_id', targetUserId)

    const totalReadingTime = (sessionsData || []).reduce((sum, s) => sum + (s.duration_seconds || 0), 0)

    const averageSessionDuration =
      totalReadingSessions && totalReadingSessions > 0 ? totalReadingTime / totalReadingSessions : 0

    return {
      totalStories: totalStories || 0,
      totalReadingSessions: totalReadingSessions || 0,
      uniqueThemes,
      illustratedStories: illustratedStories || 0,
      totalReadingTime,
      averageSessionDuration,
      streak: {
        current: userData.reading_streak_current || 0,
        longest: userData.reading_streak_longest || 0,
        lastReadDate: userData.last_read_date ? new Date(userData.last_read_date) : null,
      },
      totalPoints: userData.total_points || 0,
      readerLevel: userData.reader_level || 'bronze',
    }
  } catch (error) {
    console.error('Error in getUserStats:', error)
    return null
  }
}

/**
 * Get achievement progress for display
 */
export async function getAchievementProgress(userId?: string): Promise<Map<string, number>> {
  try {

    let targetUserId = userId

    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return new Map()
      targetUserId = user.id
    }

    const stats = await getUserStats(targetUserId)
    if (!stats) return new Map()

    const progress = new Map<string, number>()

    // Story count achievements
    progress.set('first_story', stats.totalStories)
    progress.set('story_10', stats.totalStories)
    progress.set('story_25', stats.totalStories)
    progress.set('story_50', stats.totalStories)
    progress.set('story_100', stats.totalStories)

    // Streak achievements
    progress.set('streak_3', stats.streak.current)
    progress.set('streak_7', stats.streak.current)
    progress.set('streak_14', stats.streak.current)
    progress.set('streak_30', stats.streak.current)
    progress.set('streak_100', stats.streak.current)

    // Theme achievements
    progress.set('theme_5', stats.uniqueThemes)
    progress.set('theme_10', stats.uniqueThemes)
    progress.set('theme_all', stats.uniqueThemes)

    // Illustrated story achievements
    progress.set('illustrated_first', stats.illustratedStories)
    progress.set('illustrated_10', stats.illustratedStories)

    return progress
  } catch (error) {
    console.error('Error in getAchievementProgress:', error)
    return new Map()
  }
}

/**
 * Manually award a special achievement
 * Used for time-based or special condition achievements
 */
export async function awardSpecialAchievement(achievementId: string, userId?: string): Promise<boolean> {
  try {

    let targetUserId = userId

    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return false
      targetUserId = user.id
    }

    // Check if achievement exists
    const achievement = ACHIEVEMENTS[achievementId]
    if (!achievement) {
      console.error('Achievement not found:', achievementId)
      return false
    }

    // Check if user already has this achievement
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', targetUserId)
      .eq('achievement_id', achievementId)
      .single()

    if (existing) {
      console.log('User already has this achievement')
      return false
    }

    // Award the achievement
    const { error } = await supabase.from('user_achievements').insert({
      user_id: targetUserId,
      achievement_id: achievementId,
      progress: achievement.requirement_value,
      is_viewed: false,
    })

    if (error) {
      console.error('Error awarding special achievement:', error)
      return false
    }

    // Update user points
    await updateUserPoints(targetUserId, achievement.points)

    return true
  } catch (error) {
    console.error('Error in awardSpecialAchievement:', error)
    return false
  }
}

/**
 * Update user's total points and reader level
 */
async function updateUserPoints(userId: string, pointsToAdd: number): Promise<void> {
  try {

    // Get current points
    const { data: userData } = await supabase
      .from('users')
      .select('total_points, reader_level')
      .eq('id', userId)
      .single()

    if (!userData) return

    const newPoints = (userData.total_points || 0) + pointsToAdd

    // Determine new reader level
    let newLevel: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' = 'bronze'
    if (newPoints >= 1500) newLevel = 'diamond'
    else if (newPoints >= 750) newLevel = 'platinum'
    else if (newPoints >= 300) newLevel = 'gold'
    else if (newPoints >= 100) newLevel = 'silver'

    // Update user
    await supabase
      .from('users')
      .update({
        total_points: newPoints,
        reader_level: newLevel,
      })
      .eq('id', userId)
  } catch (error) {
    console.error('Error updating user points:', error)
  }
}

/**
 * Get achievement statistics (for admin/analytics)
 */
export async function getAchievementStatistics(): Promise<{
  totalAchievements: number
  mostEarnedAchievement: { id: string; count: number } | null
  rareAchievements: Array<{ id: string; count: number }>
}> {
  try {

    const { data, error } = await supabase
      .from('user_achievements')
      .select('achievement_id')

    if (error || !data) {
      return {
        totalAchievements: 0,
        mostEarnedAchievement: null,
        rareAchievements: [],
      }
    }

    // Count achievements
    const counts: Record<string, number> = {}
    data.forEach(ua => {
      counts[ua.achievement_id] = (counts[ua.achievement_id] || 0) + 1
    })

    // Most earned
    let mostEarned: { id: string; count: number } | null = null
    Object.entries(counts).forEach(([id, count]) => {
      if (!mostEarned || count > mostEarned.count) {
        mostEarned = { id, count }
      }
    })

    // Rare achievements (earned by less than 10 users)
    const rare = Object.entries(counts)
      .filter(([_, count]) => count < 10)
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => a.count - b.count)

    return {
      totalAchievements: Object.keys(ACHIEVEMENTS).length,
      mostEarnedAchievement: mostEarned,
      rareAchievements: rare,
    }
  } catch (error) {
    console.error('Error in getAchievementStatistics:', error)
    return {
      totalAchievements: 0,
      mostEarnedAchievement: null,
      rareAchievements: [],
    }
  }
}
