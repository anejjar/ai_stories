'use client'

import { Badge } from '@/components/ui/badge'
import type { Achievement } from '@/lib/achievements/types'
import { TIER_COLORS } from '@/lib/achievements/definitions'

interface AchievementBadgeProps {
  achievement: Achievement
  isUnlocked?: boolean
  progress?: number
  showProgress?: boolean
  size?: 'small' | 'medium' | 'large'
  onClick?: () => void
}

export function AchievementBadge({
  achievement,
  isUnlocked = false,
  progress = 0,
  showProgress = false,
  size = 'medium',
  onClick,
}: AchievementBadgeProps) {
  const tierColor = TIER_COLORS[achievement.tier]

  const sizeClasses = {
    small: {
      container: 'w-16 h-20',
      icon: 'text-2xl',
      text: 'text-xs',
      badge: 'text-[10px]',
    },
    medium: {
      container: 'w-24 h-28',
      icon: 'text-4xl',
      text: 'text-sm',
      badge: 'text-xs',
    },
    large: {
      container: 'w-32 h-36',
      icon: 'text-5xl',
      text: 'text-base',
      badge: 'text-sm',
    },
  }

  const classes = sizeClasses[size]

  const percentComplete = achievement.requirement_value > 0
    ? Math.min(100, (progress / achievement.requirement_value) * 100)
    : 0

  return (
    <div
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all
        ${isUnlocked ? tierColor.bg : 'bg-gray-100'}
        ${isUnlocked ? tierColor.border : 'border-gray-300'}
        ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : ''}
        ${!isUnlocked ? 'opacity-60 grayscale' : ''}
        ${classes.container}
      `}
      title={achievement.description}
    >
      {/* Achievement Icon */}
      <div className={`${classes.icon} ${!isUnlocked && 'filter blur-sm'}`}>
        {achievement.icon}
      </div>

      {/* Achievement Name */}
      <p className={`font-bold text-center leading-tight ${classes.text} ${tierColor.text}`}>
        {achievement.name}
      </p>

      {/* Tier Badge */}
      <Badge
        className={`absolute top-1 right-1 ${classes.badge} capitalize bg-gradient-to-r ${tierColor.gradient} text-white border-none`}
      >
        {achievement.tier}
      </Badge>

      {/* Points Badge */}
      {isUnlocked && (
        <div className="absolute bottom-1 right-1 bg-white rounded-full px-2 py-0.5 text-xs font-bold text-purple-600 shadow-sm">
          +{achievement.points}
        </div>
      )}

      {/* Progress Bar (if showing progress) */}
      {showProgress && !isUnlocked && (
        <div className="absolute bottom-2 left-2 right-2">
          <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${tierColor.gradient} transition-all duration-500`}
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          <p className="text-[10px] text-center mt-1 text-gray-600">
            {progress}/{achievement.requirement_value}
          </p>
        </div>
      )}

      {/* Lock Icon (if locked and not showing progress) */}
      {!isUnlocked && !showProgress && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-xl">
          <span className="text-3xl">🔒</span>
        </div>
      )}

      {/* Secret Badge */}
      {achievement.is_secret && !isUnlocked && (
        <Badge className="absolute top-1 left-1 text-[10px] bg-purple-600 text-white">
          Secret
        </Badge>
      )}

      {/* New Badge (for recently unlocked) */}
      {isUnlocked && onClick && (
        <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
          ✨
        </div>
      )}
    </div>
  )
}
