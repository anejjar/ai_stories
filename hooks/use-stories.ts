'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from './use-auth'
import type { Story } from '@/types'

async function fetchStories(token: string): Promise<Story[]> {
  const response = await fetch('/api/stories', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch stories')
  }

  const result = await response.json()
  return result.data || []
}

export function useStories() {
  const { user, getAccessToken } = useAuth()

  return useQuery({
    queryKey: ['stories', user?.id],
    queryFn: async () => {
      if (!user) {
        throw new Error('User not authenticated')
      }
      const token = await getAccessToken()
      if (!token) {
        throw new Error('Failed to get access token')
      }
      return fetchStories(token)
    },
    enabled: !!user,
    staleTime: 60000, // 60 seconds - cache stories longer
    refetchOnMount: false, // Don't refetch if data is still fresh
    retry: 1, // Only retry once to fail faster
  })
}

