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
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Bedtime Story Time!</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a202c;
      background: linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #1e1b4b 100%);
      padding: 40px 20px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
    }
    .header {
      background: linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #1e1b4b 100%);
      padding: 50px 40px;
      text-align: center;
      color: white;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: twinkle 4s ease-in-out infinite;
    }
    .header::after {
      content: '✨';
      position: absolute;
      font-size: 20px;
      opacity: 0.6;
      animation: float 3s ease-in-out infinite;
    }
    @keyframes twinkle {
      0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.3; }
      50% { transform: scale(1.1) rotate(180deg); opacity: 0.6; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    .header-content {
      position: relative;
      z-index: 1;
    }
    .moon-icon {
      font-size: 80px;
      margin-bottom: 16px;
      display: block;
      filter: drop-shadow(0 4px 12px rgba(255,255,255,0.3));
      animation: glow 2s ease-in-out infinite alternate;
    }
    @keyframes glow {
      from { filter: drop-shadow(0 4px 12px rgba(255,255,255,0.3)); }
      to { filter: drop-shadow(0 4px 20px rgba(255,255,255,0.5)); }
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }
    .header p {
      margin: 0;
      opacity: 0.95;
      font-size: 16px;
      font-weight: 400;
    }
    .content {
      padding: 48px 40px;
    }
    .greeting {
      font-size: 20px;
      font-weight: 600;
      color: #1a202c;
      margin-bottom: 24px;
      line-height: 1.4;
    }
    .intro-text {
      font-size: 16px;
      color: #4a5568;
      margin-bottom: 32px;
      line-height: 1.7;
    }
    .reminder-card {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-radius: 20px;
      padding: 32px 28px;
      text-align: center;
      margin: 32px 0;
      border: 3px solid #fbbf24;
      box-shadow: 0 8px 24px rgba(251, 191, 36, 0.25);
      position: relative;
      overflow: hidden;
    }
    .reminder-card::before {
      content: '⏰';
      position: absolute;
      top: 16px;
      right: 16px;
      font-size: 32px;
      opacity: 0.2;
    }
    .reminder-label {
      font-size: 14px;
      color: #92400e;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .reminder-time {
      font-size: 56px;
      font-weight: 700;
      color: #78350f;
      margin: 16px 0;
      line-height: 1;
      letter-spacing: -2px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .reminder-subtext {
      font-size: 16px;
      color: #92400e;
      font-weight: 500;
      margin-top: 12px;
    }
    .streak-badge {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      border-radius: 16px;
      padding: 24px;
      margin: 32px 0;
      border-left: 5px solid #ef4444;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
    }
    .streak-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .streak-icon {
      font-size: 48px;
      flex-shrink: 0;
    }
    .streak-text {
      flex: 1;
    }
    .streak-number {
      font-size: 32px;
      font-weight: 700;
      color: #991b1b;
      margin-bottom: 4px;
    }
    .streak-label {
      font-size: 15px;
      color: #7f1d1d;
      font-weight: 500;
    }
    .stories-section {
      margin: 32px 0;
    }
    .stories-header {
      font-size: 18px;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .stories-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .story-card {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 12px;
      padding: 20px;
      border-left: 4px solid #667eea;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .story-card:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }
    .story-title {
      font-weight: 600;
      color: #1a202c;
      font-size: 16px;
      margin-bottom: 6px;
    }
    .story-theme {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
      display: inline-block;
      background: white;
      padding: 4px 10px;
      border-radius: 6px;
      margin-top: 4px;
    }
    .cta-section {
      text-align: center;
      margin: 40px 0 32px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 18px 40px;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
      transition: all 0.3s ease;
      letter-spacing: 0.3px;
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
    }
    .tip-box {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border-radius: 16px;
      padding: 24px;
      margin: 32px 0;
      border-left: 5px solid #10b981;
    }
    .tip-box p {
      margin: 0;
      color: #065f46;
      font-size: 15px;
      line-height: 1.7;
    }
    .tip-box strong {
      color: #047857;
      font-weight: 700;
    }
    .footer {
      background: #f7fafc;
      padding: 32px 40px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer p {
      margin: 0 0 12px 0;
      color: #64748b;
      font-size: 13px;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      font-size: 13px;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    @media only screen and (max-width: 600px) {
      body {
        padding: 20px 12px;
      }
      .email-wrapper {
        border-radius: 16px;
      }
      .header {
        padding: 40px 24px;
      }
      .header h1 {
        font-size: 26px;
      }
      .moon-icon {
        font-size: 64px;
      }
      .content {
        padding: 32px 24px;
      }
      .reminder-card {
        padding: 24px 20px;
      }
      .reminder-time {
        font-size: 48px;
      }
      .streak-content {
        flex-direction: column;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div class="header-content">
        <span class="moon-icon">🌙</span>
        <h1>Time for a Bedtime Story!</h1>
        <p>Reading together makes bedtime magical</p>
      </div>
    </div>

    <div class="content">
      <p class="greeting">
        Hi ${data.userName}! 👋
      </p>

      <p class="intro-text">
        It's almost bedtime${data.childName ? ` for ${data.childName}` : ''}! Reading a story together is a wonderful way to wind down and create lasting memories.
      </p>

      <div class="reminder-card">
        <div class="reminder-label">Your Bedtime Reminder</div>
        <div class="reminder-time">${data.reminderTime}</div>
        <div class="reminder-subtext">Perfect time for a story! 📖</div>
      </div>

      ${data.currentStreak > 0 ? `
      <div class="streak-badge">
        <div class="streak-content">
          <span class="streak-icon">🔥</span>
          <div class="streak-text">
            <div class="streak-number">${data.currentStreak}-Day Streak!</div>
            <div class="streak-label">Keep it going tonight!</div>
          </div>
        </div>
      </div>
      ` : ''}

      ${data.recentStories.length > 0 ? `
      <div class="stories-section">
        <div class="stories-header">
          <span>📚</span>
          <span>Recent Stories to Re-read</span>
        </div>
        <div class="stories-list">
          ${data.recentStories.map(story => `
          <div class="story-card">
            <div class="story-title">${story.title}</div>
            <span class="story-theme">${story.theme}</span>
          </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <div class="cta-section">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://aistories.app'}/stories" class="cta-button">
          Read a Story Tonight →
        </a>
      </div>

      <div class="tip-box">
        <p>
          💡 <strong>Tip:</strong> Bedtime stories help children relax, improve vocabulary, and strengthen your bond. Even 10 minutes of reading can make a big difference!
        </p>
      </div>
    </div>

    <div class="footer">
      <p>Sweet dreams and happy reading! 🌟</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://aistories.app'}/settings/notifications">
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

⏰ Your Bedtime Reminder: ${data.reminderTime}
Perfect time for a story! 📖

${data.currentStreak > 0 ? `
🔥 ${data.currentStreak}-Day Streak!
Keep it going tonight!
` : ''}

${data.recentStories.length > 0 ? `
📚 Recent Stories to Re-read:
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
