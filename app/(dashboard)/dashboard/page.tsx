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
    <div className="py-12 px-4 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-playwize-purple text-sm font-bold border border-purple-200">
          <BarChart3 className="h-4 w-4" />
          <span>Analytics & Progress</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
          Parent <span className="text-playwize-purple">Dashboard</span>
        </h1>
        <p className="text-gray-600 text-lg font-medium max-w-2xl mx-auto">
          Track your child's reading progress and achievements in their magical journey.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Stories', value: stats?.totalStories || 0, icon: BookOpen, color: 'bg-playwize-purple', sub: 'Stories created' },
          { label: 'Reading Sessions', value: stats?.totalReadingSessions || 0, icon: Calendar, color: 'bg-playwize-orange', sub: 'Times read' },
          { label: 'Reading Time', value: `${readingTimeMinutes}m`, icon: Clock, color: 'bg-playwize-purple', sub: 'Minutes total' },
          { label: 'Current Streak', value: `🔥 ${stats?.streak.current || 0}`, icon: TrendingUp, color: 'bg-playwize-orange', sub: 'Days in a row' },
        ].map((stat, i) => (
          <div key={i} className={`p-8 rounded-[3rem] ${stat.color} text-white shadow-xl relative overflow-hidden group hover:scale-105 transition-all`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl" />
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-1">
                <p className="text-white/80 text-sm font-black uppercase tracking-widest">{stat.label}</p>
                <p className="text-4xl font-black">{stat.value}</p>
                <p className="text-white/60 text-xs font-bold mt-2">{stat.sub}</p>
              </div>
              <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-sm border border-white/30 group-hover:rotate-12 transition-transform">
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full">
        <StreakCounter showMessage className="w-full" />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Reading Progress */}
        <div className="bg-white p-10 rounded-[3rem] border-4 border-gray-100 shadow-sm space-y-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-12 w-12 rounded-2xl bg-playwize-purple/10 flex items-center justify-center">
              <Target className="h-6 w-6 text-playwize-purple" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">Reading Progress</h3>
          </div>

          <div className="space-y-8">
            {[
              { label: 'Story Creation', current: stats?.totalStories || 0, target: 100, color: 'bg-playwize-purple', sub: 'to reach 100 stories!' },
              { label: 'Themes Explored', current: stats?.uniqueThemes || 0, target: 25, color: 'bg-playwize-orange', sub: 'more themes to try!' },
              { label: 'Reading Streak', current: stats?.streak.current || 0, target: 30, color: 'bg-playwize-purple', sub: 'days for monthly milestone!' },
              { label: 'Illustrated Books', current: stats?.illustratedStories || 0, target: 10, color: 'bg-playwize-orange', sub: 'more for achievement!' },
            ].map((p, i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center justify-between font-black text-sm">
                  <span className="text-gray-700 uppercase tracking-widest">{p.label}</span>
                  <span className="text-playwize-purple">{p.current} / {p.target}</span>
                </div>
                <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden border-2 border-gray-50">
                  <div
                    className={`h-full ${p.color} transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.min(100, (p.current / p.target) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 font-bold italic">
                  {Math.max(0, p.target - p.current)} {p.sub}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="bg-white p-10 rounded-[3rem] border-4 border-gray-100 shadow-sm space-y-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-12 w-12 rounded-2xl bg-playwize-orange/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-playwize-orange" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">Quick Insights</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { label: 'Average Session', value: `${avgSessionMinutes} min`, icon: Clock, color: 'text-playwize-purple', bg: 'bg-purple-50' },
              { label: 'Longest Streak', value: `${stats?.streak.longest || 0} days`, icon: Award, color: 'text-playwize-orange', bg: 'bg-orange-50' },
              { label: 'Total Points', value: `${stats?.totalPoints || 0} pts`, icon: Sparkles, color: 'text-playwize-purple', bg: 'bg-purple-50' },
              { label: 'Reader Level', value: stats?.readerLevel || 'Bronze', icon: Award, color: 'text-playwize-orange', bg: 'bg-orange-50' },
            ].map((insight, i) => (
              <div key={i} className={`${insight.bg} p-6 rounded-[2.5rem] border-2 border-white shadow-sm space-y-4 hover:shadow-md transition-all`}>
                <div className={`${insight.color} p-3 rounded-2xl bg-white w-fit shadow-sm`}>
                  <insight.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{insight.label}</p>
                  <p className={`text-2xl font-black ${insight.color} capitalize`}>{insight.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-10 rounded-[3rem] border-4 border-gray-100 shadow-sm space-y-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="h-12 w-12 rounded-2xl bg-playwize-purple/10 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-playwize-purple" />
          </div>
          <h3 className="text-2xl font-black text-gray-900">Recent Reading Activity</h3>
        </div>

        {recentSessions.length > 0 ? (
          <div className="grid gap-4">
            {recentSessions.map((session, index) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border-2 border-white hover:border-playwize-purple hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-playwize-purple text-white flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-black text-gray-900">Reading Session {recentSessions.length - index}</p>
                    <p className="text-sm text-gray-500 font-bold">
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
                <div className="flex items-center gap-3">
                  {session.audio_used && (
                    <Badge className="bg-blue-100 text-blue-700 border-0 font-black px-4 py-1.5 rounded-full">🎧 AUDIO</Badge>
                  )}
                  {session.completed && (
                    <Badge className="bg-green-100 text-green-700 border-0 font-black px-4 py-1.5 rounded-full">✓ DONE</Badge>
                  )}
                  {session.duration_seconds && (
                    <span className="text-sm font-black text-gray-400">{Math.floor(session.duration_seconds / 60)} MIN</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-200">
            <BookOpen className="h-20 w-20 text-gray-200 mx-auto mb-6" />
            <p className="text-gray-500 font-black text-xl uppercase tracking-widest">No sessions yet!</p>
            <p className="text-gray-400 font-bold mt-2">Start reading stories to see activity here!</p>
          </div>
        )}
      </div>

      {/* Encouragement Card */}
      <div className="p-12 rounded-[4rem] bg-playwize-purple text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="text-center space-y-6 relative z-10">
          <div className="text-7xl animate-bounce-slow inline-block">🌟</div>
          <h3 className="text-4xl font-black">Keep Up the Great Work!</h3>
          <p className="text-white/80 max-w-2xl mx-auto text-xl font-bold">
            Your child is building amazing reading habits! Every story read together strengthens their love for learning and imagination.
          </p>
          <div className="flex flex-wrap justify-center gap-6 pt-6">
            <div className="bg-white/20 backdrop-blur-md rounded-[2rem] px-8 py-4 border border-white/30">
              <p className="text-lg font-black">{stats?.totalStories || 0} Stories Created</p>
            </div>
            <div className="bg-playwize-orange rounded-[2rem] px-8 py-4 shadow-lg border border-white/20">
              <p className="text-lg font-black">{stats?.streak.current || 0} Day Streak 🔥</p>
            </div>
          </div>
        </div>
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
