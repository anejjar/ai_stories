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
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  const timeDisplay = hours > 0 ? `${hours}h ${remainingMinutes}m` : `${minutes}m`

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Your Weekly Reading Summary</title>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
      animation: pulse 3s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }
    .header-content {
      position: relative;
      z-index: 1;
    }
    .header-icon {
      font-size: 64px;
      margin-bottom: 16px;
      display: block;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
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
      margin-bottom: 40px;
      line-height: 1.7;
    }
    .stats-section {
      margin: 40px 0;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      border-radius: 16px;
      padding: 28px 20px;
      text-align: center;
      border: 2px solid transparent;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .stat-card.highlight {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: rgba(255,255,255,0.2);
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
    }
    .stat-card.highlight::before {
      opacity: 1;
      background: linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1));
    }
    .stat-icon {
      font-size: 32px;
      margin-bottom: 12px;
      display: block;
    }
    .stat-number {
      font-size: 42px;
      font-weight: 700;
      margin: 0;
      line-height: 1;
      letter-spacing: -1px;
    }
    .stat-label {
      font-size: 13px;
      margin: 12px 0 0;
      opacity: 0.85;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-card.highlight .stat-label {
      opacity: 0.95;
    }
    .achievement-banner {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-radius: 16px;
      padding: 24px;
      margin: 32px 0;
      border-left: 5px solid #f59e0b;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
    }
    .achievement-banner h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      color: #92400e;
      font-weight: 700;
    }
    .achievement-banner p {
      margin: 0;
      color: #78350f;
      font-size: 15px;
      line-height: 1.6;
    }
    .more-stats {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-radius: 16px;
      padding: 28px;
      margin: 32px 0;
      border: 1px solid #bae6fd;
    }
    .more-stats h3 {
      margin: 0 0 20px 0;
      font-size: 18px;
      color: #0c4a6e;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .more-stats ul {
      margin: 0;
      padding-left: 0;
      list-style: none;
    }
    .more-stats li {
      padding: 12px 0;
      font-size: 15px;
      color: #075985;
      border-bottom: 1px solid rgba(14, 165, 233, 0.1);
      display: flex;
      justify-content: space-between;
    }
    .more-stats li:last-child {
      border-bottom: none;
    }
    .more-stats strong {
      color: #0c4a6e;
      font-weight: 700;
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
    .closing-message {
      margin-top: 40px;
      padding: 24px;
      background: linear-gradient(135deg, #fef3f2 0%, #fee2e2 100%);
      border-radius: 16px;
      text-align: center;
      border: 1px solid #fecaca;
    }
    .closing-message p {
      margin: 0;
      color: #7f1d1d;
      font-size: 15px;
      line-height: 1.7;
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
      .header-icon {
        font-size: 48px;
      }
      .content {
        padding: 32px 24px;
      }
      .stats-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      .stat-card {
        padding: 24px 16px;
      }
      .stat-number {
        font-size: 36px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div class="header-content">
        <span class="header-icon">📚</span>
        <h1>Your Weekly Summary</h1>
        <p>Celebrating your reading journey</p>
      </div>
    </div>

    <div class="content">
      <p class="greeting">
        Hi ${data.userName}! 👋
      </p>

      <p class="intro-text">
        What an amazing week! Here's a look at ${data.childName ? `${data.childName}'s` : 'your'} reading adventure:
      </p>

      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card highlight">
            <span class="stat-icon">✨</span>
            <div class="stat-number">${data.storiesCreated}</div>
            <div class="stat-label">Stories Created</div>
          </div>

          <div class="stat-card">
            <span class="stat-icon">👀</span>
            <div class="stat-number">${data.storiesRead}</div>
            <div class="stat-label">Stories Read</div>
          </div>

          <div class="stat-card">
            <span class="stat-icon">⏱️</span>
            <div class="stat-number">${timeDisplay}</div>
            <div class="stat-label">Reading Time</div>
          </div>

          <div class="stat-card highlight">
            <span class="stat-icon">🔥</span>
            <div class="stat-number">${data.currentStreak}</div>
            <div class="stat-label">Day Streak</div>
          </div>
        </div>
      </div>

      ${data.achievementsUnlocked > 0 ? `
      <div class="achievement-banner">
        <h3>🏆 Amazing Achievement${data.achievementsUnlocked > 1 ? 's' : ''}!</h3>
        <p>You unlocked <strong>${data.achievementsUnlocked}</strong> new achievement${data.achievementsUnlocked > 1 ? 's' : ''} this week! Your dedication to reading together is truly inspiring. Keep up the fantastic work! 🌟</p>
      </div>
      ` : ''}

      <div class="more-stats">
        <h3>📊 Your Reading Insights</h3>
        <ul>
          <li>
            <span>Themes explored</span>
            <strong>${data.themesExplored}</strong>
          </li>
          <li>
            <span>Longest streak</span>
            <strong>${data.longestStreak} days</strong>
          </li>
          <li>
            <span>Current streak</span>
            <strong>${data.currentStreak} days</strong>
          </li>
        </ul>
      </div>

      <div class="cta-section">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://aistories.app'}/dashboard" class="cta-button">
          View Full Dashboard →
        </a>
      </div>

      <div class="closing-message">
        <p>
          🌟 Every story you share creates magical moments and builds a foundation for lifelong learning. 
          ${data.childName ? `Keep inspiring ${data.childName} with amazing stories!` : 'Keep up the wonderful reading habit!'}
        </p>
      </div>
    </div>

    <div class="footer">
      <p>This is an automated weekly summary from AI Stories</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://aistories.app'}/settings/notifications">
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

What an amazing week! Here's a look at ${data.childName ? `${data.childName}'s` : 'your'} reading adventure:

✨ Stories Created: ${data.storiesCreated}
👀 Stories Read: ${data.storiesRead}
⏱️ Reading Time: ${timeDisplay}
🔥 Day Streak: ${data.currentStreak} days

${data.achievementsUnlocked > 0 ? `
🏆 Amazing Achievement${data.achievementsUnlocked > 1 ? 's' : ''}!
You unlocked ${data.achievementsUnlocked} new achievement${data.achievementsUnlocked > 1 ? 's' : ''} this week! Your dedication to reading together is truly inspiring. Keep up the fantastic work! 🌟
` : ''}

📊 Your Reading Insights:
- Themes explored: ${data.themesExplored}
- Longest streak: ${data.longestStreak} days
- Current streak: ${data.currentStreak} days

View your full dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://aistories.app'}/dashboard

🌟 Every story you share creates magical moments and builds a foundation for lifelong learning. ${data.childName ? `Keep inspiring ${data.childName} with amazing stories!` : 'Keep up the wonderful reading habit!'}

---
This is an automated weekly summary from AI Stories
Manage email preferences: ${process.env.NEXT_PUBLIC_APP_URL || 'https://aistories.app'}/settings/notifications
  `.trim()

  return { html, text }
}
