/**
 * Bedtime Reminder Email Template
 */

export interface BedtimeReminderData {
  userName: string
  childName?: string
  reminderTime: string // e.g., "7:00 PM"
  currentStreak: number
  recentStories: Array<{
    title: string
    theme: string
    createdAt: string
  }>
}

export function generateBedtimeReminderEmail(data: BedtimeReminderData): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bedtime Story Time!</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .header p {
      margin: 10px 0 0;
      opacity: 0.9;
      font-size: 16px;
    }
    .moon-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
    }
    .reminder-box {
      background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin: 20px 0;
    }
    .reminder-box .time {
      font-size: 32px;
      font-weight: bold;
      color: #d94f00;
      margin: 10px 0;
    }
    .streak-box {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      border-radius: 12px;
      padding: 15px;
      text-align: center;
      color: white;
      margin: 20px 0;
    }
    .streak-box .number {
      font-size: 36px;
      font-weight: bold;
    }
    .stories-list {
      background: #f7fafc;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
    }
    .story-item {
      background: white;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 10px;
      border-left: 4px solid #667eea;
    }
    .story-item:last-child {
      margin-bottom: 0;
    }
    .story-title {
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }
    .story-meta {
      font-size: 14px;
      color: #666;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 25px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="moon-icon">🌙</div>
      <h1>Time for a Bedtime Story!</h1>
      <p>Reading together makes bedtime magical</p>
    </div>

    <div class="content">
      <p class="greeting">
        Hi ${data.userName}! 👋
      </p>

      <p>
        It's almost bedtime${data.childName ? ` for ${data.childName}` : ''}! Reading a story together is a wonderful way to wind down and create lasting memories.
      </p>

      <div class="reminder-box">
        <div>⏰ Your bedtime reminder</div>
        <div class="time">${data.reminderTime}</div>
        <div>Perfect time for a story!</div>
      </div>

      ${data.currentStreak > 0 ? `
      <div class="streak-box">
        <div>🔥 You're on a ${data.currentStreak}-day reading streak!</div>
        <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.9;">Keep it going tonight!</p>
      </div>
      ` : ''}

      ${data.recentStories.length > 0 ? `
      <div class="stories-list">
        <h3 style="margin-top: 0;">Recent Stories to Re-read:</h3>
        ${data.recentStories.map(story => `
        <div class="story-item">
          <div class="story-title">${story.title}</div>
          <div class="story-meta">
            <span>${story.theme}</span>
          </div>
        </div>
        `).join('')}
      </div>
      ` : ''}

      <center>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://aistories.app'}/stories" class="button">
          Read a Story Tonight →
        </a>
      </center>

      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        💡 <strong>Tip:</strong> Bedtime stories help children relax, improve vocabulary, and strengthen your bond. Even 10 minutes of reading can make a big difference!
      </p>
    </div>

    <div class="footer">
      <p>Sweet dreams and happy reading! 🌟</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://aistories.app'}/settings/notifications" style="color: #667eea;">
          Change reminder time or turn off reminders
        </a>
      </p>
    </div>
  </div>
</body>
</html>
  `

  const text = `
🌙 Time for a Bedtime Story!

Hi ${data.userName}!

It's almost bedtime${data.childName ? ` for ${data.childName}` : ''}! Reading a story together is a wonderful way to wind down and create lasting memories.

⏰ Your bedtime reminder: ${data.reminderTime}
Perfect time for a story!

${data.currentStreak > 0 ? `🔥 You're on a ${data.currentStreak}-day reading streak! Keep it going tonight!\n` : ''}

${data.recentStories.length > 0 ? `
Recent Stories to Re-read:
${data.recentStories.map(story => `- ${story.title} (${story.theme})`).join('\n')}
` : ''}

Read a story tonight: ${process.env.NEXT_PUBLIC_APP_URL || 'https://aistories.app'}/stories

💡 Tip: Bedtime stories help children relax, improve vocabulary, and strengthen your bond. Even 10 minutes of reading can make a big difference!

Sweet dreams and happy reading! 🌟

---
Change reminder time or turn off reminders: ${process.env.NEXT_PUBLIC_APP_URL || 'https://aistories.app'}/settings/notifications
  `.trim()

  return { html, text }
}
