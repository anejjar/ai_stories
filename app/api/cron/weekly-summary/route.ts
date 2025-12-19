import { NextRequest, NextResponse } from 'next/server'
import { sendWeeklySummaryEmails } from '@/lib/email/notification-service'

/**
 * Weekly Summary Email Cron Job
 * Should be triggered once per week (e.g., Sunday at 6:00 PM)
 *
 * Vercel Cron syntax:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/weekly-summary",
 *     "schedule": "0 18 * * 0"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting weekly summary email job...')

    const result = await sendWeeklySummaryEmails()

    console.log('Weekly summary email job completed:', result)

    return NextResponse.json({
      success: result.success,
      sent: result.sent,
      failed: result.failed,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in weekly summary cron job:', error)
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
