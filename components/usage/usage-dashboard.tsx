'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUsageStats, formatTimeUntilReset, formatUsageDisplay } from '@/hooks/use-usage-stats'
import { useAuth } from '@/hooks/use-auth'

interface UsageProgressBarProps {
  current: number
  limit: number
  label: string
  resetAt?: Date
}

function UsageProgressBar({ current, limit, label, resetAt }: UsageProgressBarProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const percentage = limit > 0 ? Math.min((current / limit) * 100, 100) : 0
  const isUnlimited = limit === 999

  // Update countdown timer every minute
  useEffect(() => {
    if (!resetAt) return

    const updateTimer = () => {
      setTimeRemaining(formatTimeUntilReset(resetAt))
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [resetAt])

  // Determine progress bar color based on usage
  const getProgressColor = () => {
    if (isUnlimited) return 'bg-blue-500'
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {isUnlimited ? (
            <span className="text-blue-600 dark:text-blue-400 font-semibold">Unlimited</span>
          ) : (
            <span>
              {current} / {limit}
            </span>
          )}
        </span>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: `${isUnlimited ? 0 : percentage}%` }}
        />
      </div>

      {!isUnlimited && resetAt && current >= limit && (
        <p className="text-xs text-red-600 dark:text-red-400">
          Resets in {timeRemaining}
        </p>
      )}

      {!isUnlimited && percentage >= 80 && percentage < 100 && (
        <p className="text-xs text-yellow-600 dark:text-yellow-400">
          {limit - current} remaining
        </p>
      )}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  subtitle?: string
}

function StatCard({ title, value, subtitle }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
        {title}
      </h3>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  )
}

export function UsageDashboard() {
  const { stats, isLoading, error } = useUsageStats()
  const { user } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">
          Failed to load usage statistics. Please try again later.
        </p>
      </div>
    )
  }

  const { today, thisWeek, thisMonth, allTime } = stats
  const isFamily = (user as any)?.subscriptionTier === 'family'
  const isPro = (user as any)?.subscriptionTier === 'pro'
  const isTrial = (user as any)?.subscriptionTier === 'trial'

  // Calculate if user should see upgrade prompt
  const showUpgradePrompt =
    (isFamily && (today.textStories >= today.textLimit || today.illustratedStories >= today.illustratedLimit)) ||
    (isPro && today.textStories >= 20) || // Show upgrade after 20 stories for Pro users
    isTrial

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Usage Statistics
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track your story generation usage across all time periods
        </p>
      </div>

      {/* Upgrade Prompt (if needed) */}
      {showUpgradePrompt && !isTrial && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-purple-900 dark:text-purple-100">
                {isFamily ? 'Daily limit reached' : 'Loving the stories?'}
              </h3>
              <p className="mt-1 text-sm text-purple-700 dark:text-purple-300">
                {isFamily
                  ? 'Your daily limit has been reached. Upgrade to unlock unlimited stories!'
                  : 'Upgrade to Family Plan for AI-illustrated picture books and more!'}
              </p>
              <button
                onClick={() => router.push('/settings?tab=subscription')}
                className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Today's Usage */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Today&apos;s Usage
        </h3>

        <UsageProgressBar
          current={today.textStories}
          limit={today.textLimit}
          label="Text Stories"
          resetAt={today.textResetAt}
        />

        <UsageProgressBar
          current={today.illustratedStories}
          limit={today.illustratedLimit}
          label="Illustrated Stories"
          resetAt={today.illustratedResetAt}
        />

        {isFamily && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Family Plan: 10 text stories and 2 illustrated stories per day (rolling 24-hour window)
            </p>
          </div>
        )}

        {isPro && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Pro Plan: Unlimited text stories. Upgrade to Family Plan for illustrated stories!
            </p>
          </div>
        )}
      </div>

      {/* Weekly & Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            This Week
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Text Stories</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {thisWeek.textStories}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Illustrated Stories</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {thisWeek.illustratedStories}
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between">
                <span className="font-medium text-gray-900 dark:text-white">Total</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {thisWeek.textStories + thisWeek.illustratedStories}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            This Month
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Text Stories</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {thisMonth.textStories}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Illustrated Stories</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {thisMonth.illustratedStories}
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between">
                <span className="font-medium text-gray-900 dark:text-white">Total</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {thisMonth.textStories + thisMonth.illustratedStories}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All-Time Stats */}
      <StatCard
        title="All-Time Total"
        value={allTime.totalStories}
        subtitle="Stories created since you joined"
      />
    </div>
  )
}
