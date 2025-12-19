const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY || ''
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || ''
const MAILGUN_API_BASE_URL =
  process.env.MAILGUN_API_BASE_URL || 'https://api.mailgun.net/v3'
const WAITLIST_FROM_EMAIL =
  process.env.WAITLIST_FROM_EMAIL || 'AI Stories <noreply@aistories.app>'

export interface MailgunEmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendWaitlistEmail(
  params: MailgunEmailParams
): Promise<{ success: boolean; error?: string }> {
  if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
    console.error(
      '[Mailgun] MAILGUN_API_KEY or MAILGUN_DOMAIN is not configured'
    )
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const url = `${MAILGUN_API_BASE_URL}/${MAILGUN_DOMAIN}/messages`

    const auth = Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')

    const body = new URLSearchParams({
      from: WAITLIST_FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: params.html,
    })

    if (params.text) {
      body.append('text', params.text)
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      console.error('[Mailgun] API error:', response.status, errText)
      return { success: false, error: 'Failed to send email' }
    }

    return { success: true }
  } catch (error) {
    console.error('[Mailgun] Error sending email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}


