// @ts-nocheck - Legacy file, not used in current application
import sgMail from '@sendgrid/mail'

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || ''
const WAITLIST_FROM_EMAIL = process.env.WAITLIST_FROM_EMAIL || 'AI Stories <noreply@aistories.app>'

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
}

export interface SendgridEmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendWaitlistEmail(params: SendgridEmailParams): Promise<{ success: boolean; error?: string }> {
  if (!SENDGRID_API_KEY) {
    console.error('[SendGrid] SENDGRID_API_KEY is not configured')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    await sgMail.send({
      to: params.to,
      from: WAITLIST_FROM_EMAIL,
      subject: params.subject,
      html: params.html,
      text: params.text,
    })

    return { success: true }
  } catch (error: any) {
    console.error('[SendGrid] Error sending email:', error?.response?.body || error)
    return { success: false, error: 'Failed to send email' }
  }
}


