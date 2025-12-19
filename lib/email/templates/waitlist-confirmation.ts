/**
 * Waitlist confirmation email template
 * Sent when a user joins the pre-launch waitlist
 */

interface WaitlistEmailParams {
  email: string
}

export function generateWaitlistConfirmationEmail(
  params: WaitlistEmailParams
): { subject: string; html: string; text: string } {
  const subject = 'You’re on the AI Stories waitlist'

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f3f4f6; padding: 32px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);">
              <tr>
                <td style="text-align: center;">
                  <div style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #6366f1; margin-bottom: 12px;">
                    Early access confirmed
                  </div>
                  <h1 style="margin: 0 0 16px; font-size: 24px; line-height: 1.25; color: #0f172a;">
                    Thanks for joining the AI Stories waitlist
                  </h1>
                  <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #4b5563;">
                    We’ve added <strong>${params.email}</strong> to our early access list.
                  </p>
                  <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #4b5563;">
                    We’re putting the final touches on AI Stories — a calm, focused space for turning complex ideas into clear, compelling narratives.
                    As a waitlist member, you’ll be among the first to try it when we open the doors.
                  </p>
                  <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #4b5563;">
                    We’ll reach out soon with launch updates, early access details, and a few behind-the-scenes previews.
                  </p>
                  <div style="margin: 24px 0; padding: 16px 20px; border-radius: 999px; background: #f9fafb; display: inline-block; font-size: 13px; color: #6b7280;">
                    No spam. No noise. Just thoughtful updates when there’s something worth sharing.
                  </div>
                  <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #9ca3af;">
                    If you didn’t request this, you can safely ignore this email.
                  </p>
                </td>
              </tr>
            </table>
            <p style="margin-top: 16px; font-size: 11px; color: #9ca3af; text-align: center;">
              © ${new Date().getFullYear()} AI Stories. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </div>
  `

  const text = [
    'Thanks for joining the AI Stories waitlist.',
    '',
    `We’ve added ${params.email} to our early access list.`,
    '',
    'We’re putting the final touches on AI Stories — a calm, focused space for turning complex ideas into clear, compelling narratives.',
    'As a waitlist member, you’ll be among the first to try it when we open the doors.',
    '',
    'We’ll reach out soon with launch updates, early access details, and a few behind-the-scenes previews.',
    '',
    'No spam. No noise. Just thoughtful updates when there’s something worth sharing.',
    '',
    `© ${new Date().getFullYear()} AI Stories. All rights reserved.`,
  ].join('\n')

  return { subject, html, text }
}


