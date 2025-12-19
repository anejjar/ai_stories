'use client'

import { useEffect, useState } from 'react'
import { AchievementBadge } from '@/components/achievements/achievement-badge'
import { AchievementUnlockModal } from '@/components/achievements/achievement-unlock-modal'
import { StreakCounter } from '@/components/achievements/streak-counter'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  getAllAchievements,
  getAchievementsByCategory,
  CATEGORY_EMOJIS,
  TIER_COLORS,
  READER_LEVEL_POINTS,
  getPointsToNextLevel,
} from '@/lib/achievements/definitions'
import { getUserAchievements, getUserStats, getAchievementProgress } from '@/lib/achievements/achievement-checker'
import type { Achievement, UserAchievement, UserStats, AchievementCategory } from '@/lib/achievements/types'

export default function AchievementsPage() {
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [progress, setProgress] = useState<Map<string, number>>(new Map())
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [achievements, stats, progressData] = await Promise.all([
      getUserAchievements(),
      getUserStats(),
      getAchievementProgress(),
    ])

    setUserAchievements(achievements)
    setUserStats(stats)
    setProgress(progressData)
    setLoading(false)
  }

  const allAchievements = getAllAchievements()
  const unlockedIds = new Set(userAchievements.map(ua => ua.achievement_id))

  const categories: AchievementCategory[] = ['milestone', 'streak', 'explorer', 'creator', 'special']

  const nextLevel = userStats ? getPointsToNextLevel(userStats.totalPoints) : null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🏆</div>
          <p className="text-gray-600">Loading your achievements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            🏆 Your Achievements
          </h1>
          <p className="text-gray-600">
            Track your progress and earn badges as you read!
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Points */}
          <Card className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold">{userStats?.totalPoints || 0}</div>
              <div className="text-sm opacity-90">Total Points</div>
            </div>
          </Card>

          {/* Reader Level */}
          <Card className={`p-4 ${TIER_COLORS[userStats?.readerLevel || 'bronze'].bg}`}>
            <div className="text-center">
              <div className="text-2xl font-bold capitalize">{userStats?.readerLevel || 'Bronze'}</div>
              <div className="text-sm">Reader Level</div>
              {nextLevel && (
                <div className="text-xs mt-2">
                  {nextLevel.pointsNeeded} pts to {nextLevel.level}
                </div>
              )}
            </div>
          </Card>

          {/* Achievements Unlocked */}
          <Card className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold">
                {unlockedIds.size}/{allAchievements.length}
              </div>
              <div className="text-sm opacity-90">Achievements</div>
            </div>
          </Card>

          {/* Current Streak */}
          <Card className="p-4 bg-gradient-to-br from-orange-400 to-red-500 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold flex items-center justify-center gap-2">
                🔥 {userStats?.streak.current || 0}
              </div>
              <div className="text-sm opacity-90">Day Streak</div>
            </div>
          </Card>
        </div>

        {/* Streak Card */}
        <StreakCounter showMessage className="w-full" />

        {/* Progress to Next Level */}
        {nextLevel && (
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Progress to {nextLevel.level} Level</h3>
            <div className="relative">
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${TIER_COLORS[nextLevel.level].gradient} transition-all duration-500`}
                  style={{
                    width: `${((userStats?.totalPoints || 0) / READER_LEVEL_POINTS[nextLevel.level]) * 100}%`,
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {nextLevel.pointsNeeded} points to go!
              </p>
            </div>
          </Card>
        )}

        {/* Achievements Tabs */}
        <Card className="p-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              {categories.map(cat => (
                <TabsTrigger key={cat} value={cat} className="capitalize">
                  {CATEGORY_EMOJIS[cat]} {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* All Achievements */}
            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {allAchievements.map(achievement => {
                  const isUnlocked = unlockedIds.has(achievement.id)
                  const currentProgress = progress.get(achievement.id) || 0

                  return (
                    <AchievementBadge
                      key={achievement.id}
                      achievement={achievement}
                      isUnlocked={isUnlocked}
                      progress={currentProgress}
                      showProgress={!isUnlocked}
                      onClick={() => setSelectedAchievement(achievement)}
                    />
                  )
                })}
              </div>
            </TabsContent>

            {/* Category Tabs */}
            {categories.map(category => (
              <TabsContent key={category} value={category} className="mt-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {getAchievementsByCategory(category).map(achievement => {
                    const isUnlocked = unlockedIds.has(achievement.id)
                    const currentProgress = progress.get(achievement.id) || 0

                    return (
                      <AchievementBadge
                        key={achievement.id}
                        achievement={achievement}
                        isUnlocked={isUnlocked}
                        progress={currentProgress}
                        showProgress={!isUnlocked}
                        onClick={() => setSelectedAchievement(achievement)}
                      />
                    )
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Card>

        {/* Stats Summary */}
        <Card className="p-6">
          <h3 className="font-bold text-xl mb-4">Your Story Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl mb-2">📚</div>
              <div className="text-2xl font-bold">{userStats?.totalStories || 0}</div>
              <div className="text-sm text-gray-600">Stories Created</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl mb-2">📖</div>
              <div className="text-2xl font-bold">{userStats?.totalReadingSessions || 0}</div>
              <div className="text-sm text-gray-600">Reading Sessions</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl mb-2">🎨</div>
              <div className="text-2xl font-bold">{userStats?.illustratedStories || 0}</div>
              <div className="text-sm text-gray-600">Illustrated Books</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl mb-2">🗺️</div>
              <div className="text-2xl font-bold">{userStats?.uniqueThemes || 0}</div>
              <div className="text-sm text-gray-600">Themes Explored</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <AchievementUnlockModal
          achievement={selectedAchievement}
          isOpen={!!selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </div>
  )
}
