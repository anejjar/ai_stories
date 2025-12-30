'use client'

import { useEffect, useState } from 'react'
import { StatsCard } from '@/components/admin/dashboard/stats-card'
import { Users, FileText, AlertCircle, DollarSign } from 'lucide-react'
import type { AdminDashboardStats } from '@/types/admin'

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/analytics/overview')
        const data = await res.json()
        if (data.success) {
          setStats(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg border border-gray-200" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return <div>Failed to load dashboard stats</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats.users.total}
          subtitle={`${stats.users.newThisWeek} new this week`}
          icon={Users}
        />

        <StatsCard
          title="Total Stories"
          value={stats.stories.total}
          subtitle={`${stats.stories.newThisWeek} new this week`}
          icon={FileText}
        />

        <StatsCard
          title="Pending Reports"
          value={stats.reports.pending}
          subtitle={`${stats.reports.resolved} resolved`}
          icon={AlertCircle}
          alert={stats.reports.pending > 0}
        />

        <StatsCard
          title="Revenue This Month"
          value={`$${stats.revenue.thisMonth.toFixed(2)}`}
          icon={DollarSign}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Subscription Distribution</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Trial</span>
              <span className="font-semibold text-gray-900">{stats.subscriptions.trial}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-600 font-medium">Pro</span>
              <span className="font-semibold text-blue-900">{stats.subscriptions.pro}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-purple-600 font-medium">Family</span>
              <span className="font-semibold text-purple-900">{stats.subscriptions.family}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Story Visibility</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-green-600 font-medium">Public</span>
              <span className="font-semibold text-green-900">{stats.stories.public}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Private</span>
              <span className="font-semibold text-gray-900">{stats.stories.private}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
