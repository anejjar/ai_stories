import { Resend } from 'resend'

/**
 * Resend Email Client
 * Handles sending transactional emails
 */
const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const FROM_EMAIL =
  process.env.WAITLIST_FROM_EMAIL || 'AI Stories <noreply@aistories.app>'

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

export interface SendEmailParams {
  to: string
  subject: string
  html: string
  text?: string
  replyTo?: string
}

/**
 * Send an email using Resend SDK
 */
export async function sendEmail(
  params: SendEmailParams
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    if (!resend) {
      console.error('RESEND_API_KEY is not configured')
      return { success: false, error: 'Email service not configured' }
    }

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      reply_to: params.replyTo,
    })

    if (result.error) {
      console.error('Resend API error:', result.error)
      return {
        success: false,
        error: result.error.message || 'Failed to send email',
      }
    }

    return { success: true, id: (result.data as any)?.id }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

/**
 * Send bulk emails (for newsletters, etc.)
 */
export async function sendBulkEmails(
  emails: Array<{ to: string; subject: string; html: string }>
): Promise<{ success: boolean; sent: number; failed: number }> {
  let sent = 0
  let failed = 0

  for (const email of emails) {
    const result = await sendEmail(email)
    if (result.success) {
      sent++
    } else {
      failed++
    }

    // Rate limiting: wait 100ms between emails
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return { success: true, sent, failed }
}

/**
 * Check if Resend is configured
 */
export function isResendConfigured(): boolean {
  return !!RESEND_API_KEY
}
