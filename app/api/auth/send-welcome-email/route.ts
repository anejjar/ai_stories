import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { generateWelcomeEmail } from '@/lib/email/templates/welcome'
import { sendEmail } from '@/lib/email/resend-client'
import type { ApiResponse } from '@/types'

/**
 * Send welcome email to a user after email verification
 * This endpoint should be called after a user verifies their email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email } = body

    if (!userId || !email) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User ID and email are required',
        },
        { status: 400 }
      )
    }

    // Check if welcome email was already sent
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('welcome_email_sent_at, display_name')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error('Error fetching user:', fetchError)
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Failed to fetch user data',
        },
        { status: 500 }
      )
    }

    // If welcome email was already sent, return success (idempotent)
    if (userData?.welcome_email_sent_at) {
      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: { message: 'Welcome email already sent' },
        },
        { status: 200 }
      )
    }

    // Generate welcome email
    const { subject, html, text } = generateWelcomeEmail({
      email,
      displayName: userData?.display_name || undefined,
    })

    // Send email
    const result = await sendEmail({
      to: email,
      subject,
      html,
      text,
    })

    if (!result.success) {
      console.error('Failed to send welcome email:', result.error)
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: result.error || 'Failed to send welcome email',
        },
        { status: 500 }
      )
    }

    // Update user record to mark welcome email as sent
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ welcome_email_sent_at: new Date().toISOString() })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating welcome_email_sent_at:', updateError)
      // Don't fail the request if update fails - email was sent
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { message: 'Welcome email sent successfully' },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
