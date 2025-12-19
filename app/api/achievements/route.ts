import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * GET /api/achievements
 * Get user's achievements and progress
 */
export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user achievements
    const { data: userAchievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select('*, achievement:achievements(*)')
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false })

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError)
      return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 })
    }

    // Get user stats
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('reading_streak_current, reading_streak_longest, last_read_date, total_points, reader_level')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
    }

    return NextResponse.json({
      achievements: userAchievements,
      stats: userData,
    })
  } catch (error) {
    console.error('Error in GET /api/achievements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/achievements
 * Check and award achievements for the current user
 */
export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Call the database function to check and award achievements
    const { data, error } = await supabase.rpc('check_and_award_achievements', {
      user_uuid: user.id,
    })

    if (error) {
      console.error('Error checking achievements:', error)
      return NextResponse.json({ error: 'Failed to check achievements' }, { status: 500 })
    }

    // Return newly unlocked achievements
    const newlyUnlocked = (data || []).filter((a: any) => a.newly_unlocked)

    // If achievements were unlocked, fetch their full details
    if (newlyUnlocked.length > 0) {
      const achievementIds = newlyUnlocked.map((a: any) => a.achievement_id)

      const { data: achievements, error: fetchError } = await supabase
        .from('achievements')
        .select('*')
        .in('id', achievementIds)

      if (fetchError) {
        console.error('Error fetching achievement details:', fetchError)
      }

      return NextResponse.json({
        newAchievements: achievements || [],
        count: newlyUnlocked.length,
      })
    }

    return NextResponse.json({
      newAchievements: [],
      count: 0,
    })
  } catch (error) {
    console.error('Error in POST /api/achievements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
