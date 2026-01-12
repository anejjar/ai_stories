import { NextRequest, NextResponse } from 'next/server'
import { sendBedtimeReminderEmails } from '@/lib/email/notification-service'

/**
 * Bedtime Reminder Email Cron Job
 * Should be triggered every hour to check for users at their reminder time
 *
 * Vercel Cron syntax:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/bedtime-reminder",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access (fail-closed)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error('CRON_SECRET not configured')
      return NextResponse.json({ error: 'Service misconfigured' }, { status: 500 })
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn('Unauthorized cron job attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current hour in HH:00:00 format
    const now = new Date()
    const currentHour = now.getHours()
    const targetTime = `${currentHour.toString().padStart(2, '0')}:00:00`

    console.log(`Starting bedtime reminder email job for ${targetTime}...`)

    const result = await sendBedtimeReminderEmails(targetTime)

    console.log('Bedtime reminder email job completed:', result)

    return NextResponse.json({
      success: result.success,
      sent: result.sent,
      failed: result.failed,
      errors: result.errors,
      targetTime,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in bedtime reminder cron job:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
