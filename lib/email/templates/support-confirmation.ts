/**
 * Support Confirmation Email Template
 * Sent to user when their support ticket is received
 */

import { generateBaseEmail, createContentSection, createInfoBox } from './base'

interface SupportConfirmationEmailParams {
  ticketNumber: string
  category: string
  subject: string
  userName?: string
}

const CATEGORY_LABELS: Record<string, string> = {
  bug_report: 'Bug Report',
  account_issue: 'Account Issue',
  billing_payment: 'Billing / Payment',
  general_inquiry: 'General Inquiry',
}

export function generateSupportConfirmationEmail(params: SupportConfirmationEmailParams) {
  const categoryLabel = CATEGORY_LABELS[params.category] || params.category
  const greeting = params.userName ? `Hey ${params.userName}!` : 'Hey there!'

  const subject = `We got your message! [${params.ticketNumber}]`

  const content = `
    ${createContentSection(`
      <p style="margin: 0 0 16px; font-size: 20px; font-weight: 700;">
        ${greeting} 👋
      </p>
      <p style="margin: 0 0 16px; line-height: 1.7;">
        Thanks for reaching out! We've received your support request and our team will get back to you as soon as possible.
      </p>
    `)}

    ${createInfoBox(`
      <strong>Your Reference Number:</strong><br>
      <span style="font-size: 18px; font-weight: 700; color: #1e40af;">${params.ticketNumber}</span><br>
      <small style="color: #6b7280;">Please include this in any follow-up messages</small>
    `, 'info')}

    ${createContentSection(`
      <div style="background: #f9fafb; padding: 16px; border-radius: 12px;">
        <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Your Request</p>
        <p style="margin: 0 0 8px; font-weight: 600; color: #111827;">${params.subject}</p>
        <p style="margin: 0; font-size: 14px; color: #6b7280;">Category: ${categoryLabel}</p>
      </div>
    `)}

    ${createInfoBox(`
      <strong>What happens next?</strong><br>
      We typically respond within 24-48 hours. Billing issues are prioritized for faster responses.
    `, 'success')}

    ${createContentSection(`
      <p style="margin: 0; color: #6b7280; font-size: 14px;">
        Need to add more information? Simply reply to this email.
      </p>
    `)}
  `

  const { html } = generateBaseEmail({
    headline: 'Message Received!',
    headerEmoji: '✅',
    content,
    footerNote: 'You can reply to this email to add more information to your request.',
  })

  const text = [
    'We got your message!',
    '',
    greeting,
    '',
    "Thanks for reaching out! We've received your support request and our team will get back to you as soon as possible.",
    '',
    `Reference Number: ${params.ticketNumber}`,
    `Subject: ${params.subject}`,
    `Category: ${categoryLabel}`,
    '',
    'What happens next?',
    'We typically respond within 24-48 hours. Billing issues are prioritized for faster responses.',
    '',
    'Need to add more information? Simply reply to this email.',
  ].join('\n')

  return { subject, html, text }
}
