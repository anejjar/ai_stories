/**
 * Test Script for Cron Emails
 * Usage: npx tsx scripts/test-cron-email.ts [email]
 */

import { sendTestCronEmail } from '../lib/email/notification-service'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

async function main() {
  const targetEmail = process.argv[2] || 'anejjarlhouciane@gmail.com'
  
  console.log('--- Cron Email Test Script ---')
  console.log(`Target Email: ${targetEmail}`)
  
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ Error: RESEND_API_KEY is not set in your environment.')
    process.exit(1)
  }

  try {
    const success = await sendTestCronEmail(targetEmail)
    
    if (success) {
      console.log('✅ Success! Test email has been sent.')
    } else {
      console.log('❌ Failed to send test email. Check console logs for errors.')
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

main()

