'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './use-auth'
import { getTrialUsage } from '@/lib/trial/trial-service'
import type { TrialUsage } from '@/types'

export function useTrial() {
  const { user, userProfile } = useAuth()
  const [trialUsage, setTrialUsage] = useState<TrialUsage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTrialUsage() {
      if (!user || userProfile?.subscriptionTier !== 'trial') {
        setTrialUsage(null)
        setLoading(false)
        return
      }

      try {
        const usage = await getTrialUsage(user.id)
        setTrialUsage(usage)
      } catch (error) {
        console.error('Error fetching trial usage:', error)
        setTrialUsage(null)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchTrialUsage()
    } else {
      setLoading(false)
    }
  }, [user?.id, userProfile?.subscriptionTier])

  const isTrialCompleted = trialUsage?.trialCompleted || false
  const storiesGenerated = trialUsage?.storiesGenerated || 0
  const canCreateStory = !isTrialCompleted && storiesGenerated < 1
  const isFirstStory = storiesGenerated === 0

  return {
    trialUsage,
    loading,
    isTrialCompleted,
    storiesGenerated,
    canCreateStory,
    isFirstStory,
  }
}



