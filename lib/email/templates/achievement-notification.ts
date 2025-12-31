/**
 * Achievement Notification Email Template
 */

export interface AchievementNotificationData {
  userName: string
  childName?: string
  achievements: Array<{
    name: string
    description: string
    icon: string
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
    points: number
  }>
  totalPoints: number
  readerLevel: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  nextLevelPoints?: number
}

const TIER_COLORS = {
  bronze: { gradient: 'linear-gradient(135deg, #cd7f32 0%, #8b5a3c 100%)', color: '#cd7f32' },
  silver: { gradient: 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)', color: '#C0C0C0' },
  gold: { gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', color: '#FFD700' },
  platinum: { gradient: 'linear-gradient(135deg, #E5E4E2 0%, #a8a8a8 100%)', color: '#E5E4E2' },
  diamond: { gradient: 'linear-gradient(135deg, #b9f2ff 0%, #00d4ff 100%)', color: '#b9f2ff' },
}

const LEVEL_NAMES = {
  bronze: 'Bronze Reader',
  silver: 'Silver Reader',
  gold: 'Gold Reader',
  platinum: 'Platinum Reader',
  diamond: 'Diamond Reader',
}

export function generateAchievementNotificationEmail(data: AchievementNotificationData): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Achievement Unlocked!</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 700px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 24px;
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
    .trophy-icon {
      font-size: 64px;
      margin-bottom: 10px;
      animation: bounce 1s ease infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
    }
    .achievements-list {
      margin: 20px 0;
    }
    .achievement-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 15px;
      border: 2px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .achievement-icon {
      font-size: 48px;
      flex-shrink: 0;
    }
    .achievement-details {
      flex: 1;
    }
    .achievement-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .achievement-description {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }
    .achievement-tier {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      color: white;
    }
    .points-box {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      color: white;
      margin: 20px 0;
    }
    .points-box .number {
      font-size: 42px;
      font-weight: bold;
      margin: 10px 0;
    }
    .level-box {
      background: #f7fafc;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .level-badge {
      display: inline-block;
      padding: 10px 20px;
      border-radius: 20px;
      font-size: 18px;
      font-weight: bold;
      color: white;
      margin: 10px 0;
    }
    .progress-bar {
      background: #e2e8f0;
      border-radius: 10px;
      height: 20px;
      overflow: hidden;
      margin-top: 10px;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s ease;
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
      <div class="trophy-icon">🏆</div>
      <h1>Achievement${data.achievements.length > 1 ? 's' : ''} Unlocked!</h1>
      <p>Celebrate your progress!</p>
    </div>

    <div class="content">
      <p class="greeting">
        Congratulations ${data.userName}! 🎉
      </p>

      <p>
        ${data.childName ? `${data.childName} just` : 'You just'} unlocked ${data.achievements.length} new achievement${data.achievements.length > 1 ? 's' : ''}! Here's what ${data.childName ? 'they' : 'you'} earned:
      </p>

      <div class="achievements-list">
        ${data.achievements.map(achievement => `
        <div class="achievement-card">
          <div class="achievement-icon">${achievement.icon}</div>
          <div class="achievement-details">
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-description">${achievement.description}</div>
            <span class="achievement-tier" style="background: ${TIER_COLORS[achievement.tier].gradient}">
              ${achievement.tier.toUpperCase()} • ${achievement.points} points
            </span>
          </div>
        </div>
        `).join('')}
      </div>

      <div class="points-box">
        <div>Total Points Earned</div>
        <div class="number">+${data.achievements.reduce((sum, a) => sum + a.points, 0)}</div>
        <div style="font-size: 14px; opacity: 0.9;">Grand Total: ${data.totalPoints} points</div>
      </div>

      <div class="level-box">
        <h3 style="margin-top: 0;">Reader Level</h3>
        <div class="level-badge" style="background: ${TIER_COLORS[data.readerLevel].gradient}">
          ${LEVEL_NAMES[data.readerLevel]}
        </div>
        ${data.nextLevelPoints ? `
        <p style="margin: 15px 0 5px; font-size: 14px; color: #666;">
          ${data.nextLevelPoints - data.totalPoints} points to next level
        </p>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${(data.totalPoints / data.nextLevelPoints) * 100}%"></div>
        </div>
        ` : `
        <p style="margin: 15px 0 0; font-size: 14px; color: #666;">
          🌟 Maximum level achieved!
        </p>
        `}
      </div>

      <center>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://aistories.app'}/achievements" class="button">
          View All Achievements →
        </a>
      </center>

      <p style="margin-top: 30px; color: #666;">
        Keep up the amazing work! Every story read is a step toward new adventures and achievements. 🌟
      </p>
    </div>

    <div class="footer">
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://aistories.app'}/settings/notifications" style="color: #667eea;">
          Manage Achievement Notifications
        </a>
      </p>
    </div>
  </div>
</body>
</html>
  `

  const text = `
🏆 Achievement${data.achievements.length > 1 ? 's' : ''} Unlocked!

Congratulations ${data.userName}! 🎉

${data.childName ? `${data.childName} just` : 'You just'} unlocked ${data.achievements.length} new achievement${data.achievements.length > 1 ? 's' : ''}!

${data.achievements.map(achievement => `
${achievement.icon} ${achievement.name}
${achievement.description}
${achievement.tier.toUpperCase()} • ${achievement.points} points
`).join('\n')}

Total Points Earned: +${data.achievements.reduce((sum, a) => sum + a.points, 0)}
Grand Total: ${data.totalPoints} points

Reader Level: ${LEVEL_NAMES[data.readerLevel]}
${data.nextLevelPoints ? `${data.nextLevelPoints - data.totalPoints} points to next level` : '🌟 Maximum level achieved!'}

View all achievements: ${process.env.NEXT_PUBLIC_APP_URL || 'https://aistories.app'}/achievements

Keep up the amazing work! Every story read is a step toward new adventures and achievements. 🌟

---
Manage Achievement Notifications: ${process.env.NEXT_PUBLIC_APP_URL || 'https://aistories.app'}/settings/notifications
  `.trim()

  return { html, text }
}
