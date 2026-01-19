'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, BookOpen, Clock, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface StoryInsightsProps {
  childName: string
  profileId?: string | null
}

interface InsightsData {
  totalStories: number
  favoriteThemes: string[]
  lastStoryDate: string | null
  loading: boolean
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

// Cache for stories data to avoid repeated fetches
const storiesCache: { data: unknown[] | null; timestamp: number } = { data: null, timestamp: 0 }
const CACHE_TTL = 60000 // 1 minute cache

export function StoryInsights({ childName, profileId }: StoryInsightsProps) {
  const { getAccessToken } = useAuth()
  const [insights, setInsights] = useState<InsightsData>({
    totalStories: 0,
    favoriteThemes: [],
    lastStoryDate: null,
    loading: true,
  })
  const fetchedRef = useRef(false)
  const lastChildNameRef = useRef<string>('')

  const processStories = useCallback((stories: unknown[], name: string) => {
    // Filter stories for this child (by name match)
    const childStories = (stories as { children?: { name: string }[]; childName?: string }[]).filter(
      (s) =>
        s.children?.some((c) => c.name.toLowerCase() === name.toLowerCase()) ||
        s.childName?.toLowerCase() === name.toLowerCase()
    )

    // Count themes
    const themeCounts: Record<string, number> = {}
    childStories.forEach((s: { theme?: string }) => {
      if (s.theme) {
        themeCounts[s.theme] = (themeCounts[s.theme] || 0) + 1
      }
    })

    // Get top 3 themes
    const sortedThemes = Object.entries(themeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([theme]) => theme)

    // Get last story date
    const lastStory = childStories[0] as { createdAt?: string } | undefined

    setInsights((prev) => {
      // Only update if data actually changed to prevent unnecessary re-renders
      const newInsights = {
        totalStories: childStories.length,
        favoriteThemes: sortedThemes,
        lastStoryDate: lastStory?.createdAt || null,
        loading: false,
      }
      
      // Check if data actually changed
      if (
        prev.totalStories === newInsights.totalStories &&
        prev.favoriteThemes.join(',') === newInsights.favoriteThemes.join(',') &&
        prev.lastStoryDate === newInsights.lastStoryDate &&
        prev.loading === newInsights.loading
      ) {
        return prev // Return previous state to prevent re-render
      }
      
      return newInsights
    })
  }, [])

  useEffect(() => {
    // Skip if name hasn't meaningfully changed or is too short
    if (!childName || childName.trim().length < 2) {
      setInsights((prev) => {
        if (prev.totalStories === 0 && prev.favoriteThemes.length === 0 && !prev.lastStoryDate && !prev.loading) {
          return prev // No change needed
        }
        return { totalStories: 0, favoriteThemes: [], lastStoryDate: null, loading: false }
      })
      return
    }

    const normalizedName = childName.trim().toLowerCase()

    // If same name, don't re-fetch
    if (normalizedName === lastChildNameRef.current && fetchedRef.current) {
      return
    }

    // Check cache first
    const now = Date.now()
    if (storiesCache.data && now - storiesCache.timestamp < CACHE_TTL) {
      lastChildNameRef.current = normalizedName
      fetchedRef.current = true
      processStories(storiesCache.data, childName)
      return
    }

    // Debounce the fetch
    const timeoutId = setTimeout(async () => {
      try {
        const token = await getAccessToken()
        const response = await fetch('/api/stories?limit=50', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const result = await response.json()
          const stories = result.data?.stories || []

          // Update cache
          storiesCache.data = stories
          storiesCache.timestamp = Date.now()

          fetchedRef.current = true
          lastChildNameRef.current = normalizedName
          processStories(stories, childName)
        }
      } catch (error) {
        console.error('Error fetching story insights:', error)
        setInsights((prev) => ({ ...prev, loading: false }))
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childName, profileId, getAccessToken])

  if (insights.loading) {
    return (
      <div className="p-4 rounded-xl border-2 border-gray-100 bg-gray-50 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    )
  }

  if (insights.totalStories === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50"
    >
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-blue-600" />
        <span className="font-semibold text-blue-900">{childName}&apos;s Story Stats</span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {/* Total stories */}
        <div className="p-2 rounded-lg bg-white/60">
          <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
            <BookOpen className="w-3 h-3" />
          </div>
          <div className="text-lg font-bold text-gray-900">{insights.totalStories}</div>
          <div className="text-xs text-gray-500">Stories</div>
        </div>

        {/* Favorite themes */}
        <div className="p-2 rounded-lg bg-white/60">
          <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
            <Sparkles className="w-3 h-3" />
          </div>
          <div className="text-sm font-medium text-gray-900 truncate">
            {insights.favoriteThemes[0] || '-'}
          </div>
          <div className="text-xs text-gray-500">Top Theme</div>
        </div>

        {/* Last story */}
        <div className="p-2 rounded-lg bg-white/60">
          <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
            <Clock className="w-3 h-3" />
          </div>
          <div className="text-sm font-medium text-gray-900">
            {insights.lastStoryDate ? formatRelativeTime(insights.lastStoryDate) : '-'}
          </div>
          <div className="text-xs text-gray-500">Last Story</div>
        </div>
      </div>

      {/* Additional themes */}
      {insights.favoriteThemes.length > 1 && (
        <div className="mt-3 pt-3 border-t border-blue-100">
          <div className="text-xs text-gray-500 mb-1">Also loves:</div>
          <div className="flex gap-1 flex-wrap">
            {insights.favoriteThemes.slice(1).map((theme) => (
              <span
                key={theme}
                className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
