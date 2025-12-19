import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { sendAchievementNotification } from '@/lib/email/notification-service'

/**
 * POST /api/reading-session
 * Record a reading session and update streak
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set(name, value, options)
            } catch {
              // The set method was called from a Server Component.
              // This can be ignored if you have middleware refreshing user sessions.
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set(name, '', options)
            } catch {
              // The remove method was called from a Server Component.
              // This can be ignored if you have middleware refreshing user sessions.
            }
          },
        },
      }
    )
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('❌ Reading session auth failed:', {
        hasAuthError: !!authError,
        authErrorMessage: authError?.message,
        hasUser: !!user,
        cookies: cookieStore.getAll().map(c => c.name)
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ Reading session authorized for user:', user.id)

    // Parse request body
    const body = await request.json()
    const { storyId, durationSeconds, completed = true, audioUsed = false } = body

    if (!storyId) {
      return NextResponse.json({ error: 'Story ID is required' }, { status: 400 })
    }

    // Insert reading session
    const { data: session, error: sessionError } = await supabase
      .from('reading_sessions')
      .insert({
        user_id: user.id,
        story_id: storyId,
        read_at: new Date().toISOString(),
        duration_seconds: durationSeconds,
        completed,
        audio_used: audioUsed,
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Error creating reading session:', sessionError)
      return NextResponse.json({ error: 'Failed to record reading session' }, { status: 500 })
    }

    // Update reading streak
    const { error: streakError } = await supabase.rpc('update_reading_streak', {
      user_uuid: user.id,
    })

    if (streakError) {
      console.error('Error updating streak:', streakError)
      // Don't fail the request, streak update is not critical
    }

    // Get updated streak data
    const { data: userData } = await supabase
      .from('users')
      .select('reading_streak_current, reading_streak_longest, last_read_date')
      .eq('id', user.id)
      .single()

    // Check for new achievements
    const { data: newAchievements } = await supabase.rpc('check_and_award_achievements', {
      user_uuid: user.id,
    })

    const achievementsUnlocked = (newAchievements || []).filter((a: any) => a.newly_unlocked)

    // Fetch full achievement details if any were unlocked
    let achievements = []
    if (achievementsUnlocked.length > 0) {
      const achievementIds = achievementsUnlocked.map((a: any) => a.achievement_id)
      const { data: achievementData } = await supabase
        .from('achievements')
        .select('*')
        .in('id', achievementIds)

      achievements = achievementData || []

      // Send achievement notification email (async, don't wait)
      if (achievementIds.length > 0) {
        sendAchievementNotification(user.id, achievementIds).catch((error) => {
          console.error('Error sending achievement notification email:', error)
          // Don't fail the request if email fails
        })
      }
    }

    return NextResponse.json({
      session,
      streak: userData
        ? {
            current: userData.reading_streak_current || 0,
            longest: userData.reading_streak_longest || 0,
            lastReadDate: userData.last_read_date,
          }
        : null,
      newAchievements: achievements,
    })
  } catch (error) {
    console.error('Error in POST /api/reading-session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
