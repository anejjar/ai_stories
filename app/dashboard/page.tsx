'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { StreakCounter } from '@/components/achievements/streak-counter'
import { getUserStats } from '@/lib/achievements/achievement-checker'
import { getReadingSessions } from '@/lib/achievements/streak-tracker'
import type { UserStats, ReadingSession } from '@/lib/achievements/types'
import {
  BarChart3,
  BookOpen,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  Sparkles,
  Target
} from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [recentSessions, setRecentSessions] = useState<ReadingSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    setLoading(true)
    const [statsData, sessionsData] = await Promise.all([
      getUserStats(),
      getReadingSessions({ limit: 10 }),
    ])

    setStats(statsData)
    setRecentSessions(sessionsData)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">📊</div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const readingTimeMinutes = stats ? Math.floor(stats.totalReadingTime / 60) : 0
  const avgSessionMinutes = stats ? Math.floor(stats.averageSessionDuration / 60) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <BarChart3 className="h-12 w-12 text-purple-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Parent Dashboard
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Track your child's reading progress and achievements
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Stories */}
          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-2">Total Stories</p>
                <p className="text-4xl font-bold">{stats?.totalStories || 0}</p>
                <p className="text-purple-100 text-xs mt-2">Stories created</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>
          </Card>

          {/* Reading Sessions */}
          <Card className="p-6 bg-gradient-to-br from-pink-500 to-pink-600 text-white hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-pink-100 text-sm font-medium mb-2">Reading Sessions</p>
                <p className="text-4xl font-bold">{stats?.totalReadingSessions || 0}</p>
                <p className="text-pink-100 text-xs mt-2">Times read</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </Card>

          {/* Total Time */}
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-2">Reading Time</p>
                <p className="text-4xl font-bold">{readingTimeMinutes}</p>
                <p className="text-blue-100 text-xs mt-2">Minutes total</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </Card>

          {/* Current Streak */}
          <Card className="p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium mb-2">Current Streak</p>
                <p className="text-4xl font-bold flex items-center gap-2">
                  🔥 {stats?.streak.current || 0}
                </p>
                <p className="text-orange-100 text-xs mt-2">Days in a row</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </div>

        {/* Streak Card */}
        <StreakCounter showMessage className="w-full" />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reading Progress */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Target className="h-6 w-6 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-800">Reading Progress</h3>
            </div>

            <div className="space-y-6">
              {/* Story Creation Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Story Creation</span>
                  <span className="text-sm text-gray-600">{stats?.totalStories || 0} / 100</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, ((stats?.totalStories || 0) / 100) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {100 - (stats?.totalStories || 0)} more to reach 100 stories!
                </p>
              </div>

              {/* Theme Exploration */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Themes Explored</span>
                  <span className="text-sm text-gray-600">{stats?.uniqueThemes || 0} / 25</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, ((stats?.uniqueThemes || 0) / 25) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Try {25 - (stats?.uniqueThemes || 0)} more themes!
                </p>
              </div>

              {/* Reading Consistency */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Reading Streak</span>
                  <span className="text-sm text-gray-600">{stats?.streak.current || 0} / 30 days</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, ((stats?.streak.current || 0) / 30) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {30 - (stats?.streak.current || 0)} more days for monthly milestone!
                </p>
              </div>

              {/* Illustrated Books */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Illustrated Books</span>
                  <span className="text-sm text-gray-600">{stats?.illustratedStories || 0} / 10</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, ((stats?.illustratedStories || 0) / 10) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {10 - (stats?.illustratedStories || 0)} more for achievement!
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Insights */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-800">Quick Insights</h3>
            </div>

            <div className="space-y-4">
              {/* Average Session Time */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500 text-white p-2 rounded-full">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Average Session</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {avgSessionMinutes} min
                    </p>
                  </div>
                </div>
              </div>

              {/* Longest Streak */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-2 border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500 text-white p-2 rounded-full">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Longest Streak</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {stats?.streak.longest || 0} days
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Points */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 text-white p-2 rounded-full">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Achievement Points</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {stats?.totalPoints || 0} pts
                    </p>
                  </div>
                </div>
              </div>

              {/* Reader Level */}
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-500 text-white p-2 rounded-full">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Reader Level</p>
                    <p className="text-2xl font-bold text-yellow-700 capitalize">
                      {stats?.readerLevel || 'Bronze'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="h-6 w-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-800">Recent Reading Activity</h3>
          </div>

          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.map((session, index) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-500 text-white p-2 rounded-full">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        Reading Session {recentSessions.length - index}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(session.read_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {session.audio_used && (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                        🎧 Audio
                      </Badge>
                    )}
                    {session.completed && (
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        ✓ Completed
                      </Badge>
                    )}
                    {session.duration_seconds && (
                      <span className="text-sm text-gray-600">
                        {Math.floor(session.duration_seconds / 60)} min
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No reading sessions yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Start reading stories to see activity here!
              </p>
            </div>
          )}
        </Card>

        {/* Encouragement Card */}
        <Card className="p-8 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-white">
          <div className="text-center space-y-4">
            <div className="text-5xl">🌟</div>
            <h3 className="text-2xl font-bold">Keep Up the Great Work!</h3>
            <p className="text-white/90 max-w-2xl mx-auto">
              Your child is building amazing reading habits! Every story read together strengthens their love for learning and imagination.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
                <p className="text-sm font-semibold">
                  {stats?.totalStories || 0} Stories Created
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
                <p className="text-sm font-semibold">
                  {stats?.streak.current || 0} Day Streak 🔥
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${className}`}>
      {children}
    </span>
  )
}
