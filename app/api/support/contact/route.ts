import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/resend-client'
import { generateSupportTicketEmail } from '@/lib/email/templates/support-ticket'
import { generateSupportConfirmationEmail } from '@/lib/email/templates/support-confirmation'
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/rate-limit'

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@ai-tales.com'

const VALID_CATEGORIES = ['bug_report', 'account_issue', 'billing_payment', 'general_inquiry']

function generateTicketNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `TKT-${timestamp}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))

    const {
      category,
      subject,
      email,
      message,
      userId,
      userName,
    } = body

    // Validate required fields
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Please select a valid category.' },
        { status: 400 }
      )
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: 'Subject must be at least 5 characters.' },
        { status: 400 }
      )
    }

    if (subject.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Subject must be less than 200 characters.' },
        { status: 400 }
      )
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      )
    }

    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
    if (!emailPattern.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      )
    }

    if (!message || typeof message !== 'string' || message.trim().length < 20) {
      return NextResponse.json(
        { success: false, error: 'Message must be at least 20 characters.' },
        { status: 400 }
      )
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { success: false, error: 'Message must be less than 2000 characters.' },
        { status: 400 }
      )
    }

    // Rate limiting
    const rateLimitKey = userId ||
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const rate = await checkRateLimit(rateLimitKey, RATE_LIMITS.supportContact)
    if (!rate.success) {
      return NextResponse.json(
        { success: false, error: 'Too many support requests. Please wait before trying again.' },
        { status: 429, headers: getRateLimitHeaders(rate) }
      )
    }

    // Generate ticket number
    const ticketNumber = generateTicketNumber()
    const timestamp = new Date().toISOString()

    // Determine priority based on category
    const priority = category === 'billing_payment' ? 'high' : 'normal'

    // Insert into database
    const { error: dbError } = await supabaseAdmin
      .from('support_tickets')
      .insert({
        user_id: userId || null,
        user_email: email.trim(),
        user_name: userName || null,
        ticket_number: ticketNumber,
        category,
        subject: subject.trim(),
        message: message.trim(),
        status: 'open',
        priority,
      })

    if (dbError) {
      console.error('[Support Contact] Database error:', dbError)
      return NextResponse.json(
        { success: false, error: 'Failed to create support ticket. Please try again.' },
        { status: 500 }
      )
    }

    // Send email to support team
    const supportEmailContent = generateSupportTicketEmail({
      ticketNumber,
      category,
      subject: subject.trim(),
      email: email.trim(),
      message: message.trim(),
      userId,
      userName,
      userAgent: request.headers.get('user-agent') || undefined,
      timestamp,
    })

    const supportResult = await sendEmail({
      to: SUPPORT_EMAIL,
      subject: supportEmailContent.subject,
      html: supportEmailContent.html,
      text: supportEmailContent.text,
      replyTo: email.trim(),
    })

    if (!supportResult.success) {
      console.error('[Support Contact] Failed to send admin email:', supportResult.error)
      // Don't fail the request - ticket is already in database
    }

    // Send confirmation email to user
    const confirmationEmail = generateSupportConfirmationEmail({
      ticketNumber,
      category,
      subject: subject.trim(),
      userName,
    })

    const confirmResult = await sendEmail({
      to: email.trim(),
      subject: confirmationEmail.subject,
      html: confirmationEmail.html,
      text: confirmationEmail.text,
    })

    if (!confirmResult.success) {
      console.error('[Support Contact] Failed to send confirmation email:', confirmResult.error)
      // Don't fail the request - ticket is already created
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ticketNumber,
          message: 'Your message has been sent! Check your email for confirmation.',
        },
      },
      { status: 200, headers: getRateLimitHeaders(rate) }
    )
  } catch (error) {
    console.error('[Support Contact] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
