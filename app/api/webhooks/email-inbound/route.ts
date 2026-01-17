import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { forwardInboundEmail, isSmtpConfigured } from '@/lib/email/nodemailer-client'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET

// Initialize Resend client for fetching email content
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

// Webhook event types from Resend
interface ResendWebhookEvent {
  type: string
  created_at: string
  data: {
    email_id: string
    from: string
    to: string[]
    subject: string
    created_at: string
    // Other fields depending on event type
  }
}

/**
 * Verify Resend webhook signature using HMAC
 */
async function verifyWebhookSignature(
  payload: string,
  signature: string | null
): Promise<boolean> {
  if (!RESEND_WEBHOOK_SECRET || !signature) {
    console.warn('[Webhook] Missing webhook secret or signature')
    return false
  }

  try {
    // Resend uses svix for webhook signatures
    // Format: v1,timestamp,signature
    const parts = signature.split(',')
    if (parts.length < 3) {
      return false
    }

    const timestamp = parts[0].replace('t=', '')
    const signatures = parts.slice(1).map(s => s.replace('v1=', ''))

    // Create the signed payload
    const signedPayload = `${timestamp}.${payload}`

    // Verify using Web Crypto API
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(RESEND_WEBHOOK_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signatureBytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signedPayload)
    )

    const computedSignature = Buffer.from(signatureBytes).toString('base64')

    // Check if any of the provided signatures match
    return signatures.some(sig => {
      try {
        const decodedSig = Buffer.from(sig, 'base64').toString('base64')
        return decodedSig === computedSignature
      } catch {
        return false
      }
    })
  } catch (error) {
    console.error('[Webhook] Signature verification error:', error)
    return false
  }
}

/**
 * Fetch full email content from Resend API
 */
async function fetchEmailContent(emailId: string): Promise<{
  from: string
  to: string
  subject: string
  text?: string
  html?: string
  created_at: string
} | null> {
  if (!resend) {
    console.error('[Webhook] Resend not configured')
    return null
  }

  try {
    // Use Resend API to get email details
    // Note: The exact API may vary - check Resend docs for received emails endpoint
    const response = await fetch(`https://api.resend.com/emails/${emailId}`, {
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
    })

    if (!response.ok) {
      console.error('[Webhook] Failed to fetch email:', response.status)
      return null
    }

    const email = await response.json()
    return email
  } catch (error) {
    console.error('[Webhook] Error fetching email content:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if SMTP is configured for forwarding
    if (!isSmtpConfigured()) {
      console.warn('[Webhook] SMTP not configured - cannot forward emails')
      return NextResponse.json(
        { success: false, error: 'Email forwarding not configured' },
        { status: 503 }
      )
    }

    // Get raw body for signature verification
    const rawBody = await request.text()
    const signature = request.headers.get('svix-signature')

    // Verify webhook signature (optional but recommended)
    if (RESEND_WEBHOOK_SECRET && signature) {
      const isValid = await verifyWebhookSignature(rawBody, signature)
      if (!isValid) {
        console.error('[Webhook] Invalid signature')
        return NextResponse.json(
          { success: false, error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    // Parse the webhook payload
    const event: ResendWebhookEvent = JSON.parse(rawBody)

    console.log('[Webhook] Received event:', event.type)

    // Only handle email.received events
    if (event.type !== 'email.received') {
      return NextResponse.json({ success: true, message: 'Event ignored' })
    }

    const { data } = event

    // Fetch full email content if we have an email_id
    let emailContent = {
      from: data.from,
      to: Array.isArray(data.to) ? data.to[0] : data.to,
      subject: data.subject,
      text: undefined as string | undefined,
      html: undefined as string | undefined,
      created_at: data.created_at,
    }

    if (data.email_id) {
      const fullEmail = await fetchEmailContent(data.email_id)
      if (fullEmail) {
        emailContent = {
          ...emailContent,
          text: fullEmail.text,
          html: fullEmail.html,
        }
      }
    }

    // Forward the email via nodemailer
    const result = await forwardInboundEmail({
      from: emailContent.from,
      to: emailContent.to,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
      originalDate: emailContent.created_at,
      replyTo: emailContent.from,
    })

    if (!result.success) {
      console.error('[Webhook] Failed to forward email:', result.error)
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    console.log('[Webhook] Email forwarded successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Webhook] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle GET for webhook verification (some services require this)
export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: 'email-inbound-webhook' })
}
