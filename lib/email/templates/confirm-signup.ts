/**
 * Email Confirmation Template
 * For Supabase email verification
 * Can be used both as a TypeScript function and as an HTML template for Supabase dashboard
 */

import { generateBaseEmail, createContentSection, createInfoBox } from './base'

interface ConfirmSignupEmailParams {
  confirmationUrl: string
  email?: string
}

/**
 * Generate email confirmation template (TypeScript version)
 * This matches the HTML template below for consistency
 */
export function generateConfirmSignupEmail(
  params: ConfirmSignupEmailParams
): { subject: string; html: string; text: string } {
  const subject = "Confirm your email to start creating magical stories! ✨"

  const content = `
    ${createContentSection(`
      <p style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #111827;">
        Welcome to AI Stories! 👋
      </p>
      <p style="margin: 0 0 16px;">
        We're so excited to have you! To get started creating magical, personalized bedtime stories for your child, please confirm your email address.
      </p>
      <p style="margin: 0 0 16px;">
        Just click the button below to verify your email and unlock your account.
      </p>
    `)}

    ${createInfoBox(`
      <strong>Why verify your email?</strong><br>
      Email verification helps us keep your account secure and ensures you receive important updates about your stories and account.
    `, 'info')}
  `

  const { html } = generateBaseEmail({
    headline: "Confirm Your Email",
    headerEmoji: "📧✨",
    content,
    cta: {
      text: "Confirm Your Email",
      url: params.confirmationUrl,
    },
    footerNote: "If you didn't create an account with AI Stories, you can safely ignore this email.",
  })

  const text = [
    "Confirm your email to start creating magical stories!",
    "",
    "Welcome to AI Stories!",
    "",
    "We're so excited to have you! To get started creating magical, personalized bedtime stories for your child, please confirm your email address.",
    "",
    "Just click the link below to verify your email and unlock your account:",
    "",
    params.confirmationUrl,
    "",
    "Why verify your email?",
    "Email verification helps us keep your account secure and ensures you receive important updates about your stories and account.",
    "",
    "If you didn't create an account with AI Stories, you can safely ignore this email.",
    "",
    `© ${new Date().getFullYear()} AI Stories. Made with 💖 for families everywhere.`,
  ].join('\n')

  return { subject, html, text }
}

/**
 * HTML Template for Supabase Dashboard
 * Copy this HTML into Supabase: Authentication > Email Templates > Confirm signup
 * 
 * Subject: Confirm your email to start creating magical stories! ✨
 */
export const SUPABASE_CONFIRM_SIGNUP_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Confirm Your Email</title>
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
              <div style="font-size: 48px; margin-bottom: 12px; line-height: 1;">📧✨</div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.3; letter-spacing: -0.02em;">
                Confirm Your Email
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 40px;">
              <div style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 24px;">
                <p style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #111827;">
                  Welcome to AI Stories! 👋
                </p>
                <p style="margin: 0 0 16px;">
                  We're so excited to have you! To get started creating magical, personalized bedtime stories for your child, please confirm your email address.
                </p>
                <p style="margin: 0 0 16px;">
                  Just click the button below to verify your email and unlock your account.
                </p>
              </div>
              
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
                <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #1e40af;">
                  <strong>Why verify your email?</strong><br>
                  Email verification helps us keep your account secure and ensures you receive important updates about your stories and account.
                </p>
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 999px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                      Confirm Your Email
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Alternative link for email clients that don't support buttons -->
              <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280; text-align: center;">
                  If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p style="margin: 0; font-size: 12px; color: #3b82f6; text-align: center; word-break: break-all;">
                  {{ .ConfirmationURL }}
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #6b7280; text-align: center;">
                If you didn't create an account with AI Stories, you can safely ignore this email.
              </p>
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #9ca3af; text-align: center;">
                © 2024 AI Stories. Made with 💖 for families everywhere.
              </p>
            </td>
          </tr>

        </table>

        <!-- Unsubscribe note -->
        <p style="margin: 16px 0 0; font-size: 11px; color: #9ca3af; text-align: center; max-width: 700px; padding: 0 32px;">
          This is an automated email. Please do not reply to this message.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim()
