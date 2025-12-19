/**
 * Daily Usage Limits Service
 * Manages story generation limits for Family Plan users
 * with rolling 24-hour windows
 */

import { createClient } from '@supabase/supabase-js'
import type {
  SubscriptionTier,
  UsageLimitCheck,
  UsageStats,
  DailyUsage,
  SUBSCRIPTION_LIMITS
} from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create admin client for server-side operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// =====================================================
// CORE FUNCTIONS
// =====================================================

/**
 * Check if user can create a story (respects rolling 24-hour limits)
 */
export async function checkStoryLimit(
  userId: string,
  isIllustratedBook: boolean
): Promise<UsageLimitCheck> {
  try {
    // Call database function
    const { data, error } = await supabaseAdmin.rpc('can_create_story', {
      p_user_id: userId,
      p_is_illustrated: isIllustratedBook
    })

    if (error) {
      console.error('[DailyLimits] Error checking story limit:', error)
      throw error
    }

    if (!data || data.length === 0) {
      // Default to allowing if no data (shouldn't happen)
      return {
        canCreate: true,
        reason: 'No limit data found'
      }
    }

    // Parse response from database function
    const result = data[0]

    return {
      canCreate: result.can_create,
      reason: result.reason,
      resetAt: result.reset_at ? new Date(result.reset_at) : undefined
    }
  } catch (error) {
    console.error('[DailyLimits] Exception in checkStoryLimit:', error)
    // Fail open - allow story creation if error occurs
    return {
      canCreate: true,
      reason: 'Error checking limits, allowing creation'
    }
  }
}

/**
 * Increment story usage count after successful generation
 */
export async function incrementStoryUsage(
  userId: string,
  isIllustratedBook: boolean
): Promise<void> {
  try {
    const { error } = await supabaseAdmin.rpc('increment_story_usage', {
      p_user_id: userId,
      p_is_illustrated: isIllustratedBook
    })

    if (error) {
      console.error('[DailyLimits] Error incrementing usage:', error)
      throw error
    }

    console.log(`[DailyLimits] Incremented usage for user ${userId}, illustrated: ${isIllustratedBook}`)
  } catch (error) {
    console.error('[DailyLimits] Exception in incrementStoryUsage:', error)
    // Log but don't throw - usage tracking failure shouldn't block user
  }
}

/**
 * Get detailed usage statistics for a user
 */
export async function getUserUsageStats(userId: string): Promise<UsageStats> {
  try {
    // Get user's subscription tier for limits
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    if (userError) throw userError

    const tier = userData?.subscription_tier as SubscriptionTier || 'trial'

    // Get today's usage
    const today = new Date().toISOString().split('T')[0]
    const { data: todayData, error: todayError } = await supabaseAdmin
      .from('daily_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('usage_date', today)
      .single()

    // If no error but no data, user hasn't generated stories today
    const todayUsage = todayData || {
      text_stories_count: 0,
      illustrated_stories_count: 0,
      first_text_story_at: null,
      first_illustrated_story_at: null
    }

    // Calculate limits based on tier
    let textLimit: number | 'unlimited' = 'unlimited'
    let illustratedLimit: number | 'unlimited' = 'unlimited'

    if (tier === 'family') {
      textLimit = 10
      illustratedLimit = 2
    } else if (tier === 'trial') {
      textLimit = 1 // But handled separately in trial service
      illustratedLimit = 0
    } else if (tier === 'pro') {
      textLimit = 'unlimited'
      illustratedLimit = 0
    }

    // Calculate reset times (24 hours from first story)
    let textResetAt: Date | undefined
    let illustratedResetAt: Date | undefined

    if (todayUsage.first_text_story_at) {
      textResetAt = new Date(todayUsage.first_text_story_at)
      textResetAt.setHours(textResetAt.getHours() + 24)
    }

    if (todayUsage.first_illustrated_story_at) {
      illustratedResetAt = new Date(todayUsage.first_illustrated_story_at)
      illustratedResetAt.setHours(illustratedResetAt.getHours() + 24)
    }

    // Get this week's usage (last 7 days)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const { data: weekData, error: weekError } = await supabaseAdmin
      .from('daily_usage')
      .select('text_stories_count, illustrated_stories_count')
      .eq('user_id', userId)
      .gte('usage_date', weekAgo.toISOString().split('T')[0])

    const weekStats = weekData?.reduce(
      (acc, day) => ({
        textStories: acc.textStories + (day.text_stories_count || 0),
        illustratedStories: acc.illustratedStories + (day.illustrated_stories_count || 0)
      }),
      { textStories: 0, illustratedStories: 0 }
    ) || { textStories: 0, illustratedStories: 0 }

    // Get this month's usage
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    const { data: monthData, error: monthError } = await supabaseAdmin
      .from('daily_usage')
      .select('text_stories_count, illustrated_stories_count')
      .eq('user_id', userId)
      .gte('usage_date', monthAgo.toISOString().split('T')[0])

    const monthStats = monthData?.reduce(
      (acc, day) => ({
        textStories: acc.textStories + (day.text_stories_count || 0),
        illustratedStories: acc.illustratedStories + (day.illustrated_stories_count || 0)
      }),
      { textStories: 0, illustratedStories: 0 }
    ) || { textStories: 0, illustratedStories: 0 }

    // Get all-time total stories
    const { data: allStories, error: allError } = await supabaseAdmin
      .from('stories')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    return {
      today: {
        textStories: todayUsage.text_stories_count || 0,
        illustratedStories: todayUsage.illustrated_stories_count || 0,
        textLimit: textLimit === 'unlimited' ? 999 : textLimit,
        illustratedLimit: illustratedLimit === 'unlimited' ? 999 : illustratedLimit,
        textResetAt,
        illustratedResetAt
      },
      thisWeek: weekStats,
      thisMonth: monthStats,
      allTime: {
        totalStories: allStories?.count || 0
      }
    }
  } catch (error) {
    console.error('[DailyLimits] Error getting usage stats:', error)
    // Return empty stats on error
    return {
      today: {
        textStories: 0,
        illustratedStories: 0,
        textLimit: 0,
        illustratedLimit: 0
      },
      thisWeek: {
        textStories: 0,
        illustratedStories: 0
      },
      thisMonth: {
        textStories: 0,
        illustratedStories: 0
      },
      allTime: {
        totalStories: 0
      }
    }
  }
}

/**
 * Get today's usage record for a user
 */
export async function getTodayUsage(userId: string): Promise<DailyUsage | null> {
  try {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabaseAdmin
      .from('daily_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('usage_date', today)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new days
      throw error
    }

    if (!data) return null

    return {
      id: data.id,
      userId: data.user_id,
      usageDate: new Date(data.usage_date),
      textStoriesCount: data.text_stories_count || 0,
      illustratedStoriesCount: data.illustrated_stories_count || 0,
      firstTextStoryAt: data.first_text_story_at ? new Date(data.first_text_story_at) : undefined,
      firstIllustratedStoryAt: data.first_illustrated_story_at
        ? new Date(data.first_illustrated_story_at)
        : undefined,
      lastResetAt: new Date(data.last_reset_at),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  } catch (error) {
    console.error('[DailyLimits] Error getting today usage:', error)
    return null
  }
}

/**
 * Check if user is within child profile limit
 */
export async function checkChildProfileLimit(
  userId: string,
  tier: SubscriptionTier
): Promise<UsageLimitCheck> {
  try {
    // Get current profile count
    const { data, error } = await supabaseAdmin
      .from('child_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) throw error

    const currentCount = data?.count || 0

    // Determine limit based on tier
    let limit = 1 // trial default
    if (tier === 'pro') limit = 2
    if (tier === 'family') limit = 3

    if (currentCount >= limit) {
      return {
        canCreate: false,
        reason: `Your ${tier === 'trial' ? 'trial' : tier.toUpperCase()} plan allows ${limit} child profile${limit > 1 ? 's' : ''}. Please upgrade or remove a profile.`,
        currentCount,
        maxCount: limit
      }
    }

    return {
      canCreate: true,
      reason: `Within child profile limit (${currentCount}/${limit})`,
      currentCount,
      maxCount: limit
    }
  } catch (error) {
    console.error('[DailyLimits] Error checking child profile limit:', error)
    // Fail open
    return {
      canCreate: true,
      reason: 'Error checking limit, allowing creation'
    }
  }
}

/**
 * Get time remaining until limit resets
 */
export function getTimeUntilReset(resetAt: Date): {
  hours: number
  minutes: number
  seconds: number
  humanReadable: string
} {
  const now = new Date()
  const diff = resetAt.getTime() - now.getTime()

  if (diff <= 0) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      humanReadable: 'Now'
    }
  }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  let humanReadable = ''
  if (hours > 0) humanReadable += `${hours}h `
  if (minutes > 0) humanReadable += `${minutes}m `
  if (hours === 0 && minutes < 5) humanReadable += `${seconds}s`

  return {
    hours,
    minutes,
    seconds,
    humanReadable: humanReadable.trim()
  }
}

/**
 * Format usage stats for display
 */
export function formatUsageMessage(
  currentCount: number,
  limit: number | 'unlimited',
  resetAt?: Date
): string {
  if (limit === 'unlimited') {
    return `${currentCount} stories created today (unlimited)`
  }

  const remaining = limit - currentCount

  if (remaining <= 0) {
    if (resetAt) {
      const timeUntil = getTimeUntilReset(resetAt)
      return `Daily limit reached. Resets in ${timeUntil.humanReadable}`
    }
    return 'Daily limit reached'
  }

  if (remaining === 1) {
    return `${remaining} story remaining today`
  }

  return `${remaining} stories remaining today`
}

// =====================================================
// EXPORT ALL FUNCTIONS
// =====================================================

export const DailyLimitsService = {
  checkStoryLimit,
  incrementStoryUsage,
  getUserUsageStats,
  getTodayUsage,
  checkChildProfileLimit,
  getTimeUntilReset,
  formatUsageMessage
}

export default DailyLimitsService
