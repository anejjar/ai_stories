import { NextRequest, NextResponse } from 'next/server'
import { sendTestCronEmail } from '@/lib/email/notification-service'

/**
 * Test Route for Cron Emails
 * Can be triggered via HTTP to verify email configuration in production
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email') || 'anejjarlhouciane@gmail.com'
    const secret = searchParams.get('secret')

    // Verify cron secret to prevent unauthorized access if configured
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && secret !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`Triggering test cron email for ${email}...`)

    const success = await sendTestCronEmail(email)

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${email}`,
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send test email. Check server logs.',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in cron test route:', error)
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

