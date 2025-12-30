import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './use-auth'
import {
  getUserAchievements,
  getUserStats,
  getAchievementProgress,
  markAchievementsAsViewed,
  checkAndAwardAchievements
} from '@/lib/achievements/achievement-checker'

/**
 * Hook for user achievements
 */
export function useUserAchievements() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: () => getUserAchievements(user?.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for user stats
 */
export function useUserStats() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: () => getUserStats(user?.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for achievement progress
 */
export function useAchievementProgress() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['achievement-progress', user?.id],
    queryFn: () => getAchievementProgress(user?.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to check and award achievements
 */
export function useCheckAchievements() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: () => checkAndAwardAchievements(user?.id),
    onSuccess: (newAchievements) => {
      if (newAchievements && newAchievements.length > 0) {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['achievements', user?.id] })
        queryClient.invalidateQueries({ queryKey: ['user-stats', user?.id] })
        queryClient.invalidateQueries({ queryKey: ['achievement-progress', user?.id] })
      }
    },
  })
}

/**
 * Hook to mark achievements as viewed
 */
export function useMarkAchievementsViewed() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (achievementIds: string[]) => markAchievementsAsViewed(achievementIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements', user?.id] })
    },
  })
}

