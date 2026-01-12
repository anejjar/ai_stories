import { NextRequest, NextResponse } from 'next/server'
import {
  verifyWebhookSignature,
  parseWebhookEvent,
  type LemonSqueezyWebhookEvent,
} from '@/lib/payments/lemonsqueezy'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  if (!process.env.LEMONSQUEEZY_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  const body = await request.text()
  const signature = request.headers.get('x-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  // Verify webhook signature
  try {
    const isValid = verifyWebhookSignature(body, signature)
    if (!isValid) {
      console.error('Webhook signature verification failed')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }
  } catch (err) {
    console.error('Webhook signature verification error:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Parse webhook event
  let event: LemonSqueezyWebhookEvent
  try {
    event = parseWebhookEvent(body)
  } catch (err) {
    console.error('Failed to parse webhook event:', err)
    return NextResponse.json(
      { error: 'Invalid webhook payload' },
      { status: 400 }
    )
  }

  try {
    const eventName = event.meta?.event_name
    const attributes = event.data?.attributes || {}

    switch (eventName) {
      case 'subscription_created':
      case 'subscription_updated': {
        const subscriptionId = event.data?.id
        const customerId = attributes.customer_id?.toString()
        const variantId = attributes.variant_id?.toString()
        const status = attributes.status

        if (!subscriptionId || !customerId) {
          console.error('Missing subscription or customer ID in webhook')
          break
        }

        // Determine tier from variant ID
        let tier = 'trial'
        if (variantId === process.env.LEMONSQUEEZY_PRO_VARIANT_ID) {
          tier = 'pro'
        } else if (variantId === process.env.LEMONSQUEEZY_FAMILY_VARIANT_ID) {
          tier = 'family'
        }

        // Find user by email (Lemon Squeezy provides user_email in attributes)
        const userEmail = attributes.user_email
        if (userEmail) {
          const { data: users } = await (supabaseAdmin
            .from('users') as any)
            .select('*')
            .eq('email', userEmail)
            .limit(1)

          if (users && users.length > 0) {
            const user = users[0]
            await (supabaseAdmin
              .from('users') as any)
              .update({
                subscription_tier: tier,
                lemonsqueezy_subscription_id: subscriptionId,
                lemonsqueezy_customer_id: customerId,
              })
              .eq('id', user.id)

            console.log(`[Webhook] Updated user ${user.id} to tier ${tier} (status: ${status})`)
          }
        }
        break
      }

      case 'subscription_cancelled':
      case 'subscription_expired': {
        const subscriptionId = event.data?.id
        const customerId = attributes.customer_id?.toString()

        if (!subscriptionId || !customerId) {
          console.error('Missing subscription or customer ID in webhook')
          break
        }

        // Find user by Lemon Squeezy customer ID
        const { data: users } = await (supabaseAdmin
          .from('users') as any)
          .select('*')
          .eq('lemonsqueezy_customer_id', customerId)
          .limit(1)

        if (users && users.length > 0) {
          const user = users[0]

          // Downgrade to trial
          await (supabaseAdmin
            .from('users') as any)
            .update({
              subscription_tier: 'trial',
              lemonsqueezy_subscription_id: null,
            })
            .eq('id', user.id)

          console.log(`[Webhook] Downgraded user ${user.id} to trial`)
        }
        break
      }

      case 'subscription_payment_success': {
        // Subscription payment succeeded - ensure subscription is active
        const subscriptionId = event.data?.id
        const customerId = attributes.customer_id?.toString()
        const variantId = attributes.variant_id?.toString()

        if (!subscriptionId || !customerId) {
          console.error('Missing subscription or customer ID in webhook')
          break
        }

        // Determine tier from variant ID
        let tier = 'trial'
        if (variantId === process.env.LEMONSQUEEZY_PRO_VARIANT_ID) {
          tier = 'pro'
        } else if (variantId === process.env.LEMONSQUEEZY_FAMILY_VARIANT_ID) {
          tier = 'family'
        }

        // Find user by Lemon Squeezy customer ID
        const { data: users } = await (supabaseAdmin
          .from('users') as any)
          .select('*')
          .eq('lemonsqueezy_customer_id', customerId)
          .limit(1)

        if (users && users.length > 0) {
          const user = users[0]
          await (supabaseAdmin
            .from('users') as any)
            .update({
              subscription_tier: tier,
              lemonsqueezy_subscription_id: subscriptionId,
            })
            .eq('id', user.id)

          console.log(`[Webhook] Confirmed payment for user ${user.id}, tier ${tier}`)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${eventName}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

