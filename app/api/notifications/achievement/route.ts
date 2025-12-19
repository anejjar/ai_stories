import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { sendAchievementNotification } from '@/lib/email/notification-service'

/**
 * Achievement Notification API
 * Triggered when a user unlocks new achievements
 */
export async function POST(request: NextRequest) {
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

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { achievementIds } = body

    if (!achievementIds || !Array.isArray(achievementIds) || achievementIds.length === 0) {
      return NextResponse.json({ error: 'Achievement IDs are required' }, { status: 400 })
    }

    // Send notification email
    const success = await sendAchievementNotification(user.id, achievementIds)

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Achievement notification sent',
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Notification not sent (user may have disabled notifications)',
      })
    }
  } catch (error) {
    console.error('Error sending achievement notification:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send notification',
      },
      { status: 500 }
    )
  }
}
