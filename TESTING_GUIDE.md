# Testing Guide - AI Stories

This guide covers testing all features, especially the newly implemented Voice Cloning and Email Notification systems.

## 🚀 Quick Start Testing

### 1. Environment Setup Verification

Before testing, verify your environment is properly configured:

```bash
# 1. Copy environment variables
cp .env.example .env.local

# 2. Fill in your API keys in .env.local

# 3. Run database migrations
supabase db push

# 4. Start development server
npm run dev

# 5. Visit environment check page
open http://localhost:3000/debug/env
```

The environment check page will show:
- ✅ Green: Service configured correctly
- ⚠️ Yellow: Partial configuration
- ❌ Red: Service missing or misconfigured

---

## 📋 Feature Testing Checklist

### Core Features

#### ✅ Story Creation & Display
- [ ] Create a new story with custom parameters
- [ ] View story in library
- [ ] Read story with enhanced audio player
- [ ] Test bedtime mode toggle
- [ ] Test voice selector (if custom voices exist)

#### ✅ Reading Streaks
- [ ] Complete first reading session
- [ ] Check streak counter in navigation
- [ ] Read on consecutive days to build streak
- [ ] Verify streak resets after missing a day

#### ✅ Achievements System
- [ ] Unlock "First Story" achievement
- [ ] View achievements page (`/achievements`)
- [ ] Check progress bars
- [ ] View achievement details
- [ ] Test achievement unlock modal

#### ✅ Parent Dashboard
- [ ] View dashboard (`/dashboard`)
- [ ] Check reading statistics
- [ ] Verify charts display correctly
- [ ] Check achievement progress

---

## 🎙️ Voice Cloning Testing

### Prerequisites
- ElevenLabs Pro account ($22/month)
- `ELEVENLABS_API_KEY` set in `.env.local`
- Microphone access

### Test Flow

#### 1. Create Voice Clone

**Navigate to Settings:**
```
User Menu → Voice Settings
OR
Direct: http://localhost:3000/settings/voice
```

**Create Voice Clone:**
1. Click "Create Voice Clone"
2. Read the information page
3. Click "Get Started"
4. **Record Audio Samples:**
   - Grant microphone permissions
   - Click "Start Recording"
   - Speak naturally for 30+ seconds
   - Suggest: Read a children's story aloud
   - Record 1-3 samples
5. **Name Your Voice:**
   - Enter voice name (e.g., "Dad's Bedtime Voice")
   - Optional: Add description
   - Click "Create Voice Clone"
6. Wait 2-5 minutes for processing

**Expected Result:**
- Voice appears in voice profiles list
- Success toast notification
- Voice is selectable

#### 2. Test Voice Generation

**Select Custom Voice:**
1. Go to any story
2. Open audio player voice selector
3. Select your custom voice
4. Click "Play Story"

**Expected Result:**
- Loading indicator appears
- Audio generates in 5-15 seconds
- Story plays in your voice
- Audio quality is clear

#### 3. Test Voice Management

**Test Voice:**
1. Go to Voice Settings
2. Click "Test" button on voice profile
3. Sample audio should play

**Delete Voice:**
1. Click delete button (trash icon)
2. Confirm deletion
3. Voice removed from list
4. Selection reverts to default

### Troubleshooting Voice Cloning

| Issue | Solution |
|-------|----------|
| "Failed to clone voice" | Check ElevenLabs API key, verify Pro subscription |
| "Audio files too small" | Record longer samples (minimum 30 seconds total) |
| Poor voice quality | Record in quiet environment, use better mic, record more samples |
| Generation fails | Check ElevenLabs quota, verify voice_id is valid |
| No voice in selector | Refresh page, check database for voice_profiles entry |

---

## 📧 Email Notification Testing

### Prerequisites
- Resend account (free tier available)
- `RESEND_API_KEY` set in `.env.local`
- `FROM_EMAIL` configured and verified domain
- `SUPABASE_SERVICE_ROLE_KEY` set for cron jobs

### Test Flow

#### 1. Configure Email Preferences

**Navigate to Settings:**
```
User Menu → Notifications
OR
Direct: http://localhost:3000/settings/notifications
```

**Enable Notifications:**
1. Toggle "Weekly Summary" ON
2. Toggle "Bedtime Reminder" ON
3. Set reminder time
4. Toggle "Achievement Notifications" ON
5. Click "Save Preferences"

**Expected Result:**
- Success toast notification
- Settings saved to database
- Unsaved changes warning disappears

#### 2. Test Achievement Notification

**Trigger Achievement:**
1. Read a story to completion
2. Wait 2-3 seconds
3. Achievement modal appears

**Check Email:**
- Email should arrive within 30 seconds
- Subject: "🏆 Achievement Unlocked!"
- Contains achievement details
- Shows points earned
- Has gradient styling

**Manual Test (Development):**
```bash
curl -X POST http://localhost:3000/api/notifications/achievement \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"achievementIds": ["first_story"]}'
```

#### 3. Test Weekly Summary Email

**Manual Trigger (Development):**
```bash
# Generate secret
SECRET=$(openssl rand -base64 32)

# Add to .env.local
echo "CRON_SECRET=$SECRET" >> .env.local

# Test endpoint
curl -X GET http://localhost:3000/api/cron/weekly-summary \
  -H "Authorization: Bearer $SECRET"
```

**Check Response:**
```json
{
  "success": true,
  "sent": 1,
  "failed": 0,
  "errors": [],
  "timestamp": "2025-12-10T..."
}
```

**Check Email:**
- Subject: "📚 Your Weekly Reading Summary"
- Contains reading statistics
- Shows achievement unlocks
- Has streak information
- Beautiful gradient design

#### 4. Test Bedtime Reminder

**Manual Trigger:**
```bash
curl -X GET http://localhost:3000/api/cron/bedtime-reminder \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Check Email:**
- Subject: "🌙 Time for a Bedtime Story!"
- Shows reminder time
- Displays current streak
- Suggests recent stories
- Moon-themed design

### Email Testing Tips

**Preview Emails Without Sending:**
```typescript
// In a test file or API route
import { generateWeeklySummaryEmail } from '@/lib/email/templates/weekly-summary'

const { html } = generateWeeklySummaryEmail({
  userName: 'Test User',
  childName: 'Emma',
  storiesCreated: 5,
  storiesRead: 10,
  totalReadingTime: 1800,
  achievementsUnlocked: 2,
  currentStreak: 7,
  longestStreak: 14,
  themesExplored: 3
})

// Save to file
await fs.writeFile('preview.html', html)
```

**Check Resend Dashboard:**
1. Go to https://resend.com/emails
2. View all sent emails
3. Check delivery status
4. View email content
5. Check bounce/complaint rates

### Troubleshooting Email Notifications

| Issue | Solution |
|-------|----------|
| Emails not sending | Check Resend API key, verify domain, check daily limits |
| Cron jobs not running | Set CRON_SECRET, deploy to Vercel, check cron logs |
| Wrong email content | Check template data, verify user preferences |
| Emails in spam | Configure SPF/DKIM records, use verified domain |
| User not receiving | Check email preferences, verify email address in database |

---

## 🔄 Integration Testing

### End-to-End Story Flow

**Complete User Journey:**
1. ✅ Sign up / Log in
2. ✅ Create first story
3. ✅ Achievement unlocks: "First Story"
4. ✅ Achievement email sent
5. ✅ View story in library
6. ✅ Read story with enhanced audio player
7. ✅ Reading session recorded
8. ✅ Streak counter updates
9. ✅ Create voice clone (if Pro)
10. ✅ Use custom voice to narrate
11. ✅ Configure email preferences
12. ✅ Receive weekly summary (Sunday)

### Multi-Day Testing

**Day 1:**
- Create account
- Read 2 stories
- Unlock "First Story" achievement
- Check achievement email

**Day 2:**
- Read 1 story
- Verify streak = 2 days
- Check dashboard stats

**Day 3:**
- Read 1 story
- Unlock "3-Day Streak" achievement
- Check streak email

**Day 8:**
- Verify "7-Day Streak" achievement
- Check weekly summary email

---

## 🐛 Bug Testing

### Common Issues to Check

#### Audio Player
- [ ] Switches between voices correctly
- [ ] Bedtime mode affects both voice types
- [ ] Loading states display properly
- [ ] Error states handled gracefully
- [ ] Audio playback controls work

#### Voice Cloning
- [ ] Recording stops at max duration
- [ ] File validation works
- [ ] Voice profile CRUD operations
- [ ] Voice selection persists
- [ ] Custom voice in book viewer

#### Email System
- [ ] Preferences save/load correctly
- [ ] Opt-out respected
- [ ] Emails use correct timezone
- [ ] Unsubscribe links work
- [ ] Email queue handles failures

#### Achievements
- [ ] No duplicate achievements
- [ ] Progress calculated correctly
- [ ] Unlock modal displays once per achievement
- [ ] Email sent only if opted in
- [ ] Points calculated correctly

---

## 📊 Performance Testing

### Voice Generation Speed
- Expected: 5-15 seconds for 500-word story
- Test with various text lengths
- Monitor ElevenLabs quota usage

### Email Delivery
- Expected: < 30 seconds delivery
- Test batch sending (cron jobs)
- Monitor rate limiting

### Database Queries
- Check reading session creation time
- Monitor achievement check performance
- Verify streak calculation speed

---

## 🔐 Security Testing

### API Endpoints
- [ ] Voice cloning requires authentication
- [ ] Email preferences protected by RLS
- [ ] Cron endpoints require secret
- [ ] Service role key not exposed client-side

### Data Privacy
- [ ] Users can only access own voices
- [ ] Email preferences are user-specific
- [ ] Voice profiles can only be deleted by owner
- [ ] Reading sessions private

---

## ✅ Acceptance Criteria

### Voice Cloning
- ✅ Users can record 1-3 audio samples
- ✅ Voice clones process within 5 minutes
- ✅ Custom voices work in audio player
- ✅ Voice quality is acceptable
- ✅ Voices can be deleted
- ✅ Multiple voices per user supported

### Email Notifications
- ✅ Weekly summary includes all stats
- ✅ Bedtime reminders sent at correct time
- ✅ Achievement emails sent immediately
- ✅ All emails have unsubscribe link
- ✅ Preferences persist correctly
- ✅ Opt-out respected

### Integration
- ✅ Enhanced audio player in story display
- ✅ Achievement emails triggered automatically
- ✅ Voice settings accessible from nav
- ✅ Email settings accessible from nav
- ✅ All features work together seamlessly

---

## 📝 Test Reporting

When reporting bugs or issues, include:

1. **Environment:**
   - Development or Production
   - Browser and version
   - OS
   - Node version

2. **Steps to Reproduce:**
   - Exact steps taken
   - Expected result
   - Actual result

3. **Screenshots/Videos:**
   - UI state
   - Console errors
   - Network tab

4. **Logs:**
   - Browser console
   - Server logs
   - API responses

5. **Configuration:**
   - Which API keys are set
   - Environment check results
   - Database migration status

---

## 🎯 Testing Priorities

### High Priority (Must Test)
1. Story creation and display
2. Authentication flow
3. Reading streak tracking
4. Achievement unlocking
5. Audio player functionality

### Medium Priority (Should Test)
6. Voice cloning end-to-end
7. Email notification delivery
8. Email preference management
9. Parent dashboard accuracy

### Low Priority (Nice to Test)
10. Edge cases (very long stories, etc.)
11. Performance under load
12. Mobile responsiveness
13. Accessibility features

---

## 🔗 Useful Links

- **Environment Check:** http://localhost:3000/debug/env
- **Voice Settings:** http://localhost:3000/settings/voice
- **Email Settings:** http://localhost:3000/settings/notifications
- **Achievements:** http://localhost:3000/achievements
- **Dashboard:** http://localhost:3000/dashboard
- **Resend Dashboard:** https://resend.com/emails
- **ElevenLabs Dashboard:** https://elevenlabs.io/app/voice-lab
- **Supabase Dashboard:** https://supabase.com/dashboard

---

## 📞 Support

For issues during testing:
1. Check `VOICE_AND_EMAIL_SETUP.md` for detailed setup
2. Visit `/debug/env` to verify configuration
3. Check browser console for errors
4. Review server logs
5. Check service dashboards (Resend, ElevenLabs)
6. Create GitHub issue with test report
