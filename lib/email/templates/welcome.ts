/**
 * Welcome email template
 * Sent when a user verifies their email address
 * Clear UI, clear text, fun copy, consistent design
 */

import { generateBaseEmail, createContentSection, createInfoBox } from './base'

interface WelcomeEmailParams {
  email: string
  displayName?: string
}

export function generateWelcomeEmail(
  params: WelcomeEmailParams
): { subject: string; html: string; text: string } {
  const subject = "Welcome to AI Stories! 🎉 Your magical journey begins now"

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aistories.app'
  const createStoryUrl = `${appUrl}/create`

  const content = `
    ${createContentSection(`
      <p style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #111827;">
        ${params.displayName ? `Hey ${params.displayName}! 👋` : 'Hey there! 👋'}
      </p>
      <p style="margin: 0 0 16px;">
        Welcome to <strong>AI Stories</strong>! We're so excited to have you here. You're now part of a community of parents creating magical, personalized bedtime stories for their children.
      </p>
      <p style="margin: 0 0 16px;">
        Your email has been verified and your account is ready to go. It's time to create your first story! ✨
      </p>
    `)}

    ${createInfoBox(`
      <strong>Ready to get started?</strong><br>
      Creating your first personalized story takes just seconds. Simply tell us about your child, choose a theme, and watch as AI crafts a unique adventure where your little one is the hero!
    `, 'info')}

    ${createContentSection(`
      <p style="margin: 0 0 12px; font-size: 15px; color: #6b7280;">
        <strong>What you can do:</strong>
      </p>
      <ul style="margin: 0; padding-left: 24px; color: #4b5563; line-height: 1.8;">
        <li>Create unlimited personalized stories (with PRO or FAMILY plans)</li>
        <li>Generate multiple story drafts to choose your favorite</li>
        <li>Add beautiful AI-generated illustrations (FAMILY plan)</li>
        <li>Read stories together with text-to-speech narration</li>
        <li>Export stories as PDFs to keep forever</li>
        <li>Build a library of magical memories</li>
      </ul>
    `)}

    ${createInfoBox(`
      <strong>Start with a free trial!</strong> You can create your first story right now. Upgrade anytime to unlock unlimited stories and premium features.
    `, 'success')}
  `

  const { html } = generateBaseEmail({
    headline: "Welcome to AI Stories!",
    headerEmoji: "🎉✨",
    content,
    cta: {
      text: "Create Your First Story",
      url: createStoryUrl,
    },
    footerNote: "Questions? Just reply to this email - we're here to help make bedtime magical!",
  })

  const text = [
    "Welcome to AI Stories!",
    "",
    params.displayName ? `Hey ${params.displayName}!` : "Hey there!",
    "",
    "Welcome to AI Stories! We're so excited to have you here. You're now part of a community of parents creating magical, personalized bedtime stories for their children.",
    "",
    "Your email has been verified and your account is ready to go. It's time to create your first story!",
    "",
    "Ready to get started?",
    "Creating your first personalized story takes just seconds. Simply tell us about your child, choose a theme, and watch as AI crafts a unique adventure where your little one is the hero!",
    "",
    "What you can do:",
    "• Create unlimited personalized stories (with PRO or FAMILY plans)",
    "• Generate multiple story drafts to choose your favorite",
    "• Add beautiful AI-generated illustrations (FAMILY plan)",
    "• Read stories together with text-to-speech narration",
    "• Export stories as PDFs to keep forever",
    "• Build a library of magical memories",
    "",
    "Start with a free trial! You can create your first story right now. Upgrade anytime to unlock unlimited stories and premium features.",
    "",
    `Create Your First Story: ${createStoryUrl}`,
    "",
    "Questions? Just reply to this email - we're here to help make bedtime magical!",
    "",
    `© ${new Date().getFullYear()} AI Stories. Made with 💖 for families everywhere.`,
  ].join('\n')

  return { subject, html, text }
}
