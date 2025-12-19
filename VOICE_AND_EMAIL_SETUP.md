# Voice Cloning & Email Notifications Setup Guide

This guide covers the setup and configuration for the Voice Cloning and Email Notification features.

## Features Overview

### 1. Voice Cloning (ElevenLabs)
- Clone your own voice to narrate stories
- Record 1-3 audio samples (minimum 30 seconds total)
- Use cloned voices for personalized storytelling
- Switch between default AI voice and custom voices

### 2. Email Notifications (Resend)
- **Weekly Summary**: Reading stats and achievements every Sunday
- **Bedtime Reminders**: Daily reminders at customizable times
- **Achievement Notifications**: Instant notifications when achievements are unlocked
- **New Features**: Occasional updates about app improvements

## Environment Variables Required

Add these to your `.env.local` file:

```env
# ElevenLabs API (for voice cloning)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Resend API (for email notifications)
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=AI Stories <noreply@yourdomain.com>

# Supabase Service Role Key (for cron jobs)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Cron Secret (to secure cron endpoints)
CRON_SECRET=your_random_secret_here

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Setup Instructions

### 1. ElevenLabs Setup

1. Sign up at [ElevenLabs](https://elevenlabs.io/)
2. Subscribe to a plan that includes voice cloning (Pro or higher)
3. Get your API key from Settings → API Keys
4. Add `ELEVENLABS_API_KEY` to `.env.local`

**Voice Cloning Requirements:**
- Minimum 1 audio sample
- At least 30 seconds of clear audio total
- Supported formats: MP3, WAV, M4A
- Maximum file size: 10MB per file

### 2. Resend Setup

1. Sign up at [Resend](https://resend.com/)
2. Verify your domain or use Resend's testing domain
3. Get your API key from API Keys section
4. Add `RESEND_API_KEY` and `FROM_EMAIL` to `.env.local`

**Email Limits:**
- Free tier: 100 emails/day, 3,000 emails/month
- Pro tier: 50,000 emails/month

### 3. Database Migration

Run the database migration to create required tables:

```bash
# Apply migration
supabase db push

# Or manually run the SQL file
psql $DATABASE_URL < supabase/migrations/010_voice_and_email_system.sql
```

**Tables Created:**
- `voice_profiles` - Stores user voice clones
- `email_preferences` - User notification preferences
- `email_queue` - Scheduled email queue (for future use)

### 4. Cron Jobs Setup (Vercel)

The `vercel.json` file defines two cron jobs:

**Weekly Summary:**
- Path: `/api/cron/weekly-summary`
- Schedule: `0 18 * * 0` (Every Sunday at 6:00 PM UTC)

**Bedtime Reminders:**
- Path: `/api/cron/bedtime-reminder`
- Schedule: `0 * * * *` (Every hour, on the hour)

**Securing Cron Endpoints:**

1. Generate a random secret:
```bash
openssl rand -base64 32
```

2. Add to Vercel environment variables:
```
CRON_SECRET=your_generated_secret
```

3. Vercel automatically adds the secret to cron requests

**Manual Testing:**

You can test cron endpoints manually using curl:

```bash
# Test weekly summary
curl -X GET https://yourdomain.com/api/cron/weekly-summary \
  -H "Authorization: Bearer your_cron_secret"

# Test bedtime reminder
curl -X GET https://yourdomain.com/api/cron/bedtime-reminder \
  -H "Authorization: Bearer your_cron_secret"
```

### 5. Alternative Cron Services

If not using Vercel, you can use:

**GitHub Actions:**
```yaml
name: Send Weekly Summary
on:
  schedule:
    - cron: '0 18 * * 0'
jobs:
  send-emails:
    runs-on: ubuntu-latest
    steps:
      - name: Call cron endpoint
        run: |
          curl -X GET ${{ secrets.APP_URL }}/api/cron/weekly-summary \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

**Cron-job.org:**
1. Sign up at [cron-job.org](https://cron-job.org/)
2. Create new cron job
3. Set URL: `https://yourdomain.com/api/cron/weekly-summary`
4. Add header: `Authorization: Bearer your_cron_secret`
5. Set schedule using cron syntax

## Usage

### Voice Cloning

1. Navigate to Settings → Voice
2. Click "Create Voice Clone"
3. Follow the guided wizard:
   - Read the information page
   - Record 1-3 voice samples
   - Name your voice
4. Voice processing takes 2-5 minutes
5. Select your voice in the audio player when reading stories

**Voice Recorder Tips:**
- Record in a quiet environment
- Speak naturally and clearly
- Use an expressive storytelling voice
- Aim for at least 1 minute of total audio
- Record multiple samples for better quality

### Email Preferences

1. Navigate to Settings → Notifications
2. Toggle email types on/off:
   - Weekly Summary
   - Bedtime Reminder (set custom time)
   - Achievement Notifications
   - New Features
3. Click "Save Preferences"

**Default Settings:**
- Weekly Summary: Enabled
- Bedtime Reminder: Disabled
- Achievement Notifications: Enabled
- New Features: Enabled

## API Endpoints

### Voice Cloning

**Clone Voice**
```
POST /api/voice/clone
Content-Type: multipart/form-data

Body:
- name: string (required)
- description: string (optional)
- audioFiles: File[] (required, 1-3 files)

Response:
{
  "success": true,
  "profile": {
    "id": "uuid",
    "voice_id": "elevenlabs_voice_id",
    "name": "Voice Name"
  }
}
```

**Generate Speech**
```
POST /api/voice/generate
Content-Type: application/json

Body:
{
  "text": "Story text to narrate",
  "voiceId": "elevenlabs_voice_id",
  "voiceSettings": {
    "stability": 0.5,
    "similarity_boost": 0.75
  }
}

Response: audio/mpeg binary data
```

**Delete Voice**
```
POST /api/voice/delete
Content-Type: application/json

Body:
{
  "voiceId": "elevenlabs_voice_id"
}

Response:
{
  "success": true,
  "message": "Voice deleted successfully"
}
```

### Email Notifications

**Send Achievement Notification**
```
POST /api/notifications/achievement
Content-Type: application/json

Body:
{
  "achievementIds": ["achievement_id_1", "achievement_id_2"]
}

Response:
{
  "success": true,
  "message": "Achievement notification sent"
}
```

## Database Functions

### get_weekly_summary(user_uuid)

Returns weekly reading statistics for a user:

```sql
SELECT * FROM get_weekly_summary('user-uuid-here');
```

Returns:
- `stories_created`: Number of stories created this week
- `stories_read`: Number of reading sessions this week
- `total_reading_time`: Total seconds spent reading
- `achievements_unlocked`: New achievements this week
- `current_streak`: Current reading streak
- `longest_streak`: Longest reading streak ever
- `themes_explored`: Unique themes explored this week

## Troubleshooting

### Voice Cloning Issues

**"Failed to clone voice"**
- Check ElevenLabs API key is valid
- Ensure you have voice cloning quota available
- Verify audio files meet requirements (30s minimum)

**"Audio files too small"**
- Record longer samples (aim for 1+ minute total)
- Check file wasn't corrupted during upload

**Poor voice quality**
- Record in a quieter environment
- Use better microphone
- Record more samples (3 is better than 1)
- Speak more clearly and expressively

### Email Issues

**Emails not sending**
- Check Resend API key is valid
- Verify sender email domain is verified
- Check daily/monthly sending limits
- Review Resend dashboard for bounce/complaint rates

**Cron jobs not running**
- Verify `CRON_SECRET` is set in environment
- Check Vercel cron logs in dashboard
- Test endpoints manually with curl
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set

**Users not receiving emails**
- Check user's email preferences (may have opted out)
- Verify email address in auth.users table
- Check spam folder
- Review Resend delivery logs

## Cost Estimates

### ElevenLabs
- Free tier: Limited characters/month
- Creator: $5/month (30,000 characters)
- Pro: $22/month (100,000 characters) - **Required for voice cloning**
- Each story narration: ~500-2000 characters

### Resend
- Free: 3,000 emails/month
- Pro: $20/month (50,000 emails/month)

### Estimated Monthly Costs (1000 active users)
- ElevenLabs Pro: $22 (if 50% use voice cloning)
- Resend Pro: $20 (weekly summaries + reminders + achievements)
- **Total: ~$42/month**

## Development Testing

### Test Voice Cloning Locally

```typescript
// In a test file or console
import { cloneVoice } from '@/lib/voice/elevenlabs-client'

const audioFiles = [/* File objects */]
const result = await cloneVoice({
  name: 'Test Voice',
  description: 'Testing voice cloning',
  audioFiles
})
console.log(result)
```

### Test Email Sending

```typescript
import { sendEmail } from '@/lib/email/resend-client'

const result = await sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<h1>Hello!</h1>',
  text: 'Hello!'
})
console.log(result)
```

### Test Email Templates

```typescript
import { generateWeeklySummaryEmail } from '@/lib/email/templates/weekly-summary'

const { html, text } = generateWeeklySummaryEmail({
  userName: 'John',
  childName: 'Emma',
  storiesCreated: 5,
  storiesRead: 10,
  totalReadingTime: 1800,
  achievementsUnlocked: 2,
  currentStreak: 7,
  longestStreak: 14,
  themesExplored: 3
})

// Save to file to preview
await fs.writeFile('test-email.html', html)
```

## Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **Cron Secret**: Use strong random secret for cron endpoints
3. **Service Role Key**: Only use in server-side code, never client
4. **Voice Cloning**: Only allow users to clone voices they have permission for
5. **Email Rate Limiting**: Built-in 100ms delay between emails
6. **RLS Policies**: All voice and email tables have Row Level Security enabled

## Support

For issues or questions:
- Voice Cloning: [ElevenLabs Documentation](https://docs.elevenlabs.io/)
- Email: [Resend Documentation](https://resend.com/docs)
- General: Check GitHub Issues or create new issue
