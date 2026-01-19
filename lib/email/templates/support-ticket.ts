/**
 * Support Ticket Email Template
 * Sent to admin when a new support ticket is created
 */

import { generateBaseEmail, createContentSection, createInfoBox } from './base'

interface SupportTicketEmailParams {
  ticketNumber: string
  category: string
  subject: string
  email: string
  message: string
  userId?: string
  userName?: string
  userAgent?: string
  timestamp: string
}

const CATEGORY_LABELS: Record<string, string> = {
  bug_report: 'Bug Report',
  account_issue: 'Account Issue',
  billing_payment: 'Billing / Payment',
  general_inquiry: 'General Inquiry',
}

const CATEGORY_PRIORITY: Record<string, string> = {
  bug_report: 'Normal',
  account_issue: 'Normal',
  billing_payment: 'High',
  general_inquiry: 'Low',
}

export function generateSupportTicketEmail(params: SupportTicketEmailParams) {
  const categoryLabel = CATEGORY_LABELS[params.category] || params.category
  const priority = CATEGORY_PRIORITY[params.category] || 'Normal'
  const priorityColor = priority === 'High' ? '#ef4444' : priority === 'Normal' ? '#f59e0b' : '#6b7280'

  const subject = `[${params.ticketNumber}] ${categoryLabel}: ${params.subject}`

  const content = `
    ${createInfoBox(`
      <strong>Ticket:</strong> ${params.ticketNumber}<br>
      <strong>Category:</strong> ${categoryLabel}<br>
      <strong>Priority:</strong> <span style="color: ${priorityColor}; font-weight: 600;">${priority}</span>
    `, 'info')}

    ${createContentSection(`
      <p style="margin: 0 0 8px; font-weight: 600; color: #6b7280;">From:</p>
      <div style="background: #f9fafb; padding: 16px; border-radius: 12px; margin-bottom: 16px;">
        <p style="margin: 0; font-weight: 600;">${params.userName || 'Anonymous User'}</p>
        <p style="margin: 4px 0 0; color: #6b7280;">${params.email}</p>
        ${params.userId ? `<p style="margin: 8px 0 0; font-size: 12px; color: #9ca3af;">User ID: ${params.userId}</p>` : ''}
      </div>
    `)}

    ${createContentSection(`
      <p style="margin: 0 0 8px; font-weight: 600; color: #6b7280;">Subject:</p>
      <p style="margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #111827;">${params.subject}</p>
    `)}

    ${createContentSection(`
      <p style="margin: 0 0 8px; font-weight: 600; color: #6b7280;">Message:</p>
      <div style="background: #f9fafb; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; white-space: pre-wrap; font-family: inherit; color: #374151; line-height: 1.6;">${params.message}</div>
    `)}

    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
        Submitted: ${new Date(params.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}<br>
        ${params.userAgent ? `Browser: ${params.userAgent.substring(0, 100)}${params.userAgent.length > 100 ? '...' : ''}` : ''}
      </p>
    </div>
  `

  const { html } = generateBaseEmail({
    headline: 'New Support Request',
    headerEmoji: '📬',
    content,
    footerNote: `Reply directly to this email to respond to ${params.email}`,
  })

  const text = [
    `New Support Request - ${params.ticketNumber}`,
    '',
    `Category: ${categoryLabel}`,
    `Priority: ${priority}`,
    `From: ${params.userName || 'Anonymous'} <${params.email}>`,
    params.userId ? `User ID: ${params.userId}` : '',
    '',
    `Subject: ${params.subject}`,
    '',
    'Message:',
    '---',
    params.message,
    '---',
    '',
    `Submitted: ${params.timestamp}`,
  ].filter(Boolean).join('\n')

  return { subject, html, text }
}
