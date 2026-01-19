import { NextResponse } from 'next/server'
import { addToWaitlistAndSendEmail } from '@/lib/email/waitlist'
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = typeof body?.email === 'string' ? body.email : ''
    const honeypot = typeof body?.hp === 'string' ? body.hp.trim() : ''

    // If honeypot is filled, pretend success but do nothing (bot protection)
    if (honeypot) {
      return NextResponse.json({
        ok: true,
        message: 'You’re in. We’ll email you as soon as AI Stories is ready.',
      })
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ ok: false, message: 'Please provide an email address.' }, { status: 400 })
    }

    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
    if (!emailPattern.test(email.trim())) {
      return NextResponse.json({ ok: false, message: 'That doesn’t look like a valid email. Please check and try again.' }, { status: 400 })
    }

    // Basic IP-based rate limiting to protect from spam / abuse
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const rate = await checkRateLimit(ip, RATE_LIMITS.waitlist)
    if (!rate.success) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Too many attempts from this device. Please wait a while before trying again.',
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rate),
        }
      )
    }

    try {
      const isNew = await addToWaitlistAndSendEmail(email)

      return NextResponse.json(
        {
          ok: true,
          message: isNew
            ? 'You’re in. We’ll email you as soon as AI Stories is ready.'
            : 'You’re already on the list. We’ll let you know as soon as we launch.',
        },
        { status: 200, headers: getRateLimitHeaders(rate) }
      )
    } catch (err: any) {
      const message = err?.message || 'Failed to save your email. Please try again.'
      return NextResponse.json({ ok: false, message }, { status: 500 })
    }
  } catch (error) {
    console.error('[Waitlist] Unexpected error:', error)
    return NextResponse.json(
      { ok: false, message: 'Something went wrong. Please try again in a moment.' },
      { status: 500 }
    )
  }
}

