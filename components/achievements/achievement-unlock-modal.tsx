'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Achievement } from '@/lib/achievements/types'
import { TIER_COLORS } from '@/lib/achievements/definitions'
import { AchievementBadge } from './achievement-badge'

interface AchievementUnlockModalProps {
  achievement: Achievement | null
  isOpen: boolean
  onClose: () => void
}

export function AchievementUnlockModal({ achievement, isOpen, onClose }: AchievementUnlockModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isOpen && achievement) {
      setShowConfetti(true)
      // Auto-hide confetti after 3 seconds
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, achievement])

  if (!achievement) return null

  const tierColor = TIER_COLORS[achievement.tier]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        {/* Confetti Background */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="confetti-container">
              {Array.from({ length: 50 }).map((_, i) => (
                <div
                  key={i}
                  className="confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    backgroundColor: ['#fbbf24', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981'][i % 5],
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-6 py-6">
          {/* Title */}
          <div className="text-center space-y-2">
            <DialogTitle className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 animate-pulse">
              Achievement Unlocked!
            </DialogTitle>
            <p className="text-gray-600">You earned a new badge!</p>
          </div>

          {/* Achievement Badge */}
          <div className="transform scale-125 animate-bounce">
            <AchievementBadge achievement={achievement} isUnlocked={true} size="large" />
          </div>

          {/* Achievement Details */}
          <div className="text-center space-y-3 max-w-sm">
            <h3 className="text-2xl font-bold">{achievement.name}</h3>
            <p className="text-gray-700">{achievement.description}</p>

            {/* Points Earned */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${tierColor.gradient} text-white font-bold text-lg shadow-lg`}
            >
              <span>+{achievement.points}</span>
              <span>points</span>
            </div>

            {/* Tier Badge */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-gray-600">Tier:</span>
              <span className={`font-bold capitalize ${tierColor.text}`}>{achievement.tier}</span>
            </div>
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8"
            size="lg"
          >
            Awesome! 🎉
          </Button>
        </div>

        {/* CSS for Confetti Animation */}
        <style jsx>{`
          .confetti-container {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }

          .confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            background: #fbbf24;
            animation: confetti-fall 3s linear infinite;
          }

          @keyframes confetti-fall {
            0% {
              transform: translateY(-100%) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  )
}
