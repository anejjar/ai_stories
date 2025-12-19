'use client'

import { useEffect, useState } from 'react'
import { getCurrentStreak, getStreakMessage, getStreakColor } from '@/lib/achievements/streak-tracker'
import type { ReadingStreak } from '@/lib/achievements/types'

interface StreakCounterProps {
  showMessage?: boolean
  compact?: boolean
  className?: string
}

export function StreakCounter({ showMessage = false, compact = false, className = '' }: StreakCounterProps) {
  const [streak, setStreak] = useState<ReadingStreak | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStreak()
  }, [])

  async function loadStreak() {
    const streakData = await getCurrentStreak()
    setStreak(streakData)
    setLoading(false)
  }

  if (loading || !streak) {
    return null
  }

  const streakColor = getStreakColor(streak.current)
  const message = getStreakMessage(streak)

  // Compact version (for navigation bar)
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`} title={message}>
        <span className="text-2xl">🔥</span>
        <div className="flex flex-col leading-none">
          <span className={`font-bold ${streakColor}`}>{streak.current}</span>
          <span className="text-xs text-gray-500">day{streak.current !== 1 ? 's' : ''}</span>
        </div>
      </div>
    )
  }

  // Full version
  return (
    <div className={`flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-2 border-orange-200 ${className}`}>
      {/* Flame Icon */}
      <div className="text-4xl animate-pulse">🔥</div>

      {/* Streak Info */}
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold ${streakColor}`}>{streak.current}</span>
          <span className="text-sm text-gray-600">day streak</span>
        </div>

        {showMessage && <p className="text-sm text-gray-700 mt-1">{message}</p>}

        {streak.longest > streak.current && (
          <p className="text-xs text-gray-500 mt-1">
            Personal best: {streak.longest} days
          </p>
        )}
      </div>

      {/* Badge for milestones */}
      {streak.current >= 30 && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
          Amazing!
        </div>
      )}
      {streak.current >= 7 && streak.current < 30 && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
          Great!
        </div>
      )}
    </div>
  )
}
