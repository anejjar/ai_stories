/**
 * Reading Streak Tracker
 * Handles logic for tracking and updating reading streaks
 */

import { supabase } from '@/lib/supabase/client'
import type { ReadingStreak, ReadingSession } from './types'

/**
 * Record a reading session when user views/reads a story
 */
export async function recordReadingSession(params: {
  storyId: string
  durationSeconds?: number
  completed?: boolean
  audioUsed?: boolean
}): Promise<ReadingSession | null> {
  try {

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error('No user found for recording reading session')
      return null
    }

    // Insert reading session
    const { data: session, error } = await supabase
      .from('reading_sessions')
      .insert({
        user_id: user.id,
        story_id: params.storyId,
        read_at: new Date().toISOString(),
        duration_seconds: params.durationSeconds,
        completed: params.completed ?? true,
        audio_used: params.audioUsed ?? false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error recording reading session:', error)
      return null
    }

    // Update reading streak
    await updateReadingStreak(user.id)

    return session
  } catch (error) {
    console.error('Error in recordReadingSession:', error)
    return null
  }
}

/**
 * Update user's reading streak
 * This calls the database function that handles the streak logic
 */
export async function updateReadingStreak(userId: string): Promise<ReadingStreak | null> {
  try {

    // Call the database function to update streak
    const { error: updateError } = await supabase.rpc('update_reading_streak', {
      user_uuid: userId,
    })

    if (updateError) {
      console.error('Error updating reading streak:', updateError)
      return null
    }

    // Fetch updated streak data
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('reading_streak_current, reading_streak_longest, last_read_date')
      .eq('id', userId)
      .single()

    if (fetchError || !user) {
      console.error('Error fetching updated streak:', fetchError)
      return null
    }

    return {
      current: user.reading_streak_current || 0,
      longest: user.reading_streak_longest || 0,
      lastReadDate: user.last_read_date ? new Date(user.last_read_date) : null,
    }
  } catch (error) {
    console.error('Error in updateReadingStreak:', error)
    return null
  }
}

/**
 * Get current user's reading streak
 */
export async function getCurrentStreak(userId?: string): Promise<ReadingStreak | null> {
  try {

    let targetUserId = userId

    // If no userId provided, get current user
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return null
      targetUserId = user.id
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('reading_streak_current, reading_streak_longest, last_read_date')
      .eq('id', targetUserId)
      .single()

    if (error || !user) {
      console.error('Error fetching current streak:', error)
      return null
    }

    return {
      current: user.reading_streak_current || 0,
      longest: user.reading_streak_longest || 0,
      lastReadDate: user.last_read_date ? new Date(user.last_read_date) : null,
    }
  } catch (error) {
    console.error('Error in getCurrentStreak:', error)
    return null
  }
}

/**
 * Check if user's streak is at risk (haven't read today yet)
 */
export function isStreakAtRisk(lastReadDate: Date | null): boolean {
  if (!lastReadDate) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const lastRead = new Date(lastReadDate)
  lastRead.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Streak is at risk if last read was yesterday (need to read today)
  return lastRead.getTime() === yesterday.getTime()
}

/**
 * Check if user has read today already
 */
export function hasReadToday(lastReadDate: Date | null): boolean {
  if (!lastReadDate) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const lastRead = new Date(lastReadDate)
  lastRead.setHours(0, 0, 0, 0)

  return lastRead.getTime() === today.getTime()
}

/**
 * Get streak message for UI display
 */
export function getStreakMessage(streak: ReadingStreak): string {
  const { current, longest } = streak

  if (current === 0) {
    return "Start your reading streak today!"
  }

  if (current === 1) {
    return "🎉 Great start! Read again tomorrow to keep the streak going!"
  }

  if (current === longest) {
    return `🔥 ${current} day streak - Your longest yet!`
  }

  if (current >= 30) {
    return `🎖️ Amazing! ${current} days in a row!`
  }

  if (current >= 7) {
    return `🌟 ${current} day streak! Keep it up!`
  }

  return `🔥 ${current} day streak!`
}

/**
 * Get streak color for UI display
 */
export function getStreakColor(days: number): string {
  if (days === 0) return 'text-gray-500'
  if (days < 3) return 'text-orange-500'
  if (days < 7) return 'text-orange-600'
  if (days < 14) return 'text-red-500'
  if (days < 30) return 'text-purple-500'
  return 'text-blue-500'
}

/**
 * Calculate streak motivation message
 */
export function getStreakMotivation(current: number, longest: number): string {
  if (current === 0 && longest === 0) {
    return "Start your first reading streak today!"
  }

  if (current === 0 && longest > 0) {
    return `Your longest streak is ${longest} days. Can you beat it?`
  }

  const daysToRecord = longest - current

  if (daysToRecord > 0) {
    return `Just ${daysToRecord} more day${daysToRecord === 1 ? '' : 's'} to beat your record!`
  }

  if (current === longest) {
    return "You're on your longest streak ever! Keep going!"
  }

  return `Amazing ${current} day streak!`
}

/**
 * Get days until streak milestones (for motivation)
 */
export function getDaysToNextMilestone(currentStreak: number): { milestone: number; daysAway: number } | null {
  const milestones = [3, 7, 14, 30, 50, 100, 365]

  for (const milestone of milestones) {
    if (currentStreak < milestone) {
      return {
        milestone,
        daysAway: milestone - currentStreak,
      }
    }
  }

  return null // Already past all milestones
}

/**
 * Check if user should see streak reminder notification
 * Returns true if user has an active streak but hasn't read today
 */
export function shouldShowStreakReminder(streak: ReadingStreak): boolean {
  if (streak.current === 0) return false
  if (!streak.lastReadDate) return false

  return isStreakAtRisk(streak.lastReadDate) || !hasReadToday(streak.lastReadDate)
}

/**
 * Get reading sessions for a specific date range
 */
export async function getReadingSessions(params: {
  userId?: string
  startDate?: Date
  endDate?: Date
  limit?: number
}): Promise<ReadingSession[]> {
  try {

    let targetUserId = params.userId

    // If no userId provided, get current user
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return []
      targetUserId = user.id
    }

    let query = supabase
      .from('reading_sessions')
      .select('*')
      .eq('user_id', targetUserId)
      .order('read_at', { ascending: false })

    if (params.startDate) {
      query = query.gte('read_at', params.startDate.toISOString())
    }

    if (params.endDate) {
      query = query.lte('read_at', params.endDate.toISOString())
    }

    if (params.limit) {
      query = query.limit(params.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching reading sessions:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getReadingSessions:', error)
    return []
  }
}

/**
 * Get total reading time for a user
 */
export async function getTotalReadingTime(userId?: string): Promise<number> {
  try {

    let targetUserId = userId

    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return 0
      targetUserId = user.id
    }

    const { data, error } = await supabase
      .from('reading_sessions')
      .select('duration_seconds')
      .eq('user_id', targetUserId)

    if (error) {
      console.error('Error fetching total reading time:', error)
      return 0
    }

    return (data || []).reduce((total, session) => total + (session.duration_seconds || 0), 0)
  } catch (error) {
    console.error('Error in getTotalReadingTime:', error)
    return 0
  }
}
