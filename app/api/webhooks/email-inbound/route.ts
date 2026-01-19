import { NextRequest, NextResponse } from 'next/server'
import { forwardInboundEmail, isSmtpConfigured } from '@/lib/email/nodemailer-client'

const RESEND_API_KEY = process.env.RESEND_API_KEY

// Webhook event types from Resend
interface ResendWebhookEvent {
  type: string
  created_at: string
  data: {
    email_id: string
    from: string
    to: string[]
    subject: string
    created_at: string
  }
}

/**
 * Fetch full email content from Resend API
 */
async function fetchEmailContent(emailId: string): Promise<{
  from: string
  to: string
  subject: string
  text?: string
  html?: string
  created_at: string
} | null> {
  if (!RESEND_API_KEY) {
    console.error('[Webhook] Resend API key not configured')
    return null
  }

  try {
    const response = await fetch(`https://api.resend.com/emails/${emailId}`, {
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
    })

    if (!response.ok) {
      console.error('[Webhook] Failed to fetch email:', response.status)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('[Webhook] Error fetching email content:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  console.log('[Webhook] POST received at /api/webhooks/email-inbound')

  try {
    // Parse the webhook payload
    const rawBody = await request.text()
    console.log('[Webhook] Raw body:', rawBody.substring(0, 500))

    const event: ResendWebhookEvent = JSON.parse(rawBody)
    console.log('[Webhook] Event type:', event.type)

    // Only handle email.received events
    if (event.type !== 'email.received') {
      console.log('[Webhook] Ignoring event type:', event.type)
      return NextResponse.json({ success: true, message: 'Event ignored' })
    }

    const { data } = event
    console.log('[Webhook] Email from:', data.from, 'to:', data.to, 'subject:', data.subject)

    // Check if SMTP is configured
    if (!isSmtpConfigured()) {
      console.warn('[Webhook] SMTP not configured - logging email but not forwarding')
      return NextResponse.json({
        success: true,
        message: 'Email received but SMTP not configured for forwarding',
        email: { from: data.from, to: data.to, subject: data.subject }
      })
    }

    // Build email content
    let emailContent = {
      from: data.from,
      to: Array.isArray(data.to) ? data.to[0] : data.to,
      subject: data.subject,
      text: `Email from ${data.from}`,
      html: undefined as string | undefined,
      created_at: data.created_at,
    }

    // Try to fetch full email content
    if (data.email_id) {
      const fullEmail = await fetchEmailContent(data.email_id)
      if (fullEmail) {
        emailContent.text = fullEmail.text || emailContent.text
        emailContent.html = fullEmail.html
      }
    }

    // Forward the email
    const result = await forwardInboundEmail({
      from: emailContent.from,
      to: emailContent.to,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
      originalDate: emailContent.created_at,
      replyTo: emailContent.from,
    })

    if (!result.success) {
      console.error('[Webhook] Forward failed:', result.error)
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    console.log('[Webhook] Email forwarded successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Webhook] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'email-inbound-webhook',
    smtp_configured: isSmtpConfigured()
  })
}
