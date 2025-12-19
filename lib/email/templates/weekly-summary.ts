/**
 * Weekly Summary Email Template
 */

export interface WeeklySummaryData {
  userName: string
  childName?: string
  storiesCreated: number
  storiesRead: number
  totalReadingTime: number
  achievementsUnlocked: number
  currentStreak: number
  longestStreak: number
  themesExplored: number
}

export function generateWeeklySummaryEmail(data: WeeklySummaryData): { html: string; text: string } {
  const minutes = Math.floor(data.totalReadingTime / 60)

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Weekly Reading Summary</title>
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
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin: 30px 0;
    }
    .stat-card {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
    }
    .stat-card.highlight {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      color: white;
    }
    .stat-number {
      font-size: 36px;
      font-weight: bold;
      margin: 0;
    }
    .stat-label {
      font-size: 14px;
      margin: 5px 0 0;
      opacity: 0.8;
    }
    .achievement-section {
      background: #fff5f5;
      border-left: 4px solid #f56565;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
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
      <h1>📚 Your Weekly Reading Summary</h1>
      <p>Keep up the amazing work!</p>
    </div>

    <div class="content">
      <p class="greeting">
        Hi ${data.userName}! 👋
      </p>

      <p>
        Here's what happened this week ${data.childName ? `with ${data.childName}'s` : 'with your'} reading journey:
      </p>

      <div class="stats-grid">
        <div class="stat-card highlight">
          <div class="stat-number">${data.storiesCreated}</div>
          <div class="stat-label">Stories Created 📖</div>
        </div>

        <div class="stat-card">
          <div class="stat-number">${data.storiesRead}</div>
          <div class="stat-label">Stories Read 👀</div>
        </div>

        <div class="stat-card">
          <div class="stat-number">${minutes}</div>
          <div class="stat-label">Minutes Reading ⏱️</div>
        </div>

        <div class="stat-card highlight">
          <div class="stat-number">🔥 ${data.currentStreak}</div>
          <div class="stat-label">Day Streak</div>
        </div>
      </div>

      ${data.achievementsUnlocked > 0 ? `
      <div class="achievement-section">
        <h3 style="margin-top: 0;">🏆 Achievements Unlocked!</h3>
        <p>You earned <strong>${data.achievementsUnlocked}</strong> new achievement${data.achievementsUnlocked > 1 ? 's' : ''} this week! Great job!</p>
      </div>
      ` : ''}

      <div style="background: #f7fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <h3 style="margin-top: 0;">📊 More Stats</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li><strong>${data.themesExplored}</strong> different themes explored</li>
          <li>Longest streak: <strong>${data.longestStreak}</strong> days</li>
          <li>Current streak: <strong>${data.currentStreak}</strong> days</li>
        </ul>
      </div>

      <center>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://aistories.app'}/dashboard" class="button">
          View Full Dashboard →
        </a>
      </center>

      <p style="margin-top: 30px; color: #666;">
        Keep reading together! Every story shared strengthens your child's love for learning and imagination. 🌟
      </p>
    </div>

    <div class="footer">
      <p>This is an automated weekly summary from AI Stories.</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://aistories.app'}/settings/notifications" style="color: #667eea;">
          Manage Email Preferences
        </a>
      </p>
    </div>
  </div>
</body>
</html>
  `

  const text = `
📚 Your Weekly Reading Summary

Hi ${data.userName}!

Here's what happened this week:

Stories Created: ${data.storiesCreated} 📖
Stories Read: ${data.storiesRead} 👀
Reading Time: ${minutes} minutes ⏱️
Current Streak: 🔥 ${data.currentStreak} days

${data.achievementsUnlocked > 0 ? `
🏆 Achievements Unlocked: ${data.achievementsUnlocked} new achievement${data.achievementsUnlocked > 1 ? 's' : ''}!
` : ''}

More Stats:
- ${data.themesExplored} different themes explored
- Longest streak: ${data.longestStreak} days
- Current streak: ${data.currentStreak} days

View your full dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://aistories.app'}/dashboard

Keep reading together! 🌟

---
Manage email preferences: ${process.env.NEXT_PUBLIC_APP_URL || 'https://aistories.app'}/settings/notifications
  `.trim()

  return { html, text }
}
