'use client'

import { useEffect, useState } from 'react'
import { AchievementBadge } from '@/components/achievements/achievement-badge'
import { AchievementUnlockModal } from '@/components/achievements/achievement-unlock-modal'
import { StreakCounter } from '@/components/achievements/streak-counter'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Trophy, Sparkles, Award, TrendingUp } from 'lucide-react'
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
    <div className="min-h-screen playwize-bg relative selection:bg-playwize-purple selection:text-white py-12 px-4 overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-40 -left-20 w-80 h-80 circle-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-[60%] -right-20 w-96 h-96 circle-pattern opacity-30 pointer-events-none" />
      
      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-playwize-purple text-sm font-bold border border-purple-200">
            <Trophy className="h-4 w-4" />
            <span>Rewards & Badges</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
            Your <span className="text-playwize-purple">Achievements</span>
          </h1>
          <p className="text-gray-600 text-lg font-medium max-w-2xl mx-auto">
            Track your progress and earn badges as you embark on magical reading adventures!
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Points', value: userStats?.totalPoints || 0, icon: Sparkles, color: 'bg-playwize-purple' },
            { label: 'Reader Level', value: userStats?.readerLevel || 'Bronze', icon: Award, color: 'bg-playwize-orange', capitalize: true },
            { label: 'Achievements', value: `${unlockedIds.size}/${allAchievements.length}`, icon: Trophy, color: 'bg-playwize-purple' },
            { label: 'Day Streak', value: `🔥 ${userStats?.streak.current || 0}`, icon: TrendingUp, color: 'bg-playwize-orange' },
          ].map((stat, i) => (
            <div key={i} className={`p-8 rounded-[2.5rem] ${stat.color} text-white shadow-xl relative overflow-hidden group hover:scale-105 transition-all`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl" />
              <div className="text-center space-y-2 relative z-10">
                <div className="text-3xl font-black">{stat.value}</div>
                <div className="text-xs font-black uppercase tracking-widest opacity-80">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full">
          <StreakCounter showMessage className="w-full" />
        </div>

        {/* Progress to Next Level */}
        {nextLevel && (
          <div className="bg-white p-10 rounded-[3rem] border-4 border-gray-100 shadow-sm space-y-6">
            <h3 className="font-black text-2xl text-gray-900">Progress to {nextLevel.level} Level</h3>
            <div className="space-y-4">
              <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden border-2 border-gray-50 p-1">
                <div
                  className={`h-full bg-playwize-purple rounded-full transition-all duration-1000 ease-out`}
                  style={{
                    width: `${((userStats?.totalPoints || 0) / READER_LEVEL_POINTS[nextLevel.level]) * 100}%`,
                  }}
                />
              </div>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-widest text-center">
                {nextLevel.pointsNeeded} points to go! 🚀
              </p>
            </div>
          </div>
        )}

        {/* Achievements Tabs */}
        <div className="bg-white p-8 md:p-12 rounded-[4rem] border-4 border-gray-100 shadow-sm">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full gap-2 bg-gray-50 p-2 rounded-[2.5rem] h-auto border-2 border-gray-100 mb-10">
              <TabsTrigger value="all" className="rounded-full font-black py-3 data-[state=active]:bg-playwize-purple data-[state=active]:text-white">All</TabsTrigger>
              {categories.map(cat => (
                <TabsTrigger key={cat} value={cat} className="rounded-full font-black py-3 capitalize data-[state=active]:bg-playwize-purple data-[state=active]:text-white">
                  {CATEGORY_EMOJIS[cat]} {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
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

            {categories.map(category => (
              <TabsContent key={category} value={category} className="mt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
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
        </div>

        {/* Stats Summary */}
        <div className="bg-white p-10 rounded-[3rem] border-4 border-gray-100 shadow-sm space-y-8">
          <h3 className="font-black text-2xl text-gray-900 text-center">Your Story Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Stories Created', value: userStats?.totalStories || 0, icon: '📚', color: 'bg-purple-50', text: 'text-playwize-purple' },
              { label: 'Reading Sessions', value: userStats?.totalReadingSessions || 0, icon: '📖', color: 'bg-orange-50', text: 'text-playwize-orange' },
              { label: 'Illustrated Books', value: userStats?.illustratedStories || 0, icon: '🎨', color: 'bg-purple-50', text: 'text-playwize-purple' },
              { label: 'Themes Explored', value: userStats?.uniqueThemes || 0, icon: '🗺️', color: 'bg-orange-50', text: 'text-playwize-orange' },
            ].map((s, i) => (
              <div key={i} className="text-center space-y-4">
                <div className={`h-24 w-24 rounded-[2rem] ${s.color} mx-auto flex items-center justify-center text-4xl shadow-inner`}>
                  {s.icon}
                </div>
                <div>
                  <div className={`text-3xl font-black ${s.text}`}>{s.value}</div>
                  <div className="text-xs font-black text-gray-400 uppercase tracking-widest">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
