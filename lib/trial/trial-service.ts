// Trial usage tracking service

import { supabase } from '@/lib/supabase/client'
import type { TrialUsage } from '@/types'
import { databaseTrialUsageToTrialUsage } from '@/types/database'

const TRIAL_LIMIT = 1

/**
 * Get trial usage for a user
 */
export async function getTrialUsage(userId: string): Promise<TrialUsage | null> {
  const { data, error } = await supabase
    .from('usage')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    // Initialize if doesn't exist
    await initializeTrialUsage(userId)
    return getTrialUsage(userId)
  }

  return databaseTrialUsageToTrialUsage(data)
}

/**
 * Initialize trial usage tracking for a user
 */
async function initializeTrialUsage(userId: string): Promise<void> {
  const { error } = await supabase.from('usage').insert({
    user_id: userId,
    stories_generated: 0,
    trial_completed: false,
  })
  if (error && error.code !== '23505') {
    // Ignore duplicate key errors
    throw error
  }
}

/**
 * Check if user has reached trial limit
 */
export async function checkTrialLimit(userId: string): Promise<boolean> {
  const usage = await getTrialUsage(userId)
  if (!usage) return false
  return usage.storiesGenerated >= TRIAL_LIMIT || usage.trialCompleted
}

/**
 * Increment trial usage counter
 */
export async function incrementTrialUsage(userId: string): Promise<TrialUsage> {
  // Get current usage
  const currentUsage = await getTrialUsage(userId)
  if (!currentUsage) {
    await initializeTrialUsage(userId)
    return incrementTrialUsage(userId)
  }

  const newCount = (currentUsage.storiesGenerated || 0) + 1
  const isCompleted = newCount >= TRIAL_LIMIT

  const { data, error } = await supabase
    .from('usage')
    .update({
      stories_generated: newCount,
      trial_completed: isCompleted,
      trial_completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error || !data) {
    throw new Error('Failed to increment trial usage')
  }

  return databaseTrialUsageToTrialUsage(data)
}

/**
 * Mark trial as completed
 */
export async function markTrialCompleted(userId: string): Promise<void> {
  const { error } = await supabase
    .from('usage')
    .update({
      trial_completed: true,
      trial_completed_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) throw error
}

