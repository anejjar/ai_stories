import nodemailer from 'nodemailer'

// SMTP configuration from environment variables
const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10)
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const SMTP_FORWARD_TO = process.env.SMTP_FORWARD_TO

// Check if SMTP is configured
export function isSmtpConfigured(): boolean {
  return !!(SMTP_HOST && SMTP_USER && SMTP_PASS && SMTP_FORWARD_TO)
}

// Create transporter lazily
let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
  if (!isSmtpConfigured()) {
    console.warn('[Nodemailer] SMTP not configured - email forwarding disabled')
    return null
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  }

  return transporter
}

interface ForwardEmailOptions {
  from: string
  to: string
  subject: string
  text?: string
  html?: string
  originalDate?: string
  replyTo?: string
}

/**
 * Forward an inbound email to the configured personal email address
 */
export async function forwardInboundEmail(
  options: ForwardEmailOptions
): Promise<{ success: boolean; error?: string }> {
  const transport = getTransporter()

  if (!transport) {
    return { success: false, error: 'SMTP not configured' }
  }

  if (!SMTP_FORWARD_TO) {
    return { success: false, error: 'SMTP_FORWARD_TO not configured' }
  }

  try {
    const { from, to, subject, text, html, originalDate, replyTo } = options

    // Build forwarded email content
    const forwardedSubject = `[Forwarded] ${subject}`

    const headerInfo = [
      `From: ${from}`,
      `To: ${to}`,
      originalDate ? `Date: ${originalDate}` : null,
      '---',
    ].filter(Boolean).join('\n')

    const forwardedText = text ? `${headerInfo}\n\n${text}` : headerInfo
    const forwardedHtml = html
      ? `<div style="background:#f5f5f5;padding:10px;margin-bottom:15px;border-radius:4px;font-family:monospace;font-size:12px;">
          <p><strong>From:</strong> ${from}</p>
          <p><strong>To:</strong> ${to}</p>
          ${originalDate ? `<p><strong>Date:</strong> ${originalDate}</p>` : ''}
        </div>
        <hr style="border:1px solid #ddd;margin:15px 0;">
        ${html}`
      : undefined

    await transport.sendMail({
      from: `AI Tales Forwarded <${SMTP_USER}>`,
      to: SMTP_FORWARD_TO,
      subject: forwardedSubject,
      text: forwardedText,
      html: forwardedHtml,
      replyTo: replyTo || from,
    })

    console.log(`[Nodemailer] Email forwarded to ${SMTP_FORWARD_TO}`)
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Nodemailer] Failed to forward email:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Test SMTP connection
 */
export async function testSmtpConnection(): Promise<{ success: boolean; error?: string }> {
  const transport = getTransporter()

  if (!transport) {
    return { success: false, error: 'SMTP not configured' }
  }

  try {
    await transport.verify()
    console.log('[Nodemailer] SMTP connection verified')
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Nodemailer] SMTP connection failed:', errorMessage)
    return { success: false, error: errorMessage }
  }
}
