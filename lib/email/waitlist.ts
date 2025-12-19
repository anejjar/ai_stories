import { createClient } from '@supabase/supabase-js'
import { generateWaitlistConfirmationEmail } from './templates/waitlist-confirmation'
import { sendEmail } from './resend-client'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Admin client for waitlist writes
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Add an email to the waitlist and (optionally) send a confirmation email.
 * Returns true if this is a brand new subscription, false if the email
 * was already on the list.
 */
export async function addToWaitlistAndSendEmail(emailRaw: string): Promise<boolean> {
  const email = emailRaw.trim().toLowerCase()

  if (!email) {
    throw new Error('Email is required')
  }

  const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
  if (!emailPattern.test(email)) {
    throw new Error('Invalid email address')
  }

  // Check if the email is already subscribed
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('waitlist_subscriptions')
    .select('id, status')
    .eq('email', email)
    .maybeSingle()

  if (fetchError) {
    console.error('[Waitlist] Error checking existing subscription:', fetchError)
    throw new Error('Failed to save subscription')
  }

  const alreadySubscribed = !!existing && existing.status === 'subscribed'

  // Upsert into waitlist_subscriptions (idempotent)
  const { error } = await supabaseAdmin
    .from('waitlist_subscriptions')
    .upsert(
      {
        email,
        status: 'subscribed',
        source: 'landing_page',
      },
      {
        onConflict: 'email',
      }
    )

  if (error) {
    console.error('[Waitlist] Error saving subscription:', error)
    throw new Error('Failed to save subscription')
  }

  // If this email was already subscribed, do not send another confirmation
  if (alreadySubscribed) {
    return false
  }

  // Send confirmation email once per new subscriber (best-effort)
  try {
    const { subject, html, text } = generateWaitlistConfirmationEmail({ email })

    const result = await sendEmail({
      to: email,
      subject,
      html,
      text,
    })

    if (!result.success) {
      console.error('[Waitlist] Failed to send confirmation email:', result.error)
    }
  } catch (err) {
    console.error('[Waitlist] Error sending confirmation email:', err)
  }

  return true
}


