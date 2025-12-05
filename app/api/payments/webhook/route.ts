import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/payments/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const tier = session.metadata?.tier

        if (userId && tier) {
          // Update user subscription tier
          await (supabaseAdmin
            .from('users') as any)
            .update({
              subscription_tier: tier,
              stripe_subscription_id: session.subscription as string,
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by Stripe customer ID
        const { data: users } = await (supabaseAdmin
          .from('users') as any)
          .select('*')
          .eq('stripe_customer_id', customerId)
          .limit(1)

        if (users && users.length > 0) {
          const user = users[0]
          const priceId = subscription.items.data[0]?.price.id

          // Determine tier from price ID
          let tier = 'trial'
          if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
            tier = 'pro'
          } else if (priceId === process.env.STRIPE_PRO_MAX_PRICE_ID) {
            tier = 'pro_max'
          }

          await (supabaseAdmin
            .from('users') as any)
            .update({
              subscription_tier: tier,
              stripe_subscription_id: subscription.id,
            })
            .eq('id', user.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by Stripe customer ID
        const { data: users } = await (supabaseAdmin
          .from('users') as any)
          .select('*')
          .eq('stripe_customer_id', customerId)
          .limit(1)

        if (users && users.length > 0) {
          const user = users[0]

          // Downgrade to trial
          await (supabaseAdmin
            .from('users') as any)
            .update({
              subscription_tier: 'trial',
              stripe_subscription_id: null,
            })
            .eq('id', user.id)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
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

