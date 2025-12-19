'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './use-auth'
import type { UsageStats } from '@/types'

interface UseUsageStatsResult {
  stats: UsageStats | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * React hook to fetch and manage user usage statistics
 * Provides today's usage, weekly, monthly, and all-time stats
 */
export function useUsageStats(): UseUsageStatsResult {
  const { user, getAccessToken } = useAuth()
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const token = await getAccessToken()
      if (!token) {
        throw new Error('Failed to get access token')
      }

      const response = await fetch('/api/usage/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch usage statistics')
      }

      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      } else {
        throw new Error(data.error || 'Failed to fetch usage statistics')
      }
    } catch (err) {
      console.error('Error fetching usage stats:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user?.id])

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats,
  }
}

/**
 * Hook to check if user is near their daily limit
 * Returns warning state when user has used 80%+ of their daily limit
 */
export function useUsageLimitWarning() {
  const { stats } = useUsageStats()

  if (!stats) return { isNearLimit: false, percentage: 0 }

  const today = stats.today

  // Calculate percentage for text stories
  const textPercentage = today.textLimit > 0
    ? (today.textStories / today.textLimit) * 100
    : 0

  // Calculate percentage for illustrated stories
  const illustratedPercentage = today.illustratedLimit > 0
    ? (today.illustratedStories / today.illustratedLimit) * 100
    : 0

  const maxPercentage = Math.max(textPercentage, illustratedPercentage)

  return {
    isNearLimit: maxPercentage >= 80,
    percentage: maxPercentage,
    textPercentage,
    illustratedPercentage,
  }
}

/**
 * Format time remaining until reset
 */
export function formatTimeUntilReset(resetAt?: Date): string {
  if (!resetAt) return 'Unknown'

  const now = new Date()
  const diff = resetAt.getTime() - now.getTime()

  if (diff <= 0) return 'Now'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  return `${minutes}m`
}

/**
 * Format usage message for display
 */
export function formatUsageDisplay(
  current: number,
  limit: number,
  type: 'text' | 'illustrated'
): string {
  if (limit === 999) {
    return `${current} ${type} stories created today (unlimited)`
  }

  const remaining = limit - current

  if (remaining <= 0) {
    return `Daily limit reached (${current}/${limit})`
  }

  if (remaining === 1) {
    return `${remaining} ${type} story remaining`
  }

  return `${remaining} ${type} stories remaining`
}
