import { NextResponse } from 'next/server'
import { isElevenLabsConfigured } from '@/lib/voice/elevenlabs-client'
import { isResendConfigured } from '@/lib/email/resend-client'

/**
 * Environment Configuration Check
 * Returns status of all required services
 * Only works in development mode for security
 */
export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Environment check not available in production' },
      { status: 403 }
    )
  }

  const checks = {
    supabase: {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      status: !!(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
        ? 'configured'
        : 'missing',
    },
    elevenlabs: {
      apiKey: isElevenLabsConfigured(),
      status: isElevenLabsConfigured() ? 'configured' : 'missing',
      note: 'Required for voice cloning feature',
    },
    resend: {
      apiKey: isResendConfigured(),
      fromEmail: !!process.env.FROM_EMAIL,
      status:
        isResendConfigured() && !!process.env.FROM_EMAIL ? 'configured' : 'partial',
      note: 'Required for email notifications',
    },
    openai: {
      apiKey: !!process.env.OPENAI_API_KEY,
      status: !!process.env.OPENAI_API_KEY ? 'configured' : 'missing',
      note: 'Required for AI story generation',
    },
    replicate: {
      apiKey: !!process.env.REPLICATE_API_TOKEN,
      status: !!process.env.REPLICATE_API_TOKEN ? 'configured' : 'missing',
      note: 'Required for AI image generation',
    },
    cron: {
      secret: !!process.env.CRON_SECRET,
      status: !!process.env.CRON_SECRET ? 'configured' : 'missing',
      note: 'Required for scheduled email jobs',
    },
    app: {
      url: !!process.env.NEXT_PUBLIC_APP_URL,
      status: !!process.env.NEXT_PUBLIC_APP_URL ? 'configured' : 'missing',
      note: 'Used in emails and redirects',
    },
  }

  const summary = {
    core: checks.supabase.status === 'configured' && checks.openai.status === 'configured',
    features: {
      voiceCloning: checks.elevenlabs.status === 'configured',
      emailNotifications: checks.resend.status === 'configured',
      imageGeneration: checks.replicate.status === 'configured',
      cronJobs: checks.cron.status === 'configured',
    },
  }

  return NextResponse.json({
    checks,
    summary,
    ready: summary.core,
    timestamp: new Date().toISOString(),
  })
}
