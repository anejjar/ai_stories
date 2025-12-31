/**
 * Base Email Template System
 * Unified design for all AI Stories emails
 * Clear UI, clear text, fun copy, consistent design
 */

export interface BaseEmailOptions {
  /** Main headline/title */
  headline: string
  /** Optional emoji or icon for the header */
  headerEmoji?: string
  /** Main content HTML */
  content: string
  /** Optional CTA button */
  cta?: {
    text: string
    url: string
  }
  /** Footer note (optional) */
  footerNote?: string
}

/**
 * Generate a consistent email template with our brand design
 */
export function generateBaseEmail(options: BaseEmailOptions): { html: string } {
  const { headline, headerEmoji = '✨', content, cta, footerNote } = options

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${headline}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6; padding: 32px 0;">
    <tr>
      <td align="center">
        <!-- Main container -->
        <table role="presentation" width="700" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); max-width: 700px; width: 100%;">
          
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 48px 32px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 12px; line-height: 1;">${headerEmoji}</div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.3; letter-spacing: -0.02em;">
                ${headline}
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 40px;">
              ${content}
              
              ${cta ? `
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0 0;">
                <tr>
                  <td align="center">
                    <a href="${cta.url}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 999px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                      ${cta.text}
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              ${footerNote ? `
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #6b7280; text-align: center;">
                ${footerNote}
              </p>
              ` : ''}
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #9ca3af; text-align: center;">
                © ${new Date().getFullYear()} AI Stories. Made with 💖 for families everywhere.
              </p>
            </td>
          </tr>

        </table>

        <!-- Unsubscribe note -->
        <p style="margin: 16px 0 0; font-size: 11px; color: #9ca3af; text-align: center; max-width: 700px; padding: 0 32px;">
          If you didn't request this email, you can safely ignore it.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  return { html }
}

/**
 * Helper to create content sections with consistent styling
 */
export function createContentSection(html: string): string {
  return `<div style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 24px;">
    ${html}
  </div>`
}

/**
 * Helper to create highlighted info boxes
 */
export function createInfoBox(html: string, type: 'info' | 'success' | 'warning' = 'info'): string {
  const colors = {
    info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
    success: { bg: '#f0fdf4', border: '#10b981', text: '#065f46' },
    warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' },
  }
  const color = colors[type]

  return `
    <div style="background-color: ${color.bg}; border-left: 4px solid ${color.border}; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
      <p style="margin: 0; font-size: 15px; line-height: 1.6; color: ${color.text};">
        ${html}
      </p>
    </div>
  `
}

