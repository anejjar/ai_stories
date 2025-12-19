/**
 * Waitlist confirmation email template
 * Sent when a user joins the pre-launch waitlist
 * Clear UI, clear text, fun copy, consistent design
 */

import { generateBaseEmail, createContentSection, createInfoBox } from './base'

interface WaitlistEmailParams {
  email: string
}

export function generateWaitlistConfirmationEmail(
  params: WaitlistEmailParams
): { subject: string; html: string; text: string } {
  const subject = "You're on the waitlist! 🌙 Bedtime magic is coming soon"

  const content = `
    ${createContentSection(`
      <p style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #111827;">
        Hey there! 👋
      </p>
      <p style="margin: 0 0 16px;">
        We're so excited you joined the waitlist! You're now part of a special group of parents who'll be the first to experience <strong>AI Stories</strong> — where bedtime becomes a magical moment where your child is the hero of every adventure.
      </p>
      <p style="margin: 0 0 16px;">
        We're putting the finishing touches on something we think you'll love: personalized, kid-safe bedtime stories that you can generate in seconds, read together, and turn into cherished memories.
      </p>
    `)}

    ${createInfoBox(`
      <strong>What happens next?</strong><br>
      We'll email you as soon as we're ready to launch. You'll get early access, a behind-the-scenes look at how it works, and the chance to help shape the future of bedtime stories.
    `, 'info')}

    ${createContentSection(`
      <p style="margin: 0 0 12px; font-size: 15px; color: #6b7280;">
        <strong>What to expect:</strong>
      </p>
      <ul style="margin: 0; padding-left: 24px; color: #4b5563; line-height: 1.8;">
        <li>Launch updates (we'll only email when there's real news)</li>
        <li>Early access invite when we open the doors</li>
        <li>Tips and ideas for making bedtime magical</li>
      </ul>
    `)}

    ${createInfoBox(`
      <strong>No spam, ever.</strong> We only email when there's something worth sharing. You can unsubscribe anytime.
    `, 'success')}
  `

  const { html } = generateBaseEmail({
    headline: "You're on the waitlist!",
    headerEmoji: "🌙✨",
    content,
    footerNote: "We're building something special for you and your family. Can't wait to share it!",
  })

  const text = [
    "You're on the waitlist!",
    "",
    "Hey there!",
    "",
    "We're so excited you joined the waitlist! You're now part of a special group of parents who'll be the first to experience AI Stories — where bedtime becomes a magical moment where your child is the hero of every adventure.",
    "",
    "We're putting the finishing touches on something we think you'll love: personalized, kid-safe bedtime stories that you can generate in seconds, read together, and turn into cherished memories.",
    "",
    "What happens next?",
    "We'll email you as soon as we're ready to launch. You'll get early access, a behind-the-scenes look at how it works, and the chance to help shape the future of bedtime stories.",
    "",
    "What to expect:",
    "• Launch updates (we'll only email when there's real news)",
    "• Early access invite when we open the doors",
    "• Tips and ideas for making bedtime magical",
    "",
    "No spam, ever. We only email when there's something worth sharing. You can unsubscribe anytime.",
    "",
    `© ${new Date().getFullYear()} AI Stories. Made with 💖 for families everywhere.`,
  ].join('\n')

  return { subject, html, text }
}
