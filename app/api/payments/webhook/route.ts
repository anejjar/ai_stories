import { NextRequest, NextResponse } from 'next/server'
import {
  verifyWebhookSignature,
  parseWebhookEvent,
  type LemonSqueezyWebhookEvent,
} from '@/lib/payments/lemonsqueezy'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { retryDatabaseOperation } from '@/lib/database/retry'

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
      logger.error('Webhook signature verification failed', undefined, {
        endpoint: '/api/payments/webhook',
        hasSignature: !!signature,
      })
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }
  } catch (err) {
    logger.error('Webhook signature verification error', err instanceof Error ? err : new Error(String(err)), {
      endpoint: '/api/payments/webhook',
    })
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
    logger.error('Failed to parse webhook event', err instanceof Error ? err : new Error(String(err)), {
      endpoint: '/api/payments/webhook',
    })
    return NextResponse.json(
      { error: 'Invalid webhook payload' },
      { status: 400 }
    )
  }

  try {
    const eventName = event.meta?.event_name
    const attributes = event.data?.attributes || {}
    const eventId = event.data?.id

    if (!eventId) {
      logger.error('Webhook event missing ID', undefined, {
        endpoint: '/api/payments/webhook',
        eventType: event.meta?.event_name,
      })
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      )
    }

    // Check for duplicate event (idempotency)
    const { data: existingEvent } = await supabaseAdmin
      .from('webhook_events')
      .select('id, status')
      .eq('event_id', eventId)
      .single()

    if (existingEvent) {
      logger.info('Webhook event already processed', {
        eventId,
        status: existingEvent.status,
        eventType: eventName,
      })
      return NextResponse.json({
        received: true,
        note: 'Event already processed',
        status: existingEvent.status
      })
    }

    // Record webhook event as processing
    const { error: insertError } = await supabaseAdmin
      .from('webhook_events')
      .insert({
        event_id: eventId,
        event_type: eventName,
        provider: 'lemonsqueezy',
        status: 'processing',
        payload: event,
      })

    if (insertError) {
      // Check if it's a unique constraint violation (race condition)
      if (insertError.code === '23505') {
        logger.warn('Webhook race condition detected', {
          eventId,
          eventType: eventName,
          errorCode: insertError.code,
        })
        return NextResponse.json({
          received: true,
          note: 'Event being processed by another instance'
        })
      }
      throw insertError
    }

    // Process webhook using database function for atomicity
    // This ensures all operations succeed or fail together
    let processingResult: any = null
    let processingError: Error | null = null

    try {
      // Determine tier from variant ID before calling RPC
      let tier = 'trial'
      const variantId = attributes.variant_id?.toString()
      if (variantId === process.env.LEMONSQUEEZY_PRO_VARIANT_ID) {
        tier = 'pro'
      } else if (variantId === process.env.LEMONSQUEEZY_FAMILY_VARIANT_ID) {
        tier = 'family'
      }

      // Use RPC function for atomic transaction-like processing
      const { data: rpcResult, error: rpcError } = await (supabaseAdmin.rpc as any)(
        'process_subscription_webhook',
        {
          p_event_id: eventId,
          p_event_type: eventName,
          p_user_email: attributes.user_email || null,
          p_customer_id: attributes.customer_id?.toString() || null,
          p_subscription_id: event.data?.id || null,
          p_variant_id: variantId || null,
          p_status: attributes.status || null,
          p_tier: tier,
        }
      )

      if (rpcError) {
        throw rpcError
      }

      processingResult = rpcResult

      // If RPC function doesn't exist or returns error, fall back to manual processing
      if (!processingResult || !processingResult.success) {
        logger.warn('RPC function unavailable or returned error, using fallback processing', {
          eventId,
          eventType: eventName,
          error: processingResult?.error,
        })
        processingError = new Error(processingResult?.error || 'RPC function failed')
        throw processingError
      }

      logger.info('Webhook processed successfully via RPC', {
        eventId,
        eventType: eventName,
        userId: processingResult.user_id,
        tier: processingResult.tier,
      })
    } catch (rpcError) {
      // Fallback to manual processing if RPC function fails or doesn't exist
      logger.warn('Using fallback processing due to RPC error', {
        eventId,
        eventType: eventName,
        error: rpcError instanceof Error ? rpcError.message : String(rpcError),
      })

      switch (eventName) {
        case 'subscription_created':
        case 'subscription_updated': {
          const subscriptionId = event.data?.id
          const customerId = attributes.customer_id?.toString()
          const variantId = attributes.variant_id?.toString()
          const status = attributes.status

          if (!subscriptionId || !customerId) {
            logger.error('Missing subscription or customer ID in webhook', undefined, {
              eventId,
              eventType: eventName,
            })
            throw new Error('Missing required webhook data')
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
            const { data: users, error: userError } = await (supabaseAdmin
              .from('users') as any)
              .select('*')
              .eq('email', userEmail)
              .limit(1)

            if (userError) {
              throw new Error(`Failed to find user: ${userError.message}`)
            }

            if (users && users.length > 0) {
              const user = users[0]
              
              // Use retry logic for database operations
              await retryDatabaseOperation(async () => {
                const { error: updateError } = await (supabaseAdmin
                  .from('users') as any)
                  .update({
                    subscription_tier: tier,
                    lemonsqueezy_subscription_id: subscriptionId,
                    lemonsqueezy_customer_id: customerId,
                  })
                  .eq('id', user.id)

                if (updateError) {
                  throw new Error(`Failed to update user subscription: ${updateError.message}`)
                }
              })

              logger.info('User subscription updated', {
                eventId,
                eventType: eventName,
                userId: user.id,
                tier,
                status,
              })
            } else {
              throw new Error(`User not found for email: ${userEmail}`)
            }
          } else {
            throw new Error('User email not provided in webhook')
          }
          break
        }

        case 'subscription_cancelled':
        case 'subscription_expired': {
          const subscriptionId = event.data?.id
          const customerId = attributes.customer_id?.toString()

          if (!subscriptionId || !customerId) {
            logger.error('Missing subscription or customer ID in webhook', undefined, {
              eventId,
              eventType: eventName,
            })
            throw new Error('Missing required webhook data')
          }

          // Find user by Lemon Squeezy customer ID
          const { data: users, error: userError } = await (supabaseAdmin
            .from('users') as any)
            .select('*')
            .eq('lemonsqueezy_customer_id', customerId)
            .limit(1)

          if (userError) {
            throw new Error(`Failed to find user: ${userError.message}`)
          }

          if (users && users.length > 0) {
            const user = users[0]

            // Downgrade to trial with retry logic
            await retryDatabaseOperation(async () => {
              const { error: updateError } = await (supabaseAdmin
                .from('users') as any)
                .update({
                  subscription_tier: 'trial',
                  lemonsqueezy_subscription_id: null,
                })
                .eq('id', user.id)

              if (updateError) {
                throw new Error(`Failed to downgrade user: ${updateError.message}`)
              }
            })

            logger.info('User subscription downgraded to trial', {
              eventId,
              eventType: eventName,
              userId: user.id,
            })
          } else {
            throw new Error(`User not found for customer ID: ${customerId}`)
          }
          break
        }

        case 'subscription_payment_success': {
          // Subscription payment succeeded - ensure subscription is active
          const subscriptionId = event.data?.id
          const customerId = attributes.customer_id?.toString()
          const variantId = attributes.variant_id?.toString()

          if (!subscriptionId || !customerId) {
            logger.error('Missing subscription or customer ID in webhook', undefined, {
              eventId,
              eventType: eventName,
            })
            throw new Error('Missing required webhook data')
          }

          // Determine tier from variant ID
          let tier = 'trial'
          if (variantId === process.env.LEMONSQUEEZY_PRO_VARIANT_ID) {
            tier = 'pro'
          } else if (variantId === process.env.LEMONSQUEEZY_FAMILY_VARIANT_ID) {
            tier = 'family'
          }

          // Find user by Lemon Squeezy customer ID
          const { data: users, error: userError } = await (supabaseAdmin
            .from('users') as any)
            .select('*')
            .eq('lemonsqueezy_customer_id', customerId)
            .limit(1)

          if (userError) {
            throw new Error(`Failed to find user: ${userError.message}`)
          }

          if (users && users.length > 0) {
            const user = users[0]
            
            // Use retry logic for database operations
            await retryDatabaseOperation(async () => {
              const { error: updateError } = await (supabaseAdmin
                .from('users') as any)
                .update({
                  subscription_tier: tier,
                  lemonsqueezy_subscription_id: subscriptionId,
                })
                .eq('id', user.id)

              if (updateError) {
                throw new Error(`Failed to update user subscription: ${updateError.message}`)
              }
            })

            logger.info('Payment confirmed for user', {
              eventId,
              eventType: eventName,
              userId: user.id,
              tier,
            })
          } else {
            throw new Error(`User not found for customer ID: ${customerId}`)
          }
          break
        }

        default:
          console.log(`Unhandled event type: ${eventName}`)
          // Don't throw for unhandled events, just log
      }
    }

    // Only mark as completed if processing succeeded
    // If we reach here, processing was successful
    await supabaseAdmin
      .from('webhook_events')
      .update({ status: 'completed' })
      .eq('event_id', eventId)

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('Error processing webhook', error instanceof Error ? error : new Error(String(error)), {
      eventId: event?.data?.id,
      eventType: event?.meta?.event_name,
    })

    // Mark webhook event as failed with error message
    try {
      const eventId = event?.data?.id
      if (eventId) {
        await supabaseAdmin
          .from('webhook_events')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('event_id', eventId)
      }
    } catch (updateError) {
      logger.error('Failed to update webhook event status', updateError instanceof Error ? updateError : new Error(String(updateError)), {
        eventId: event?.data?.id,
      })
    }

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

