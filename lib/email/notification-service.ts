/**
 * Email Notification Service
 * Handles sending scheduled and triggered email notifications
 */

import { sendEmail } from './resend-client'
import { generateWeeklySummaryEmail } from './templates/weekly-summary'
import { generateBedtimeReminderEmail } from './templates/bedtime-reminder'
import { generateAchievementNotificationEmail } from './templates/achievement-notification'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface EmailResult {
  success: boolean
  sent: number
  failed: number
  errors: string[]
}

/**
 * Send weekly summary emails to all users who have opted in
 */
export async function sendWeeklySummaryEmails(): Promise<EmailResult> {
  const result: EmailResult = {
    success: true,
    sent: 0,
    failed: 0,
    errors: [],
  }

  try {
    // Get all users with weekly summary enabled
    const { data: preferences, error: prefsError } = await supabase
      .from('email_preferences')
      .select('user_id, weekly_summary')
      .eq('weekly_summary', true)

    if (prefsError) throw prefsError

    if (!preferences || preferences.length === 0) {
      return result
    }

    // Process each user
    for (const pref of preferences) {
      try {
        // Get user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('id', pref.user_id)
          .single()

        if (userError) throw userError

        // Get first child profile name (if any)
        const { data: childProfile } = await supabase
          .from('child_profiles')
          .select('name')
          .eq('user_id', pref.user_id)
          .order('created_at', { ascending: true })
          .limit(1)
          .single()

        // Get user email from auth
        const { data: authData, error: authError } = await supabase.auth.admin.getUserById(
          pref.user_id
        )

        if (authError || !authData.user?.email) {
          result.errors.push(`No email found for user ${pref.user_id}`)
          result.failed++
          continue
        }

        // Get weekly summary data
        const { data: summaryData, error: summaryError } = await supabase.rpc(
          'get_weekly_summary',
          { user_uuid: pref.user_id }
        )

        if (summaryError) throw summaryError

        const summary = summaryData[0] || {
          stories_created: 0,
          stories_read: 0,
          total_reading_time: 0,
          achievements_unlocked: 0,
          current_streak: 0,
          longest_streak: 0,
          themes_explored: 0,
        }

        // Generate email
        const { html, text } = generateWeeklySummaryEmail({
          userName: authData.user.user_metadata?.name || 'there',
          childName: childProfile?.name || undefined,
          storiesCreated: summary.stories_created,
          storiesRead: summary.stories_read,
          totalReadingTime: summary.total_reading_time,
          achievementsUnlocked: summary.achievements_unlocked,
          currentStreak: summary.current_streak,
          longestStreak: summary.longest_streak,
          themesExplored: summary.themes_explored,
        })

        // Send email
        const emailResult = await sendEmail({
          to: authData.user.email,
          subject: '📚 Your Weekly Reading Summary',
          html,
          text,
        })

        if (emailResult.success) {
          result.sent++
        } else {
          result.failed++
          result.errors.push(`Failed to send to ${authData.user.email}: ${emailResult.error}`)
        }

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        result.failed++
        const errorMsg = error instanceof Error ? error.message : JSON.stringify(error)
        result.errors.push(`Error processing user ${pref.user_id}: ${errorMsg}`)
      }
    }
  } catch (error) {
    result.success = false
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error)
    result.errors.push(`Fatal error: ${errorMsg}`)
  }

  return result
}

/**
 * Send bedtime reminder emails to users at their specified time
 */
export async function sendBedtimeReminderEmails(targetTime?: string): Promise<EmailResult> {
  const result: EmailResult = {
    success: true,
    sent: 0,
    failed: 0,
    errors: [],
  }

  try {
    // Get all users with bedtime reminders enabled
    let query = supabase
      .from('email_preferences')
      .select('user_id, bedtime_reminder, bedtime_reminder_time')
      .eq('bedtime_reminder', true)

    // If target time specified, filter by that time
    if (targetTime) {
      query = query.eq('bedtime_reminder_time', targetTime)
    }

    const { data: preferences, error: prefsError } = await query

    if (prefsError) throw prefsError

    if (!preferences || preferences.length === 0) {
      return result
    }

    // Process each user
    for (const pref of preferences) {
      try {
        // Get user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, reading_streak_current')
          .eq('id', pref.user_id)
          .single()

        if (userError) throw userError

        // Get first child profile name (if any)
        const { data: childProfile } = await supabase
          .from('child_profiles')
          .select('name')
          .eq('user_id', pref.user_id)
          .order('created_at', { ascending: true })
          .limit(1)
          .single()

        // Get user email
        const { data: authData, error: authError } = await supabase.auth.admin.getUserById(
          pref.user_id
        )

        if (authError || !authData.user?.email) {
          result.errors.push(`No email found for user ${pref.user_id}`)
          result.failed++
          continue
        }

        // Get recent stories for suggestions
        const { data: recentStories } = await supabase
          .from('stories')
          .select('title, theme, created_at')
          .eq('user_id', pref.user_id)
          .order('created_at', { ascending: false })
          .limit(3)

        // Generate email
        const { html, text } = generateBedtimeReminderEmail({
          userName: authData.user.user_metadata?.name || 'there',
          childName: childProfile?.name || undefined,
          reminderTime: formatTime(pref.bedtime_reminder_time),
          currentStreak: userData.reading_streak_current || 0,
          recentStories: (recentStories || []).map((s) => ({
            title: s.title,
            theme: s.theme,
            createdAt: s.created_at,
          })),
        })

        // Send email
        const emailResult = await sendEmail({
          to: authData.user.email,
          subject: '🌙 Time for a Bedtime Story!',
          html,
          text,
        })

        if (emailResult.success) {
          result.sent++
        } else {
          result.failed++
          result.errors.push(`Failed to send to ${authData.user.email}: ${emailResult.error}`)
        }

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        result.failed++
        const errorMsg = error instanceof Error ? error.message : JSON.stringify(error)
        result.errors.push(`Error processing user ${pref.user_id}: ${errorMsg}`)
      }
    }
  } catch (error) {
    result.success = false
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error)
    result.errors.push(`Fatal error: ${errorMsg}`)
  }

  return result
}

/**
 * Send achievement notification email to a specific user
 */
export async function sendAchievementNotification(
  userId: string,
  achievementIds: string[]
): Promise<boolean> {
  try {
    // Check if user has achievement notifications enabled
    const { data: preferences } = await supabase
      .from('email_preferences')
      .select('achievement_notifications')
      .eq('user_id', userId)
      .single()

    if (!preferences?.achievement_notifications) {
      return false
    }

    // Get user email
    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId)

    if (authError || !authData.user?.email) {
      console.error('No email found for user', userId)
      return false
    }

    // Get achievement details
    const { data: achievementData } = await supabase
      .from('achievements')
      .select('id, name, description, icon, tier, points')
      .in('id', achievementIds)

    if (!achievementData || achievementData.length === 0) {
      return false
    }

    // Get user data
    const { data: userData } = await supabase
      .from('users')
      .select('total_points, reader_level')
      .eq('id', userId)
      .single()

    // Get first child profile name (if any)
    const { data: childProfile } = await supabase
      .from('child_profiles')
      .select('name')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    // Determine next level points
    const levelThresholds = {
      bronze: 0,
      silver: 100,
      gold: 300,
      platinum: 750,
      diamond: 1500,
    }

    const currentLevel = userData?.reader_level || 'bronze'
    const nextLevel =
      currentLevel === 'bronze'
        ? 'silver'
        : currentLevel === 'silver'
          ? 'gold'
          : currentLevel === 'gold'
            ? 'platinum'
            : currentLevel === 'platinum'
              ? 'diamond'
              : null

    const nextLevelPoints = nextLevel ? levelThresholds[nextLevel] : undefined

    // Generate email
    const { html, text } = generateAchievementNotificationEmail({
      userName: authData.user.user_metadata?.name || 'there',
      childName: childProfile?.name || undefined,
      achievements: achievementData.map((a) => ({
        name: a.name,
        description: a.description,
        icon: a.icon,
        tier: a.tier,
        points: a.points,
      })),
      totalPoints: userData?.total_points || 0,
      readerLevel: currentLevel,
      nextLevelPoints,
    })

    // Send email
    const emailResult = await sendEmail({
      to: authData.user.email,
      subject: `🏆 Achievement${achievementData.length > 1 ? 's' : ''} Unlocked!`,
      html,
      text,
    })

    return emailResult.success
  } catch (error) {
    console.error('Error sending achievement notification:', error)
    return false
  }
}

/**
 * Send a test email to a specific address
 */
export async function sendTestCronEmail(email: string): Promise<boolean> {
  try {
    console.log(`Sending test email to ${email}...`)

    const { html, text } = generateBedtimeReminderEmail({
      userName: 'Test User',
      childName: 'Alex',
      reminderTime: '8:00 PM',
      currentStreak: 5,
      recentStories: [
        {
          title: 'The Brave Little Lion',
          theme: 'Courage',
          createdAt: new Date().toISOString(),
        },
      ],
    })

    const result = await sendEmail({
      to: email,
      subject: '🧪 AI Stories - Cron Test Email',
      html,
      text,
    })

    return result.success
  } catch (error) {
    console.error('Error sending test email:', error)
    return false
  }
}

/**
 * Helper function to format time
 */
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:${minutes} ${ampm}`
}
